import { corsPreflight, withCors } from "@/lib/api/cors";
import { subscribeNewsletter } from "@/lib/api/handlers";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await subscribeNewsletter(body);
    return withCors(result.body, { status: result.status });
  } catch (e) {
    console.error("[v1/newsletter] failed", e);
    return withCors({ error: "Failed to subscribe" }, { status: 500 });
  }
}
