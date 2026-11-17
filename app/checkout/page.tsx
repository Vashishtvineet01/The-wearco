import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-session";
import CheckoutClient, {
  type CheckoutPrefill,
} from "@/components/CheckoutClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checkout — TheWearCo",
  description: "Place your TheWearCo order. Guest checkout welcome.",
};

/**
 * Server wrapper — if the buyer is signed in, pull their email + last order's
 * address so the client form can prefill. Guest buyers get empty defaults.
 */
export default async function CheckoutPage() {
  const session = await getCustomerSession();
  const isLoggedIn = Boolean(session.isLoggedIn && session.email);

  const empty: CheckoutPrefill = {
    email: "",
    name: "",
    phone: "",
    gst: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    isLoggedIn: false,
  };

  if (!isLoggedIn || !session.email) {
    return <CheckoutClient prefill={empty} />;
  }

  const email = session.email;
  const lastOrder = await prisma.order.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
    select: { name: true, phone: true, gst: true, address: true },
  });

  let address: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  } = {};
  if (lastOrder?.address) {
    try {
      address = JSON.parse(lastOrder.address) as typeof address;
    } catch {
      address = {};
    }
  }

  const customer = await prisma.customer.findUnique({
    where: { email },
    select: { name: true },
  });

  const prefill: CheckoutPrefill = {
    email,
    name: lastOrder?.name || customer?.name || "",
    phone: lastOrder?.phone || "",
    gst: lastOrder?.gst || "",
    line1: address.line1 || "",
    line2: address.line2 || "",
    city: address.city || "",
    state: address.state || "",
    pincode: address.pincode || "",
    country: address.country || "India",
    isLoggedIn: true,
  };

  return <CheckoutClient prefill={prefill} />;
}
