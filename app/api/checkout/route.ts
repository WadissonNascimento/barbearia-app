import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import {
  buildMercadoPagoPreferenceItems,
  buildCheckoutSummary,
  findCouponByCode,
  getCheckoutProducts,
} from "@/lib/checkout";
import { getPreferenceClient } from "@/lib/mercadopago";

const schema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(8),
  customerAddress: z.string().min(8),
  shippingZipCode: z.string().min(8),
  couponCode: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.parse(body);

    const dbProducts = await getCheckoutProducts(parsed.items);
    const coupon = await findCouponByCode(parsed.couponCode);
    const summary = buildCheckoutSummary({
      items: parsed.items,
      products: dbProducts,
      zipCode: parsed.shippingZipCode,
      coupon,
    });

    let customer = await prisma.user.findUnique({
      where: { email: parsed.customerEmail },
    });

    if (customer && customer.role !== "CUSTOMER") {
      return NextResponse.json(
        { message: "Este e-mail ja esta vinculado a outro tipo de conta." },
        { status: 400 }
      );
    }

    if (!customer) {
      customer = await prisma.user.create({
        data: {
          name: parsed.customerName,
          email: parsed.customerEmail,
          phone: parsed.customerPhone,
          role: "CUSTOMER",
          isActive: true,
        },
      });
    } else {
      customer = await prisma.user.update({
        where: { id: customer.id },
        data: {
          name: parsed.customerName,
          phone: parsed.customerPhone,
        },
      });
    }

    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        couponId: coupon?.id || null,
        subtotal: summary.subtotal,
        shippingCost: summary.shipping.cost,
        discountTotal: summary.discountTotal,
        total: summary.total,
        shippingZipCode: summary.shipping.zipCode,
        shippingMethod: summary.shipping.method,
        shippingAddress: parsed.customerAddress,
        notes: `Entrega prevista: ${summary.shipping.etaLabel}`,
        items: {
          create: parsed.items.map((item) => {
            const product = dbProducts.find((entry) => entry.id === item.productId)!;

            return {
              productId: item.productId,
              productNameSnapshot: product.name,
              quantity: item.quantity,
              unitPrice: product.price,
            };
          }),
        },
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || "";
    const mercadoPagoDisabled =
      !accessToken || accessToken.includes("xxxxxxxx");

    if (mercadoPagoDisabled) {
      return NextResponse.json({
        redirectTo: `${baseUrl}/rastreio?email=${encodeURIComponent(parsed.customerEmail)}`,
        orderId: order.id,
        totals: {
          subtotal: summary.subtotal,
          shippingCost: summary.shipping.cost,
          discountTotal: summary.discountTotal,
          total: summary.total,
          shippingMethod: summary.shipping.method,
        },
      });
    }

    const isLocal =
      baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");

    const preferenceClient = getPreferenceClient();

    const preferenceBody: {
      items: Array<{
        id: string;
        title: string;
        quantity: number;
        unit_price: number;
        currency_id: string;
      }>;
      payer: {
        name: string;
        email: string;
      };
      external_reference: string;
      back_urls: {
        success: string;
        failure: string;
        pending: string;
      };
      notification_url?: string;
    } = {
      items: buildMercadoPagoPreferenceItems({
        items: parsed.items,
        products: dbProducts,
        shippingCost: summary.shipping.cost,
        shippingMethod: summary.shipping.method,
        discountTotal: summary.discountTotal,
      }),
      payer: {
        name: parsed.customerName,
        email: parsed.customerEmail,
      },
      external_reference: order.id,
      back_urls: {
        success: `${baseUrl}/rastreio?email=${encodeURIComponent(parsed.customerEmail)}`,
        failure: `${baseUrl}/falha`,
        pending: `${baseUrl}/rastreio?email=${encodeURIComponent(parsed.customerEmail)}`,
      },
    };

    if (!isLocal) {
      preferenceBody.notification_url = `${baseUrl}/api/mercadopago/webhook`;
    }

    const preference = await preferenceClient.create({
      body: preferenceBody,
    });

    const initPoint =
      preference.init_point ||
      (preference as { sandbox_init_point?: string }).sandbox_init_point;

    if (!initPoint) {
      throw new Error(
        `Mercado Pago nao retornou init_point. Resposta: ${JSON.stringify(preference)}`
      );
    }

    return NextResponse.json({
      initPoint,
      preferenceId: preference.id,
      totals: {
        subtotal: summary.subtotal,
        shippingCost: summary.shipping.cost,
        discountTotal: summary.discountTotal,
        total: summary.total,
        shippingMethod: summary.shipping.method,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Confira os dados de entrega e tente novamente." },
        { status: 400 }
      );
    }

    console.error("Erro ao criar checkout Mercado Pago:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Erro ao criar checkout.",
      },
      { status: 500 }
    );
  }
}
