import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import {
  buildCheckoutSummary,
  findCouponByCode,
  getCheckoutProducts,
} from "@/lib/checkout";
import {
  enforceRateLimit,
  rateLimitResponse,
  readJsonWithLimit,
} from "@/lib/security";

const schema = z.object({
  shippingZipCode: z.string().trim().min(8).max(12),
  couponCode: z.string().trim().max(40).optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1).max(80),
        quantity: z.number().int().positive().max(20),
      })
    )
    .min(1)
    .max(30),
}).strict();

export async function POST(request: Request) {
  const rateLimit = await enforceRateLimit({
    scope: "checkout:quote",
    limit: 60,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return rateLimitResponse("Muitas cotacoes em pouco tempo. Aguarde e tente novamente.");
  }

  try {
    const body = await readJsonWithLimit(request, 16 * 1024);
    const parsed = schema.parse(body);

    const dbProducts = await getCheckoutProducts(parsed.items);
    const coupon = await findCouponByCode(parsed.couponCode);
    const summary = buildCheckoutSummary({
      items: parsed.items,
      products: dbProducts,
      zipCode: parsed.shippingZipCode,
      coupon,
    });

    return NextResponse.json({
      subtotal: summary.subtotal,
      shippingCost: summary.shipping.cost,
      shippingMethod: summary.shipping.method,
      shippingEta: summary.shipping.etaLabel,
      discountTotal: summary.discountTotal,
      total: summary.total,
      couponCode: summary.coupon?.code || null,
    });
  } catch (error) {
    const isPayloadTooLarge =
      error instanceof Error && error.message === "PAYLOAD_TOO_LARGE";

    return NextResponse.json(
      {
        message: isPayloadTooLarge
          ? "Requisicao muito grande."
          : error instanceof ZodError
            ? "Informe CEP e itens validos para calcular."
            : "Nao foi possivel calcular.",
      },
      { status: isPayloadTooLarge ? 413 : 400 }
    );
  }
}
