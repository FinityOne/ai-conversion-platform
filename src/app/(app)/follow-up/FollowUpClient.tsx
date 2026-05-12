"use client";

import { useState, useMemo } from "react";
import { TEMPLATES, type EmailTemplate, type TemplateCategory } from "./templates";

// ── Design tokens ─────────────────────────────────────────────────────────────
const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";
const BG     = "#F9F7F2";
const WHITE  = "#ffffff";

// ── Timing options ────────────────────────────────────────────────────────────
const TIMING_OPTIONS = [
  { label: "Immediate (Day 0)", hours: 0 },
  { label: "Day 1",  hours: 24 },
  { label: "Day 2",  hours: 48 },
  { label: "Day 3",  hours: 72 },
  { label: "Day 4",  hours: 96 },
  { label: "Day 5",  hours: 120 },
  { label: "Day 6",  hours: 144 },
  { label: "Day 7",  hours: 168 },
  { label: "Day 10", hours: 240 },
  { label: "Day 14", hours: 336 },
  { label: "Day 21", hours: 504 },
  { label: "Day 30", hours: 720 },
  { label: "Day 45", hours: 1080 },
  { label: "Day 60", hours: 1440 },
];

function hoursToLabel(h: number): string {
  const opt = TIMING_OPTIONS.find(o => o.hours === h);
  if (opt) return opt.label;
  const days = Math.round(h / 24);
  return days === 0 ? "Immediate" : `Day ${days}`;
}

// ── Category metadata ─────────────────────────────────────────────────────────
const CATEGORY_META: Record<TemplateCategory, { label: string; icon: string; color: string; bg: string; border: string; description: string }> = {
  personal:     { label: "Personal Touch",    icon: "fa-heart",           color: "#ea580c", bg: "rgba(234,88,12,0.06)",   border: "rgba(234,88,12,0.20)",   description: "Relationship emails that make every lead feel heard." },
  promo:        { label: "Promotions",        icon: "fa-tag",             color: "#15803d", bg: "rgba(21,128,61,0.06)",   border: "rgba(21,128,61,0.20)",   description: "Offers and deals that turn hesitant leads into bookings." },
  value:        { label: "Value Delivery",    icon: "fa-lightbulb",       color: "#0891b2", bg: "rgba(8,145,178,0.06)",   border: "rgba(8,145,178,0.20)",   description: "Educational content that positions you as the expert." },
  reengagement: { label: "Re-engagement",    icon: "fa-rotate-left",     color: "#be185d", bg: "rgba(190,24,93,0.06)",   border: "rgba(190,24,93,0.20)",   description: "Bring cold or unresponsive leads back to life." },
  referral:     { label: "Referral & Reviews",icon: "fa-star",            color: "#b45309", bg: "rgba(180,83,9,0.06)",    border: "rgba(180,83,9,0.20)",    description: "Turn happy patients into your best marketing channel." },
  urgency:      { label: "Urgency & FOMO",   icon: "fa-fire",            color: "#dc2626", bg: "rgba(220,38,38,0.06)",   border: "rgba(220,38,38,0.20)",   description: "Scarcity and deadline emails that force a decision." },
  seasonal:     { label: "Seasonal",          icon: "fa-calendar-days",   color: "#7c3aed", bg: "rgba(124,58,237,0.06)",  border: "rgba(124,58,237,0.20)",  description: "Holiday and seasonal campaigns tied to the calendar." },
  series:       { label: "Email Series",      icon: "fa-list-ol",         color: "#7c3aed", bg: "rgba(124,58,237,0.06)",  border: "rgba(124,58,237,0.20)",  description: "Multi-day drip sequences that build trust over time." },
};

const ALL_CATEGORIES = Object.keys(CATEGORY_META) as TemplateCategory[];

// Seed the flow with the 7 original templates
const INITIAL_FLOW = new Map<string, number>([
  ["welcome",         0],
  ["followup-info",   24],
  ["checkin-d3",      72],
  ["new-patient-offer", 120],
  ["flash-promo",     168],
  ["exercises",       240],
  ["whentovisit",     336],
]);

