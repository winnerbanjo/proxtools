import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("flex min-h-11 w-full rounded-md border border-slate-950/15 bg-white/78 px-3 py-2 text-sm font-semibold outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring", className)} {...props} />;
}
