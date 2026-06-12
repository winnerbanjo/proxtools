"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchAdminDashboardAction } from "./actions";
import { DashboardShell, PageHeader } from "@/components/dashboard-shell";
import { SkeletonDashboard } from "@/components/ui/skeletons";
import { OverviewTab } from "./tabs/overview-tab";
import { FinancialsTab } from "./tabs/financials-tab";
import { InventoryTab } from "./tabs/inventory-tab";
import { CustomersTab } from "./tabs/customers-tab";
import { LogsTab } from "./tabs/logs-tab";


const TABS = [
  { id: "overview", label: "Overview" },
  { id: "financials", label: "Bank & Deposits" },
  { id: "inventory", label: "Products & Inventory" },
  { id: "customers", label: "Customers & Orders" },
  { id: "logs", label: "Activity Logs" },
];

export function AdminDashboardClient({
  initialData,
  adminName,
}: {
  initialData: any;
  adminName: string;
}) {
  const [activeTab, setActiveTab] = useState("overview");

  const { data, isLoading } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: () => fetchAdminDashboardAction(),
    initialData,
  });

  return (
    <DashboardShell role="Admin" userName={adminName}>
      <PageHeader
        eyebrow="Admin Console"
        title="Store Control Center"
        subtitle="Manage sellable inventory, inspect customers, review purchases, and audit wallet/service events."
      />

      <div className="mb-6 flex gap-2 overflow-x-auto rounded-md border border-slate-950/10 bg-white/55 p-2 shadow-sm">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-black transition ${activeTab === tab.id
                ? "bg-slate-950 text-white shadow-[0_12px_28px_rgba(15,23,42,0.16)]"
                : "text-muted-foreground hover:bg-slate-950/[0.07] hover:text-foreground"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && !data ? (
        <SkeletonDashboard />
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === "overview" && <OverviewTab data={data} />}
          {activeTab === "financials" && <FinancialsTab data={data} />}
          {activeTab === "inventory" && <InventoryTab data={data} />}
          {activeTab === "customers" && <CustomersTab data={data} />}
          {activeTab === "logs" && <LogsTab data={data} />}
        </div>
      )}
    </DashboardShell>
  );
}
