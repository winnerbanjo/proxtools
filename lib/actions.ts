"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createPasswordHash, createSession, clearSession, requireUser, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminBankAccounts, assets, dataPlans, deposits, flights, invoices, logs, orders, smsInventory, tickets, users } from "@/lib/db/schema";
import { sendMail } from "@/lib/services/brevo";
import { uploadAsset } from "@/lib/services/cloudinary";
import { purchaseShopProductForUser } from "@/lib/services/product-purchases";

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
  console.log(role, email, password);
  let user: { id: string; email: string; passwordHash: string; role: "admin" | "customer" } | undefined;
  if (role === "admin") {
    [user] = await db.select().from(users).where(and(eq(users.email, email), eq(users.role, role))).limit(1);
  } else {
    [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  }
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    redirect(`/login?role=${role}&error=invalid`);
  }

  await createSession(user);
  await addLog(user.id, "Login", `${user.email} signed in.`);
  redirect("/");
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
    subject: "Welcome to ProxTools – Account Activated",
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ProxTools</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table width="100%" Maggie style="max-width: 500px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0;" cellpadding="0" cellspacing="0" border="0">
              
              <!-- Header Brand Accent -->
              <tr>
                <td style="background: linear-gradient(135deg, #2dd4bf 0%, #2563eb 100%); padding: 32px; text-align: center;">
                  <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.15); color: #ffffff; font-weight: 900; font-size: 24px; width: 48px; height: 48px; line-height: 48px; border-radius: 8px; text-align: center; margin-bottom: 12px;">P</span>
                  <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; tracking-style: -0.025em;">Welcome to ProxTools!</h1>
                </td>
              </tr>

              <!-- Body Content -->
              <tr>
                <td style="padding: 32px 24px; color: #334155;">
                  <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; font-weight: 600;">Hi ${user.name},</p>
                  
                  <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #64748b;">
                    Your customer account has been successfully set up and is ready for action. You now have full access to our wallet services and developer management infrastructure.
                  </p>

                  <!-- Call to Action Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0;">
                    <tr>
                      <td align="center">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-weight: 600; font-size: 14px; padding: 12px 32px; text-decoration: none; border-radius: 6px; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);">
                          Go to Dashboard
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 0 0 4px 0; font-size: 14px; line-height: 20px; color: #64748b;">Cheers,</p>
                  <p style="margin: 0; font-size: 14px; line-height: 20px; font-weight: 600; color: #0f172a;">The ProxTools Team</p>
                </td>
              </tr>

              <!-- Footer Details -->
              <tr>
                <td style="padding: 0 24px 24px 24px; border-top: 1px solid #f1f5f9;">
                  <p style="margin: 20px 0 0 0; font-size: 12px; line-height: 18px; color: #94a3b8; text-align: center;">
                    If you didn't create an account with us, you can safely ignore this email.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `,
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
  const narration = formString(formData, "narration") || "Wallet top-up";
  const proof = formData.get("proof");

  if (amount < 100) {
    redirect("/balance?error=minimum");
  }

  if (!(proof instanceof File) || proof.size === 0) {
    redirect("/balance?error=proof");
  }

  if (proof.size > 5 * 1024 * 1024) {
    redirect("/balance?error=proof-size");
  }

  const bank = await db.query.adminBankAccounts.findFirst({
    where: eq(adminBankAccounts.isActive, true),
  });

  if (!bank) {
    redirect("/balance?error=no-bank");
  }

  let uploadedProof: { publicId: string; secureUrl: string; resourceType: string };
  try {
    uploadedProof = await uploadAsset(proof, "proxtools/payment-proofs");
  } catch (error) {
    console.error("Payment proof upload failed:", error);
    redirect("/balance?error=upload");
  }

  const [asset] = await db
    .insert(assets)
    .values({
      userId: user.id,
      publicId: uploadedProof.publicId,
      secureUrl: uploadedProof.secureUrl,
      resourceType: uploadedProof.resourceType,
    })
    .returning();

  await db.insert(deposits).values({
    userId: user.id,
    ref: `WAL-${Date.now()}`,
    amount: String(amount),
    method: "Bank Transfer",
    narration,
    proofAssetId: asset.id,
    proofUrl: uploadedProof.secureUrl,
    status: "Pending",
  });

  await addLog(user.id, "Wallet Top-up Pending", `Submitted bank transfer proof for ₦${amount}.`);
  revalidatePath("/balance");
  revalidatePath("/admin");
  redirect("/balance?deposit=pending");
}

