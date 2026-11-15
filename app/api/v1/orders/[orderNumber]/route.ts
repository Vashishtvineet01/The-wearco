import { corsPreflight, withCors } from "@/lib/api/cors";
import { getOrderByNumber } from "@/lib/api/handlers";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return corsPreflight();
}

export async function GET(
  _req: Request,
  { params }: { params: { orderNumber: string } }
) {
  const result = await getOrderByNumber(params.orderNumber);
  return withCors(result.body, { status: result.status });
}
