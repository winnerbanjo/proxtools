import { DashboardShell, Field, PageHeader } from "@/components/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DataTable } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { createTicketAction } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { getCustomerDashboard } from "@/lib/queries";
import { shortDate } from "@/lib/utils";

export default async function ContactPage() {
  const user = await requireUser("customer");
  const data = await getCustomerDashboard(user.id);

  return (
    <DashboardShell userName={user.name}>
      <PageHeader eyebrow="Support" title="Contact Support" subtitle="Send a message to the support desk and keep track of your requests." />
      <section className="grid gap-4 xl:grid-cols-[1.45fr_0.55fr]">
        <Card>
          <CardHeader><CardTitle>New Message</CardTitle></CardHeader>
          <CardContent>
            <form action={createTicketAction} className="grid gap-4 md:grid-cols-2">
              <Field label="Subject"><Input name="subject" placeholder="What do you need help with?" required /></Field>
              <Field label="Priority"><Select name="priority"><option>Normal</option><option>High</option><option>Urgent</option></Select></Field>
              <Field label="Message" full><Textarea name="message" placeholder="Type your message" required /></Field>
              <div className="md:col-span-2"><Button type="submit">Send Message</Button></div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Support Details</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Email</span><strong>support@wapxplus.test</strong></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Response</span><strong>Within 24 hours</strong></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><strong>Online</strong></div>
          </CardContent>
        </Card>
      </section>
      <Card className="mt-4">
        <CardHeader><CardTitle>Tickets</CardTitle></CardHeader>
        <DataTable headers={["S/N", "Subject", "Priority", "Status", "Created At"]} rows={data.tickets.map((ticket, index) => [index + 1, ticket.subject, ticket.priority, <Badge key={ticket.id} className="border-slate-200 bg-white text-muted-foreground">{ticket.status}</Badge>, shortDate(ticket.createdAt)])} empty="No support tickets yet." />
      </Card>
    </DashboardShell>
  );
}
