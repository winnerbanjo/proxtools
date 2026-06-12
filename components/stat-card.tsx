import { Card } from "@/components/ui/card";

export function StatCard({ label, value, note, icon }: { label: string; value: string | number; note: string; icon: React.ReactNode }) {
  return (
    <Card className="flex min-h-40 flex-col justify-between p-5">
      <div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
          <span className="grid size-11 place-items-center rounded-md bg-slate-950 text-[#f05238]">{icon}</span>
        </div>
        <div className="font-display mt-5 text-3xl font-black tracking-normal text-slate-950">{value}</div>
      </div>
      <p className="text-sm font-semibold text-muted-foreground">{note}</p>
    </Card>
  );
}
