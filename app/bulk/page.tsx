import { redirect } from "next/navigation";

// Force dynamic so the redirect header always re-emits (otherwise Next
// caches the response and the Location header gets dropped on cache HITs).
export const dynamic = "force-dynamic";

/**
 * /bulk is now part of /design (the "For my team" tab).
 */
export default function BulkRedirect() {
  redirect("/design?view=team");
}
