import { Card } from "@/components/ui/card";

export function StatCard({ label, value, note, icon }: { label: string; value: string | number; note: string; icon: React.ReactNode }) {
  return (
    <Card className="flex min-h-36 flex-col justify-between p-5">
      <div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-bold text-muted-foreground">{label}</span>
          <span className="grid size-10 place-items-center rounded-md bg-blue-50 text-primary">{icon}</span>
        </div>
        <div className="mt-4 text-2xl font-black tracking-normal">{value}</div>
      </div>
      <p className="text-sm text-muted-foreground">{note}</p>
    </Card>
  );
}
