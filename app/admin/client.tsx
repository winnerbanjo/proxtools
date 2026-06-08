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

      <div className="mb-6 flex space-x-1 border-b overflow-x-auto pb-px">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
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
