import { NextResponse } from "next/server";
import { getShopProducts, shopMarkupPercent } from "@/lib/services/shopviaclone";

export const runtime = "nodejs";

export async function GET() {
  try {
    const categories = await getShopProducts();
    return NextResponse.json({ success: true, markupPercent: shopMarkupPercent(), data: categories });
  } catch (error) {
    console.error("Error fetching ShopViaClone products:", error);
    return NextResponse.json({ message: "Failed to fetch ShopViaClone products." }, { status: 500 });
  }
}
