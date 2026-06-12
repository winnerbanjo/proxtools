import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn("flex min-h-28 w-full rounded-md border border-slate-950/15 bg-white/78 px-3 py-2 text-sm font-semibold outline-none ring-offset-background transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";
