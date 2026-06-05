"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createPasswordHash, createSession, clearSession, requireUser, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { dataPlans, deposits, flights, invoices, logs, orders, smsInventory, tickets, users } from "@/lib/db/schema";
import { sendMail } from "@/lib/services/brevo";

const demoAdmin = {
  name: "Admin",
  email: "admin@proxtools.test",
  password: "admin12345",
};

async function addLog(userId: string | null, event: string, description: string) {
  await db.insert(logs).values({ userId, event, description });
}

function formString(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function loginAction(formData: FormData) {
  const role = formString(formData, "role") === "admin" ? "admin" : "customer";
  const email = formString(formData, "email").toLowerCase();
  const password = String(formData.get("password") || "");

  const [user] = await db.select().from(users).where(and(eq(users.email, email), eq(users.role, role))).limit(1);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    redirect(`/login?role=${role}&error=invalid`);
  }

  await createSession(user);
  await addLog(user.id, "Login", `${user.email} signed in.`);
  redirect(role === "admin" ? "/admin" : "/");
}

export async function registerAction(formData: FormData) {
  const parsed = z
    .object({
      name: z.string().min(2),
      email: z.string().email(),
      phone: z.string().optional(),
      password: z.string().min(8),
      confirm: z.string().min(8),
    })
    .refine((value) => value.password === value.confirm, "Passwords do not match.")
    .parse({
      name: formString(formData, "name"),
      email: formString(formData, "email").toLowerCase(),
      phone: formString(formData, "phone"),
      password: String(formData.get("password") || ""),
      confirm: String(formData.get("confirm") || ""),
    });

  const passwordHash = await createPasswordHash(parsed.password);
  const [user] = await db
    .insert(users)
    .values({ name: parsed.name, email: parsed.email, phone: parsed.phone, passwordHash, role: "customer" })
    .returning();

  await addLog(user.id, "Customer Signup", `Created customer account for ${user.email}.`);
  await sendMail({
    to: user.email,
    subject: "Welcome to ProxTools",
    html: `<p>Hello ${user.name}, your ProxTools account is ready.</p>`,
  });
  await createSession(user);
  redirect("/");
}

