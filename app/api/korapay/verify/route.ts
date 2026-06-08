import { NextRequest, NextResponse } from "next/server";
import { creditKoraDeposit } from "@/lib/services/kora";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const reference = req.nextUrl.searchParams.get("reference");
    const secretKey = process.env.KORAPAY_SECRET_KEY;

    if (!reference) {
      return NextResponse.json({ message: "Transaction reference is required" }, { status: 400 });
    }

    if (!secretKey) {
      return NextResponse.json({ message: "KoraPay secret key is not configured" }, { status: 500 });
    }

    const response = await fetch(`https://api.korapay.com/merchant/api/v1/charges/${encodeURIComponent(reference)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ message: data.message || "Failed to verify KoraPay charge" }, { status: response.status });
    }

    const koraStatus = data.data?.status;
    const amount = data.data?.amount === undefined ? undefined : Number(data.data.amount);
    const creditStatus = await creditKoraDeposit(reference, koraStatus, amount);

    return NextResponse.json({ ...data, credit_status: creditStatus });
  } catch (error) {
    console.error("Error verifying KoraPay charge:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
