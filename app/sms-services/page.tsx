import { Smartphone } from "lucide-react";
import { DashboardShell, Field, PageHeader } from "@/components/dashboard-shell";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DataTable } from "@/components/ui/table";
import { buySmsAction } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { getCustomerDashboard } from "@/lib/queries";
import { money } from "@/lib/utils";

export default async function SmsServicesPage() {
  const user = await requireUser("customer");
  const data = await getCustomerDashboard(user.id);
  const available = data.sms.filter((item) => item.status === "available");
  const services = [...new Set(available.map((item) => item.service))];
  const countries = [...new Set(available.map((item) => item.country))];
  const smsOrders = data.orders.filter((order) => order.kind === "SMS");

  return (
    <DashboardShell userName={user.name} accountRole={user.role}>
      <PageHeader eyebrow="Services" title="SMS Services" subtitle="Buy virtual numbers only when matching admin inventory is available." />
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Available Balance" value={money(user.wallet)} note="Ready for SMS activations" icon={<Smartphone className="size-5" />} />
        <StatCard label="Available Numbers" value={available.length} note="Stock controlled by admin" icon={<Smartphone className="size-5" />} />
        <StatCard label="Completed SMS Orders" value={smsOrders.length} note="Successful activations" icon={<Smartphone className="size-5" />} />
      </section>
      <section className="mt-4 grid gap-4 xl:grid-cols-[1.45fr_0.55fr]">
        <Card>
          <CardHeader><CardTitle>Buy SMS Number</CardTitle></CardHeader>
          <CardContent>
            <form action={buySmsAction} className="grid gap-4 md:grid-cols-2">
              <Field label="Service"><Select name="service">{services.map((service) => <option key={service}>{service}</option>)}</Select></Field>
              <Field label="Country"><Select name="country">{countries.map((country) => <option key={country}>{country}</option>)}</Select></Field>
              <Field label="Quantity"><Input name="quantity" type="number" defaultValue="1" min="1" max="5" /></Field>
              <Field label="Estimated Amount"><Input value={available.length ? "Calculated on submit" : "No matching stock"} readOnly /></Field>
              <div className="md:col-span-2"><Button type="submit">Buy Number</Button></div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Available Stock</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {available.slice(0, 6).map((item) => (
              <div key={item.id} className="flex justify-between gap-3 border-t pt-3 first:border-t-0 first:pt-0">
                <span className="text-sm text-muted-foreground">{item.service} {item.country}</span>
                <strong className="text-sm">{money(item.price)}</strong>
              </div>
            ))}
            {!available.length ? <p className="text-sm font-semibold text-muted-foreground">No SMS stock available.</p> : null}
          </CardContent>
        </Card>
      </section>
      <Card className="mt-4">
        <CardHeader><CardTitle>SMS Orders</CardTitle></CardHeader>
        <DataTable headers={["S/N", "Service", "Country", "Number", "Code", "Status"]} rows={smsOrders.map((order, index) => [index + 1, order.service || "-", order.country || "-", order.number || "-", order.code || "Waiting", <Badge key={order.id}>{order.status}</Badge>])} empty="No SMS orders yet." />
      </Card>
    </DashboardShell>
  );
}
