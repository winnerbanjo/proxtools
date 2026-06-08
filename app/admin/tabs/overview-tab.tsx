"use client";

import { Building2, Database, Receipt, Smartphone } from "lucide-react";
import { StatCard } from "@/components/stat-card";

export function OverviewTab({ data }: { data: any }) {
  if (!data) return null;

  const soldSms = data.sms.filter((item: any) => item.status === "sold").length;
  const availableSms = data.sms.filter((item: any) => item.status === "available").length;
  const pendingDeposits = data.deposits.filter((d: any) => d.status === "Pending").length;

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="SMS Available"
        value={availableSms}
        note="Numbers customers can buy"
        icon={<Smartphone className="size-5" />}
      />
      <StatCard
        label="SMS Sold"
        value={soldSms}
        note="Purchased numbers"
        icon={<Receipt className="size-5" />}
      />
      <StatCard
        label="Data Plans"
        value={data.plans.length}
        note="Plans in catalog"
        icon={<Database className="size-5" />}
      />
      <StatCard
        label="Pending Deposits"
        value={pendingDeposits}
        note="Transfers awaiting review"
        icon={<Building2 className="size-5" />}
      />
    </section>
  );
}
