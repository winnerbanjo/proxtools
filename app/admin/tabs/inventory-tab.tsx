"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { addPlanAction, addSmsAction, deletePlanAction, deleteSmsAction } from "@/lib/actions";
import { money } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { Field } from "@/components/dashboard-shell";
import { Modal } from "@/components/ui/modal";
import { SubmitButton } from "@/components/submit-button";

export function InventoryTab({ data }: { data: any }) {
  const queryClient = useQueryClient();
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [smeModalOpen, setSmeModalOpen] = useState(false);

  const addSmsMutation = useMutation({
    mutationFn: async (formData: FormData) => await addSmsAction(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
      setSmsModalOpen(false);
    },
  });

  const deleteSmsMutation = useMutation({
    mutationFn: async (formData: FormData) => await deleteSmsAction(formData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminDashboard"] }),
  });

  const addPlanMutation = useMutation({
    mutationFn: async (formData: FormData) => await addPlanAction(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
      setSmeModalOpen(false);
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (formData: FormData) => await deletePlanAction(formData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminDashboard"] }),
  });

  if (!data) return null;

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>SMS Inventory</CardTitle>
          <Button size="sm" onClick={() => setSmsModalOpen(true)}>
            <Plus className="mr-2 size-4" /> Add SMS
          </Button>
        </CardHeader>
        <DataTable
          headers={["S/N", "Service", "Country", "Number", "Price", "Status", "Action"]}
          rows={data.sms.map((item: any, index: number) => [
            index + 1,
            item.service,
            item.country,
            item.number,
            money(item.price),
            <Badge key={item.id} className={item.status === "sold" ? "border-slate-200 bg-white text-muted-foreground" : ""}>
              {item.status}
            </Badge>,
            <form key={`${item.id}-form`} action={deleteSmsMutation.mutate}>
              <input type="hidden" name="id" value={item.id} />
              <Button size="sm" variant="destructive" type="submit" disabled={deleteSmsMutation.isPending}>
                Delete
              </Button>
            </form>,
          ])}
          empty="No SMS inventory yet."
        />
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>SME Data Inventory</CardTitle>
          <Button size="sm" onClick={() => setSmeModalOpen(true)}>
            <Plus className="mr-2 size-4" /> Add Plan
          </Button>
        </CardHeader>
        <DataTable
          headers={["S/N", "Network", "Bundle", "Price", "Stock", "Status", "Action"]}
          rows={data.plans.map((plan: any, index: number) => [
            index + 1,
            plan.network,
            plan.bundle,
            money(plan.price),
            plan.stock,
            <Badge key={plan.id} className={plan.status === "out_of_stock" ? "border-orange-200 bg-orange-50 text-orange-700" : ""}>
              {plan.status}
            </Badge>,
            <form key={`${plan.id}-form`} action={deletePlanMutation.mutate}>
              <input type="hidden" name="id" value={plan.id} />
              <Button size="sm" variant="destructive" type="submit" disabled={deletePlanMutation.isPending}>
                Delete
              </Button>
            </form>,
          ])}
          empty="No data plans yet."
        />
      </Card>

      <Modal open={smsModalOpen} onOpenChange={setSmsModalOpen} title="Add SMS Number">
        <form action={addSmsMutation.mutate} className="grid gap-4">
          <Field label="Service">
            <Input name="service" placeholder="WhatsApp" required />
          </Field>
          <Field label="Country">
            <Input name="country" placeholder="Nigeria" required />
          </Field>
          <Field label="Number">
            <Input name="number" placeholder="+234 800 000 0000" required />
          </Field>
          <Field label="Code">
            <Input name="code" placeholder="Waiting or 123456" />
          </Field>
          <Field label="Price">
            <Input name="price" type="number" min="1" defaultValue="350" required />
          </Field>
          <SubmitButton defaultText="Add SMS Stock" pendingText="Adding..." />
        </form>
      </Modal>

      <Modal open={smeModalOpen} onOpenChange={setSmeModalOpen} title="Add SME Data Plan">
        <form action={addPlanMutation.mutate} className="grid gap-4">
          <Field label="Network">
            <Input name="network" placeholder="MTN" required />
          </Field>
          <Field label="Bundle">
            <Input name="bundle" placeholder="1GB - 30 Days" required />
          </Field>
          <Field label="Price">
            <Input name="price" type="number" min="1" defaultValue="650" required />
          </Field>
          <Field label="Stock Units">
            <Input name="stock" type="number" min="0" defaultValue="10" required />
          </Field>
          <SubmitButton defaultText="Add Data Plan" pendingText="Adding..." />
        </form>
      </Modal>
    </div>
  );
}
