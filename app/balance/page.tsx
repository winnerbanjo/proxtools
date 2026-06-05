import { CreditCard } from "lucide-react";
import { DashboardShell, Field, PageHeader } from "@/components/dashboard-shell";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DataTable } from "@/components/ui/table";
import { topUpAction } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { getCustomerDashboard } from "@/lib/queries";
import { money, shortDate } from "@/lib/utils";

export default async function BalancePage() {
  const user = await requireUser("customer");
  const data = await getCustomerDashboard(user.id);

  return (
    <DashboardShell userName={user.name}>
      <PageHeader eyebrow="Balance" title="Wallet Balance" subtitle="Top up your wallet, review deposits, and monitor your current spend." />
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Available Balance" value={money(user.wallet)} note="Current wallet" icon={<CreditCard className="size-5" />} />
        <StatCard label="Total Spent" value={money(user.spent)} note="All-time service usage" icon={<CreditCard className="size-5" />} />
        <StatCard label="Total Deposited" value={money(user.deposited)} note="Completed wallet top-ups" icon={<CreditCard className="size-5" />} />
      </section>
      <section className="mt-4 grid gap-4 xl:grid-cols-[1.45fr_0.55fr]">
        <Card>
          <CardHeader><CardTitle>Top Up Wallet</CardTitle></CardHeader>
          <CardContent>
            <form action={topUpAction} className="grid gap-4 md:grid-cols-2">
              <Field label="Amount"><Input name="amount" type="number" placeholder="10000" min="100" required /></Field>
              <Field label="Payment Method"><Select name="method"><option>Bank Transfer</option><option>Card Payment</option><option>USSD</option></Select></Field>
              <Field label="Narration" full><Input name="narration" placeholder="Wallet top-up" /></Field>
              <div className="md:col-span-2"><Button type="submit">Create Deposit</Button></div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Wallet Health</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Deposited</span><strong>{money(user.deposited)}</strong></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Spent</span><strong>{money(user.spent)}</strong></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Current Balance</span><strong>{money(user.wallet)}</strong></div>
          </CardContent>
        </Card>
      </section>
      <Card className="mt-4">
        <CardHeader><CardTitle>Deposit History</CardTitle></CardHeader>
        <DataTable headers={["S/N", "Reference", "Amount", "Method", "Status", "Created At"]} rows={data.deposits.map((deposit, index) => [index + 1, deposit.ref, money(deposit.amount), deposit.method, <Badge key={deposit.id}>{deposit.status}</Badge>, shortDate(deposit.createdAt)])} />
      </Card>
    </DashboardShell>
  );
}