export async function forgotPasswordAction(formData: FormData) {
  const email = formString(formData, "email").toLowerCase();
  await sendMail({
    to: email,
    subject: "ProxTools password reset",
    html: "<p>Reply to support to complete your password reset. A full token flow can be layered on this foundation.</p>",
  });
  redirect("/forgot-password?sent=1");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function topUpAction(formData: FormData) {
  const user = await requireUser("customer");
  const amount = Number(formData.get("amount") || 0);
  const method = formString(formData, "method");
  const narration = formString(formData, "narration");
  if (amount < 100) return;

  await db.insert(deposits).values({ userId: user.id, ref: `WAL-${Date.now()}`, amount: String(amount), method, narration });
  await db
    .update(users)
    .set({
      wallet: sql`${users.wallet} + ${amount}`,
      deposited: sql`${users.deposited} + ${amount}`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));
  await addLog(user.id, "Wallet Top-up", `Completed wallet top-up of ₦${amount}.`);
  revalidatePath("/balance");
  redirect("/balance");
}

export async function buySmsAction(formData: FormData) {
  const user = await requireUser("customer");
  const service = formString(formData, "service");
  const country = formString(formData, "country");
  const quantity = Math.max(1, Number(formData.get("quantity") || 1));
  const stock = await db.select().from(smsInventory).where(and(eq(smsInventory.service, service), eq(smsInventory.country, country), eq(smsInventory.status, "available"))).limit(quantity);
  const total = stock.reduce((sum, item) => sum + Number(item.price), 0);

  if (stock.length < quantity || Number(user.wallet) < total) return;

  await db.update(smsInventory).set({ status: "sold" }).where(inArray(smsInventory.id, stock.map((item) => item.id)));
  await db.insert(orders).values(
    stock.map((item) => ({
      userId: user.id,
      kind: "SMS" as const,
      service: item.service,
      country: item.country,
      number: item.number,
      code: item.code,
      amount: item.price,
    })),
  );
  await db.update(users).set({ wallet: sql`${users.wallet} - ${total}`, spent: sql`${users.spent} + ${total}`, updatedAt: new Date() }).where(eq(users.id, user.id));
  await addLog(user.id, "SMS Purchase", `Bought ${quantity} ${service} number(s).`);
  revalidatePath("/sms-services");
  redirect("/sms-services");
}

export async function buyDataAction(formData: FormData) {
  const user = await requireUser("customer");
  const planId = formString(formData, "planId");
  const phone = formString(formData, "phone");
  const quantity = Math.max(1, Number(formData.get("quantity") || 1));
  const [plan] = await db.select().from(dataPlans).where(eq(dataPlans.id, planId)).limit(1);
  if (!plan || plan.status !== "active" || plan.stock < quantity || !phone) return;

  const total = Number(plan.price) * quantity;
  if (Number(user.wallet) < total) return;

  await db.update(dataPlans).set({ stock: plan.stock - quantity, status: plan.stock - quantity <= 0 ? "out_of_stock" : "active" }).where(eq(dataPlans.id, plan.id));
  await db.insert(orders).values({ userId: user.id, kind: "SME", network: plan.network, bundle: `${quantity} x ${plan.bundle}`, phone, amount: String(total) });
  await db.update(users).set({ wallet: sql`${users.wallet} - ${total}`, spent: sql`${users.spent} + ${total}`, updatedAt: new Date() }).where(eq(users.id, user.id));
  await addLog(user.id, "SME Purchase", `Bought ${quantity} ${plan.network} ${plan.bundle} bundle(s).`);
  revalidatePath("/sme-services");
  redirect("/sme-services");
}

export async function createTicketAction(formData: FormData) {
  const user = await requireUser("customer");
  const subject = formString(formData, "subject");
  const priority = formString(formData, "priority") || "Normal";
  const message = formString(formData, "message");
  await db.insert(tickets).values({ userId: user.id, subject, priority, message });
  await addLog(user.id, "Support Ticket", `Created support ticket: ${subject}.`);
  await sendMail({ to: user.email, subject: "Support ticket received", html: `<p>We received your ticket: ${subject}</p>` });
  redirect("/contact");
}

export async function createInvoiceAction(formData: FormData) {
  const user = await requireUser("customer");
  const amount = Number(formData.get("amount") || 0);
  const description = formString(formData, "description");
  if (amount <= 0) return;
  await db.insert(invoices).values({ userId: user.id, ref: `INV-${Date.now()}`, amount: String(amount), description });
  await addLog(user.id, "Invoice", `Created draft invoice for ₦${amount}.`);
  redirect("/billing");
}

export async function createFlightAction(formData: FormData) {
  const user = await requireUser("customer");
  await db.insert(flights).values({
    userId: user.id,
    from: formString(formData, "from"),
    to: formString(formData, "to"),
    departure: formString(formData, "departure"),
    passengers: Number(formData.get("passengers") || 1),
  });
  await addLog(user.id, "Flight Request", "Created flight request.");
  redirect("/travel");
}

export async function addSmsAction(formData: FormData) {
  const admin = await requireUser("admin");
  await db.insert(smsInventory).values({
    service: formString(formData, "service"),
    country: formString(formData, "country"),
    number: formString(formData, "number"),
    code: formString(formData, "code") || "Waiting",
    price: String(Number(formData.get("price") || 0)),
  });
  await addLog(admin.id, "Admin Stock", "Added a new SMS number.");
  redirect("/admin#products");
}

export async function addPlanAction(formData: FormData) {
  const admin = await requireUser("admin");
  const stock = Number(formData.get("stock") || 0);
  await db.insert(dataPlans).values({
    network: formString(formData, "network"),
    bundle: formString(formData, "bundle"),
    price: String(Number(formData.get("price") || 0)),
    stock,
    status: stock > 0 ? "active" : "out_of_stock",
  });
  await addLog(admin.id, "Admin Stock", "Added a new SME data plan.");
  redirect("/admin#products");
}

export async function deleteSmsAction(formData: FormData) {
  await requireUser("admin");
  await db.delete(smsInventory).where(eq(smsInventory.id, formString(formData, "id")));
  redirect("/admin#products");
}

export async function deletePlanAction(formData: FormData) {
  await requireUser("admin");
  await db.delete(dataPlans).where(eq(dataPlans.id, formString(formData, "id")));
  redirect("/admin#products");
}

export async function ensureDemoAdminAction() {
  const existing = await db.select().from(users).where(eq(users.email, demoAdmin.email)).limit(1);
  if (!existing.length) {
    await db.insert(users).values({
      name: demoAdmin.name,
      email: demoAdmin.email,
      role: "admin",
      passwordHash: await createPasswordHash(demoAdmin.password),
    });
  }
}
