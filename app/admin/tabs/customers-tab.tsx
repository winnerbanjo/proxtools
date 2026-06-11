"use client";

import { money, shortDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";

export function CustomersTab({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
        </CardHeader>
        <DataTable
          headers={["S/N", "Name", "Email", "Phone", "Wallet", "Status", "Created At"]}
          rows={data.customers
            .filter((user: any) => user.role === "customer")
            .map((customer: any, index: number) => [
              index + 1,
              customer.name,
              customer.email,
              customer.phone || "-",
              money(customer.wallet),
              <Badge key={customer.id}>{customer.status}</Badge>,
              shortDate(customer.createdAt),
            ])}
          empty="No customers yet."
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer Orders</CardTitle>
        </CardHeader>
        <DataTable
          headers={["S/N", "Type", "Product", "Country / Phone", "Amount", "Status", "Created At"]}
          rows={data.orders.map((order: any, index: number) => [
            index + 1,
            order.kind,
            order.productName || order.service || order.network || "-",
            order.externalRef || order.country || order.phone || "-",
            money(order.amount),
            <Badge key={order.id}>{order.status}</Badge>,
            shortDate(order.createdAt),
          ])}
          empty="No customer orders yet."
        />
      </Card>
    </div>
  );
}
