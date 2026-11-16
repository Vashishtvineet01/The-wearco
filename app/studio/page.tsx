import { redirect } from "next/navigation";

/**
 * /studio is now part of /design (the "Just for me" tab). Preserve the
 * ?product= query param so links from product cards still land on the
 * right garment.
 */
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function StudioRedirect({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const product = typeof sp.product === "string" ? sp.product : undefined;
  const qs = new URLSearchParams();
  qs.set("view", "me");
  if (product) qs.set("product", product);
  redirect(`/design?${qs.toString()}`);
}
