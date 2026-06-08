import { requireUser } from "@/lib/auth";
import { getAdminDashboard } from "@/lib/queries";
import { AdminDashboardClient } from "./client";

export default async function AdminPage() {
  const admin = await requireUser("admin");
  const data = await getAdminDashboard();

  return <AdminDashboardClient initialData={data} adminName={admin.name} />;
}
