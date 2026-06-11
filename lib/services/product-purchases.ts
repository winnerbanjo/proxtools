import "server-only";

import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { logs, orders, users, type User } from "@/lib/db/schema";
import { buyShopProduct, findShopProduct } from "@/lib/services/shopviaclone";

export type ProductPurchaseResult = {
  orderId: string;
  productName: string;
  total: number;
  quantity: number;
  externalOrder: any;
};

export async function purchaseShopProductForUser(user: User, productId: string, quantity: number): Promise<ProductPurchaseResult> {
  const safeQuantity = Math.max(1, Math.floor(quantity));

  if (!productId || !Number.isFinite(safeQuantity)) {
    throw new Error("Invalid product or quantity.");
  }

  const product = await findShopProduct(productId);
  if (!product) {
    throw new Error("Product was not found.");
  }

  if (product.amount < safeQuantity) {
    throw new Error("Product is out of stock.");
  }

  const total = product.markedUpPrice * safeQuantity;
  if (Number(user.wallet) < total) {
    throw new Error("Insufficient wallet balance.");
  }

  const externalOrder = await buyShopProduct(product.id, safeQuantity);
  const [order] = await db
    .insert(orders)
    .values({
      userId: user.id,
      kind: "PRODUCT",
      productId: product.id,
      productName: product.name,
      productQuantity: safeQuantity,
      productDetails: JSON.stringify(externalOrder?.data ?? externalOrder ?? {}),
      externalRef: externalOrder?.trans_id ? String(externalOrder.trans_id) : null,
      amount: total.toFixed(2),
      status: "Completed",
    })
    .returning({ id: orders.id });

  await db.batch([
    db
      .update(users)
      .set({ wallet: sql`${users.wallet} - ${total}`, spent: sql`${users.spent} + ${total}`, updatedAt: new Date() })
      .where(eq(users.id, user.id)),
    db.insert(logs).values({
      userId: user.id,
      event: "Product Purchase",
      description: `Bought ${safeQuantity} x ${product.name}.`,
    }),
  ]);

  return {
    orderId: order.id,
    productName: product.name,
    total,
    quantity: safeQuantity,
    externalOrder,
  };
}
