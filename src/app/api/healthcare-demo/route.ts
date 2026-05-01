import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

export async function POST(req: NextRequest) {
  try {
    const { first_name, last_name, email, phone } = await req.json();

    if (!first_name?.trim() || !email?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "first_name, email, and phone are required" }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("internal_leads")
      .insert({
        first_name: first_name.trim(),
        last_name: last_name?.trim() ?? null,
        email: email.trim(),
        phone: phone.trim(),
        status: "new",
        priority: "high",
        source: "healthcare_landing",
        trade: "chiropractic",
        tags: ["healthcare", "chiro"],
      })
      .select("id")
      .single();

    if (error) {
      console.error("healthcare-demo POST error:", error);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (err) {
    console.error("healthcare-demo POST exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
