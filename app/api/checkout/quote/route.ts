import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildCheckoutSummary,
  findCouponByCode,
  getCheckoutProducts,
} from "@/lib/checkout";

const schema = z.object({
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
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Nao foi possivel calcular.",
      },
      { status: 400 }
    );
  }
}
