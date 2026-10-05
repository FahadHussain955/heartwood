import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/dashboard";
import { getAdmin } from "@/lib/admin";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  // The layout already redirects visitors who aren't admins.
  const admin = (await getAdmin())!;
  return <AdminDashboard admin={admin} />;
}
