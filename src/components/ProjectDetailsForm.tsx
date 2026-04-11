"use client";

import { useState, useRef } from "react";

const JOB_TYPES = [
  "Roofing", "Siding & Gutters", "Windows & Doors", "HVAC", "Plumbing",
  "Electrical", "Kitchen Remodel", "Bathroom Remodel", "Flooring",
  "Painting & Drywall", "Landscaping & Lawn Care",
];

const PROPERTY_TYPES = ["Single-Family Home", "Condo / Townhouse", "Multi-Family", "Commercial", "Other"];
const BUDGET_RANGES  = ["Under $1,000", "$1,000 – $5,000", "$5,000 – $15,000", "$15,000 – $30,000", "$30,000+", "Not sure yet"];
const TIMELINES      = ["As soon as possible", "Within 2 weeks", "Within a month", "1–3 months", "Just planning ahead"];

interface Props {
  token: string;
  initialJobType?: string | null;
  initialDescription?: string | null;
  businessName: string;
}

const ACCENT = "#7c3aed";

const fieldStyle = (focused: boolean): React.CSSProperties => ({
  width: "100%", padding: "14px 16px", borderRadius: 10,
  border: focused ? `2px solid ${ACCENT}` : "2px solid #e6e2db",
  boxShadow: focused ? `0 0 0 3px ${ACCENT}18` : "none",
  background: "#fff", fontSize: 16, color: "#1c1917",
  outline: "none", boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
  WebkitAppearance: "none",
});

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 15, fontWeight: 700, color: "#292524" }}>{label}</label>
      {children}
      {hint && <p style={{ margin: 0, fontSize: 12, color: "#a8a29e" }}>{hint}</p>}
    </div>
  );
}

