import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { getStageConfig } from "@/lib/scoring";
import { leadFullName, type Lead } from "@/lib/leads";
import UpdateImportButton from "./UpdateImportButton";

const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";
const ORANGE = "#D35400";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function ImportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const sb = createSupabaseServiceClient();

  const { data: imp } = await sb
    .from("lead_imports")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!imp) notFound();

  const { data: leads } = await sb
    .from("leads")
    .select("*")
    .eq("import_id", id)
    .order("created_at", { ascending: true });

  return (
    <div>
      {/* Back link */}
      <Link href="/imports" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: MUTED, textDecoration: "none", marginBottom: 18 }}>
        <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} />
        All Imports
      </Link>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <div>
          <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: ORANGE }}>
            Import Details
          </p>
          <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 900, color: TEXT }}>{imp.file_name}</h1>
          <p style={{ margin: 0, fontSize: 13, color: MUTED }}>
            Imported {formatDate(imp.created_at)} · {imp.imported_count} leads · {imp.skipped_count} skipped
          </p>
        </div>
        <UpdateImportButton importId={id} />
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Total Rows",   value: imp.row_count,       color: TEXT },
          { label: "Imported",     value: imp.imported_count,  color: "#27AE60" },
          { label: "Skipped",      value: imp.skipped_count,   color: imp.skipped_count > 0 ? "#dc2626" : MUTED },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px", textAlign: "center" }}>
            <p style={{ margin: "0 0 2px", fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</p>
            <p style={{ margin: 0, fontSize: 11, color: MUTED }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Leads table */}
      {!leads?.length ? (
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "32px", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 15, color: MUTED }}>No leads found for this import.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 560 }}>
              <thead>
                <tr style={{ background: "#f9f7f4", borderBottom: `1px solid ${BORDER}` }}>
                  {["Name", "Email", "Phone", "Job Type", "Status"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(leads as Lead[]).map((lead, i) => {
                  const cfg = getStageConfig(lead.status);
                  return (
                    <tr key={lead.id} style={{ borderBottom: i < leads.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                      <td style={{ padding: "10px 14px" }}>
                        <Link href={`/leads/${lead.id}`} style={{ fontSize: 14, fontWeight: 700, color: TEXT, textDecoration: "none" }}>
                          {leadFullName(lead)}
                        </Link>
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: 13, color: MUTED }}>{lead.email ?? <em style={{ color: "#c4bfb8" }}>—</em>}</td>
                      <td style={{ padding: "10px 14px", fontSize: 13, color: MUTED }}>{lead.phone ?? <em style={{ color: "#c4bfb8" }}>—</em>}</td>
                      <td style={{ padding: "10px 14px", fontSize: 13, color: MUTED }}>{lead.job_type ?? <em style={{ color: "#c4bfb8" }}>—</em>}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "3px 10px", borderRadius: 20,
                          background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                          fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
                        }}>
                          {cfg.emoji} {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
