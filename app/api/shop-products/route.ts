import { NextResponse } from "next/server";
import { getCachedUsdToNgnRate } from "@/lib/services/currency";
import { getShopProducts, shopMarkupPercent } from "@/lib/services/shopviaclone";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [categories, rate] = await Promise.all([getShopProducts(), getCachedUsdToNgnRate()]);
    return NextResponse.json({ success: true, markupPercent: shopMarkupPercent(), rate, data: categories });
  } catch (error) {
    console.error("Error fetching ShopViaClone products:", error);
    return NextResponse.json({ message: "Failed to fetch ShopViaClone products." }, { status: 500 });
  }
}