export default function ProjectDetailsForm({ token, initialJobType, initialDescription, businessName }: Props) {
  const [jobType,          setJobType]          = useState(initialJobType ?? "");
  const [description,      setDescription]      = useState(initialDescription ?? "");
  const [propertyType,     setPropertyType]     = useState("");
  const [budgetRange,      setBudgetRange]       = useState("");
  const [timeline,         setTimeline]         = useState("");
  const [address,          setAddress]          = useState("");
  const [additionalNotes,  setAdditionalNotes]  = useState("");
  const [photos,           setPhotos]           = useState<File[]>([]);
  const [previews,         setPreviews]         = useState<string[]>([]);
  const [focusedField,     setFocusedField]     = useState<string | null>(null);
  const [loading,          setLoading]          = useState(false);
  const [error,            setError]            = useState("");
  const [submitted,        setSubmitted]        = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 5 - photos.length);
    const newPhotos = [...photos, ...files].slice(0, 5);
    setPhotos(newPhotos);
    setPreviews(newPhotos.map(f => URL.createObjectURL(f)));
  }

  function removePhoto(i: number) {
    const newPhotos   = photos.filter((_, idx) => idx !== i);
    const newPreviews = previews.filter((_, idx) => idx !== i);
    setPhotos(newPhotos);
    setPreviews(newPreviews);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) { setError("Please describe your project."); return; }
    setLoading(true); setError("");

    const fd = new FormData();
    fd.append("token",           token);
    fd.append("jobType",         jobType);
    fd.append("description",     description);
    fd.append("propertyType",    propertyType);
    fd.append("budgetRange",     budgetRange);
    fd.append("timeline",        timeline);
    fd.append("address",         address);
    fd.append("additionalNotes", additionalNotes);
    photos.forEach(p => fd.append("photos", p));

    const res = await fetch("/api/project-details", { method: "POST", body: fd });
    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong. Please try again.");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "48px 20px" }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%", margin: "0 auto 20px",
          background: "#faf5ff", border: `2px solid #ddd6fe`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
        }}>✅</div>
        <h2 style={{ margin: "0 0 10px", fontSize: 24, fontWeight: 900, color: "#1c1917" }}>
          Details submitted!
        </h2>
        <p style={{ margin: 0, fontSize: 16, color: "#57534e", lineHeight: 1.6 }}>
          <strong>{businessName}</strong> has everything they need.
          Expect a response very soon.
        </p>
      </div>
    );
  }

  const step1Done = description.trim().length > 0;
  const step2Done = budgetRange !== "" || timeline !== "";
  const step3Done = photos.length > 0;
  const stepsCompleted = [step1Done, step2Done, step3Done].filter(Boolean).length;

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Progress indicator */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {[
          { n: 1, label: "Project",  done: step1Done },
          { n: 2, label: "Details",  done: step2Done },
          { n: 3, label: "Photos",   done: step3Done },
        ].map((s, i) => (
          <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
              background: s.done ? ACCENT : "#e6e2db",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 800, color: s.done ? "#fff" : "#a8a29e",
              transition: "background 0.2s",
            }}>
              {s.done ? "✓" : s.n}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: s.done ? ACCENT : "#a8a29e" }}>{s.label}</span>
            {i < 2 && <div style={{ flex: 1, height: 2, background: s.done ? ACCENT : "#e6e2db", borderRadius: 1, transition: "background 0.2s" }} />}
          </div>
        ))}
        <span style={{ fontSize: 11, color: "#a8a29e", whiteSpace: "nowrap" }}>{stepsCompleted}/3</span>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: 10, padding: "12px 16px", color: "#dc2626", fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Step 1: Project info */}
      <div style={{ background: "#faf5ff", borderRadius: 14, padding: "18px 18px", border: "1px solid #ede9fe" }}>
        <p style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 800, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.8px" }}>
          1 · Project Info
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Service Type">
            <div style={{ position: "relative" }}>
              <select
                style={{ ...fieldStyle(focusedField === "jobType"), appearance: "none", paddingRight: 40, cursor: "pointer" }}
                value={jobType}
                onChange={e => setJobType(e.target.value)}
                onFocus={() => setFocusedField("jobType")}
                onBlur={() => setFocusedField(null)}
              >
                <option value="">Select a service...</option>
                {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#a8a29e", fontSize: 12 }}>▼</span>
            </div>
          </Field>

          <Field label="Describe your project *" hint="What's the issue or goal? The more detail, the better.">
            <textarea
              style={{ ...fieldStyle(focusedField === "description"), resize: "vertical", minHeight: 100 }}
              placeholder="E.g. My roof has 3 missing shingles after last week's storm. It's on the south-facing side…"
              value={description}
              onChange={e => setDescription(e.target.value)}
              onFocus={() => setFocusedField("description")}
              onBlur={() => setFocusedField(null)}
              autoComplete="off"
            />
          </Field>

          <Field label="Property Type">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
              {PROPERTY_TYPES.map(t => (
                <button
                  key={t} type="button"
                  onClick={() => setPropertyType(t)}
                  style={{
                    padding: "10px 12px", borderRadius: 8, fontSize: 13, cursor: "pointer",
                    border: propertyType === t ? `2px solid ${ACCENT}` : "2px solid #e6e2db",
                    background: propertyType === t ? "#faf5ff" : "#fff",
                    color: propertyType === t ? ACCENT : "#78716c",
                    fontWeight: propertyType === t ? 700 : 500,
                    textAlign: "left",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>
        </div>
      </div>

      {/* Step 2: Logistics */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "18px 18px", border: "1px solid #e6e2db" }}>
        <p style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 800, color: "#78716c", textTransform: "uppercase", letterSpacing: "0.8px" }}>
          2 · Budget & Timeline
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Approximate Budget">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
              {BUDGET_RANGES.map(b => (
                <button
                  key={b} type="button"
                  onClick={() => setBudgetRange(b)}
                  style={{
                    padding: "10px 12px", borderRadius: 8, fontSize: 13, cursor: "pointer",
                    border: budgetRange === b ? `2px solid ${ACCENT}` : "2px solid #e6e2db",
                    background: budgetRange === b ? "#faf5ff" : "#fff",
                    color: budgetRange === b ? ACCENT : "#78716c",
                    fontWeight: budgetRange === b ? 700 : 500,
                    textAlign: "left",
                  }}
                >
                  {b}
                </button>
              ))}
            </div>
          </Field>

          <Field label="When do you need this done?">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {TIMELINES.map(t => (
                <button
                  key={t} type="button"
                  onClick={() => setTimeline(t)}
                  style={{
                    padding: "12px 14px", borderRadius: 8, fontSize: 14, cursor: "pointer",
                    border: timeline === t ? `2px solid ${ACCENT}` : "2px solid #e6e2db",
                    background: timeline === t ? "#faf5ff" : "#fff",
                    color: timeline === t ? ACCENT : "#44403c",
                    fontWeight: timeline === t ? 700 : 400,
                    textAlign: "left", display: "flex", alignItems: "center", gap: 8,
                  }}
                >
                  <span style={{
                    width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                    border: `2px solid ${timeline === t ? ACCENT : "#c4bfb8"}`,
                    background: timeline === t ? ACCENT : "transparent",
                  }} />
                  {t}
                </button>
              ))}
            </div>
          </Field>

          <Field label="City / ZIP Code" hint="Helps us confirm we serve your area">
            <input
              style={fieldStyle(focusedField === "address")}
              placeholder="e.g. Austin, TX or 78701"
              value={address}
              onChange={e => setAddress(e.target.value)}
              onFocus={() => setFocusedField("address")}
              onBlur={() => setFocusedField(null)}
              autoComplete="postal-code"
            />
          </Field>
        </div>
      </div>

      {/* Step 3: Photos */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "18px 18px", border: "1px solid #e6e2db" }}>
        <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 800, color: "#78716c", textTransform: "uppercase", letterSpacing: "0.8px" }}>
          3 · Photos
        </p>
        <p style={{ margin: "0 0 14px", fontSize: 13, color: "#78716c" }}>
          A picture is worth a thousand words — and a much more accurate estimate.
        </p>

        {/* Upload zone */}
        {photos.length < 5 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: "100%", padding: "24px", borderRadius: 12, cursor: "pointer",
              border: `2px dashed ${photos.length > 0 ? ACCENT : "#c4bfb8"}`,
              background: photos.length > 0 ? "#faf5ff" : "#f9f7f4",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            }}
          >
            <i className="fa-solid fa-camera" style={{ fontSize: 24, color: photos.length > 0 ? ACCENT : "#a8a29e" }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: photos.length > 0 ? ACCENT : "#78716c" }}>
              {photos.length === 0 ? "Tap to add photos" : `Add more (${photos.length}/5)`}
            </span>
            <span style={{ fontSize: 12, color: "#a8a29e" }}>JPG, PNG, HEIC · Max 10 MB each</span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={handlePhotoChange}
        />

        {/* Preview grid */}
        {previews.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 12 }}>
            {previews.map((src, i) => (
              <div key={i} style={{ position: "relative", borderRadius: 8, overflow: "hidden", aspectRatio: "1", background: "#f0ede8" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Photo ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  style={{
                    position: "absolute", top: 4, right: 4,
                    width: 22, height: 22, borderRadius: "50%",
                    background: "rgba(0,0,0,0.6)", border: "none",
                    color: "#fff", fontSize: 11, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Additional notes */}
      <Field label="Anything else? (optional)">
        <textarea
          style={{ ...fieldStyle(focusedField === "notes"), resize: "vertical", minHeight: 80 }}
          placeholder="Access instructions, past work done, specific concerns…"
          value={additionalNotes}
          onChange={e => setAdditionalNotes(e.target.value)}
          onFocus={() => setFocusedField("notes")}
          onBlur={() => setFocusedField(null)}
          autoComplete="off"
        />
      </Field>

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "18px", borderRadius: 12, border: "none",
          background: `linear-gradient(135deg, ${ACCENT}, #9333ea)`,
          color: "#fff", fontSize: 17, fontWeight: 800,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.75 : 1,
          boxShadow: `0 6px 20px ${ACCENT}40`,
        }}
      >
        {loading ? "Submitting…" : "Submit My Project Details →"}
      </button>

      <p style={{ margin: 0, textAlign: "center", fontSize: 12, color: "#a8a29e" }}>
        Your information is shared only with {businessName}.
      </p>
    </form>
  );
}
