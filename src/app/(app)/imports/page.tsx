import { cookies } from "next/headers";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";
const ORANGE = "#D35400";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function timeAgo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const days  = Math.floor(diff / 86_400_000);
  const hours = Math.floor(diff / 3_600_000);
  const mins  = Math.floor(diff / 60_000);
  if (mins < 60)  return mins <= 1 ? "Just now" : `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7)   return `${days} days ago`;
  return formatDate(iso);
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  completed:  { bg: "#f0fdf4", color: "#15803d", label: "Completed" },
  processing: { bg: "#fff8f5", color: ORANGE,    label: "Processing" },
  failed:     { bg: "#fef2f2", color: "#dc2626", label: "Failed" },
};

export default async function ImportsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const cfOrg = cookieStore.get("cf_org")?.value ?? null;
  let activeUserId = user!.id;

  if (cfOrg) {
    const sb = createSupabaseServiceClient();
    const { data: m } = await sb
      .from("team_memberships").select("id")
      .eq("owner_id", cfOrg).eq("member_user_id", user!.id).eq("status", "active")
      .maybeSingle();
    if (m) activeUserId = cfOrg;
  }

  const sb = createSupabaseServiceClient();
  const { data: imports } = await sb
    .from("lead_imports")
    .select("*")
    .eq("user_id", activeUserId)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: ORANGE }}>
          Lead Management
        </p>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: TEXT }}>CSV Imports</h1>
      </div>

      {!imports?.length ? (
        <div style={{
          background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16,
          padding: "48px 24px", textAlign: "center",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
          <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: TEXT }}>No imports yet</h3>
          <p style={{ margin: 0, fontSize: 15, color: MUTED }}>
            Use the "Import CSV" button on the Leads page to upload your first batch.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {imports.map(imp => {
            const st = STATUS_STYLE[imp.status] ?? STATUS_STYLE.completed;
            return (
              <Link key={imp.id} href={`/imports/${imp.id}`} style={{ textDecoration: "none", display: "block" }}>
                <div style={{
                  background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14,
                  padding: "16px 18px", display: "flex", alignItems: "center", gap: 14,
                }}>
                  <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 10, background: "#f5f3f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className="fa-solid fa-file-csv" style={{ fontSize: 20, color: ORANGE }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {imp.file_name}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: MUTED }}>
                      {imp.imported_count} imported · {imp.skipped_count} skipped · {timeAgo(imp.created_at)}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                      background: st.bg, color: st.color,
                    }}>
                      {st.label}
                    </span>
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: 12, color: "#c4bfb8" }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
