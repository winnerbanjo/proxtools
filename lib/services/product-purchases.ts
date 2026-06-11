import "server-only";

import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { logs, orders, users, type User } from "@/lib/db/schema";
import { buyShopProduct, findShopProduct } from "@/lib/services/shopviaclone";

export class ProductPurchaseError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
    this.name = "ProductPurchaseError";
  }
}

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
    throw new ProductPurchaseError("Choose a product and enter a valid quantity.", 400);
  }

  const product = await findShopProduct(productId);
  if (!product) {
    throw new ProductPurchaseError("This product is no longer available. Refresh and choose another product.", 404);
  }

  if (product.amount < safeQuantity) {
    throw new ProductPurchaseError(`Only ${product.amount} unit(s) are available right now.`, 409);
  }

  const total = product.markedUpPrice * safeQuantity;
  if (Number(user.wallet) < total) {
    throw new ProductPurchaseError(`Insufficient wallet balance. You need ₦${total.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`, 402);
  }

  const externalOrder = await buyShopProduct(product.id, safeQuantity);
  console.log(externalOrder, "ORDER");
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
