import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex min-h-7 items-center rounded-md border border-teal-700/20 bg-teal-50/90 px-3 text-xs font-black uppercase tracking-[0.12em] text-teal-800", className)} {...props} />;
}
