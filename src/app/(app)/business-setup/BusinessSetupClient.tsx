"use client";

import { useState, useCallback, useRef } from "react";
import { INDUSTRY_GROUPS } from "@/lib/industry-config";

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
  business_logo_url: string | null;
  business_website: string | null;
  business_email: string | null;
  business_phone: string | null;
  business_address: string | null;
  business_city: string | null;
  business_state: string | null;
  business_zip: string | null;
  business_tagline: string | null;
  business_description: string | null;
  business_license: string | null;
  business_instagram: string | null;
  business_facebook: string | null;
  business_google_profile: string | null;
  years_in_business: number | null;
  service_area: string | null;
  business_industry: string | null;
  intake_slug: string | null;
}

interface UserLocation {
  id: string;
  name: string;
  location: string;
  is_primary: boolean;
  intake_slug: string | null;
  loc_phone: string | null;
  loc_email: string | null;
  loc_address: string | null;
  loc_city: string | null;
  loc_state: string | null;
  loc_zip: string | null;
  loc_tagline: string | null;
  loc_description: string | null;
  loc_service_area: string | null;
}

// ── Palette ───────────────────────────────────────────────────────────────────

const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";
const CARD   = "#ffffff";
const BG     = "#F9F7F2";
const ORANGE = "#D35400";

// ── Helpers ───────────────────────────────────────────────────────────────────

type SaveState = "idle" | "saving" | "saved" | "error";

const INP: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: `1.5px solid ${BORDER}`, background: CARD,
  color: TEXT, fontSize: 14, outline: "none",
  boxSizing: "border-box", fontFamily: "inherit",
  transition: "border-color 0.15s",
};
const LABEL: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: MUTED,
  display: "block", marginBottom: 5, letterSpacing: "0.6px",
  textTransform: "uppercase",
};

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label style={LABEL}>{label}</label>
      {children}
      {hint && <p style={{ margin: "4px 0 0", fontSize: 11, color: MUTED }}>{hint}</p>}
    </div>
  );
}

function SaveBtn({ state, onClick, label = "Save" }: { state: SaveState; onClick: () => void; label?: string }) {
  const bg  = state === "saved" ? "#22c55e" : state === "error" ? "#ef4444" : ORANGE;
  const txt = state === "saving" ? "Saving…" : state === "saved" ? "✓ Saved" : state === "error" ? "Retry" : label;
  return (
    <button
      onClick={onClick}
      disabled={state === "saving"}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "8px 18px", borderRadius: 8, border: "none",
        background: bg, color: "#fff",
        fontSize: 13, fontWeight: 700, cursor: state === "saving" ? "wait" : "pointer",
        opacity: state === "saving" ? 0.75 : 1, transition: "background 0.25s",
      }}
    >
      {state === "saving" && <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 11 }} />}
      {txt}
    </button>
  );
}

