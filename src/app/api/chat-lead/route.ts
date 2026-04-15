import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { intent, name, phone, email, messages } = body;

    if (!intent || !name || !phone || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sb = createSupabaseServiceClient();
    const { data, error } = await sb
      .from("chat_leads")
      .insert({ intent, name: name.trim(), phone: phone.trim(), email: email.trim().toLowerCase(), messages: messages ?? [] })
      .select("id")
      .single();

    if (error) {
      console.error("[chat-lead]", error);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (e) {
    console.error("[chat-lead]", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
