import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { deposits } from "@/lib/db/schema";
import { currentUser } from "@/lib/auth";

export const runtime = "nodejs";

const KORAPAY_INITIALIZE_URL = "https://api.korapay.com/merchant/api/v1/charges/initialize";

function appOrigin(req: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "customer") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const secretKey = process.env.KORAPAY_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ message: "KoraPay secret key is not configured" }, { status: 500 });
    }

    const body = await req.json();
    const amount = Number(body.amount || 0);

    if (!Number.isFinite(amount) || amount < 100) {
      return NextResponse.json({ message: "Enter at least ₦100 to fund your wallet." }, { status: 400 });
    }

    const reference = `KORA-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const origin = appOrigin(req);
    const redirectUrl = `${origin}/balance?kora_reference=${encodeURIComponent(reference)}`;

    await db.insert(deposits).values({
      userId: user.id,
      ref: reference,
      amount: amount.toFixed(2),
      method: "KoraPay",
      narration: "KoraPay wallet top-up",
      status: "Pending",
    });

    const response = await fetch(KORAPAY_INITIALIZE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify({
        amount,
        currency: "NGN",
        reference,
        customer: {
          email: user.email,
          name: user.name,
        },
        metadata: {
          user_id: user.id,
          deposit_id: reference,
        },
        merchant_bears_cost: true,
        redirect_url: redirectUrl,
        notification_url: `${origin}/api/korapay/webhook`,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      await db.update(deposits).set({ status: "Declined", reviewedAt: new Date() }).where(eq(deposits.ref, reference));
      return NextResponse.json({ message: data.message || "Failed to initialize KoraPay charge" }, { status: response.status || 502 });
    }

    return NextResponse.json({ ...data, reference });
  } catch (error) {
    console.error("Error initializing KoraPay charge:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
