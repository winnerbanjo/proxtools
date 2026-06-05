import * as React from "react";
import { cn } from "@/lib/utils";

export function DataTable({ headers, rows, empty = "No records yet." }: { headers: string[]; rows: React.ReactNode[][]; empty?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} className="border-t bg-secondary px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr key={index}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className={cn("border-t px-4 py-3 text-sm", cellIndex === row.length - 1 && "whitespace-nowrap")}>
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
