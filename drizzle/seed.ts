import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { dataPlans, smsInventory, users } from "../lib/db/schema";

async function main() {
  const demoUsers = [
    { name: "Demo User", email: "user@proxtools.test", password: "user12345", phone: "08012345678", role: "customer" as const },
    { name: "Admin", email: "admin@proxtools.test", password: "admin12345", role: "admin" as const },
  ];

  for (const user of demoUsers) {
    const existing = await db.select().from(users).where(eq(users.email, user.email)).limit(1);
    if (!existing.length) {
      await db.insert(users).values({
        name: user.name,
        email: user.email,
        phone: "phone" in user ? user.phone : null,
        role: user.role,
        passwordHash: await hash(user.password, 12),
      });
    }
  }

  const existingSms = await db.select().from(smsInventory).limit(1);
  if (!existingSms.length) {
    await db.insert(smsInventory).values([
      { service: "WhatsApp", country: "Nigeria", number: "+234 812 000 1001", code: "482910", price: "350" },
      { service: "Telegram", country: "Nigeria", number: "+234 812 000 1002", code: "719204", price: "280" },
      { service: "Google", country: "United States", number: "+1 213 555 0108", code: "338190", price: "900" },
      { service: "Instagram", country: "United Kingdom", number: "+44 7400 123456", code: "921774", price: "750" },
    ]);
  }

  const existingPlans = await db.select().from(dataPlans).limit(1);
  if (!existingPlans.length) {
    await db.insert(dataPlans).values([
      { network: "MTN", bundle: "1GB - 30 Days", price: "650", stock: 24 },
      { network: "Airtel", bundle: "1GB - 30 Days", price: "670", stock: 18 },
      { network: "Glo", bundle: "2GB - 30 Days", price: "1200", stock: 14 },
      { network: "9mobile", bundle: "5GB - 30 Days", price: "3100", stock: 9 },
    ]);
  }
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
