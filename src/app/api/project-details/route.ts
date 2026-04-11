import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { computeScore } from "@/lib/scoring";

export async function POST(request: Request) {
  const sb = createSupabaseServiceClient();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const token          = formData.get("token") as string;
  const jobType        = formData.get("jobType") as string | null;
  const description    = formData.get("description") as string | null;
  const propertyType   = formData.get("propertyType") as string | null;
  const budgetRange    = formData.get("budgetRange") as string | null;
  const timeline       = formData.get("timeline") as string | null;
  const address        = formData.get("address") as string | null;
  const additionalNotes = formData.get("additionalNotes") as string | null;
  const photoFiles     = formData.getAll("photos") as File[];

  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  // Fetch the project_details record
  const { data: pd } = await sb
    .from("project_details")
    .select("id, lead_id, user_id, submitted_at")
    .eq("token", token)
    .single();

  if (!pd) return NextResponse.json({ error: "Invalid link" }, { status: 404 });
  if (pd.submitted_at) return NextResponse.json({ error: "Already submitted" }, { status: 409 });

  // Upload photos to Supabase Storage
  const photoUrls: string[] = [];
  for (const file of photoFiles) {
    if (!file || file.size === 0) continue;
    const ext      = file.name.split(".").pop() ?? "jpg";
    const fileName = `${pd.lead_id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer   = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await sb.storage
      .from("project-photos")
      .upload(fileName, buffer, { contentType: file.type, upsert: false });

    if (!uploadError) {
      const { data: { publicUrl } } = sb.storage
        .from("project-photos")
        .getPublicUrl(fileName);
      photoUrls.push(publicUrl);
    }
  }

  // Update project_details record
  await sb.from("project_details").update({
    job_type:         jobType        || null,
    description:      description    || null,
    property_type:    propertyType   || null,
    budget_range:     budgetRange    || null,
    timeline:         timeline       || null,
    address:          address        || null,
    additional_notes: additionalNotes || null,
    photo_urls:       photoUrls,
    submitted_at:     new Date().toISOString(),
  }).eq("token", token);

  // Advance lead to project_submitted
  const { data: lead } = await sb
    .from("leads")
    .select("status, created_at, last_activity_at")
    .eq("id", pd.lead_id)
    .single();

  if (lead) {
    const newScore = computeScore(
      { ...lead, status: "project_submitted" },
      [],
    );
    await sb.from("leads").update({
      status:           "project_submitted",
      score:            newScore,
      last_activity_at: new Date().toISOString(),
    }).eq("id", pd.lead_id);
  }

  return NextResponse.json({ ok: true });
}
