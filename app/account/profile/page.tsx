import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-session";
import ProfileEditForm from "@/components/ProfileEditForm";

export const metadata = { title: "My Profile — TheWearCo" };

export default async function AccountProfilePage() {
  const session = await getCustomerSession();
  const customer = session.customerId
    ? await prisma.customer.findUnique({
        where: { id: session.customerId },
        select: { name: true, email: true, phone: true, gender: true },
      })
    : null;

  const phone = customer?.phone || session.phone || null;
  const phoneDisplay = phone
    ? phone.replace(/^\+91/, "").replace(/^91/, "")
    : null;
  const gender =
    customer?.gender === "male" ||
    customer?.gender === "female" ||
    customer?.gender === "other"
      ? customer.gender
      : "";

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-paper-900">My Profile</h1>
      <p className="mt-1 text-sm text-paper-500">
        Edit personal info. Phone is locked to your verified number.
      </p>
      <div className="mt-8 rounded-xl border border-[#e8e8e8] bg-white p-6 sm:p-8">
        <ProfileEditForm
          initialName={customer?.name || ""}
          initialEmail={customer?.email || session.email || ""}
          initialGender={gender}
          phoneDisplay={phoneDisplay}
        />
      </div>
    </div>
  );
}
