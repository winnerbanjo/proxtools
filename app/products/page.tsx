import { Package, ShoppingCart } from "lucide-react";
import { DashboardShell, PageHeader } from "@/components/dashboard-shell";
import { ProductPurchaseCard } from "@/components/product-purchase-card";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getCustomerDashboard } from "@/lib/queries";
import { getCachedUsdToNgnRate } from "@/lib/services/currency";
import { getShopProducts, shopMarkupPercent, type ShopCategory } from "@/lib/services/shopviaclone";
import { money } from "@/lib/utils";

const errorMessages: Record<string, string> = {
  invalid: "Choose a product and quantity before purchasing.",
  products: "Products could not be loaded. Please try again.",
  stock: "That product does not have enough stock.",
  wallet: "Your wallet balance is not enough for that purchase.",
  purchase: "The product purchase could not be completed.",
};

export default async function ProductsPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) || {};
  const user = await requireUser("customer");
  const data = await getCustomerDashboard(user.id);
  const productOrders = data.orders.filter((order) => order.kind === "PRODUCT");
  let categories: ShopCategory[] = [];
  let loadError = "";
  let rateSource = "";

  try {
    const [shopCategories, rate] = await Promise.all([getShopProducts(), getCachedUsdToNgnRate()]);
    categories = shopCategories;
    rateSource = rate.source;
  } catch (error) {
    console.error("Unable to fetch ShopViaClone products:", error);
    loadError = "Products are temporarily unavailable.";
  }

  const products = categories.flatMap((category) => category.products);
  const available = products.filter((product) => product.amount > 0);
  const error = typeof params.error === "string" ? errorMessages[params.error] : "";
  const success = params.purchase === "success";

  return (
    <DashboardShell userName={user.name}>

      <Badge className="mt-4 w-fit mb-10 border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
        All accounts should be logged in with a US address to reduce the chance of account lock.
      </Badge>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Available Balance" value={money(user.wallet)} note="Ready for purchases" icon={<ShoppingCart className="size-5" />} />
        <StatCard label="Available Products" value={available.length} note="Live stock" icon={<Package className="size-5" />} />
        <StatCard label="Product Orders" value={productOrders.length} note="Completed product buys" icon={<Package className="size-5" />} />
      </section>

      {success ? <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">Product purchase completed.</p> : null}
      {error || loadError ? <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error || loadError}</p> : null}

      <section className="mt-4 grid gap-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2">
                {category.name}
                <Badge className="border-slate-200 bg-white text-muted-foreground">{category.products.length} items</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {category.products.map((product) => <ProductPurchaseCard key={product.id} product={product} />)}
            </CardContent>
          </Card>
        ))}

        {!categories.length && !loadError ? (
          <Card>
            <CardContent className="p-8 text-center text-sm font-semibold text-muted-foreground">No products available.</CardContent>
          </Card>
        ) : null}
      </section>
    </DashboardShell>
  );
}
