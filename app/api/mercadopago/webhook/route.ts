import { NextResponse } from "next/server";
import { reserveInventoryForOrder } from "@/lib/orderInventory";
import { prisma } from "@/lib/prisma";
import { getMercadoPagoClient } from "@/lib/mercadopago";
import { Payment } from "mercadopago";
import {
  enforceRateLimit,
  rateLimitResponse,
  readJsonWithLimit,
} from "@/lib/security";

export async function POST(request: Request) {
  const rateLimit = await enforceRateLimit({
    scope: "mercadopago:webhook",
    limit: 120,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return rateLimitResponse();
  }

  try {
    const body = await readJsonWithLimit<{ type?: string; data?: { id?: string } }>(
      request,
      16 * 1024
    ).catch(() => null);
    const topic = new URL(request.url).searchParams.get("topic") || body?.type;
    const paymentId =
      new URL(request.url).searchParams.get("id") || body?.data?.id;

    if (topic !== "payment" || !paymentId) {
      return NextResponse.json({ ok: true });
    }

    const paymentApi = new Payment(getMercadoPagoClient());
    const payment = await paymentApi.get({ id: paymentId });
    const orderId = payment.external_reference;

    if (!orderId) {
      return NextResponse.json({ ok: true });
    }

    const status =
      payment.status === "approved"
        ? "CONFIRMED"
        : payment.status === "cancelled"
        ? "CANCELLED"
        : "PENDING";

    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!currentOrder) {
      return NextResponse.json({ ok: true });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    if (status === "CONFIRMED" && currentOrder.status !== "CONFIRMED") {
      await reserveInventoryForOrder(orderId);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro no webhook Mercado Pago:", error);
    return NextResponse.json(
      { ok: false },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
