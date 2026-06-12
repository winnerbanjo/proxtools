"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, Clipboard, CreditCard, Landmark, Loader2, UploadCloud, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { topUpAction } from "@/lib/actions";
import type { AdminBankAccount } from "@/lib/db/schema";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type BalanceFundingCardProps = {
  bankAccount?: AdminBankAccount | null;
  showPendingDialog?: boolean;
  error?: string;
  koraReference?: string;
};

const errorMessages: Record<string, string> = {
  minimum: "Enter at least ₦100 to submit a wallet top-up.",
  proof: "Upload your transfer receipt before submitting.",
  "proof-size": "Proof upload must be 5MB or less.",
  "no-bank": "Bank transfer is temporarily unavailable.",
  upload: "We could not upload that proof. Try again in a moment.",
};

function FundingField({ label, children, full = false }: { label: string; children: ReactNode; full?: boolean }) {
  return (
    <label className={full ? "grid gap-2 md:col-span-2" : "grid gap-2"}>
      <span className="text-sm font-black text-slate-800">{label}</span>
      {children}
    </label>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      title={`Copy ${label}`}
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? <CheckCircle2 className="size-4" /> : <Clipboard className="size-4" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

function BankRow({ label, value, canCopy = false }: { label: string; value: string; canCopy?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-slate-950/10 bg-white/62 px-3 py-3">
      <span className="min-w-0">
        <span className="block text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
        <strong className="mt-1 block break-words text-sm font-black">{value}</strong>
      </span>
      {canCopy ? <CopyButton value={value} label={label} /> : null}
    </div>
  );
}

function FundingDialog({ title, body, onClose }: { title: string; body: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4">
      <div className="w-full max-w-md rounded-md border border-slate-950/10 bg-[#f4efe5] p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <span className="grid size-11 place-items-center rounded-md bg-slate-950 text-[#f05238]">
            <CheckCircle2 className="size-6" />
          </span>
          <Button type="button" variant="ghost" size="icon" title="Close dialog" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
        <h2 className="font-display mt-4 text-2xl font-black tracking-normal">{title}</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-muted-foreground">{body}</p>
        <Button type="button" className="mt-5 w-full" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}

export function BalanceFundingCard({ bankAccount, showPendingDialog = false, error, koraReference }: BalanceFundingCardProps) {
  const router = useRouter();
  const [fundingMode, setFundingMode] = useState<"transfer" | "kora">("transfer");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const [fileName, setFileName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(showPendingDialog);
  const [koraDialogOpen, setKoraDialogOpen] = useState(false);
  const [koraMessage, setKoraMessage] = useState<string | null>(null);
  const [isInitiatingKora, setIsInitiatingKora] = useState(false);
  const [isVerifyingKora, setIsVerifyingKora] = useState(Boolean(koraReference));
  const errorMessage = error ? errorMessages[error] : null;
  const isReady = Boolean(bankAccount);
  const appHasBankaccounts = bankAccount !== null && bankAccount !== undefined;
  const instructions = useMemo(() => {
    return bankAccount?.instructions?.trim() || "Use your wallet top-up reference or account name as the transfer narration.";
  }, [bankAccount?.instructions]);

  useEffect(() => {
    if (!koraReference) return;

    let isMounted = true;
    const reference = koraReference;

    async function verify(attempt = 0): Promise<void> {
      if (attempt >= 5) {
        if (isMounted) {
          setIsVerifyingKora(false);
          setKoraMessage("Payment is still processing. Your wallet will update automatically once Kora confirms it.");
        }
        return;
      }

      try {
        const response = await fetch(`/api/korapay/verify?reference=${encodeURIComponent(reference)}`);
        const result = await response.json();
        const koraStatus = result.data?.status;
        const creditStatus = result.credit_status;

        if (response.ok && koraStatus === "success" && (creditStatus === "credited" || creditStatus === "already_credited")) {
          if (isMounted) {
            setIsVerifyingKora(false);
            setKoraDialogOpen(true);
            router.replace("/balance?kora=success");
            router.refresh();
          }
          return;
        }

        if (response.ok && (koraStatus === "processing" || koraStatus === "pending")) {
          await new Promise((resolve) => window.setTimeout(resolve, 3000));
          return verify(attempt + 1);
        }

        if (isMounted) {
          setIsVerifyingKora(false);
          setKoraMessage(result.message || "KoraPay could not confirm this payment yet.");
        }
      } catch {
        if (isMounted) {
          setIsVerifyingKora(false);
          setKoraMessage("KoraPay verification failed. Try refreshing this page.");
        }
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [koraReference, router]);

  async function initiateKoraFunding() {
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount < 100) {
      setKoraMessage("Enter at least ₦100 to continue with KoraPay.");
      return;
    }

    setIsInitiatingKora(true);
    setKoraMessage(null);

    try {
      const response = await fetch("/api/korapay/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numericAmount }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to initialize KoraPay charge");
      }

      const checkoutUrl = result.data?.checkout_url;
      if (!checkoutUrl) {
        throw new Error("KoraPay did not return a checkout URL.");
      }

      window.location.href = checkoutUrl;
    } catch (error) {
      setIsInitiatingKora(false);
      setKoraMessage(error instanceof Error ? error.message : "Unknown KoraPay funding error.");
    }
  }

  return (
    <>
      {dialogOpen ? (
        <FundingDialog
          title="Proof submitted"
          body="Your transfer is pending admin review. Your wallet will be funded after approval."
          onClose={() => setDialogOpen(false)}
        />
      ) : null}
      {koraDialogOpen ? (
        <FundingDialog
          title="Wallet funded"
          body="KoraPay confirmed your payment and your wallet balance has been updated."
          onClose={() => setKoraDialogOpen(false)}
        />
      ) : null}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Top Up Wallet</CardTitle>
            <div className="inline-flex rounded-md border border-slate-950/10 bg-white/62 p-1">
              <Button
                type="button"
                size="sm"
                variant={fundingMode === "transfer" ? "default" : "ghost"}
                onClick={() => setFundingMode("transfer")}
              >
                <Landmark className="size-4" />
                Transfer
              </Button>
              <Button
                type="button"
                size="sm"
                variant={fundingMode === "kora" ? "default" : "ghost"}
                onClick={() => setFundingMode("kora")}
              >
                <CreditCard className="size-4" />
                KoraPay
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          {errorMessage ? <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{errorMessage}</div> : null}
          {isVerifyingKora ? (
            <div className="flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">
              <Loader2 className="size-4 animate-spin" />
              Confirming your KoraPay payment...
            </div>
          ) : null}
          {koraMessage ? <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">{koraMessage}</div> : null}

          {fundingMode === "transfer" ? (
            <>
              {appHasBankaccounts ? (
                <div className="grid gap-3">
                  <BankRow label="Bank" value={bankAccount.bankName} />
                  <BankRow label="Account Name" value={bankAccount.accountName} canCopy />
                  <BankRow label="Account Number" value={bankAccount.accountNumber} canCopy />
                  <p className="rounded-md border border-teal-700/15 bg-teal-50 px-3 py-2 text-sm font-semibold leading-6 text-teal-900">{instructions}</p>
                </div>
              ) : (
                <div className="grid gap-3 rounded-md border border-slate-950/10 bg-white/58 p-3">
                  <p className="rounded-md border border-teal-700/15 bg-teal-50 px-3 py-2 text-sm font-semibold leading-6 text-teal-900">No accounts configured yet, contact support or admin</p>
                </div>
              )}

              <form action={topUpAction} className="grid gap-4 md:grid-cols-2">
                <FundingField label="Amount">
                  <Input name="amount" type="number" placeholder="10000" min="100" required disabled={!isReady} value={amount} onChange={(event) => setAmount(event.currentTarget.value)} />
                </FundingField>
                <FundingField label="Narration">
                  <Input name="narration" placeholder="Wallet top-up" disabled={!isReady} value={narration} onChange={(event) => setNarration(event.currentTarget.value)} />
                </FundingField>
                <FundingField label="Transfer Proof" full>
                  <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-slate-950/25 bg-white/62 px-4 py-5 text-center text-sm font-black text-muted-foreground transition hover:border-primary hover:bg-white">
                    {fileName ? <CheckCircle2 className="size-6 text-emerald-600" /> : <UploadCloud className="size-6" />}
                    <span>{fileName || "Upload receipt image or PDF"}</span>
                    <Input
                      className="sr-only"
                      name="proof"
                      type="file"
                      accept="image/*,.pdf"
                      required
                      disabled={!isReady}
                      onChange={(event) => setFileName(event.currentTarget.files?.[0]?.name || "")}
                    />
                  </label>
                </FundingField>
                <div className="md:col-span-2">
                  <SubmitButton defaultText="Submit Proof For Review" pendingText="Uploading Proof..." disabled={!isReady} />
                </div>
              </form>

              {!isReady ? (
                <div className="flex items-center gap-2 rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-800">
                  <Loader2 className="size-4 animate-spin" />
                  Waiting for admin bank details.
                </div>
              ) : null}
            </>
          ) : (
            <div className="grid gap-4">
              <FundingField label="Amount">
                <Input type="number" placeholder="10000" min="100" required value={amount} onChange={(event) => setAmount(event.currentTarget.value)} />
              </FundingField>
              <Button type="button" onClick={initiateKoraFunding} disabled={isInitiatingKora || isVerifyingKora}>
                {isInitiatingKora ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
                {isInitiatingKora ? "Redirecting..." : "Pay With KoraPay"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