// ── Category badge ────────────────────────────────────────────────────────────
function CatBadge({ category }: { category: TemplateCategory }) {
  const meta = CATEGORY_META[category];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
      background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`,
      textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap",
    }}>
      <i className={`fa-solid ${meta.icon}`} style={{ fontSize: 8 }} />
      {meta.label}
    </span>
  );
}

// ── Preview modal ─────────────────────────────────────────────────────────────
function PreviewModal({ template, html, onClose }: { template: EmailTemplate; html?: string; onClose: () => void }) {
  const meta = CATEGORY_META[template.category];
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <div style={{ background: WHITE, borderRadius: 20, width: "100%", maxWidth: 660, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(0,0,0,0.25)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${template.color}15`, border: `1px solid ${template.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className={`fa-solid ${template.icon}`} style={{ fontSize: 15, color: template.color }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: TEXT }}>{template.title}</p>
              <CatBadge category={template.category} />
            </div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${BORDER}`, background: BG, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: MUTED, fontSize: 13 }}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Body */}
        {html ? (
          <div style={{ flex: 1, overflow: "hidden", background: "#f0ede8" }}>
            <iframe srcDoc={html} title={template.title} style={{ width: "100%", height: "100%", border: "none", minHeight: 540 }} sandbox="allow-same-origin" />
          </div>
        ) : (
          <div style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
            <div style={{ marginBottom: 20 }}>
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.05em" }}>Subject Line</p>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: TEXT, lineHeight: 1.5 }}>{template.subject}</p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.05em" }}>Goal</p>
              <p style={{ margin: 0, fontSize: 14, color: TEXT, lineHeight: 1.7 }}>{template.purpose}</p>
            </div>
            <div style={{ padding: "20px 24px", borderRadius: 14, background: meta.bg, border: `1px solid ${meta.border}`, display: "flex", alignItems: "flex-start", gap: 12 }}>
              <i className="fa-solid fa-paintbrush" style={{ color: meta.color, fontSize: 16, marginTop: 2, flexShrink: 0 }} />
              <div>
                <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: TEXT }}>Full template preview coming soon</p>
                <p style={{ margin: 0, fontSize: 13, color: MUTED, lineHeight: 1.6 }}>This template will be fully designed and personalized with your business name, logo, and contact details before it goes live in your sequence.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Add to Flow modal ─────────────────────────────────────────────────────────
