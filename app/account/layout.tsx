import { redirect } from "next/navigation";
import AccountShell from "@/components/AccountShell";
import { getCustomerSession } from "@/lib/customer-session";

export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCustomerSession();
  if (!session.isLoggedIn || !session.customerId) {
    redirect("/login?next=/account");
  }

  return <AccountShell>{children}</AccountShell>;
}
