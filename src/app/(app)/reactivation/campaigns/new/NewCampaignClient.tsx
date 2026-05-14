"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import {
  MIDNIGHT_NAVY, SAPPHIRE, SAPPHIRE_PALE, CLOUD, FROST, WHITE, STEEL,
  GRAD_PRIMARY, FONT_SANS, BTN_PRIMARY,
} from "@/lib/brand";
import { EMAIL_SEQUENCE } from "@/lib/reactivation";
import type { ReactivationCampaign } from "@/lib/reactivation";

interface FormData {
  name:        string;
  from_name:   string;
  from_email:  string;
  reply_to:    string;
  booking_url: string;
}

const DELAY_LABELS: Record<number, string> = { 0: "Day 0 — Immediately on launch", 4: "Day 4", 9: "Day 9", 16: "Day 16", 23: "Day 23" };
const DELAY_DELTAS: Record<number, string> = { 0: "Sends immediately upon launch", 4: "+4 days after step 1", 9: "+5 days after step 2", 16: "+7 days after step 3", 23: "+7 days after step 4" };

export default function NewCampaignClient() {
  const router = useRouter();
  const [form, setForm]       = useState<FormData>({ name: "", from_name: "", from_email: "", reply_to: "", booking_url: "" });
  const [errors, setErrors]   = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const e: Partial<FormData> = {};
    if (!form.name.trim())        e.name        = "Campaign name is required";
    if (!form.from_name.trim())   e.from_name   = "From name is required";
    if (!form.from_email.trim())  e.from_email  = "From email is required";
    if (form.from_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.from_email)) e.from_email = "Enter a valid email";
    if (!form.booking_url.trim()) e.booking_url = "Booking URL is required";
    if (form.booking_url && !/^https?:\/\/.+/.test(form.booking_url)) e.booking_url = "Enter a valid URL (starting with https://)";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res  = await fetch("/api/reactivation/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:        form.name.trim(),
          from_name:   form.from_name.trim(),
          from_email:  form.from_email.trim(),
          reply_to:    form.reply_to.trim() || undefined,
          booking_url: form.booking_url.trim(),
        }),
      });
      const data = await res.json() as { campaign?: ReactivationCampaign; error?: string };
      if (!res.ok || !data.campaign) { toast.error(data.error ?? "Failed to create campaign"); return; }
      toast.success("Campaign created!");
      router.push(`/reactivation/campaigns/${data.campaign.id}`);
    } catch {
      toast.error("Failed to create campaign");
    } finally {
      setLoading(false);
    }
  }

  function field(key: keyof FormData) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(f => ({ ...f, [key]: e.target.value }));
        setErrors(err => ({ ...err, [key]: undefined }));
      },
    };
  }

  const previewName  = form.from_name  || "{{practiceName}}";
  const previewFirst = "{{firstName}}";

  return (
    <div style={{ fontFamily: FONT_SANS, maxWidth: 1000, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
        <Link href="/reactivation/campaigns" style={{ color: STEEL, fontSize: 13, textDecoration: "none" }}>
          <i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }} /> Campaigns
        </Link>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: MIDNIGHT_NAVY }}>New Campaign</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
        {/* ── Left: Form ── */}
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${CLOUD}`, boxShadow: "0 1px 4px rgba(13,20,40,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${CLOUD}` }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: MIDNIGHT_NAVY }}>Campaign Settings</h2>
            </div>
            <div style={{ padding: "24px" }}>
              {/* Campaign Name */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: MIDNIGHT_NAVY, marginBottom: 5 }}>Campaign Name *</label>
                <input {...field("name")} placeholder="e.g. Spring 2026 Patient Reactivation"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 9, border: `1px solid ${errors.name ? "#FCA5A5" : CLOUD}`, fontSize: 14, color: MIDNIGHT_NAVY, outline: "none", boxSizing: "border-box" }} />
                {errors.name && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#DC2626" }}>{errors.name}</p>}
                <p style={{ margin: "4px 0 0", fontSize: 12, color: STEEL }}>A name to identify this campaign internally.</p>
              </div>

              {/* From Name */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: MIDNIGHT_NAVY, marginBottom: 5 }}>From Name *</label>
                <input {...field("from_name")} placeholder="e.g. Dr. Sarah at City Chiro"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 9, border: `1px solid ${errors.from_name ? "#FCA5A5" : CLOUD}`, fontSize: 14, color: MIDNIGHT_NAVY, outline: "none", boxSizing: "border-box" }} />
                {errors.from_name && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#DC2626" }}>{errors.from_name}</p>}
                <p style={{ margin: "4px 0 0", fontSize: 12, color: STEEL }}>The name recipients see in their inbox.</p>
              </div>

              {/* From Email */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: MIDNIGHT_NAVY, marginBottom: 5 }}>From Email *</label>
                <input {...field("from_email")} type="email" placeholder="hello@yourclinic.com"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 9, border: `1px solid ${errors.from_email ? "#FCA5A5" : CLOUD}`, fontSize: 14, color: MIDNIGHT_NAVY, outline: "none", boxSizing: "border-box" }} />
                {errors.from_email && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#DC2626" }}>{errors.from_email}</p>}
                <p style={{ margin: "4px 0 0", fontSize: 12, color: STEEL }}>Must be a verified sender domain in Resend.</p>
              </div>

              {/* Reply-To */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: MIDNIGHT_NAVY, marginBottom: 5 }}>Reply-To (optional)</label>
                <input {...field("reply_to")} type="email" placeholder="reception@yourclinic.com"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 9, border: `1px solid ${CLOUD}`, fontSize: 14, color: MIDNIGHT_NAVY, outline: "none", boxSizing: "border-box" }} />
                <p style={{ margin: "4px 0 0", fontSize: 12, color: STEEL }}>Where patient replies will go. Defaults to from email if blank.</p>
              </div>

              {/* Booking URL */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: MIDNIGHT_NAVY, marginBottom: 5 }}>Booking URL *</label>
                <input {...field("booking_url")} type="url" placeholder="https://yourclinic.com/book"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 9, border: `1px solid ${errors.booking_url ? "#FCA5A5" : CLOUD}`, fontSize: 14, color: MIDNIGHT_NAVY, outline: "none", boxSizing: "border-box" }} />
                {errors.booking_url && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#DC2626" }}>{errors.booking_url}</p>}
                <p style={{ margin: "4px 0 0", fontSize: 12, color: STEEL }}>The link patients click to book their return appointment.</p>
              </div>

              <button type="submit" disabled={loading} style={{ ...BTN_PRIMARY, width: "100%", padding: "13px", fontSize: 14, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {loading
                  ? <><i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 13 }} /> Creating…</>
                  : <><i className="fa-solid fa-check" style={{ fontSize: 13 }} /> Create Campaign</>}
              </button>
            </div>
          </div>
        </form>

        {/* ── Right: Preview ── */}
        <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${CLOUD}`, boxShadow: "0 1px 4px rgba(13,20,40,0.06)", overflow: "hidden", position: "sticky", top: 80 }}>
          <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${CLOUD}` }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: MIDNIGHT_NAVY }}>Email Sequence Preview</h2>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: STEEL }}>5 emails · sent over 23 days</p>
          </div>
          <div style={{ padding: "8px 24px 20px" }}>
            {EMAIL_SEQUENCE.map((seq, i) => (
              <div key={seq.step} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: i < EMAIL_SEQUENCE.length - 1 ? `1px solid ${FROST}` : "none" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%",
                    background: seq.delayDays === 0 ? GRAD_PRIMARY : SAPPHIRE_PALE,
                    border: `2px solid ${seq.delayDays === 0 ? SAPPHIRE : CLOUD}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 900, color: seq.delayDays === 0 ? "#fff" : SAPPHIRE }}>{seq.step}</span>
                  </div>
                  {i < EMAIL_SEQUENCE.length - 1 && <div style={{ width: 2, height: 24, background: CLOUD, marginTop: 4 }} />}
                </div>
                <div style={{ flex: 1, paddingTop: 2 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: seq.delayDays === 0 ? "#F0FDF4" : FROST, color: seq.delayDays === 0 ? "#15803D" : STEEL, border: `1px solid ${seq.delayDays === 0 ? "#BBF7D0" : CLOUD}` }}>
                      {DELAY_LABELS[seq.delayDays] ?? `Day ${seq.delayDays}`}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: MIDNIGHT_NAVY, marginBottom: 3, lineHeight: 1.4 }}>
                    {seq.subject.replace("{{firstName}}", previewFirst).replace("{{practiceName}}", previewName)}
                  </div>
                  <div style={{ fontSize: 11, color: STEEL, lineHeight: 1.5 }}>{seq.previewText}</div>
                  <div style={{ marginTop: 5, fontSize: 10, color: "#a8a29e", fontStyle: "italic" }}>
                    {DELAY_DELTAS[seq.delayDays] ?? ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
