import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { deposits, logs, users } from "@/lib/db/schema";

export type KoraCreditResult = "credited" | "already_credited" | "not_found" | "not_success" | "amount_mismatch";

export async function creditKoraDeposit(reference: string, status?: string, amount?: number): Promise<KoraCreditResult> {
  if (status && status !== "success") return "not_success";

  const [deposit] = await db.select().from(deposits).where(eq(deposits.ref, reference)).limit(1);

  if (!deposit || deposit.method !== "KoraPay") return "not_found";
  if (deposit.status === "Completed") return "already_credited";
  if (deposit.status !== "Pending") return "not_success";

  const depositAmount = Number(deposit.amount);
  if (amount !== undefined && Number(amount) < depositAmount) return "amount_mismatch";

  await db.transaction(async (tx) => {
    await tx
      .update(deposits)
      .set({ status: "Completed", reviewedAt: new Date() })
      .where(eq(deposits.id, deposit.id));

    await tx
      .update(users)
      .set({
        wallet: sql`${users.wallet} + ${depositAmount}`,
        deposited: sql`${users.deposited} + ${depositAmount}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, deposit.userId));

    await tx.insert(logs).values({
      userId: deposit.userId,
      event: "Kora Wallet Top-up",
      description: `Confirmed KoraPay wallet top-up of ₦${depositAmount}.`,
    });
  });

  return "credited";
}
