export function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow animate-pulse">
      <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-1/3 bg-muted rounded"></div>
        <div className="size-5 bg-muted rounded-full"></div>
      </div>
      <div className="p-6 pt-0">
        <div className="h-8 w-1/4 bg-muted rounded mb-2"></div>
        <div className="h-3 w-1/2 bg-muted rounded"></div>
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow animate-pulse p-4">
      <div className="h-6 w-1/4 bg-muted rounded mb-6"></div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 w-1/12 bg-muted rounded"></div>
            <div className="h-4 w-3/12 bg-muted rounded"></div>
            <div className="h-4 w-2/12 bg-muted rounded"></div>
            <div className="h-4 w-2/12 bg-muted rounded"></div>
            <div className="h-4 w-2/12 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonTable />
    </div>
  );
}
