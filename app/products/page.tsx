import { Package, ShoppingCart } from "lucide-react";
import { DashboardShell, Field, PageHeader } from "@/components/dashboard-shell";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buyProductAction } from "@/lib/actions";
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
      <PageHeader eyebrow="Marketplace" title="Products" subtitle={`ShopViaClone USD prices are converted to naira, then a ${shopMarkupPercent()}% wallet markup is applied automatically${rateSource ? ` via ${rateSource}` : ""}.`} />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Available Balance" value={money(user.wallet)} note="Ready for purchases" icon={<ShoppingCart className="size-5" />} />
        <StatCard label="Available Products" value={available.length} note="Live ShopViaClone stock" icon={<Package className="size-5" />} />
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
              {category.products.map((product) => {
                const outOfStock = product.amount <= 0;
                return (
                  <article key={product.id} className="grid gap-3 rounded-md border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-base font-bold leading-6">{product.name}</h2>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{product.amount} in stock</p>
                      </div>
                      <strong className="whitespace-nowrap text-sm">{money(product.markedUpPrice)}</strong>
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground">${product.priceUsd.toFixed(2)} base price</p>
                    {product.description ? <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{product.description}</p> : null}
                    <form action={buyProductAction} className="mt-auto grid gap-3">
                      <input type="hidden" name="productId" value={product.id} />
                      <Field label="Quantity">
                        <Input name="quantity" type="number" min="1" max={Math.max(1, product.amount)} defaultValue="1" disabled={outOfStock} />
                      </Field>
                      <Button type="submit" disabled={outOfStock}>
                        <ShoppingCart className="size-4" />
                        {outOfStock ? "Out of Stock" : "Buy Product"}
                      </Button>
                    </form>
                  </article>
                );
              })}
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
