import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { purchaseShopProductForUser } from "@/lib/services/product-purchases";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "customer") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    let productId = "";
    let quantity = 1;

    if (contentType.includes("application/json")) {
      const body = await req.json();
      productId = String(body.productId || body.id || "");
      quantity = Number(body.quantity || body.amount || 1);
    } else {
      const formData = await req.formData();
      productId = String(formData.get("productId") || formData.get("id") || "");
      quantity = Number(formData.get("quantity") || formData.get("amount") || 1);
    }

    const purchase = await purchaseShopProductForUser(user, productId, quantity);
    return NextResponse.json({ success: true, ...purchase });
  } catch (error) {
    console.error("Error processing ShopViaClone purchase:", error);
    return NextResponse.json({ message: error instanceof Error ? error.message : "Product purchase failed." }, { status: 400 });
  }
}
