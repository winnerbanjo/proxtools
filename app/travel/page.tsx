import { DashboardShell, Field, PageHeader } from "@/components/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { createFlightAction } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { getCustomerDashboard } from "@/lib/queries";
import { shortDate } from "@/lib/utils";

export default async function TravelPage() {
  const user = await requireUser("customer");
  const data = await getCustomerDashboard(user.id);

  return (
    <DashboardShell userName={user.name} accountRole={user.role}>
      <PageHeader eyebrow="Quick Action" title="Travel" subtitle="Create a flight request and keep the booking flow attached to your wallet." />
      <section className="grid gap-4 xl:grid-cols-[1.45fr_0.55fr]">
        <Card>
          <CardHeader><CardTitle>New Flight</CardTitle></CardHeader>
          <CardContent>
            <form action={createFlightAction} className="grid gap-4 md:grid-cols-2">
              <Field label="From"><Input name="from" placeholder="Lagos" required /></Field>
              <Field label="To"><Input name="to" placeholder="Abuja" required /></Field>
              <Field label="Departure"><Input name="departure" type="date" required /></Field>
              <Field label="Passengers"><Input name="passengers" type="number" defaultValue="1" min="1" required /></Field>
              <div className="md:col-span-2"><Button type="submit">Create Flight Request</Button></div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Travel Wallet</CardTitle></CardHeader>
          <CardContent><p className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm font-semibold text-blue-700">Flight requests are saved as drafts until payment and confirmation are completed.</p></CardContent>
        </Card>
      </section>
      <Card className="mt-4">
        <CardHeader><CardTitle>Flight Requests</CardTitle></CardHeader>
        <DataTable headers={["S/N", "Route", "Passengers", "Status", "Created At"]} rows={data.flights.map((flight, index) => [index + 1, `${flight.from} to ${flight.to}`, flight.passengers, <Badge key={flight.id} className="border-slate-200 bg-white text-muted-foreground">{flight.status}</Badge>, shortDate(flight.createdAt)])} empty="No flight requests yet." />
      </Card>
    </DashboardShell>
  );
}