// Compact card with a group label; optionally shows its own save button
function GroupCard({ label, icon, children, onSave, saveState }: {
  label: string; icon: string;
  children: React.ReactNode;
  onSave?: () => void; saveState?: SaveState;
}) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, marginBottom: 12, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 9 }}>
        <i className={icon} style={{ fontSize: 13, color: ORANGE }} />
        <span style={{ fontSize: 13, fontWeight: 800, color: TEXT }}>{label}</span>
      </div>
      <div style={{ padding: "18px 20px" }}>
        {children}
        {onSave && saveState !== undefined && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <SaveBtn state={saveState} onClick={onSave} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Image Uploader ────────────────────────────────────────────────────────────

function ImageUploader({
  currentUrl, type, shape, size, placeholder, onUploaded,
}: {
  currentUrl: string | null;
  type: "avatar" | "logo";
  shape: "circle" | "rect";
  size: number;
  placeholder: React.ReactNode;
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState("");
  const [hover, setHover]         = useState(false);
  const inputRef                  = useRef<HTMLInputElement>(null);

  const radius = shape === "circle" ? "50%" : 10;

  async function handleFile(file: File) {
    setUploading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", type);
      const res  = await fetch("/api/profile/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onUploaded(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          width: size, height: size, borderRadius: radius, flexShrink: 0,
          position: "relative", cursor: "pointer", overflow: "hidden",
          border: `2px dashed ${hover ? ORANGE : BORDER}`,
          transition: "border-color 0.15s",
        }}
      >
        {currentUrl
          ? <img src={currentUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: BG }}>{placeholder}</div>
        }
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.52)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
          opacity: hover || uploading ? 1 : 0, transition: "opacity 0.15s",
          borderRadius: radius,
        }}>
          {uploading
            ? <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 18, color: "#fff" }} />
            : <><i className="fa-solid fa-camera" style={{ fontSize: 14, color: "#fff" }} /><span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>Change</span></>
          }
        </div>
      </div>
      <input
        ref={inputRef} type="file"
        accept={type === "avatar" ? "image/jpeg,image/png,image/webp,image/gif" : "image/jpeg,image/png,image/webp,image/svg+xml"}
        style={{ display: "none" }}
        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ""; }}
      />
      {error && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#ef4444" }}>{error}</p>}
      <p style={{ margin: "4px 0 0", fontSize: 10, color: MUTED }}>Click to upload · max 5 MB</p>
    </div>
  );
}

// ── Brand Tab ─────────────────────────────────────────────────────────────────

