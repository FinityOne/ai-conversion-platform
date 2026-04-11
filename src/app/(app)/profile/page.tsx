import { createSupabaseServerClient } from "@/lib/supabase-server";

const TEXT   = "#1c1917";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "16px 0", borderBottom: `1px solid ${BORDER}` }}>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#a8a29e" }}>{label}</p>
      <p style={{ margin: 0, fontSize: 16, color: value ? TEXT : "#c4bfb8", fontWeight: value ? 500 : 400 }}>
        {value || "Not set"}
      </p>
    </div>
  );
}

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, email, phone, business_name, wants_setup_call, created_at")
    .eq("id", user!.id)
    .single();

  const fullName     = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || null;
  const initials     = (profile?.first_name?.[0] ?? user?.email?.[0] ?? "?").toUpperCase();
  const memberSince  = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#ea580c" }}>
          Account
        </p>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: TEXT }}>Your Profile</h1>
      </div>

      {/* Avatar card */}
      <div style={{
        background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16,
        padding: "28px 24px", marginBottom: 20,
        display: "flex", alignItems: "center", gap: 18,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg,#ea580c,#f97316)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 26, fontWeight: 900,
        }}>
          {initials}
        </div>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 900, color: TEXT }}>
            {fullName || profile?.email || user?.email}
          </h2>
          {profile?.business_name && (
            <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: "#ea580c" }}>{profile.business_name}</p>
          )}
          {memberSince && (
            <p style={{ margin: 0, fontSize: 13, color: MUTED }}>Member since {memberSince}</p>
          )}
        </div>
      </div>

      {/* Profile details */}
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "0 24px", marginBottom: 20 }}>
        <h3 style={{ margin: "20px 0 0", fontSize: 14, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "1px" }}>
          Personal Info
        </h3>
        <InfoRow label="First Name"     value={profile?.first_name} />
        <InfoRow label="Last Name"      value={profile?.last_name} />
        <InfoRow label="Email Address"  value={profile?.email ?? user?.email} />
        <InfoRow label="Phone Number"   value={profile?.phone} />
        <div style={{ padding: "16px 0" }}>
          <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#a8a29e" }}>Business Name</p>
          <p style={{ margin: 0, fontSize: 16, color: profile?.business_name ? TEXT : "#c4bfb8", fontWeight: profile?.business_name ? 500 : 400 }}>
            {profile?.business_name || "Not set"}
          </p>
        </div>
      </div>

      {/* Setup call preference */}
      <div style={{
        background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px 24px",
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <div style={{
          width: 46, height: 46, borderRadius: 12, flexShrink: 0,
          background: profile?.wants_setup_call ? "rgba(234,88,12,0.09)" : "rgba(0,0,0,0.04)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22,
        }}>
          📞
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 700, color: TEXT }}>Free Setup Call</p>
          <p style={{ margin: 0, fontSize: 14, color: MUTED }}>
            {profile?.wants_setup_call
              ? "You requested a setup call — our team will be in touch within 24 hours."
              : "You haven't requested a setup call. Contact us at hello@clozeflow.com to schedule one."}
          </p>
        </div>
        <span style={{
          flexShrink: 0, fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 20,
          background: profile?.wants_setup_call ? "#fffbeb" : "#f8f8f8",
          color: profile?.wants_setup_call ? "#d97706" : "#a8a29e",
          border: `1px solid ${profile?.wants_setup_call ? "#fde68a" : BORDER}`,
        }}>
          {profile?.wants_setup_call ? "Requested" : "Not requested"}
        </span>
      </div>
    </div>
  );
}
