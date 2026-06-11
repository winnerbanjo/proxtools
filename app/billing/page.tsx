import { DashboardShell, Field, PageHeader } from "@/components/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { createInvoiceAction } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { getCustomerDashboard } from "@/lib/queries";
import { money, shortDate } from "@/lib/utils";

export default async function BillingPage() {
  const user = await requireUser("customer");
  const data = await getCustomerDashboard(user.id);
  const outstanding = data.invoices.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <DashboardShell userName={user.name} accountRole={user.role}>
      <PageHeader eyebrow="Quick Action" title="Billing" subtitle="Create and review invoices tied to wallet funding and service purchases." />
      <section className="grid gap-4 xl:grid-cols-[1.45fr_0.55fr]">
        <Card>
          <CardHeader><CardTitle>New Invoice</CardTitle></CardHeader>
          <CardContent>
            <form action={createInvoiceAction} className="grid gap-4 md:grid-cols-2">
              <Field label="Customer Name"><Input value={user.name} readOnly /></Field>
              <Field label="Amount"><Input name="amount" type="number" placeholder="0.00" min="1" required /></Field>
              <Field label="Description" full><Input name="description" placeholder="Invoice description" required /></Field>
              <div className="md:col-span-2"><Button type="submit">Create Invoice</Button></div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Billing Summary</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><strong>{money(user.deposited)}</strong></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Outstanding</span><strong>{money(outstanding)}</strong></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Invoices</span><strong>{data.invoices.length}</strong></div>
          </CardContent>
        </Card>
      </section>
      <Card className="mt-4">
        <CardHeader><CardTitle>Invoices</CardTitle></CardHeader>
        <DataTable headers={["S/N", "Invoice", "Amount", "Status", "Created At"]} rows={data.invoices.map((invoice, index) => [index + 1, invoice.ref, money(invoice.amount), <Badge key={invoice.id} className="border-slate-200 bg-white text-muted-foreground">{invoice.status}</Badge>, shortDate(invoice.createdAt)])} empty="No invoices yet." />
      </Card>
    </DashboardShell>
  );
}