function BrandTab({ profile, onChange }: { profile: UserProfile; onChange: (p: Partial<UserProfile>) => void }) {
  // ── Identity group
  const [logo,        setLogo]     = useState(profile.business_logo_url);
  const [bizName,     setBizName]  = useState(profile.business_name ?? "");
  const [tagline,     setTagline]  = useState(profile.business_tagline ?? "");
  const [nameWarning, setNameWarn] = useState(false);
  const [idSave,      setIdSave]   = useState<SaveState>("idle");

  async function saveIdentity() {
    setIdSave("saving");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_name: bizName || null, business_tagline: tagline || null, business_logo_url: logo }),
      });
      if (!res.ok) throw new Error();
      onChange(await res.json());
      setIdSave("saved"); setTimeout(() => setIdSave("idle"), 3000);
    } catch { setIdSave("error"); setTimeout(() => setIdSave("idle"), 3000); }
  }

  // ── About group
  const [industry,    setIndustry] = useState(profile.business_industry ?? "");
  const [description, setDesc]     = useState(profile.business_description ?? "");
  const [license,     setLicense]  = useState(profile.business_license ?? "");
  const [years,       setYears]    = useState(profile.years_in_business?.toString() ?? "");
  const [aboutSave,   setAboutSave] = useState<SaveState>("idle");
  const selectedGroup = INDUSTRY_GROUPS.find(g => g.items.includes(industry));

  async function saveAbout() {
    setAboutSave("saving");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_industry: industry || null,
          business_description: description || null,
          business_license: license || null,
          years_in_business: years ? parseInt(years) : null,
        }),
      });
      if (!res.ok) throw new Error();
      onChange(await res.json());
      setAboutSave("saved"); setTimeout(() => setAboutSave("idle"), 3000);
    } catch { setAboutSave("error"); setTimeout(() => setAboutSave("idle"), 3000); }
  }

  // ── Online presence group
  const [instagram, setInstagram] = useState(profile.business_instagram ?? "");
  const [facebook,  setFacebook]  = useState(profile.business_facebook ?? "");
  const [google,    setGoogle]    = useState(profile.business_google_profile ?? "");
  const [website,   setWebsite]   = useState(profile.business_website ?? "");
  const [linkSave,  setLinkSave]  = useState<SaveState>("idle");

  async function saveLinks() {
    setLinkSave("saving");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_website:        website   || null,
          business_instagram:      instagram || null,
          business_facebook:       facebook  || null,
          business_google_profile: google    || null,
        }),
      });
      if (!res.ok) throw new Error();
      onChange(await res.json());
      setLinkSave("saved"); setTimeout(() => setLinkSave("idle"), 3000);
    } catch { setLinkSave("error"); setTimeout(() => setLinkSave("idle"), 3000); }
  }

  return (
    <div>
      {/* Identity */}
      <GroupCard label="Identity" icon="fa-solid fa-building" onSave={saveIdentity} saveState={idSave}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div>
            <p style={{ ...LABEL, marginBottom: 8 }}>Logo</p>
            <ImageUploader
              currentUrl={logo} type="logo" shape="rect" size={80}
              placeholder={<i className="fa-solid fa-image" style={{ fontSize: 20, color: "#cbd5e1" }} />}
              onUploaded={url => setLogo(url)}
            />
          </div>
          <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Business Name">
              <input
                style={{ ...INP, borderColor: nameWarning ? "#f59e0b" : BORDER }}
                value={bizName}
                onFocus={() => setNameWarn(true)}
                onChange={e => setBizName(e.target.value)}
                placeholder="e.g. Ridge Line Roofing"
              />
            </Field>
            {nameWarning && (
              <div style={{ display: "flex", gap: 8, padding: "9px 12px", borderRadius: 8, background: "#fffbeb", border: "1px solid #fde68a" }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ color: "#f59e0b", fontSize: 12, marginTop: 1, flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: 11, color: "#92400e", lineHeight: 1.5 }}>
                  Updating the name changes it across all locations and landing pages.
                </p>
              </div>
            )}
            <Field label="Tagline" hint="Shown under your name on all landing pages">
              <input style={INP} value={tagline} onChange={e => setTagline(e.target.value)} placeholder="e.g. Fast, reliable service you can trust" />
            </Field>
          </div>
        </div>
      </GroupCard>

      {/* About */}
      <GroupCard label="About" icon="fa-solid fa-circle-info" onSave={saveAbout} saveState={aboutSave}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Industry" hint="Personalizes intake pages — images, CTAs, and copy adapt to your industry">
            <div style={{ position: "relative" }}>
              <select
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                style={{ ...INP, appearance: "none", paddingRight: 32, cursor: "pointer" }}
              >
                <option value="">Select your industry…</option>
                {INDUSTRY_GROUPS.map(g => (
                  <optgroup key={g.group} label={g.group}>
                    {g.items.map(item => <option key={item} value={item}>{item}</option>)}
                  </optgroup>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: MUTED, pointerEvents: "none" }} />
            </div>
            {selectedGroup && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 6, padding: "3px 9px", borderRadius: 20, background: "rgba(211,84,0,0.08)", border: "1px solid rgba(211,84,0,0.2)" }}>
                <i className={`fa-solid ${selectedGroup.icon}`} style={{ fontSize: 10, color: ORANGE }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: ORANGE }}>{selectedGroup.group}</span>
              </div>
            )}
          </Field>

          <Field label="Business Description" hint="Default copy on landing pages — each location can override">
            <textarea
              value={description}
              onChange={e => setDesc(e.target.value)}
              rows={3}
              placeholder="Tell potential customers what makes your business stand out…"
              style={{ ...INP, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 } as React.CSSProperties}
            />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Years in Business">
              <input style={INP} type="number" min="0" max="200" value={years} onChange={e => setYears(e.target.value)} placeholder="e.g. 12" />
            </Field>
            <Field label="Contractor / License #">
              <input style={INP} value={license} onChange={e => setLicense(e.target.value)} placeholder="e.g. LIC-123456" />
            </Field>
          </div>
        </div>
      </GroupCard>

      {/* Website & Social */}
      <GroupCard label="Website & Social" icon="fa-solid fa-globe" onSave={saveLinks} saveState={linkSave}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Business Website">
            <div style={{ position: "relative" }}>
              <i className="fa-solid fa-globe" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: MUTED, pointerEvents: "none" }} />
              <input style={{ ...INP, paddingLeft: 34 }} type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yoursite.com" />
            </div>
          </Field>
          {[
            { key: "instagram", label: "Instagram", icon: "fa-brands fa-instagram", color: "#E1306C", val: instagram, set: setInstagram, ph: "https://instagram.com/yourbusiness" },
            { key: "facebook",  label: "Facebook",  icon: "fa-brands fa-facebook",  color: "#1877F2", val: facebook,  set: setFacebook,  ph: "https://facebook.com/yourbusiness" },
            { key: "google",    label: "Google Business", icon: "fa-brands fa-google", color: "#4285F4", val: google, set: setGoogle, ph: "https://g.page/yourbusiness" },
          ].map(({ key, label, icon, color, val, set, ph }) => (
            <Field key={key} label={label}>
              <div style={{ position: "relative" }}>
                <i className={icon} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color, pointerEvents: "none" }} />
                <input style={{ ...INP, paddingLeft: 36 }} type="url" value={val} onChange={e => set(e.target.value)} placeholder={ph} />
              </div>
            </Field>
          ))}
        </div>
      </GroupCard>
    </div>
  );
}

