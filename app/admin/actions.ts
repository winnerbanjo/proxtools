"use server";

import { requireUser } from "@/lib/auth";
import { getAdminDashboard } from "@/lib/queries";

export async function fetchAdminDashboardAction() {
  await requireUser("admin");
  return getAdminDashboard();
}
