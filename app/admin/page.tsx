import { Building2, Database, ExternalLink, Receipt, Smartphone } from "lucide-react";
import { DashboardShell, Field, PageHeader } from "@/components/dashboard-shell";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/ui/table";
import { addPlanAction, addSmsAction, approveDepositAction, deletePlanAction, deleteSmsAction, rejectDepositAction, saveAdminBankAction } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { getAdminDashboard } from "@/lib/queries";
import { money, shortDate } from "@/lib/utils";
import { SubmitButton } from "@/components/submit-button";

function depositStatusClass(status: string) {
  if (status === "Pending") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "Declined") return "border-red-200 bg-red-50 text-red-700";
  return "";
}

export default async function AdminPage() {
  const admin = await requireUser("admin");
  const data = await getAdminDashboard();
  const soldSms = data.sms.filter((item) => item.status === "sold").length;

  return (
    <DashboardShell role="Admin" userName={admin.name}>
      <PageHeader eyebrow="Admin Console" title="Store Control Center" subtitle="Manage sellable inventory, inspect customers, review purchases, and audit wallet/service events." />
      <section id="overview" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="SMS Available" value={data.sms.filter((item) => item.status === "available").length} note="Numbers customers can buy" icon={<Smartphone className="size-5" />} />
        <StatCard label="SMS Sold" value={soldSms} note="Purchased numbers" icon={<Receipt className="size-5" />} />
        <StatCard label="Data Plans" value={data.plans.length} note="Plans in catalog" icon={<Database className="size-5" />} />
        <StatCard label="Pending Deposits" value={data.deposits.filter((deposit) => deposit.status === "Pending").length} note="Transfers awaiting review" icon={<Building2 className="size-5" />} />
      </section>
      <section id="payments" className="mt-4 grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <Card>
          <CardHeader><CardTitle>Bank Transfer Account</CardTitle></CardHeader>
          <CardContent>
            <form action={saveAdminBankAction} className="grid gap-4">
              <Field label="Bank Name"><Input name="bankName" placeholder="Opay" defaultValue={data.bankAccount?.bankName || ""} required /></Field>
              <Field label="Account Name"><Input name="accountName" placeholder="ProxTools Limited" defaultValue={data.bankAccount?.accountName || ""} required /></Field>
              <Field label="Account Number"><Input name="accountNumber" placeholder="0000000000" defaultValue={data.bankAccount?.accountNumber || ""} required /></Field>
              <Field label="Transfer Instructions"><Textarea name="instructions" placeholder="Use your wallet top-up reference as narration." defaultValue={data.bankAccount?.instructions || ""} /></Field>
              <SubmitButton defaultText="Save Bank Details" pendingText="Saving Bank Details..." />
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Deposit Review Queue</CardTitle></CardHeader>
          <DataTable
            headers={["S/N", "Customer", "Reference", "Amount", "Proof", "Status", "Action"]}
            rows={data.deposits.map((deposit, index) => [
              index + 1,
              <span key={`${deposit.id}-customer`} className="grid gap-1">
                <strong>{deposit.customerName || "Customer"}</strong>
                <span className="text-xs text-muted-foreground">{deposit.customerEmail || "-"}</span>
              </span>,
              deposit.ref,
              money(deposit.amount),
              deposit.proofUrl ? (
                <Button key={`${deposit.id}-proof`} asChild size="sm" variant="secondary">
                  <a href={deposit.proofUrl} target="_blank" rel="noreferrer" className="no-underline">
                    <ExternalLink className="size-4" />
                    View
                  </a>
                </Button>
              ) : "-",
              <Badge key={`${deposit.id}-status`} className={depositStatusClass(deposit.status)}>{deposit.status}</Badge>,
              deposit.status === "Pending" && deposit.method === "Bank Transfer" ? (
                <div key={`${deposit.id}-actions`} className="flex flex-wrap gap-2">
                  <form action={approveDepositAction}>
                    <input type="hidden" name="id" value={deposit.id} />
                    <Button size="sm" type="submit">Approve</Button>
                  </form>
                  <form action={rejectDepositAction}>
                    <input type="hidden" name="id" value={deposit.id} />
                    <Button size="sm" variant="destructive" type="submit">Reject</Button>
                  </form>
                </div>
              ) : deposit.status === "Pending" ? "Gateway pending" : deposit.reviewedAt ? shortDate(deposit.reviewedAt) : "-",
            ])}
            empty="No deposit requests yet."
          />
        </Card>
      </section>
      <section id="products" className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Add SMS Number</CardTitle></CardHeader>
          <CardContent>
            <form action={addSmsAction} className="grid gap-4 md:grid-cols-2">
              <Field label="Service"><Input name="service" placeholder="WhatsApp" required /></Field>
              <Field label="Country"><Input name="country" placeholder="Nigeria" required /></Field>
              <Field label="Number"><Input name="number" placeholder="+234 800 000 0000" required /></Field>
              <Field label="Code"><Input name="code" placeholder="Waiting or 123456" /></Field>
              <Field label="Price"><Input name="price" type="number" min="1" defaultValue="350" required /></Field>
              <div className="md:col-span-2"><Button type="submit">Add SMS Stock</Button></div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Add SME Data Plan</CardTitle></CardHeader>
          <CardContent>
            <form action={addPlanAction} className="grid gap-4 md:grid-cols-2">
              <Field label="Network"><Input name="network" placeholder="MTN" required /></Field>
              <Field label="Bundle"><Input name="bundle" placeholder="1GB - 30 Days" required /></Field>
              <Field label="Price"><Input name="price" type="number" min="1" defaultValue="650" required /></Field>
              <Field label="Stock Units"><Input name="stock" type="number" min="0" defaultValue="10" required /></Field>
              <div className="md:col-span-2"><Button type="submit">Add Data Plan</Button></div>
            </form>
          </CardContent>
        </Card>
      </section>
      <Card className="mt-4">
        <CardHeader><CardTitle>SMS Inventory</CardTitle></CardHeader>
        <DataTable
          headers={["S/N", "Service", "Country", "Number", "Price", "Status", "Action"]}
          rows={data.sms.map((item, index) => [
            index + 1,
            item.service,
            item.country,
            item.number,
            money(item.price),
            <Badge key={item.id} className={item.status === "sold" ? "border-slate-200 bg-white text-muted-foreground" : ""}>{item.status}</Badge>,
            <form key={`${item.id}-form`} action={deleteSmsAction}><input type="hidden" name="id" value={item.id} /><Button size="sm" variant="destructive" type="submit">Delete</Button></form>,
          ])}
          empty="No SMS inventory yet."
        />
      </Card>
      <Card className="mt-4">
        <CardHeader><CardTitle>SME Data Inventory</CardTitle></CardHeader>
        <DataTable
          headers={["S/N", "Network", "Bundle", "Price", "Stock", "Status", "Action"]}
          rows={data.plans.map((plan, index) => [
            index + 1,
            plan.network,
            plan.bundle,
            money(plan.price),
            plan.stock,
            <Badge key={plan.id} className={plan.status === "out_of_stock" ? "border-orange-200 bg-orange-50 text-orange-700" : ""}>{plan.status}</Badge>,
            <form key={`${plan.id}-form`} action={deletePlanAction}><input type="hidden" name="id" value={plan.id} /><Button size="sm" variant="destructive" type="submit">Delete</Button></form>,
          ])}
          empty="No data plans yet."
        />
      </Card>
      <Card id="customers" className="mt-4">
        <CardHeader><CardTitle>Customers</CardTitle></CardHeader>
        <DataTable headers={["S/N", "Name", "Email", "Phone", "Wallet", "Status", "Created At"]} rows={data.customers.filter((user) => user.role === "customer").map((customer, index) => [index + 1, customer.name, customer.email, customer.phone || "-", money(customer.wallet), <Badge key={customer.id}>{customer.status}</Badge>, shortDate(customer.createdAt)])} empty="No customers yet." />
      </Card>
      <Card id="orders" className="mt-4">
        <CardHeader><CardTitle>Customer Orders</CardTitle></CardHeader>
        <DataTable headers={["S/N", "Type", "Product", "Country / Phone", "Amount", "Status", "Created At"]} rows={data.orders.map((order, index) => [index + 1, order.kind, order.service || order.network || "-", order.country || order.phone || "-", money(order.amount), <Badge key={order.id}>{order.status}</Badge>, shortDate(order.createdAt)])} empty="No customer orders yet." />
      </Card>
      <Card id="logs" className="mt-4">
        <CardHeader><CardTitle>Tools & Logs</CardTitle></CardHeader>
        <DataTable headers={["S/N", "Event", "Description", "IP Address", "Created At"]} rows={data.logs.map((log, index) => [index + 1, log.event, log.description, log.ipAddress, shortDate(log.createdAt)])} empty="No activity logs yet." />
      </Card>
    </DashboardShell>
  );
}
