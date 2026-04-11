import { notFound } from "next/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import ProjectDetailsForm from "@/components/ProjectDetailsForm";

export default async function ProjectPage(
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const sb = createSupabaseServiceClient();

  const { data: pd } = await sb
    .from("project_details")
    .select("lead_id, user_id, job_type, description, submitted_at")
    .eq("token", token)
    .single();

  if (!pd) notFound();

  // Fetch business name for context
  const { data: profile } = await sb
    .from("profiles")
    .select("business_name, first_name")
    .eq("id", pd.user_id)
    .single();

  const businessName = profile?.business_name ?? "Your Service Provider";

  const alreadySubmitted = !!pd.submitted_at;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 16px 60px" }}>

      {/* Header */}
      <div style={{
        padding: "28px 24px 24px",
        textAlign: "center",
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%", margin: "0 auto 14px",
          background: "linear-gradient(135deg,#7c3aed,#9333ea)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22,
        }}>
          📋
        </div>
        <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#7c3aed" }}>
          {businessName}
        </p>
        <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 900, color: "#1c1917", lineHeight: 1.2 }}>
          Tell us about your project
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: "#78716c", lineHeight: 1.6 }}>
          A little more detail helps us respond faster with a more accurate estimate.
        </p>
      </div>

      {alreadySubmitted ? (
        <div style={{
          background: "#fff", borderRadius: 20, border: "1px solid #e6e2db",
          padding: "40px 28px", textAlign: "center",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 900, color: "#1c1917" }}>
            Already submitted!
          </h2>
          <p style={{ margin: 0, fontSize: 15, color: "#78716c", lineHeight: 1.6 }}>
            We have your project details on file. <strong>{businessName}</strong> will be in touch shortly.
          </p>
        </div>
      ) : (
        <div style={{
          background: "#fff", borderRadius: 20, border: "1px solid #e6e2db",
          padding: "24px 20px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}>
          <ProjectDetailsForm
            token={token}
            initialJobType={pd.job_type}
            initialDescription={pd.description}
            businessName={businessName}
          />
        </div>
      )}

      <p style={{ margin: "20px 0 0", textAlign: "center", fontSize: 12, color: "#c4bfb8" }}>
        Powered by ClozeFlow · Your info is never shared or sold.
      </p>
    </div>
  );
}
