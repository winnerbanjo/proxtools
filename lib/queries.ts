import "server-only";

import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { dataPlans, deposits, flights, invoices, logs, orders, smsInventory, tickets, users } from "@/lib/db/schema";

export async function getCustomerDashboard(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const [sms, plans, orderRows, depositRows, logRows, ticketRows, invoiceRows, flightRows] = await Promise.all([
    db.select().from(smsInventory).orderBy(desc(smsInventory.createdAt)),
    db.select().from(dataPlans).orderBy(desc(dataPlans.createdAt)),
    db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt)),
    db.select().from(deposits).where(eq(deposits.userId, userId)).orderBy(desc(deposits.createdAt)),
    db.select().from(logs).where(eq(logs.userId, userId)).orderBy(desc(logs.createdAt)),
    db.select().from(tickets).where(eq(tickets.userId, userId)).orderBy(desc(tickets.createdAt)),
    db.select().from(invoices).where(eq(invoices.userId, userId)).orderBy(desc(invoices.createdAt)),
    db.select().from(flights).where(eq(flights.userId, userId)).orderBy(desc(flights.createdAt)),
  ]);

  return { user, sms, plans, orders: orderRows, deposits: depositRows, logs: logRows, tickets: ticketRows, invoices: invoiceRows, flights: flightRows };
}

export async function getAdminDashboard() {
  const [customerRows, sms, plans, orderRows, logRows] = await Promise.all([
    db.select().from(users).orderBy(desc(users.createdAt)),
    db.select().from(smsInventory).orderBy(desc(smsInventory.createdAt)),
    db.select().from(dataPlans).orderBy(desc(dataPlans.createdAt)),
    db.select().from(orders).orderBy(desc(orders.createdAt)),
    db.select().from(logs).orderBy(desc(logs.createdAt)),
  ]);

  return { customers: customerRows, sms, plans, orders: orderRows, logs: logRows };
}
