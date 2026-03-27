import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getPreferenceClient } from "@/lib/mercadopago";

const schema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(8),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1),
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
        { message: "Produto inválido no carrinho." },
        { status: 400 }
      );
    }

    const noStock = parsed.items.find((item) => {
      const product = dbProducts.find((p) => p.id === item.productId)!;
      return product.stock < item.quantity;
    });

    if (noStock) {
      return NextResponse.json(
        { message: "Um ou mais produtos estão sem estoque suficiente." },
        { status: 400 }
      );
    }

    const orderTotal = parsed.items.reduce((acc, item) => {
      const product = dbProducts.find((p) => p.id === item.productId)!;
      return acc + product.price * item.quantity;
    }, 0);

    const order = await prisma.order.create({
      data: {
        customerName: parsed.customerName,
        customerEmail: parsed.customerEmail,
        customerPhone: parsed.customerPhone,
        total: orderTotal,
        items: {
          create: parsed.items.map((item) => {
            const product = dbProducts.find((p) => p.id === item.productId)!;
            return {
              productId: item.productId,
              quantity: item.quantity,
              price: product.price,
            };
          }),
        },
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const isLocal =
      baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");

    const preferenceClient = getPreferenceClient();

    const preferenceBody: any = {
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

    // Só envia webhook se a URL for pública
    if (!isLocal) {
      preferenceBody.notification_url = `${baseUrl}/api/mercadopago/webhook`;
    }

    const preference = await preferenceClient.create({
      body: preferenceBody,
    });

    const initPoint =
      preference.init_point || (preference as any).sandbox_init_point;

    if (!initPoint) {
      throw new Error(
        `Mercado Pago não retornou init_point. Resposta: ${JSON.stringify(preference)}`
      );
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { mercadoPagoPrefId: preference.id },
    });

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