import { Wifi } from "lucide-react";
import { DashboardShell, Field, PageHeader } from "@/components/dashboard-shell";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DataTable } from "@/components/ui/table";
import { buyDataAction } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { getCustomerDashboard } from "@/lib/queries";
import { money } from "@/lib/utils";

export default async function SmeServicesPage() {
  const user = await requireUser("customer");
  const data = await getCustomerDashboard(user.id);
  const activePlans = data.plans.filter((item) => item.status === "active");
  const dataOrders = data.orders.filter((order) => order.kind === "SME");

  return (
    <DashboardShell userName={user.name}>
      <PageHeader eyebrow="Services" title="SME Services" subtitle="Purchase data bundles from available admin-managed stock." />
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Available Balance" value={money(user.wallet)} note="Ready for data purchases" icon={<Wifi className="size-5" />} />
        <StatCard label="Active Plans" value={activePlans.length} note="Sellable SME bundles" icon={<Wifi className="size-5" />} />
        <StatCard label="Completed SME Orders" value={dataOrders.length} note="Data purchases" icon={<Wifi className="size-5" />} />
      </section>
      <section className="mt-4 grid gap-4 xl:grid-cols-[1.45fr_0.55fr]">
        <Card>
          <CardHeader><CardTitle>Buy Data</CardTitle></CardHeader>
          <CardContent>
            <form action={buyDataAction} className="grid gap-4 md:grid-cols-2">
              <Field label="Plan" full><Select name="planId">{activePlans.map((plan) => <option key={plan.id} value={plan.id}>{plan.network} {plan.bundle} - {money(plan.price)} ({plan.stock} left)</option>)}</Select></Field>
              <Field label="Phone Number"><Input name="phone" placeholder="08012345678" required /></Field>
              <Field label="Quantity"><Input name="quantity" type="number" defaultValue="1" min="1" max="10" /></Field>
              <div className="md:col-span-2"><Button type="submit">Purchase Data</Button></div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Bundle Rates</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {activePlans.map((plan) => (
              <div key={plan.id} className="flex justify-between gap-3 border-t pt-3 first:border-t-0 first:pt-0">
                <span className="text-sm text-muted-foreground">{plan.network} {plan.bundle}</span>
                <strong className="text-sm">{money(plan.price)} / {plan.stock}</strong>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
      <Card className="mt-4">
        <CardHeader><CardTitle>SME Purchase History</CardTitle></CardHeader>
        <DataTable headers={["S/N", "Network", "Plan", "Phone", "Amount", "Status"]} rows={dataOrders.map((order, index) => [index + 1, order.network || "-", order.bundle || "-", order.phone || "-", money(order.amount), <Badge key={order.id}>{order.status}</Badge>])} empty="No SME purchases yet." />
      </Card>
    </DashboardShell>
  );
}
