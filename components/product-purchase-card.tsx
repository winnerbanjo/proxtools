"use client";

import { CheckCircle2, Loader2, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Field } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { money } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  priceUsd: number;
  priceNgn: number;
  markedUpPrice: number;
  amount: number;
  description: string;
};

type PurchaseResult = {
  orderId: string;
  productName: string;
  quantity: number;
  total: number;
};

export function ProductPurchaseCard({ product }: { product: Product }) {
  const router = useRouter();
  const outOfStock = product.amount <= 0;
  const [quantity, setQuantity] = useState(1);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PurchaseResult | null>(null);

  const safeQuantity = useMemo(() => Math.max(1, Math.min(quantity || 1, Math.max(1, product.amount))), [quantity, product.amount]);
  const total = product.markedUpPrice * safeQuantity;

  function openConfirmation() {
    setError("");
    setResult(null);
    setQuantity(safeQuantity);
    setOpen(true);
  }

  async function confirmPurchase() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/shop-products/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: safeQuantity }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "We could not complete this purchase. Please try again.");
      }

      setResult({
        orderId: data.orderId,
        productName: data.productName,
        quantity: data.quantity,
        total: data.total,
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not complete this purchase. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="grid gap-4 rounded-md border border-slate-950/10 bg-white/70 p-4 shadow-sm transition hover:-translate-y-1 hover:bg-white/90 hover:shadow-[0_18px_45px_rgba(15,23,42,0.1)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-black leading-6 tracking-normal text-slate-950">{product.name}</h2>
          <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">{product.amount} in stock</p>
        </div>
        <strong className="whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-sm font-black text-white">{money(product.markedUpPrice)}</strong>
      </div>
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#0f766e]">${product.priceUsd.toFixed(2)} base price</p>
      {product.description ? <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{product.description}</p> : null}
      <div className="mt-auto grid gap-3">
        <Field label="Quantity">
          <Input
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value || 1))}
            type="number"
            min="1"
            max={Math.max(1, product.amount)}
            disabled={outOfStock}
          />
        </Field>
        <Button type="button" disabled={outOfStock} onClick={openConfirmation}>
          <ShoppingCart className="size-4" />
          {outOfStock ? "Out of Stock" : "Buy Product"}
        </Button>
      </div>

      <Modal open={open} onOpenChange={setOpen} title={result ? "Purchase Complete" : "Confirm Purchase"}>
        {result ? (
          <div className="grid gap-4">
            <div className="flex items-center gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-3 text-emerald-800">
              <CheckCircle2 className="size-5 shrink-0" />
              <div>
                <strong className="block text-sm">Order completed</strong>
                <span className="text-sm">Order ID: {result.orderId}</span>
              </div>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between gap-3"><span className="text-muted-foreground">Product</span><strong className="text-right">{result.productName}</strong></div>
              <div className="flex justify-between gap-3"><span className="text-muted-foreground">Quantity</span><strong>{result.quantity}</strong></div>
              <div className="flex justify-between gap-3"><span className="text-muted-foreground">Total</span><strong>{money(result.total)}</strong></div>
            </div>
            <Button type="button" onClick={() => setOpen(false)}>Done</Button>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between gap-3"><span className="text-muted-foreground">Product</span><strong className="text-right">{product.name}</strong></div>
              <div className="flex justify-between gap-3"><span className="text-muted-foreground">Unit price</span><strong>{money(product.markedUpPrice)}</strong></div>
              <div className="flex justify-between gap-3"><span className="text-muted-foreground">Quantity</span><strong>{safeQuantity}</strong></div>
              <div className="flex justify-between gap-3 border-t pt-2"><span className="font-semibold">Total</span><strong>{money(total)}</strong></div>
            </div>
            {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" disabled={loading} onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="button" disabled={loading} onClick={confirmPurchase}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : <ShoppingCart className="size-4" />}
                {loading ? "Buying..." : "Confirm Purchase"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </article>
  );
}
