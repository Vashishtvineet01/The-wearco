import { redirect } from "next/navigation";
import SettingsPageClient from "@/components/admin/SettingsPageClient";
import { getAdminSession } from "@/lib/session";

export default async function SettingsPage() {
  const session = await getAdminSession();
  if (!session.isLoggedIn || !session.email) redirect("/admin/login");
  return <SettingsPageClient email={session.email} />;
}
