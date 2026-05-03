import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getMemberOrgs } from "@/lib/team";

/**
 * GET /api/org/auto-switch
 *
 * Called once after pending invites are auto-activated. Sets the cf_org cookie
 * to the user's first active org and redirects to the dashboard.
 * (Cookie writes require a Route Handler — they cannot be done in a Server Component.)
 */
export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const memberOrgs = await getMemberOrgs(user.id);
  const firstOrg   = memberOrgs[0];

  const destination = new URL("/dashboard", request.url);
  const res         = NextResponse.redirect(destination);

  if (firstOrg) {
    res.cookies.set("cf_org", firstOrg.owner_id, {
      path:     "/",
      maxAge:   60 * 60 * 24 * 365,
      httpOnly: true,
      sameSite: "lax",
    });
  }

  return res;
}
