import "server-only";

import { getCachedUsdToNgnRate } from "@/lib/services/currency";

const SHOP_PRODUCTS_URL = "https://shopviaclone22.com/api/products.php";
const SHOP_BUY_URL = "https://shopviaclone22.com/api/buy_product";

export type ShopProduct = {
  id: string;
  name: string;
  priceUsd: number;
  priceNgn: number;
  markedUpPrice: number;
  amount: number;
  description: string;
  categoryId: string;
  categoryName: string;
  categoryIcon?: string;
  raw: Record<string, unknown>;
};

export type ShopCategory = {
  id: string;
  name: string;
  icon?: string;
  products: ShopProduct[];
};

function apiKey() {
  const key = process.env.SHOPCLONEAPI;
  if (!key) throw new Error("SHOPCLONEAPI is not configured.");
  return key;
}

export function shopMarkupPercent() {
  const percent = Number(process.env.SHOPCLONE_MARKUP_PERCENT ?? "20");
  return Number.isFinite(percent) && percent >= 0 ? percent : 20;
}

function withMarkup(priceNgn: number) {
  return Number((priceNgn * (1 + shopMarkupPercent() / 100)).toFixed(2));
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" || typeof value === "number" ? String(value) : fallback;
}

function number(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeProduct(raw: Record<string, unknown>, category: Record<string, unknown>, usdToNgnRate: number): ShopProduct {
  const priceUsd = number(raw.price);
  const priceNgn = Number((priceUsd * usdToNgnRate).toFixed(2));
  const categoryId = text(category.id ?? category.category_id ?? category.name, "uncategorized");
  const categoryName = text(category.name ?? category.category ?? category.title, "Products");

  return {
    id: text(raw.id ?? raw.product_id),
    name: text(raw.name ?? raw.product_name ?? raw.title, "Untitled product"),
    priceUsd,
    priceNgn,
    markedUpPrice: withMarkup(priceNgn),
    amount: number(raw.amount ?? raw.stock ?? raw.quantity),
    description: text(raw.description ?? raw.details),
    categoryId,
    categoryName,
    categoryIcon: text(category.icon ?? category.image, ""),
    raw,
  };
}

export async function getShopProducts(): Promise<ShopCategory[]> {
  const { rate } = await getCachedUsdToNgnRate();
  const url = `${SHOP_PRODUCTS_URL}?api_key=${encodeURIComponent(apiKey())}`;
  const response = await fetch(url, { next: { revalidate: 60 } });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Failed to fetch ShopViaClone products.");
  }

  const source = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.categories)
        ? data.categories
        : [];
  const categories: ShopCategory[] = source.map((category: Record<string, unknown>, index: number) => {
    const products = Array.isArray(category.products) ? category.products : [];
    const fallbackName = text(category.name ?? category.category ?? category.title, `Category ${index + 1}`);

    return {
      id: text(category.id ?? category.category_id ?? fallbackName, `category-${index}`),
      name: fallbackName,
      icon: text(category.icon ?? category.image, ""),
      products: products
        .map((product) => normalizeProduct(product as Record<string, unknown>, category, rate))
        .filter((product) => product.id),
    };
  });

  return categories.filter((category) => category.products.length > 0);
}

export async function findShopProduct(productId: string) {
  const categories = await getShopProducts();
  return categories.flatMap((category) => category.products).find((product) => product.id === productId) || null;
}

export async function buyShopProduct(productId: string, quantity: number) {
  const formData = new FormData();
  formData.set("action", "buyProduct");
  formData.set("id", productId);
  formData.set("amount", String(quantity));
  formData.set("api_key", apiKey());

  const response = await fetch(SHOP_BUY_URL, {
    method: "POST",
    body: formData,
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "External product purchase failed.");
  }

  return data;
}
