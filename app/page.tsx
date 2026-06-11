import Link from "next/link";
import { Activity, BadgeDollarSign, CreditCard, Package, Smartphone } from "lucide-react";
import { DashboardShell, PageHeader } from "@/components/dashboard-shell";
import { ListRow } from "@/components/list-row";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { requireUser } from "@/lib/auth";
import { getCustomerDashboard } from "@/lib/queries";
import { money, shortDate, toNumber } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getCustomerDashboard(user.id);
  const smsOrders = data.orders.filter((order) => order.kind === "SMS");
  const dataOrders = data.orders.filter((order) => order.kind === "SME");
  const productOrders = data.orders.filter((order) => order.kind === "PRODUCT");
  const usage = toNumber(user.deposited) ? Math.min(100, (toNumber(user.spent) / toNumber(user.deposited)) * 100) : 0;

  return (
    <DashboardShell userName={user.name}>
      <PageHeader
        eyebrow="Dashboard"
        title="Welcome Back"
        subtitle="Your wallet, stock-backed purchases, service history, and support activity are now backed by Neon and Drizzle."
        action={
          <>
            <Badge>Wallet Active</Badge>
            <Button asChild variant="secondary">
              <Link href="/balance">Top Up</Link>
            </Button>
          </>
        }
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Available Balance" value={money(user.wallet)} note={`Updated ${shortDate(user.updatedAt)}`} icon={<CreditCard className="size-5" />} />
        <StatCard label="Total Spent" value={money(user.spent)} note="All-time service usage" icon={<BadgeDollarSign className="size-5" />} />
        <StatCard label="Total Deposited" value={money(user.deposited)} note="Completed wallet top-ups" icon={<Activity className="size-5" />} />
        <StatCard label="Products" value={productOrders.length} note="Shop purchases" icon={<Package className="size-5" />} />
      </section>
      <section className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {[
              ["Wallet", "Top Up", "/balance"],
              ["SMS", "Buy Number", "/sms-services"],
              ["SME", "Buy Data", "/sme-services"],
              ["Products", "Buy Product", "/products"],
            ].map(([label, note, href]) => (
              <Link key={href} href={href} className="rounded-md border bg-secondary p-4 no-underline hover:bg-blue-50">
                <strong className="block">{label}</strong>
                <span className="text-sm text-muted-foreground">{note}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Spend Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <ListRow label="SMS Orders" value={smsOrders.length} />
            <ListRow label="SME Orders" value={dataOrders.length} />
            <ListRow label="Product Orders" value={productOrders.length} />
            <ListRow label="Usage" value={`${usage.toFixed(1)}%`} />
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <span className="block h-full bg-gradient-to-r from-primary to-emerald-500" style={{ width: `${usage}%` }} />
            </div>
            <ListRow label="Balance" value={money(user.wallet)} />
          </CardContent>
        </Card>
      </section>
      <section className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {data.logs.slice(0, 4).length ? (
              data.logs.slice(0, 4).map((log) => (
                <div key={log.id} className="border-t pt-3 first:border-t-0 first:pt-0">
                  <strong className="block text-sm">{log.event}</strong>
                  <span className="block text-sm text-muted-foreground">{log.description}</span>
                  <small className="text-muted-foreground">{shortDate(log.createdAt)}</small>
                </div>
              ))
            ) : (
              <p className="rounded-md border border-dashed p-8 text-center text-sm font-semibold text-muted-foreground">No recent activity.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Inventory Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <ListRow label="SMS numbers available" value={data.sms.filter((item) => item.status === "available").length} />
            <ListRow label="SME plans active" value={data.plans.filter((item) => item.status === "active").length} />
            <ListRow label="Total orders" value={data.orders.length} />
          </CardContent>
        </Card>
      </section>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Latest Orders</CardTitle>
        </CardHeader>
        <DataTable
          headers={["S/N", "Type", "Product / Network", "Amount", "Status", "Created At"]}
          rows={data.orders.slice(0, 5).map((order, index) => [index + 1, order.kind, order.productName || order.country || order.network || "-", money(order.amount), <Badge key={order.id}>{order.status}</Badge>, shortDate(order.createdAt)])}
          empty="No orders yet."
        />
      </Card>
    </DashboardShell>
  );
}
