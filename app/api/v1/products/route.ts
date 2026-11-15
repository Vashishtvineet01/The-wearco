import { corsPreflight, withCors } from "@/lib/api/cors";
import { listProducts } from "@/lib/api/handlers";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return corsPreflight();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || undefined;
  const result = await listProducts({ category });
  return withCors(result.body, { status: result.status });
}
