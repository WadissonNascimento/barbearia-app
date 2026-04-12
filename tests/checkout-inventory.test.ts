import assert from "node:assert/strict";
import test from "node:test";
import { PrismaClient } from "@prisma/client";
import {
  buildCheckoutSummary,
  buildMercadoPagoPreferenceItems,
} from "@/lib/checkout";
import { reserveInventoryForOrder } from "@/lib/orderInventory";

async function setupDatabase() {
  const db = new PrismaClient();
  const runId = `${Date.now()}-${Math.round(Math.random() * 100000)}`;

  return {
    db,
    runId,
    async cleanup() {
      await db.stockMovement.deleteMany({
        where: {
          reason: {
            contains: runId,
          },
        },
      });
      await db.orderItem.deleteMany({
        where: {
          product: {
            name: {
              contains: runId,
            },
          },
        },
      });
      await db.order.deleteMany({
        where: {
          customer: {
            email: {
              contains: `${runId}@test.local`,
            },
          },
        },
      });
      await db.product.deleteMany({
        where: {
          name: {
            contains: runId,
          },
        },
      });
      await db.coupon.deleteMany({
        where: {
          code: {
            contains: runId.replace(/\D/g, "").slice(0, 12),
          },
        },
      });
      await db.user.deleteMany({
        where: {
          email: {
            contains: `${runId}@test.local`,
          },
        },
      });
    },
  };
}

async function createOrderFixture(
  db: PrismaClient,
  runId: string,
  stock: number,
  quantity: number
) {
  const customer = await db.user.create({
    data: {
      name: "Cliente Estoque",
      email: `estoque-${runId}@test.local`,
      role: "CUSTOMER",
      isActive: true,
    },
  });
  const product = await db.product.create({
    data: {
      name: `Pomada Teste ${runId}`,
      price: 40,
      stock,
      isActive: true,
    },
  });
  const order = await db.order.create({
    data: {
      customerId: customer.id,
      status: "PENDING",
      subtotal: 40 * quantity,
      total: 40 * quantity,
      items: {
        create: {
          productId: product.id,
          productNameSnapshot: product.name,
          quantity,
          unitPrice: product.price,
        },
      },
    },
  });

  return { product, order };
}

test("checkout summary applies coupon and Mercado Pago items never use negative prices", async () => {
  const { db, runId, cleanup } = await setupDatabase();

  try {
    const product = await db.product.create({
      data: {
        name: `Shampoo Teste ${runId}`,
        price: 100,
        stock: 10,
        isActive: true,
      },
    });
    const coupon = await db.coupon.create({
      data: {
        code: `TESTE${runId.replace(/\D/g, "").slice(0, 12)}`,
        discountType: "PERCENT",
        discountValue: 10,
        minOrderTotal: 0,
        isActive: true,
      },
    });
    const items = [{ productId: product.id, quantity: 2 }];
    const summary = buildCheckoutSummary({
      items,
      products: [product],
      zipCode: "01001000",
      coupon,
    });
    const preferenceItems = buildMercadoPagoPreferenceItems({
      items,
      products: [product],
      shippingCost: summary.shipping.cost,
      shippingMethod: summary.shipping.method,
      discountTotal: summary.discountTotal,
    });

    assert.equal(summary.subtotal, 200);
    assert.equal(summary.discountTotal, 20);
    assert.equal(summary.total, 180);
    assert.equal(preferenceItems.some((item) => item.unit_price < 0), false);
    assert.equal(preferenceItems[0].unit_price, 90);
  } finally {
    await cleanup();
    await db.$disconnect();
  }
});

test("reserveInventoryForOrder decrements stock and marks order as approved once", async () => {
  const { db, runId, cleanup } = await setupDatabase();

  try {
    const { product, order } = await createOrderFixture(db, runId, 5, 2);

    await reserveInventoryForOrder(order.id, db);
    await reserveInventoryForOrder(order.id, db);

    const [updatedProduct, updatedOrder, movements] = await Promise.all([
      db.product.findUnique({ where: { id: product.id } }),
      db.order.findUnique({ where: { id: order.id } }),
      db.stockMovement.count({ where: { productId: product.id, type: "OUT" } }),
    ]);

    assert.equal(updatedProduct?.stock, 3);
    assert.equal(updatedOrder?.adminApproved, true);
    assert.equal(movements, 1);
  } finally {
    await cleanup();
    await db.$disconnect();
  }
});

test("reserveInventoryForOrder fails without mutating stock when stock is insufficient", async () => {
  const { db, runId, cleanup } = await setupDatabase();

  try {
    const { product, order } = await createOrderFixture(db, runId, 1, 2);

    await assert.rejects(
      () => reserveInventoryForOrder(order.id, db),
      /Estoque insuficiente/
    );

    const [updatedProduct, updatedOrder, movements] = await Promise.all([
      db.product.findUnique({ where: { id: product.id } }),
      db.order.findUnique({ where: { id: order.id } }),
      db.stockMovement.count({ where: { productId: product.id, type: "OUT" } }),
    ]);

    assert.equal(updatedProduct?.stock, 1);
    assert.equal(updatedOrder?.adminApproved, false);
    assert.equal(movements, 0);
  } finally {
    await cleanup();
    await db.$disconnect();
  }
});
