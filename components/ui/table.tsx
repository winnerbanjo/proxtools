import * as React from "react";
import { cn } from "@/lib/utils";

export function DataTable({ headers, rows, empty = "No records yet." }: { headers: string[]; rows: React.ReactNode[][]; empty?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} className="border-t border-slate-950/10 bg-slate-950 px-4 py-3 text-left text-xs font-black uppercase tracking-[0.16em] text-white/75">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr key={index} className="transition hover:bg-white/58">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className={cn("border-t border-slate-950/10 px-4 py-3 text-sm font-semibold", cellIndex === row.length - 1 && "whitespace-nowrap")}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className="h-24 border-t px-4 py-3 text-center text-sm font-semibold text-muted-foreground" colSpan={headers.length}>
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
