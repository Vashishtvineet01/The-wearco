import { corsPreflight, withCors } from "@/lib/api/cors";
import { getProduct } from "@/lib/api/handlers";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return corsPreflight();
}

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const result = await getProduct(params.slug);
  return withCors(result.body, { status: result.status });
}
