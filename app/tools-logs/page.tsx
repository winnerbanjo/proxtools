import { ListChecks } from "lucide-react";
import { DashboardShell, PageHeader } from "@/components/dashboard-shell";
import { StatCard } from "@/components/stat-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { requireUser } from "@/lib/auth";
import { getCustomerDashboard } from "@/lib/queries";
import { shortDate } from "@/lib/utils";

export default async function LogsPage() {
  const user = await requireUser("customer");
  const data = await getCustomerDashboard(user.id);

  return (
    <DashboardShell userName={user.name}>
      <PageHeader eyebrow="Logs" title="Tools & Logs" subtitle="Audit wallet changes, service attempts, account activity, and system notes." />
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Login Events" value={data.logs.filter((log) => log.event === "Login").length} note="This account" icon={<ListChecks className="size-5" />} />
        <StatCard label="Wallet Events" value={data.deposits.length} note="Deposits recorded" icon={<ListChecks className="size-5" />} />
        <StatCard label="Service Events" value={data.orders.length} note="Purchases recorded" icon={<ListChecks className="size-5" />} />
      </section>
      <Card className="mt-4">
        <CardHeader><CardTitle>Activity Logs</CardTitle></CardHeader>
        <DataTable headers={["S/N", "Event", "Description", "IP Address", "Created At"]} rows={data.logs.map((log, index) => [index + 1, log.event, log.description, log.ipAddress, shortDate(log.createdAt)])} />
      </Card>
    </DashboardShell>
  );
}