// ── Locations Tab ─────────────────────────────────────────────────────────────

interface LocForm {
  name: string;
  loc_phone: string;
  loc_email: string;
  loc_address: string;
  loc_city: string;
  loc_state: string;
  loc_zip: string;
  loc_service_area: string;
  loc_tagline: string;
  loc_description: string;
  intake_slug: string;
}

function locToForm(loc: UserLocation): LocForm {
  return {
    name:             loc.name             ?? "",
    loc_phone:        loc.loc_phone        ?? "",
    loc_email:        loc.loc_email        ?? "",
    loc_address:      loc.loc_address      ?? "",
    loc_city:         loc.loc_city         ?? "",
    loc_state:        loc.loc_state        ?? "",
    loc_zip:          loc.loc_zip          ?? "",
    loc_service_area: loc.loc_service_area ?? "",
    loc_tagline:      loc.loc_tagline      ?? "",
    loc_description:  loc.loc_description  ?? "",
    intake_slug:      loc.intake_slug      ?? "",
  };
}

// Solo mode: global contact/address on profile
function SoloLocationCard({ profile, onChange }: { profile: UserProfile; onChange: (p: Partial<UserProfile>) => void }) {
  const [form, setForm] = useState({
    business_email:   profile.business_email   ?? "",
    business_phone:   profile.business_phone   ?? "",
    business_address: profile.business_address ?? "",
    business_city:    profile.business_city    ?? "",
    business_state:   profile.business_state   ?? "",
    business_zip:     profile.business_zip     ?? "",
    service_area:     profile.service_area     ?? "",
    intake_slug:      profile.intake_slug      ?? "",
  });
  const [saveState, setSave] = useState<SaveState>("idle");
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function save() {
    setSave("saving");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          business_email:   form.business_email   || null,
          business_phone:   form.business_phone   || null,
          business_address: form.business_address || null,
          business_city:    form.business_city    || null,
          business_state:   form.business_state   || null,
          business_zip:     form.business_zip     || null,
          service_area:     form.service_area     || null,
          intake_slug:      form.intake_slug      || null,
        }),
      });
      if (!res.ok) throw new Error();
      onChange(await res.json());
      setSave("saved"); setTimeout(() => setSave("idle"), 3000);
    } catch { setSave("error"); setTimeout(() => setSave("idle"), 3000); }
  }

  const slugPreview = form.intake_slug || "your-slug";

  return (
    <div>
      <GroupCard label="Contact Info" icon="fa-solid fa-phone" onSave={save} saveState={saveState}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Business Email">
            <input style={INP} type="email" value={form.business_email} onChange={set("business_email")} placeholder="hello@yourcompany.com" />
          </Field>
          <Field label="Business Phone">
            <input style={INP} type="tel" value={form.business_phone} onChange={set("business_phone")} placeholder="(555) 000-0000" />
          </Field>
          <Field label="Service Area" hint="e.g. Austin, TX + 50 miles">
            <input style={INP} value={form.service_area} onChange={set("service_area")} placeholder="Austin, TX + 50 miles" />
          </Field>
        </div>
      </GroupCard>

      <GroupCard label="Business Address" icon="fa-solid fa-location-dot" onSave={save} saveState={saveState}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Street Address">
            <input style={INP} value={form.business_address} onChange={set("business_address")} placeholder="123 Main St" />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 72px 96px", gap: 12 }}>
            <Field label="City">
              <input style={INP} value={form.business_city} onChange={set("business_city")} placeholder="Austin" />
            </Field>
            <Field label="State">
              <input style={INP} value={form.business_state} onChange={set("business_state")} placeholder="TX" maxLength={2} />
            </Field>
            <Field label="ZIP">
              <input style={INP} value={form.business_zip} onChange={set("business_zip")} placeholder="78701" />
            </Field>
          </div>
        </div>
      </GroupCard>

      <GroupCard label="Landing Page" icon="fa-solid fa-link" onSave={save} saveState={saveState}>
        <Field label="Landing Page Slug" hint={`clozeflow.com/intake/${slugPreview}`}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ padding: "9px 12px", borderRadius: "8px 0 0 8px", border: `1.5px solid ${BORDER}`, borderRight: "none", background: BG, fontSize: 13, color: MUTED, whiteSpace: "nowrap", flexShrink: 0 }}>
              /intake/
            </div>
            <input style={{ ...INP, borderRadius: "0 8px 8px 0" }} value={form.intake_slug} onChange={set("intake_slug")} placeholder="your-business-name" />
          </div>
        </Field>
        {form.intake_slug && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, padding: "7px 11px", borderRadius: 8, background: "rgba(211,84,0,0.04)", border: `1px solid ${BORDER}` }}>
            <i className="fa-solid fa-link" style={{ fontSize: 10, color: ORANGE }} />
            <span style={{ fontSize: 11, color: MUTED, fontFamily: "monospace" }}>/intake/{form.intake_slug}</span>
            <a href={`/intake/${form.intake_slug}`} target="_blank" rel="noopener noreferrer"
              style={{ marginLeft: "auto", fontSize: 11, color: ORANGE, fontWeight: 700, textDecoration: "none" }}>
              Preview ↗
            </a>
          </div>
        )}
      </GroupCard>
    </div>
  );
}

