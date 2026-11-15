import { corsPreflight, withCors } from "@/lib/api/cors";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return corsPreflight();
}

export async function GET() {
  return withCors({
    ok: true,
    name: "TheWearCo API",
    version: "v1",
    timestamp: new Date().toISOString()
  });
}
