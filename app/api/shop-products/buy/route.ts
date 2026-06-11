import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import {
  ProductPurchaseError,
  purchaseShopProductForUser,
} from "@/lib/services/product-purchases";
import { ShopViaCloneError } from "@/lib/services/shopviaclone";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  console.log("========== PURCHASE REQUEST START ==========");

  try {
    console.log("[1] Request received", {
      method: req.method,
      url: req.url,
      contentType: req.headers.get("content-type"),
    });

    const user = await currentUser();

    console.log("[2] Current user loaded", {
      id: user?.id,
      role: user?.role,
      email: user?.email,
    });

    if (!user || !["customer", "admin"].includes(user.role)) {
      console.warn("[3] Unauthorized request", {
        userExists: !!user,
        role: user?.role,
      });

      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const contentType = req.headers.get("content-type") || "";

    let productId = "";
    let quantity = 1;

    console.log("[4] Parsing request body");

    if (contentType.includes("application/json")) {
      const body = await req.json();

      console.log("[5] JSON body received", body);

      productId = String(body.productId || body.id || "");
      quantity = Number(body.quantity || body.amount || 1);
    } else {
      const formData = await req.formData();

      console.log(
        "[5] FormData received",
        Object.fromEntries(formData.entries())
      );

      productId = String(formData.get("productId") || formData.get("id") || "");
      quantity = Number(
        formData.get("quantity") || formData.get("amount") || 1
      );
    }

    console.log("[6] Parsed purchase payload", {
      productId,
      quantity,
    });

    console.log("[7] Calling purchaseShopProductForUser");

    const purchase = await purchaseShopProductForUser(
      user,
      productId,
      quantity
    );

    console.log("[8] Purchase service completed", purchase);

    console.log("========== PURCHASE REQUEST SUCCESS ==========");

    return NextResponse.json({
      success: true,
      ...purchase,
    });
  } catch (error) {
    console.error("========== PURCHASE REQUEST FAILED ==========");
    console.error("[ERROR]", error);

    if (error instanceof Error) {
      console.error("[ERROR MESSAGE]", error.message);
      console.error("[ERROR STACK]", error.stack);
    }

    const status =
      error instanceof ProductPurchaseError ||
        error instanceof ShopViaCloneError
        ? error.status
        : 500;

    const message =
      error instanceof Error
        ? error.message
        : "Product purchase failed.";

    console.error("[RESPONSE]", {
      status,
      message,
    });

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status }
    );
  } finally {
    console.log("========== PURCHASE REQUEST END ==========");
  }
}
