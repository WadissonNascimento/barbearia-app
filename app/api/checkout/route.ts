import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getPreferenceClient } from "@/lib/mercadopago";

const schema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(8),
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

    const dbProducts = await prisma.product.findMany({
      where: { id: { in: parsed.items.map((item) => item.productId) } },
    });

    const missing = parsed.items.find(
      (item) => !dbProducts.find((product) => product.id === item.productId)
    );
    if (missing) {
      return NextResponse.json(
        { message: "Produto invalido no carrinho." },
        { status: 400 }
      );
    }

    const noStock = parsed.items.find((item) => {
      const product = dbProducts.find((p) => p.id === item.productId)!;
      return !product.isActive || product.stock < item.quantity;
    });

    if (noStock) {
      return NextResponse.json(
        { message: "Um ou mais produtos estao indisponiveis." },
        { status: 400 }
      );
    }

    const orderTotal = parsed.items.reduce((acc, item) => {
      const product = dbProducts.find((p) => p.id === item.productId)!;
      return acc + product.price * item.quantity;
    }, 0);

    let customer = await prisma.user.findUnique({
      where: { email: parsed.customerEmail },
    });

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
    }

    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        total: orderTotal,
        items: {
          create: parsed.items.map((item) => {
            const product = dbProducts.find((p) => p.id === item.productId)!;
            return {
              productId: item.productId,
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
        redirectTo: `${baseUrl}/sucesso?pedido=${order.id}`,
        orderId: order.id,
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
      items: parsed.items.map((item) => {
        const product = dbProducts.find((p) => p.id === item.productId)!;
        return {
          id: product.id,
          title: product.name,
          quantity: item.quantity,
          unit_price: Number(product.price),
          currency_id: "BRL",
        };
      }),
      payer: {
        name: parsed.customerName,
        email: parsed.customerEmail,
      },
      external_reference: order.id,
      back_urls: {
        success: `${baseUrl}/sucesso`,
        failure: `${baseUrl}/falha`,
        pending: `${baseUrl}/sucesso`,
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
    });
  } catch (error) {
    console.error("Erro ao criar checkout Mercado Pago:", error);
    return NextResponse.json(
      {
        message: "Erro ao criar checkout.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
