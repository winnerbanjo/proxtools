import { CreditCard } from "lucide-react";
import { BalanceFundingCard } from "@/app/balance/balance-funding-card";
import { DashboardShell, PageHeader } from "@/components/dashboard-shell";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { requireUser } from "@/lib/auth";
import { getCustomerDashboard } from "@/lib/queries";
import { money, shortDate } from "@/lib/utils";

function statusClass(status: string) {
  if (status === "Pending") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "Declined") return "border-red-200 bg-red-50 text-red-700";
  return "";
}

export default async function BalancePage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireUser("customer");
  const data = await getCustomerDashboard(user.id);
  console.log(data);
  const params = searchParams ? await searchParams : {};
  const depositNotice = params.deposit === "pending";
  const error = typeof params.error === "string" ? params.error : undefined;
  const koraReference = typeof params.kora_reference === "string" ? params.kora_reference : undefined;

  return (
    <DashboardShell userName={user.name}>
      <PageHeader eyebrow="Balance" title="Wallet Balance" subtitle="Top up your wallet, review deposits, and monitor your current spend." />
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Available Balance" value={money(user.wallet)} note="Current wallet" icon={<CreditCard className="size-5" />} />
        <StatCard label="Total Spent" value={money(user.spent)} note="All-time service usage" icon={<CreditCard className="size-5" />} />
        <StatCard label="Total Deposited" value={money(user.deposited)} note="Completed wallet top-ups" icon={<CreditCard className="size-5" />} />
      </section>
      <section className="mt-4 grid gap-4 xl:grid-cols-[1.45fr_0.55fr]">
        <BalanceFundingCard bankAccount={data.bankAccount} showPendingDialog={depositNotice} error={error} koraReference={koraReference} />
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
        <DataTable
          headers={["S/N", "Reference", "Amount", "Method", "Status", "Created At"]}
          rows={data.deposits.map((deposit, index) => [
            index + 1,
            deposit.ref,
            money(deposit.amount),
            deposit.method,
            <Badge key={deposit.id} className={statusClass(deposit.status)}>{deposit.status}</Badge>,
            shortDate(deposit.createdAt),
          ])}
        />
      </Card>
    </DashboardShell>
  );
}
