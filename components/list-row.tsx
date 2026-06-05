export function ListRow({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 border-t pt-3 first:border-t-0 first:pt-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <strong className="whitespace-nowrap text-sm">{value}</strong>
    </div>
  );
}
