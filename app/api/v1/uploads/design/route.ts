import { corsPreflight, withCors } from "@/lib/api/cors";
import { uploadDesign } from "@/lib/api/handlers";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const result = await uploadDesign(form);
    return withCors(result.body, { status: result.status });
  } catch (e) {
    console.error("[v1/uploads] failed", e);
    return withCors({ error: "Upload failed" }, { status: 400 });
  }
}
