import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const type = formData.get("type") as string | null; // "avatar" | "logo"

  if (!file || !type) return NextResponse.json({ error: "Missing file or type" }, { status: 400 });
  if (!["avatar", "logo"].includes(type)) return NextResponse.json({ error: "Invalid type" }, { status: 400 });

  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 400 });

  const allowedTypes = type === "avatar"
    ? ["image/jpeg", "image/png", "image/webp", "image/gif"]
    : ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  const ext    = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const bucket = type === "avatar" ? "avatars" : "business-logos";
  const path   = `${user.id}/${type}.${ext}`;

  const sb = createSupabaseServiceClient();
  const { error } = await sb.storage
    .from(bucket)
    .upload(path, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
      upsert: true,
    });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = sb.storage.from(bucket).getPublicUrl(path);
  const url = `${publicUrl}?t=${Date.now()}`;

  return NextResponse.json({ url });
}
