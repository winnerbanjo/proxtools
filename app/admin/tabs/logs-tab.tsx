"use client";

import { shortDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";

export function LogsTab({ data }: { data: any }) {
  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Trail</CardTitle>
      </CardHeader>
      <DataTable
        headers={["S/N", "Event", "Description", "IP Address", "Created At"]}
        rows={data.logs.map((log: any, index: number) => [
          index + 1,
          log.event,
          log.description,
          log.ipAddress,
          shortDate(log.createdAt),
        ])}
        empty="No activity logs yet."
      />
    </Card>
  );
}