export async function saveAdminBankAction(formData: FormData) {
  const admin = await requireUser("admin");
  const bankName = formString(formData, "bankName");
  const accountName = formString(formData, "accountName");
  const accountNumber = formString(formData, "accountNumber");
  const instructions = formString(formData, "instructions");

  if (!bankName || !accountName || !accountNumber) {
    redirect("/admin?bank=missing#payments");
  }

  const existing = await db.select().from(adminBankAccounts).limit(1);

  if (existing.length) {
    await db
      .update(adminBankAccounts)
      .set({ bankName, accountName, accountNumber, instructions, isActive: true, updatedAt: new Date() })
      .where(eq(adminBankAccounts.id, existing[0].id));
  } else {
    await db.insert(adminBankAccounts).values({ bankName, accountName, accountNumber, instructions, isActive: true });
  }

  await addLog(admin.id, "Admin Bank Updated", `Updated bank transfer account: ${bankName}.`);
  revalidatePath("/admin");
  revalidatePath("/balance");
  redirect("/admin?bank=saved#payments");
}

export async function approveDepositAction(formData: FormData) {
  const admin = await requireUser("admin");
  const depositId = formString(formData, "id");
  const [deposit] = await db.select().from(deposits).where(eq(deposits.id, depositId)).limit(1);

  if (!deposit || deposit.status !== "Pending" || deposit.method !== "Bank Transfer") {
    redirect("/admin#payments");
  }

  const amount = Number(deposit.amount);

  await db.batch([
    db
      .update(deposits)
      .set({ status: "Completed", reviewedBy: admin.id, reviewedAt: new Date() })
      .where(eq(deposits.id, deposit.id)),

    db
      .update(users)
      .set({
        wallet: sql`${users.wallet} + ${amount}`,
        deposited: sql`${users.deposited} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, deposit.userId)),

    db.insert(logs).values({
      userId: deposit.userId,
      event: "Wallet Top-up Approved",
      description: `Approved wallet top-up of ₦${amount}.`,
    }),
  ]);

  revalidatePath("/admin");
  revalidatePath("/balance");
  redirect("/admin#payments");
}

export async function rejectDepositAction(formData: FormData) {
  const admin = await requireUser("admin");
  const depositId = formString(formData, "id");
  const [deposit] = await db.select().from(deposits).where(eq(deposits.id, depositId)).limit(1);

  if (!deposit || deposit.status !== "Pending" || deposit.method !== "Bank Transfer") {
    redirect("/admin#payments");
  }

  await db
    .update(deposits)
    .set({ status: "Declined", reviewedBy: admin.id, reviewedAt: new Date() })
    .where(eq(deposits.id, deposit.id));

  await addLog(deposit.userId, "Wallet Top-up Declined", `Declined wallet top-up request ${deposit.ref}.`);
  revalidatePath("/admin");
  revalidatePath("/balance");
  redirect("/admin#payments");
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

export async function buyProductAction(formData: FormData) {
  const user = await requireUser("customer");
  const productId = formString(formData, "productId");
  const quantity = Math.max(1, Number(formData.get("quantity") || 1));

  if (!productId || !Number.isFinite(quantity)) {
    redirect("/products?error=invalid");
  }

  try {
    await purchaseShopProductForUser(user, productId, quantity);
  } catch (error) {
    console.error("Product purchase failed:", error);
    redirect("/products?error=purchase");
  }

  revalidatePath("/products");
  revalidatePath("/purchased");
  revalidatePath("/");
  redirect("/products?purchase=success");
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
