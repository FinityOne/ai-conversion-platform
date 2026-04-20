import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { randomBytes } from "crypto";

async function requireAdmin(): Promise<string | null> {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: p } = await sb.from("profiles").select("role, email").eq("id", user.id).single();
  if (p?.role !== "admin") return null;
  return user.email ?? "admin";
}

function generatePassword(): string {
  const upper   = "ABCDEFGHJKMNPQRSTUVWXYZ";
  const lower   = "abcdefghjkmnpqrstuvwxyz";
  const digits  = "23456789";
  const special = "!@#$%";
  const all = upper + lower + digits + special;

  const bytes = randomBytes(12);
  const chars = Array.from(bytes).map(b => all[b % all.length]);
  chars[0] = upper[randomBytes(1)[0] % upper.length];
  chars[1] = lower[randomBytes(1)[0] % lower.length];
  chars[2] = digits[randomBytes(1)[0] % digits.length];
  chars[3] = special[randomBytes(1)[0] % special.length];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomBytes(1)[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

export async function POST(req: Request) {
  const adminEmail = await requireAdmin();
  if (!adminEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { first_name, last_name, email } = body as { first_name: string; last_name: string; email: string };

  if (!email?.trim()) return NextResponse.json({ error: "Email is required." }, { status: 400 });

  const password = generatePassword();
  const sb = createSupabaseServiceClient();

  const { data: authData, error: authError } = await sb.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password,
    email_confirm: true,
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  const userId = authData.user.id;

  await sb.from("profiles").upsert({
    id: userId,
    email: email.trim().toLowerCase(),
    first_name: first_name?.trim() || null,
    last_name:  last_name?.trim()  || null,
    role: "user",
  }, { onConflict: "id" });

  return NextResponse.json({ id: userId, email: email.trim().toLowerCase(), password });
}
