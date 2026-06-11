import { Receipt } from "lucide-react";
import { DashboardShell, PageHeader } from "@/components/dashboard-shell";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { requireUser } from "@/lib/auth";
import { getCustomerDashboard } from "@/lib/queries";
import { money, shortDate } from "@/lib/utils";

export default async function PurchasedPage() {
  const user = await requireUser("customer");
  const data = await getCustomerDashboard(user.id);
  const smsOrders = data.orders.filter((order) => order.kind === "SMS");
  const dataOrders = data.orders.filter((order) => order.kind === "SME");
  const productOrders = data.orders.filter((order) => order.kind === "PRODUCT");

  return (
    <DashboardShell userName={user.name}>
      <PageHeader eyebrow="Orders" title="Purchased Orders" subtitle="View everything bought from SMS rentals to SME services and invoices." />
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Orders" value={data.orders.length} note="Completed orders" icon={<Receipt className="size-5" />} />
        <StatCard label="SMS Orders" value={smsOrders.length} note="Number rentals" icon={<Receipt className="size-5" />} />
        <StatCard label="SME Orders" value={dataOrders.length} note="Data purchases" icon={<Receipt className="size-5" />} />
        <StatCard label="Product Orders" value={productOrders.length} note="Shop purchases" icon={<Receipt className="size-5" />} />
      </section>
      <Card className="mt-4">
        <CardHeader><CardTitle>Latest Orders</CardTitle></CardHeader>
        <DataTable headers={["S/N", "Type", "Product / Network", "Details", "Amount", "Status", "Created At"]} rows={data.orders.map((order, index) => [index + 1, order.kind, order.productName || order.country || order.network || "-", order.externalRef || order.phone || order.number || "-", money(order.amount), <Badge key={order.id}>{order.status}</Badge>, shortDate(order.createdAt)])} empty="No orders yet." />
      </Card>
    </DashboardShell>
  );
}
