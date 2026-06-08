"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Plus } from "lucide-react";
import { useState } from "react";
import { approveDepositAction, rejectDepositAction, saveAdminBankAction } from "@/lib/actions";
import { money, shortDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/ui/table";
import { Field } from "@/components/dashboard-shell";
import { Modal } from "@/components/ui/modal";
import { SubmitButton } from "@/components/submit-button";

function depositStatusClass(status: string) {
  if (status === "Pending") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "Declined") return "border-red-200 bg-red-50 text-red-700";
  return "";
}

export function FinancialsTab({ data }: { data: any }) {
  const queryClient = useQueryClient();
  const [bankModalOpen, setBankModalOpen] = useState(false);

  const bankMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      await saveAdminBankAction(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
      setBankModalOpen(false);
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (formData: FormData) => await approveDepositAction(formData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminDashboard"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: async (formData: FormData) => await rejectDepositAction(formData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminDashboard"] }),
  });

  if (!data) return null;

  return (
    <div className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Bank Transfer Account</CardTitle>
          <Button size="sm" onClick={() => setBankModalOpen(true)}>
            <Plus className="mr-2 size-4" />
            {data.bankAccount ? "Edit Account" : "Add Account"}
          </Button>
        </CardHeader>
        <CardContent>
          {data.bankAccount ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bank Name</p>
                <p>{data.bankAccount.bankName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Name</p>
                <p>{data.bankAccount.accountName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Number</p>
                <p className="font-mono">{data.bankAccount.accountNumber}</p>
              </div>
              {data.bankAccount.instructions && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Instructions</p>
                  <p className="text-sm">{data.bankAccount.instructions}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No active bank account configured.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deposit Review Queue</CardTitle>
        </CardHeader>
        <DataTable
          headers={["S/N", "Customer", "Reference", "Amount", "Proof", "Status", "Action"]}
          rows={data.deposits.map((deposit: any, index: number) => [
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
                  <ExternalLink className="size-4 mr-1" />
                  View
                </a>
              </Button>
            ) : (
              "-"
            ),
            <Badge key={`${deposit.id}-status`} className={depositStatusClass(deposit.status)}>
              {deposit.status}
            </Badge>,
            deposit.status === "Pending" && deposit.method === "Bank Transfer" ? (
              <div key={`${deposit.id}-actions`} className="flex flex-wrap gap-2">
                <form action={approveMutation.mutate}>
                  <input type="hidden" name="id" value={deposit.id} />
                  <Button size="sm" type="submit" disabled={approveMutation.isPending}>
                    {approveMutation.isPending ? "Approving..." : "Approve"}
                  </Button>
                </form>
                <form action={rejectMutation.mutate}>
                  <input type="hidden" name="id" value={deposit.id} />
                  <Button size="sm" variant="destructive" type="submit" disabled={rejectMutation.isPending}>
                    {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                  </Button>
                </form>
              </div>
            ) : deposit.status === "Pending" ? (
              "Gateway pending"
            ) : deposit.reviewedAt ? (
              shortDate(deposit.reviewedAt)
            ) : (
              "-"
            ),
          ])}
          empty="No deposit requests yet."
        />
      </Card>

      <Modal open={bankModalOpen} onOpenChange={setBankModalOpen} title="Bank Transfer Account">
        <form action={bankMutation.mutate} className="grid gap-4">
          <Field label="Bank Name">
            <Input name="bankName" placeholder="Opay" defaultValue={data.bankAccount?.bankName || ""} required />
          </Field>
          <Field label="Account Name">
            <Input name="accountName" placeholder="ProxTools Limited" defaultValue={data.bankAccount?.accountName || ""} required />
          </Field>
          <Field label="Account Number">
            <Input name="accountNumber" placeholder="0000000000" defaultValue={data.bankAccount?.accountNumber || ""} required />
          </Field>
          <Field label="Transfer Instructions">
            <Textarea name="instructions" placeholder="Use your wallet top-up reference as narration." defaultValue={data.bankAccount?.instructions || ""} />
          </Field>
          <SubmitButton defaultText="Save Bank Details" pendingText="Saving..." />
        </form>
      </Modal>
    </div>
  );
}