function AddToFlowModal({
  template, onAdd, onClose,
}: { template: EmailTemplate; onAdd: (hours: number) => void; onClose: () => void }) {
  const [hours, setHours] = useState(
    TIMING_OPTIONS.find(o => o.hours >= template.suggestedHours)?.hours ?? template.suggestedHours
  );
  const meta = CATEGORY_META[template.category];

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <div style={{ background: WHITE, borderRadius: 20, width: "100%", maxWidth: 440, boxShadow: "0 24px 64px rgba(0,0,0,0.25)", overflow: "hidden" }}>
        {/* Header stripe */}
        <div style={{ padding: "20px 24px", background: meta.bg, borderBottom: `1px solid ${meta.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: WHITE, border: `1.5px solid ${meta.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className={`fa-solid ${template.icon}`} style={{ fontSize: 18, color: template.color }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: TEXT }}>{template.title}</p>
              <CatBadge category={template.category} />
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>
          <div style={{ marginBottom: 8, padding: "12px 14px", borderRadius: 10, background: BG, border: `1px solid ${BORDER}` }}>
            <p style={{ margin: "0 0 2px", fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.05em" }}>Subject</p>
            <p style={{ margin: 0, fontSize: 13, color: TEXT, lineHeight: 1.5 }}>{template.subject}</p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: TEXT, marginBottom: 6 }}>
              Send this email on:
            </label>
            <select
              value={hours}
              onChange={e => setHours(Number(e.target.value))}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${BORDER}`, fontSize: 14, color: TEXT, background: WHITE, cursor: "pointer", appearance: "auto" }}
            >
              {TIMING_OPTIONS.map(o => (
                <option key={o.hours} value={o.hours}>{o.label}</option>
              ))}
            </select>
            {template.suggestedHours > 0 && (
              <p style={{ margin: "6px 0 0", fontSize: 11, color: MUTED }}>
                Suggested: {hoursToLabel(template.suggestedHours)} based on best-practice sequences
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => onAdd(hours)}
              style={{ flex: 1, padding: "12px", borderRadius: 11, border: "none", background: template.color, color: WHITE, fontSize: 14, fontWeight: 800, cursor: "pointer" }}
            >
              <i className="fa-solid fa-plus" style={{ marginRight: 7, fontSize: 12 }} />
              Add to Flow
            </button>
            <button
              onClick={onClose}
              style={{ padding: "12px 18px", borderRadius: 11, border: `1.5px solid ${BORDER}`, background: WHITE, color: MUTED, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Marketplace template card ─────────────────────────────────────────────────
function TemplateCard({ template, inFlow, onAdd, onPreview }: {
  template: EmailTemplate;
  inFlow: boolean;
  onAdd: () => void;
  onPreview: () => void;
}) {
  const meta = CATEGORY_META[template.category];
  return (
    <div style={{
      background: WHITE, borderRadius: 14, border: `1.5px solid ${BORDER}`,
      borderLeft: `4px solid ${inFlow ? template.color : BORDER}`,
      overflow: "hidden", display: "flex", flexDirection: "column",
      transition: "box-shadow 0.15s, border-color 0.15s",
    }}>
      {/* Top */}
      <div style={{ padding: "14px 14px 10px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: `${template.color}12`, border: `1.5px solid ${template.color}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className={`fa-solid ${template.icon}`} style={{ fontSize: 14, color: template.color }} />
            </div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: TEXT, lineHeight: 1.3 }}>{template.title}</p>
          </div>
          <CatBadge category={template.category} />
        </div>

        {/* Subject */}
        <p style={{ margin: "0 0 6px", fontSize: 12, color: MUTED, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>
          <i className="fa-solid fa-at" style={{ fontSize: 9, marginRight: 5, color: "#c4bfb8" }} />
          {template.subject}
        </p>

        {/* Purpose */}
        <p style={{ margin: 0, fontSize: 11, color: "#a8a29e", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>
          {template.purpose}
        </p>
      </div>

      {/* Footer */}
      <div style={{ marginTop: "auto", padding: "10px 14px", borderTop: `1px solid ${BORDER}`, background: BG, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        {template.suggestedHours > 0 ? (
          <span style={{ fontSize: 10, fontWeight: 700, color: meta.color, background: meta.bg, border: `1px solid ${meta.border}`, padding: "2px 8px", borderRadius: 20 }}>
            <i className="fa-regular fa-clock" style={{ marginRight: 4, fontSize: 9 }} />
            Suggested {hoursToLabel(template.suggestedHours)}
          </span>
        ) : (
          <span style={{ fontSize: 10, color: MUTED }}>Manual / seasonal send</span>
        )}

        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button
            onClick={onPreview}
            style={{ padding: "5px 10px", borderRadius: 8, border: `1.5px solid ${BORDER}`, background: WHITE, color: MUTED, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            <i className="fa-solid fa-eye" style={{ fontSize: 10 }} />
            Preview
          </button>
          {inFlow ? (
            <button
              disabled
              style={{ padding: "5px 10px", borderRadius: 8, border: `1.5px solid ${template.color}40`, background: `${template.color}10`, color: template.color, fontSize: 11, fontWeight: 800, cursor: "default", display: "flex", alignItems: "center", gap: 4 }}
            >
              <i className="fa-solid fa-circle-check" style={{ fontSize: 10 }} />
              In Flow
            </button>
          ) : (
            <button
              onClick={onAdd}
              style={{ padding: "5px 10px", borderRadius: 8, border: `1.5px solid ${template.color}`, background: template.color, color: WHITE, fontSize: 11, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
            >
              <i className="fa-solid fa-plus" style={{ fontSize: 10 }} />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Marketplace tab ───────────────────────────────────────────────────────────
function MarketplaceTab({ flow, onAdd, onPreview }: {
  flow: Map<string, number>;
  onAdd: (t: EmailTemplate) => void;
  onPreview: (t: EmailTemplate) => void;
}) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<TemplateCategory | "all">("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: TEMPLATES.length };
    for (const cat of ALL_CATEGORIES) {
      c[cat] = TEMPLATES.filter(t => t.category === cat).length;
    }
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return TEMPLATES.filter(t =>
      (filterCat === "all" || t.category === filterCat) &&
      (!q || t.title.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q) || t.purpose.toLowerCase().includes(q))
    );
  }, [search, filterCat]);

  return (
    <>
      {/* Search + stats */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ position: "relative", marginBottom: 12 }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: MUTED, fontSize: 13, pointerEvents: "none" }} />
          <input
            type="text"
            placeholder="Search templates by title, subject, or goal…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "11px 14px 11px 38px", borderRadius: 12, border: `1.5px solid ${BORDER}`, fontSize: 13, color: TEXT, background: WHITE, outline: "none", boxSizing: "border-box" }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: MUTED, fontSize: 13 }}
            >
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button
            onClick={() => setFilterCat("all")}
            style={{ padding: "5px 12px", borderRadius: 20, border: `1.5px solid ${filterCat === "all" ? TEXT : BORDER}`, background: filterCat === "all" ? TEXT : WHITE, color: filterCat === "all" ? WHITE : MUTED, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >
            All <span style={{ opacity: 0.7 }}>({counts.all})</span>
          </button>
          {ALL_CATEGORIES.map(cat => {
            const meta = CATEGORY_META[cat];
            const active = filterCat === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                style={{ padding: "5px 12px", borderRadius: 20, border: `1.5px solid ${active ? meta.color : BORDER}`, background: active ? meta.color : WHITE, color: active ? WHITE : MUTED, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
              >
                <i className={`fa-solid ${meta.icon}`} style={{ fontSize: 10 }} />
                {meta.label} <span style={{ opacity: 0.75 }}>({counts[cat]})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Result count */}
      <p style={{ margin: "0 0 12px", fontSize: 12, color: MUTED }}>
        {filtered.length === TEMPLATES.length
          ? `${TEMPLATES.length} templates across ${ALL_CATEGORIES.length} categories`
          : `${filtered.length} template${filtered.length === 1 ? "" : "s"} found`}
        {flow.size > 0 && <span style={{ marginLeft: 12, color: "#15803d", fontWeight: 700 }}><i className="fa-solid fa-circle-check" style={{ marginRight: 4, fontSize: 10 }} />{flow.size} in your flow</span>}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "52px 24px", background: WHITE, border: `1.5px dashed ${BORDER}`, borderRadius: 14 }}>
          <i className="fa-solid fa-inbox" style={{ fontSize: 28, color: "#d4d4d4", display: "block", marginBottom: 12 }} />
          <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: TEXT }}>No templates match</p>
          <p style={{ margin: 0, fontSize: 13, color: MUTED }}>Try a different search or category filter.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {filtered.map(t => (
            <TemplateCard
              key={t.id}
              template={t}
              inFlow={flow.has(t.id)}
              onAdd={() => onAdd(t)}
              onPreview={() => onPreview(t)}
            />
          ))}
        </div>
      )}
    </>
  );
}

// ── Flow tab ──────────────────────────────────────────────────────────────────
function FlowTab({ flow, onUpdateTiming, onRemove, onPreview }: {
  flow: Map<string, number>;
  onUpdateTiming: (id: string, hours: number) => void;
  onRemove: (id: string) => void;
  onPreview: (t: EmailTemplate) => void;
}) {
  const sorted = useMemo(() => {
    return TEMPLATES
      .filter(t => flow.has(t.id))
      .sort((a, b) => (flow.get(a.id) ?? 0) - (flow.get(b.id) ?? 0));
  }, [flow]);

  const maxHours = sorted.length > 0 ? Math.max(...sorted.map(t => flow.get(t.id) ?? 0)) : 0;
  const seqDays  = maxHours > 0 ? Math.round(maxHours / 24) : 0;

  if (sorted.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "64px 24px", background: WHITE, border: `1.5px dashed ${BORDER}`, borderRadius: 16 }}>
        <i className="fa-solid fa-code-branch" style={{ fontSize: 32, color: "#d4d4d4", display: "block", marginBottom: 14 }} />
        <p style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 800, color: TEXT }}>Your flow is empty</p>
        <p style={{ margin: 0, fontSize: 14, color: MUTED }}>Head to the Template Library tab and add emails to build your sequence.</p>
      </div>
    );
  }

  return (
    <>
      {/* Stats */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { icon: "fa-envelope", val: String(sorted.length), label: "emails in sequence" },
          { icon: "fa-calendar-days", val: seqDays > 0 ? `${seqDays} days` : "Immediate", label: "sequence length" },
          { icon: "fa-circle-check", val: String(sorted.filter(t => t.previewKey).length), label: "with full preview" },
        ].map(({ icon, val, label }) => (
          <div key={label} style={{ flex: "1 1 140px", padding: "14px 16px", borderRadius: 12, background: WHITE, border: `1px solid ${BORDER}`, textAlign: "center" }}>
            <i className={`fa-solid ${icon}`} style={{ fontSize: 16, color: MUTED, marginBottom: 6, display: "block" }} />
            <p style={{ margin: "0 0 2px", fontSize: 20, fontWeight: 900, color: TEXT }}>{val}</p>
            <p style={{ margin: 0, fontSize: 11, color: MUTED }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Flow list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.map((template, i) => {
          const hours = flow.get(template.id) ?? 0;
          return (
            <div key={template.id}>
              {/* Connector */}
              {i > 0 && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", paddingLeft: 28, margin: "2px 0" }}>
                  <div style={{ width: 2, height: 14, background: BORDER, marginLeft: 16 }} />
                  <div style={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: `5px solid ${BORDER}`, marginLeft: 14 }} />
                </div>
              )}
              {/* Card */}
              <div style={{ background: WHITE, border: `1.5px solid ${template.color}35`, borderLeft: `4px solid ${template.color}`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                {/* Step number */}
                <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: `${template.color}12`, border: `1.5px solid ${template.color}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: template.color }}>
                  {i + 1}
                </div>

                {/* Icon */}
                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: `${template.color}10`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className={`fa-solid ${template.icon}`} style={{ fontSize: 15, color: template.color }} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: TEXT }}>{template.title}</span>
                    <CatBadge category={template.category} />
                  </div>
                  <p style={{ margin: 0, fontSize: 11, color: MUTED, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>
                    {template.subject}
                  </p>
                </div>

                {/* Timing dropdown */}
                <div style={{ flexShrink: 0 }}>
                  <select
                    value={hours}
                    onChange={e => onUpdateTiming(template.id, Number(e.target.value))}
                    style={{ padding: "6px 10px", borderRadius: 9, border: `1.5px solid ${template.color}40`, background: `${template.color}08`, color: template.color, fontSize: 12, fontWeight: 700, cursor: "pointer", appearance: "auto" }}
                  >
                    {TIMING_OPTIONS.map(o => (
                      <option key={o.hours} value={o.hours}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => onPreview(template)}
                    style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`, background: BG, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: MUTED, fontSize: 12 }}
                    title="Preview"
                  >
                    <i className="fa-solid fa-eye" />
                  </button>
                  <button
                    onClick={() => onRemove(template.id)}
                    style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(220,38,38,0.25)", background: "rgba(220,38,38,0.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626", fontSize: 12 }}
                    title="Remove from flow"
                  >
                    <i className="fa-solid fa-trash" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info note */}
      <div style={{ marginTop: 20, padding: "14px 18px", borderRadius: 12, background: "rgba(8,145,178,0.05)", border: "1px solid rgba(8,145,178,0.18)", display: "flex", alignItems: "flex-start", gap: 10 }}>
        <i className="fa-solid fa-circle-info" style={{ color: "#0891b2", fontSize: 14, flexShrink: 0, marginTop: 1 }} />
        <p style={{ margin: 0, fontSize: 13, color: TEXT, lineHeight: 1.6 }}>
          Timing is relative to when the lead submits their intake form. Adjust any step using the dropdown above. Full automation is enabled once your sequence is finalized.
        </p>
      </div>
    </>
  );
}

// ── SMS tab ───────────────────────────────────────────────────────────────────
function SmsComingSoon() {
  return (
    <div style={{ background: WHITE, border: `1.5px solid ${BORDER}`, borderRadius: 16, padding: "52px 24px", textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: 18, margin: "0 auto 20px", background: "#faf5ff", border: "1px solid #ddd6fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <i className="fa-solid fa-message" style={{ fontSize: 28, color: "#7c3aed" }} />
      </div>
      <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 900, color: TEXT }}>SMS Follow-Up — Coming Soon</h3>
      <p style={{ margin: "0 0 20px", fontSize: 14, color: MUTED, lineHeight: 1.7, maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
        Text follow-ups get 3× the response rate of email. The same library of templates will be available over SMS once Twilio verification is complete.
      </p>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 20, background: "#faf5ff", border: "1px solid #ddd6fe", fontSize: 13, fontWeight: 700, color: "#7c3aed" }}>
        <i className="fa-solid fa-clock" style={{ fontSize: 12 }} />
        Twilio verification in progress
      </div>
    </div>
  );
}

// ── Root component ─────────────────────────────────────────────────────────────
export default function FollowUpClient({ previews }: { previews: Record<string, string> }) {
  const [tab, setTab]         = useState<"library" | "flow" | "sms">("library");
  const [flow, setFlow]       = useState<Map<string, number>>(new Map(INITIAL_FLOW));
  const [addModal, setAddModal] = useState<EmailTemplate | null>(null);
  const [preview, setPreview] = useState<EmailTemplate | null>(null);

  function handleAdd(template: EmailTemplate) {
    setAddModal(template);
  }

  function confirmAdd(hours: number) {
    if (!addModal) return;
    setFlow(prev => new Map(prev).set(addModal.id, hours));
    setAddModal(null);
  }

  function handleRemove(id: string) {
    setFlow(prev => { const n = new Map(prev); n.delete(id); return n; });
  }

  function handleUpdateTiming(id: string, hours: number) {
    setFlow(prev => new Map(prev).set(id, hours));
  }

  const TABS = [
    { key: "library" as const, label: "Template Library", icon: "fa-store", badge: `${TEMPLATES.length}` },
    { key: "flow"    as const, label: "My Flow",          icon: "fa-code-branch", badge: flow.size > 0 ? String(flow.size) : null },
    { key: "sms"     as const, label: "SMS",              icon: "fa-message", soon: true },
  ];

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#D35400" }}>
          Follow-Up Engine
        </p>
        <h1 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 900, color: TEXT }}>Email Template Marketplace</h1>
        <p style={{ margin: 0, fontSize: 14, color: MUTED, lineHeight: 1.6 }}>
          Browse {TEMPLATES.length} ready-to-deploy templates across {ALL_CATEGORIES.length} categories. Add any to your flow and set the exact timing for each touchpoint.
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: BG, padding: 4, borderRadius: 12, border: `1px solid ${BORDER}`, width: "fit-content" }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "8px 18px", borderRadius: 9, border: "none",
              background: tab === t.key ? WHITE : "transparent",
              color: tab === t.key ? TEXT : MUTED,
              fontSize: 13, fontWeight: tab === t.key ? 700 : 500,
              cursor: "pointer", boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              display: "flex", alignItems: "center", gap: 7, transition: "all 0.15s",
            }}
          >
            <i className={`fa-solid ${t.icon}`} style={{ fontSize: 12 }} />
            {t.label}
            {t.badge && (
              <span style={{ fontSize: 10, fontWeight: 800, padding: "1px 6px", borderRadius: 20, background: tab === t.key ? TEXT : BORDER, color: tab === t.key ? WHITE : MUTED }}>
                {t.badge}
              </span>
            )}
            {t.soon && (
              <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 5px", borderRadius: 8, background: "#7c3aed", color: WHITE, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Soon
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "library" && (
        <MarketplaceTab
          flow={flow}
          onAdd={handleAdd}
          onPreview={t => setPreview(t)}
        />
      )}
      {tab === "flow" && (
        <FlowTab
          flow={flow}
          onUpdateTiming={handleUpdateTiming}
          onRemove={handleRemove}
          onPreview={t => setPreview(t)}
        />
      )}
      {tab === "sms" && <SmsComingSoon />}

      {/* Modals */}
      {addModal && (
        <AddToFlowModal
          template={addModal}
          onAdd={confirmAdd}
          onClose={() => setAddModal(null)}
        />
      )}
      {preview && (
        <PreviewModal
          template={preview}
          html={preview.previewKey ? previews[preview.previewKey] : undefined}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}
