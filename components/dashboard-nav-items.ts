import { BarChart3, Building2, Contact, CreditCard, Database, Home, ListChecks, Package, Plane, Receipt, Shield, Smartphone, UserCircle, Wifi, type LucideIcon } from "lucide-react";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const customerNav: DashboardNavItem[] = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/sms-services", label: "SMS Services", icon: Smartphone },
  { href: "/sme-services", label: "SME Services", icon: Wifi },
  { href: "/products", label: "Logs", icon: Package },
  { href: "/balance", label: "Balance", icon: CreditCard },
  { href: "/tools-logs", label: "Audit Trail", icon: ListChecks },
  { href: "/purchased", label: "Purchased", icon: Receipt },
  { href: "/contact", label: "Contact", icon: Contact },
  { href: "/billing", label: "Billing", icon: Database },
  { href: "/travel", label: "Travel", icon: Plane },
];

export const adminNav: DashboardNavItem[] = [
  { href: "/admin#overview", label: "Overview", icon: BarChart3 },
  { href: "/admin#payments", label: "Payments", icon: Building2 },
  { href: "/admin#products", label: "Products", icon: Database },
  { href: "/admin#customers", label: "Customers", icon: UserCircle },
  { href: "/admin#orders", label: "Orders", icon: Receipt },
  { href: "/admin#logs", label: "Logs", icon: ListChecks },
  { href: "/", label: "Customer Site", icon: Shield },
];
