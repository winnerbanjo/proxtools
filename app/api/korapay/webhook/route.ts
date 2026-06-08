import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { creditKoraDeposit } from "@/lib/services/kora";

export const runtime = "nodejs";

function signaturesMatch(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(received, "hex");

  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const secretKey = process.env.KORAPAY_SECRET_KEY;
    if (!secretKey) {
      console.error(`[KORA][${requestId}] KORAPAY_SECRET_KEY is not set`);
      return new NextResponse("Server Error", { status: 500 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get("x-korapay-signature");

    if (!signature) {
      return new NextResponse("Missing signature", { status: 401 });
    }

    let payload: { event?: string; data?: Record<string, unknown> };
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return new NextResponse("Invalid JSON", { status: 400 });
    }

    const data = payload.data || {};
    const computedHash = createHmac("sha256", secretKey).update(JSON.stringify(data)).digest("hex");

    if (!signaturesMatch(computedHash, signature)) {
      console.warn(`[KORA][${requestId}] Signature mismatch`);
      return new NextResponse("Invalid signature", { status: 401 });
    }

    if (payload.event === "charge.success") {
      const reference = String(data.payment_reference || data.reference || "");
      const status = typeof data.status === "string" ? data.status : undefined;
      const amount = data.amount === undefined ? undefined : Number(data.amount);

      if (!reference) {
        return new NextResponse("Missing reference", { status: 400 });
      }

      const creditStatus = await creditKoraDeposit(reference, status, amount);
      console.info(`[KORA][${requestId}] charge.success handled`, { reference, creditStatus });
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error(`[KORA][${requestId}] Unhandled webhook error`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
