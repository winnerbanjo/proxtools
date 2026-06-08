import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["customer", "admin"]);
export const customerStatusEnum = pgEnum("customer_status", ["active", "suspended"]);
export const smsStatusEnum = pgEnum("sms_status", ["available", "sold"]);
export const planStatusEnum = pgEnum("plan_status", ["active", "out_of_stock"]);
export const orderKindEnum = pgEnum("order_kind", ["SMS", "SME"]);
export const recordStatusEnum = pgEnum("record_status", ["Draft", "Open", "Completed", "Pending", "Declined"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: text("phone"),
  role: userRoleEnum("role").notNull().default("customer"),
  status: customerStatusEnum("status").notNull().default("active"),
  wallet: numeric("wallet", { precision: 12, scale: 2 }).notNull().default("0"),
  deposited: numeric("deposited", { precision: 12, scale: 2 }).notNull().default("0"),
  spent: numeric("spent", { precision: 12, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const smsInventory = pgTable("sms_inventory", {
  id: uuid("id").primaryKey().defaultRandom(),
  service: text("service").notNull(),
  country: text("country").notNull(),
  number: text("number").notNull(),
  code: text("code").notNull().default("Waiting"),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  status: smsStatusEnum("status").notNull().default("available"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const dataPlans = pgTable("data_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  network: text("network").notNull(),
  bundle: text("bundle").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  status: planStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  kind: orderKindEnum("kind").notNull(),
  service: text("service"),
  country: text("country"),
  number: text("number"),
  code: text("code"),
  network: text("network"),
  bundle: text("bundle"),
  phone: text("phone"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status: recordStatusEnum("status").notNull().default("Completed"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const assets = pgTable("assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  publicId: text("public_id").notNull(),
  secureUrl: text("secure_url").notNull(),
  resourceType: text("resource_type").notNull().default("image"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const deposits = pgTable("deposits", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  ref: text("ref").notNull().unique(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  method: text("method").notNull(),
  narration: text("narration"),
  proofAssetId: uuid("proof_asset_id").references(() => assets.id, { onDelete: "set null" }),
  proofUrl: text("proof_url"),
  status: recordStatusEnum("status").notNull().default("Pending"),
  reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminBankAccounts = pgTable("admin_bank_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  bankName: text("bank_name").notNull(),
  accountName: text("account_name").notNull(),
  accountNumber: text("account_number").notNull(),
  instructions: text("instructions"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const logs = pgTable("logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  event: text("event").notNull(),
  description: text("description").notNull(),
  ipAddress: text("ip_address").notNull().default("127.0.0.1"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tickets = pgTable("tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  priority: text("priority").notNull().default("Normal"),
  message: text("message").notNull(),
  status: recordStatusEnum("status").notNull().default("Open"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  ref: text("ref").notNull().unique(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull(),
  status: recordStatusEnum("status").notNull().default("Draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const flights = pgTable("flights", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  from: text("from").notNull(),
  to: text("to").notNull(),
  departure: text("departure").notNull(),
  passengers: integer("passengers").notNull().default(1),
  status: recordStatusEnum("status").notNull().default("Draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type SmsInventory = typeof smsInventory.$inferSelect;
export type DataPlan = typeof dataPlans.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type AdminBankAccount = typeof adminBankAccounts.$inferSelect;