// Multi-location: per-location editor with location tab picker
function MultiLocationEditor({
  locations, profile, onLocationUpdated,
}: {
  locations: UserLocation[];
  profile: UserProfile;
  onLocationUpdated: (id: string, patch: Partial<UserLocation>) => void;
}) {
  const [selectedId, setSelectedId] = useState<string>(
    locations.find(l => l.is_primary)?.id ?? locations[0]?.id ?? ""
  );
  const selectedLoc = locations.find(l => l.id === selectedId);
  const [form, setForm] = useState<LocForm>(selectedLoc ? locToForm(selectedLoc) : {} as LocForm);
  const [saveState, setSave] = useState<SaveState>("idle");
  const [slugError, setSlugError] = useState("");

  function selectLocation(id: string) {
    const loc = locations.find(l => l.id === id);
    if (!loc) return;
    setSelectedId(id);
    setForm(locToForm(loc));
    setSave("idle");
    setSlugError("");
  }

  const set = (k: keyof LocForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function save() {
    setSave("saving");
    setSlugError("");
    try {
      const payload: Record<string, string | null> = {};
      for (const [k, v] of Object.entries(form)) {
        payload[k] = (v as string).trim() || null;
      }
      const res = await fetch(`/api/profile/locations/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) setSlugError(data.error ?? "Slug already taken.");
        throw new Error();
      }
      onLocationUpdated(selectedId, data.location);
      setSave("saved"); setTimeout(() => setSave("idle"), 3000);
    } catch {
      if (!slugError) setSave("error");
      else setSave("idle");
      setTimeout(() => setSave("idle"), 3000);
    }
  }

  if (!selectedLoc) return null;

  return (
    <div>
      {/* Location tab picker */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {locations.map(loc => {
          const active = loc.id === selectedId;
          return (
            <button
              key={loc.id}
              onClick={() => selectLocation(loc.id)}
              style={{
                padding: "7px 16px", borderRadius: 20, cursor: "pointer", border: "none",
                background: active ? "rgba(211,84,0,0.1)" : "#fff",
                color: active ? ORANGE : MUTED,
                fontWeight: active ? 800 : 600, fontSize: 13,
                outline: active ? `2px solid rgba(211,84,0,0.25)` : `1px solid ${BORDER}`,
                outlineOffset: 1,
                display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s",
              }}
            >
              <i className="fa-solid fa-location-dot" style={{ fontSize: 10 }} />
              {loc.name}
              {loc.is_primary && (
                <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 5px", borderRadius: 8, background: "rgba(22,163,74,0.1)", color: "#16a34a", border: "1px solid rgba(22,163,74,0.2)" }}>
                  PRIMARY
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Location display name */}
      <GroupCard label="Location Name" icon="fa-solid fa-store">
        <Field label="Display Name" hint="How this location appears in the portal and on its landing page">
          <input style={INP} value={form.name} onChange={set("name")} placeholder="e.g. Downtown Clinic, North Location" />
        </Field>
      </GroupCard>

      {/* Contact */}
      <GroupCard label="Contact Info" icon="fa-solid fa-phone">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Phone" hint={profile.business_phone ? `Brand default: ${profile.business_phone}` : undefined}>
            <input style={INP} type="tel" value={form.loc_phone} onChange={set("loc_phone")} placeholder={profile.business_phone || "(555) 000-0000"} />
          </Field>
          <Field label="Email" hint={profile.business_email ? `Brand default: ${profile.business_email}` : undefined}>
            <input style={INP} type="email" value={form.loc_email} onChange={set("loc_email")} placeholder={profile.business_email || "location@yourcompany.com"} />
          </Field>
          <Field label="Service Area" hint={profile.service_area ? `Brand default: ${profile.service_area}` : undefined}>
            <input style={INP} value={form.loc_service_area} onChange={set("loc_service_area")} placeholder={profile.service_area || "e.g. North Austin + 30 miles"} />
          </Field>
        </div>
      </GroupCard>

      {/* Address */}
      <GroupCard label="Address" icon="fa-solid fa-location-dot">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Street Address">
            <input style={INP} value={form.loc_address} onChange={set("loc_address")} placeholder="123 Main St" />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 72px 96px", gap: 12 }}>
            <Field label="City">
              <input style={INP} value={form.loc_city} onChange={set("loc_city")} placeholder="Austin" />
            </Field>
            <Field label="State">
              <input style={INP} value={form.loc_state} onChange={set("loc_state")} placeholder="TX" maxLength={2} />
            </Field>
            <Field label="ZIP">
              <input style={INP} value={form.loc_zip} onChange={set("loc_zip")} placeholder="78701" />
            </Field>
          </div>
        </div>
      </GroupCard>

      {/* Landing page */}
      <GroupCard label="Landing Page" icon="fa-solid fa-link">
        <Field label="URL Slug" hint="Creates a dedicated landing page for this location">
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ padding: "9px 12px", borderRadius: "8px 0 0 8px", border: `1.5px solid ${BORDER}`, borderRight: "none", background: BG, fontSize: 13, color: MUTED, whiteSpace: "nowrap", flexShrink: 0 }}>
              /intake/
            </div>
            <input
              style={{ ...INP, borderRadius: "0 8px 8px 0", borderColor: slugError ? "#ef4444" : BORDER }}
              value={form.intake_slug}
              onChange={set("intake_slug")}
              placeholder={selectedLoc.name.toLowerCase().replace(/\s+/g, "-")}
            />
          </div>
        </Field>
        {slugError && (
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "#ef4444", fontWeight: 600 }}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 5 }} />{slugError}
          </p>
        )}
        {form.intake_slug && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, padding: "7px 11px", borderRadius: 8, background: "rgba(211,84,0,0.04)", border: `1px solid ${BORDER}` }}>
            <i className="fa-solid fa-link" style={{ fontSize: 10, color: ORANGE }} />
            <span style={{ fontSize: 11, color: MUTED, fontFamily: "monospace" }}>/intake/{form.intake_slug}</span>
            <a href={`/intake/${form.intake_slug}`} target="_blank" rel="noopener noreferrer"
              style={{ marginLeft: "auto", fontSize: 11, color: ORANGE, fontWeight: 700, textDecoration: "none" }}>
              Preview ↗
            </a>
          </div>
        )}
      </GroupCard>

      {/* Content overrides */}
      <GroupCard label="Content Overrides" icon="fa-solid fa-pen">
        <p style={{ margin: "0 0 14px", fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
          Leave blank to use the brand defaults. Fill in to customize this location&apos;s copy.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Tagline" hint={profile.business_tagline ? `Brand default: "${profile.business_tagline}"` : "Optional"}>
            <input style={INP} value={form.loc_tagline} onChange={set("loc_tagline")} placeholder={profile.business_tagline || "Optional tagline override…"} />
          </Field>
          <Field label="Description" hint="Optional override shown on this location's landing page">
            <textarea
              rows={3}
              value={form.loc_description}
              onChange={set("loc_description")}
              placeholder={profile.business_description || "Optional description for this location…"}
              style={{ ...INP, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 } as React.CSSProperties}
            />
          </Field>
        </div>
      </GroupCard>

      {/* Single save for all location groups */}
      <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: 8 }}>
        <SaveBtn state={saveState} onClick={save} label="Save Location" />
      </div>
    </div>
  );
}

function LocationsTab({ profile, locations, onChange, onLocationUpdated }: {
  profile: UserProfile;
  locations: UserLocation[];
  onChange: (p: Partial<UserProfile>) => void;
  onLocationUpdated: (id: string, patch: Partial<UserLocation>) => void;
}) {
  const isMultiLocation = locations.length > 0;

  if (!isMultiLocation) {
    return <SoloLocationCard profile={profile} onChange={onChange} />;
  }

  return <MultiLocationEditor locations={locations} profile={profile} onLocationUpdated={onLocationUpdated} />;
}

// ── Progress Checklist ────────────────────────────────────────────────────────

function ProfileProgress({ profile, locations }: { profile: UserProfile; locations: UserLocation[] }) {
  const isMulti = locations.length > 0;
  const steps = isMulti
    ? [
        { label: "Business name & logo", done: !!(profile.business_name && profile.business_logo_url) },
        { label: "Industry set",         done: !!profile.business_industry },
        { label: "Website added",        done: !!profile.business_website },
        { label: "Location details",     done: locations.some(l => l.loc_address || l.loc_city) },
        { label: "Landing page slug",    done: locations.some(l => l.intake_slug) },
      ]
    : [
        { label: "Business name & logo", done: !!(profile.business_name && profile.business_logo_url) },
        { label: "Industry set",         done: !!profile.business_industry },
        { label: "Contact info",         done: !!(profile.business_email || profile.business_phone) },
        { label: "Address added",        done: !!(profile.business_address || profile.business_city) },
        { label: "Landing page slug",    done: !!profile.intake_slug },
      ];

  const done = steps.filter(s => s.done).length;
  const pct  = Math.round((done / steps.length) * 100);
  const allDone = done === steps.length;

  return (
    <div style={{
      background: allDone ? "rgba(34,197,94,0.05)" : "rgba(211,84,0,0.04)",
      border: `1.5px solid ${allDone ? "rgba(34,197,94,0.22)" : "rgba(211,84,0,0.16)"}`,
      borderRadius: 14, padding: "16px 20px", marginBottom: 20,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: allDone ? 0 : 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <i
            className={allDone ? "fa-solid fa-circle-check" : "fa-solid fa-chart-simple"}
            style={{ fontSize: 14, color: allDone ? "#22c55e" : ORANGE }}
          />
          <span style={{ fontSize: 13, fontWeight: 800, color: TEXT }}>
            {allDone ? "Profile complete" : "Complete your profile"}
          </span>
        </div>
        {!allDone && (
          <span style={{ fontSize: 12, fontWeight: 700, color: ORANGE }}>{done}/{steps.length}</span>
        )}
      </div>
      {allDone
        ? <p style={{ margin: "6px 0 0", fontSize: 12, color: MUTED }}>All set — your landing pages, emails, and booking pages look great.</p>
        : (
          <>
            <div style={{ height: 5, borderRadius: 4, background: "rgba(211,84,0,0.1)", overflow: "hidden", marginBottom: 10 }}>
              <div style={{ height: "100%", width: `${pct}%`, borderRadius: 4, background: ORANGE, transition: "width 0.4s" }} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {steps.map(step => (
                <div key={step.label} style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                  background: step.done ? "rgba(34,197,94,0.07)" : "rgba(211,84,0,0.06)",
                  border: `1px solid ${step.done ? "rgba(34,197,94,0.22)" : "rgba(211,84,0,0.15)"}`,
                  color: step.done ? "#16a34a" : TEXT,
                }}>
                  <i className={step.done ? "fa-solid fa-circle-check" : "fa-regular fa-circle"} style={{ fontSize: 9, color: step.done ? "#22c55e" : ORANGE }} />
                  {step.label}
                </div>
              ))}
            </div>
          </>
        )
      }
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

type TopTab = "brand" | "locations";

export default function BusinessSetupClient({
  initialProfile,
  initialLocations = [],
}: {
  initialProfile: UserProfile;
  initialLocations?: UserLocation[];
}) {
  const [profile,   setProfile]   = useState<UserProfile>(initialProfile);
  const [locations, setLocations] = useState<UserLocation[]>(initialLocations);
  const [tab,       setTab]       = useState<TopTab>("brand");

  const isMultiLocation = locations.length > 0;

  const handleChange = useCallback((patch: Partial<UserProfile>) => {
    setProfile(p => ({ ...p, ...patch }));
  }, []);

  function handleLocationUpdated(id: string, patch: Partial<UserLocation>) {
    setLocations(locs => locs.map(l => l.id === id ? { ...l, ...patch } : l));
  }

  const TABS: { id: TopTab; label: string; icon: string; desc: string }[] = [
    { id: "brand",     label: "Brand",     icon: "fa-solid fa-building",      desc: "Logo, name, industry, social" },
    { id: "locations", label: isMultiLocation ? `Locations (${locations.length})` : "Location", icon: "fa-solid fa-location-dot", desc: isMultiLocation ? "Per-location contact, address & pages" : "Contact, address & landing page" },
  ];

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: ORANGE }}>
          Settings
        </p>
        <h1 style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 900, color: TEXT }}>Business Setup</h1>
        <p style={{ margin: 0, fontSize: 13, color: MUTED }}>
          {isMultiLocation
            ? `${locations.length} location${locations.length !== 1 ? "s" : ""} · Global brand settings apply across all locations`
            : "Power your landing page, emails, and booking page"}
        </p>
      </div>

      {/* Progress */}
      <ProfileProgress profile={profile} locations={locations} />

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 0, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 4, marginBottom: 20 }}>
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: "10px 16px", borderRadius: 9, cursor: "pointer",
                border: "none", background: active ? BG : "transparent",
                transition: "all 0.15s", textAlign: "left",
                outline: active ? `2px solid rgba(211,84,0,0.2)` : "none",
                outlineOffset: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <i className={t.icon} style={{ fontSize: 13, color: active ? ORANGE : MUTED }} />
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: active ? TEXT : MUTED }}>{t.label}</p>
                  <p style={{ margin: 0, fontSize: 11, color: MUTED }}>{t.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === "brand" && (
        <BrandTab profile={profile} onChange={handleChange} />
      )}
      {tab === "locations" && (
        <LocationsTab
          profile={profile}
          locations={locations}
          onChange={handleChange}
          onLocationUpdated={handleLocationUpdated}
        />
      )}
    </div>
  );
}
