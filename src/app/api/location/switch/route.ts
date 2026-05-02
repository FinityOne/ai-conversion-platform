import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { locationId } = await req.json();

  // Verify the location actually belongs to this user
  if (locationId) {
    const sb = createSupabaseServiceClient();
    const { data } = await sb
      .from("user_locations")
      .select("id")
      .eq("id", locationId)
      .eq("user_id", user.id)
      .single();
    if (!data) return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  const res = NextResponse.json({ ok: true });
  if (locationId) {
    res.cookies.set("cf_loc", locationId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  } else {
    res.cookies.delete("cf_loc");
  }
  return res;
}
