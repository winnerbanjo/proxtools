import "server-only";

import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminBankAccounts, dataPlans, deposits, flights, invoices, logs, orders, smsInventory, tickets, users } from "@/lib/db/schema";

export async function getCustomerDashboard(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const [sms, plans, orderRows, depositRows, logRows, ticketRows, invoiceRows, flightRows, bankAccount] = await Promise.all([
    db.select().from(smsInventory).orderBy(desc(smsInventory.createdAt)),
    db.select().from(dataPlans).orderBy(desc(dataPlans.createdAt)),
    db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt)),
    db.select().from(deposits).where(eq(deposits.userId, userId)).orderBy(desc(deposits.createdAt)),
    db.select().from(logs).where(eq(logs.userId, userId)).orderBy(desc(logs.createdAt)),
    db.select().from(tickets).where(eq(tickets.userId, userId)).orderBy(desc(tickets.createdAt)),
    db.select().from(invoices).where(eq(invoices.userId, userId)).orderBy(desc(invoices.createdAt)),
    db.select().from(flights).where(eq(flights.userId, userId)).orderBy(desc(flights.createdAt)),
    db.query.adminBankAccounts.findFirst({ where: eq(adminBankAccounts.isActive, true) }),
  ]);

  return { user, sms, plans, orders: orderRows, deposits: depositRows, logs: logRows, tickets: ticketRows, invoices: invoiceRows, flights: flightRows, bankAccount };
}

export async function getAdminDashboard() {
  const [customerRows, sms, plans, orderRows, logRows, depositRows, bankAccount] = await Promise.all([
    db.select().from(users).orderBy(desc(users.createdAt)),
    db.select().from(smsInventory).orderBy(desc(smsInventory.createdAt)),
    db.select().from(dataPlans).orderBy(desc(dataPlans.createdAt)),
    db.select().from(orders).orderBy(desc(orders.createdAt)),
    db.select().from(logs).orderBy(desc(logs.createdAt)),
    db
      .select({
        id: deposits.id,
        userId: deposits.userId,
        customerName: users.name,
        customerEmail: users.email,
        ref: deposits.ref,
        amount: deposits.amount,
        method: deposits.method,
        narration: deposits.narration,
        proofUrl: deposits.proofUrl,
        status: deposits.status,
        createdAt: deposits.createdAt,
        reviewedAt: deposits.reviewedAt,
      })
      .from(deposits)
      .leftJoin(users, eq(deposits.userId, users.id))
      .orderBy(desc(deposits.createdAt)),
    db.query.adminBankAccounts.findFirst({ where: eq(adminBankAccounts.isActive, true) }),
  ]);

  return { customers: customerRows, sms, plans, orders: orderRows, logs: logRows, deposits: depositRows, bankAccount };
}
