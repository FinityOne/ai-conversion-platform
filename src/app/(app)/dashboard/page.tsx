import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getLeadStats } from "@/lib/leads";
import Link from "next/link";

const TEXT   = "#1c1917";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, business_name, wants_setup_call")
    .eq("id", user!.id)
    .single();

  const firstName    = profile?.first_name    ?? "there";
  const businessName = profile?.business_name ?? null;
  const wantsCall    = profile?.wants_setup_call ?? false;

  const stats = await getLeadStats();
  const hot   = stats.replied + stats.booked;
  const warm  = stats.contacted;
  const cold  = stats.new;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#ea580c" }}>
          Dashboard
        </p>
        <h1 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 900, color: TEXT }}>
          Welcome back, {firstName}! 👋
        </h1>
        {businessName && (
          <p style={{ margin: 0, fontSize: 15, color: MUTED }}>{businessName}</p>
        )}
      </div>

      {/* Setup call banner */}
      {wantsCall && (
        <div style={{
          background: "#fff",
          border: `1px solid #fde68a`,
          borderLeft: "4px solid #f59e0b",
          borderRadius: "0 12px 12px 0",
          padding: "16px 18px",
          marginBottom: 24,
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <span style={{ fontSize: 26, flexShrink: 0 }}>📞</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 700, color: TEXT }}>
              Your free setup call is being scheduled
            </p>
            <p style={{ margin: 0, fontSize: 14, color: MUTED }}>
              Our team will reach out within 24 hours to get you fully configured.
            </p>
          </div>
          <span style={{
            flexShrink: 0, fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 20,
            background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a",
          }}>
            Pending
          </span>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 24 }} className="md:grid-cols-4">
        {[
          { icon: "fa-bolt-lightning", label: "Total Leads",   value: stats.total, color: "#ea580c" },
          { icon: "fa-fire",           label: "Hot & Replied", value: hot,          color: "#dc2626" },
          { icon: "fa-temperature-half", label: "Contacted",  value: warm,         color: "#2563eb" },
          { icon: "fa-snowflake",      label: "New / Cold",   value: cold,         color: "#64748b" },
        ].map(s => (
          <div key={s.label} style={{
            background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "20px 18px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <i className={`fa-solid ${s.icon}`} style={{ fontSize: 14, color: s.color }} />
              <span style={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>{s.label}</span>
            </div>
            <p style={{ margin: 0, fontSize: 32, fontWeight: 900, color: s.value > 0 ? s.color : "#d1cfc9" }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: "grid", gap: 12 }} className="md:grid-cols-2">
        <Link
          href="/leads"
          style={{
            display: "flex", alignItems: "center", gap: 16,
            background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "20px 20px",
            textDecoration: "none", transition: "box-shadow 0.15s",
          }}
        >
          <div style={{
            width: 46, height: 46, borderRadius: 12, flexShrink: 0,
            background: "rgba(234,88,12,0.09)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <i className="fa-solid fa-bolt-lightning" style={{ fontSize: 18, color: "#ea580c" }} />
          </div>
          <div>
            <p style={{ margin: "0 0 3px", fontSize: 16, fontWeight: 700, color: TEXT }}>View Leads</p>
            <p style={{ margin: 0, fontSize: 13, color: MUTED }}>
              {stats.total > 0
                ? `${stats.total} lead${stats.total > 1 ? "s" : ""} in your pipeline`
                : "Add your first lead"}
            </p>
          </div>
          <i className="fa-solid fa-chevron-right" style={{ marginLeft: "auto", fontSize: 13, color: "#c4bfb8" }} />
        </Link>

        <Link
          href="/profile"
          style={{
            display: "flex", alignItems: "center", gap: 16,
            background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "20px 20px",
            textDecoration: "none",
          }}
        >
          <div style={{
            width: 46, height: 46, borderRadius: 12, flexShrink: 0,
            background: "rgba(37,99,235,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <i className="fa-solid fa-user" style={{ fontSize: 18, color: "#2563eb" }} />
          </div>
          <div>
            <p style={{ margin: "0 0 3px", fontSize: 16, fontWeight: 700, color: TEXT }}>Your Profile</p>
            <p style={{ margin: 0, fontSize: 13, color: MUTED }}>Business info &amp; account settings</p>
          </div>
          <i className="fa-solid fa-chevron-right" style={{ marginLeft: "auto", fontSize: 13, color: "#c4bfb8" }} />
        </Link>
      </div>

      {/* Tip card */}
      {stats.total === 0 && (
        <div style={{
          marginTop: 20, background: "#fff",
          border: `1px solid ${BORDER}`, borderRadius: 14, padding: "24px 22px",
        }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <span style={{ fontSize: 28, flexShrink: 0 }}>🚀</span>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 800, color: TEXT }}>Get started in 30 seconds</p>
              <p style={{ margin: "0 0 14px", fontSize: 14, color: MUTED, lineHeight: 1.6 }}>
                Head over to Leads and add your first contact. ClozeFlow will help you track who's hot, who's warm, and who needs a follow-up.
              </p>
              <Link
                href="/leads"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "linear-gradient(135deg,#ea580c,#f97316)",
                  color: "#fff", fontSize: 14, fontWeight: 700,
                  padding: "10px 18px", borderRadius: 10, textDecoration: "none",
                }}
              >
                <i className="fa-solid fa-plus" style={{ fontSize: 12 }} />
                Add Your First Lead
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
