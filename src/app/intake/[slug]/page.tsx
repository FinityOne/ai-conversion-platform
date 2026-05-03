import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import IntakeForm from "@/components/IntakeForm";
import IntakeLiveTicker from "@/components/IntakeLiveTicker";
import { getIndustryConfig } from "@/lib/industry-config";

// ── Accent palette ────────────────────────────────────────────────────────────
const ACCENT_PALETTE = [
  "#ea580c","#16a34a","#2563eb","#7c3aed","#0891b2","#e11d48",
];
function accentFromSlug(slug: string) {
  const sum = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return ACCENT_PALETTE[sum % ACCENT_PALETTE.length];
}

// ── Data fetch ────────────────────────────────────────────────────────────────
interface BizProfile {
  id: string;
  business_name: string | null;
  email: string | null;
  business_email: string | null;
  business_website: string | null;
  business_logo_url: string | null;
  business_tagline: string | null;
  business_description: string | null;
  business_address: string | null;
  business_city: string | null;
  business_state: string | null;
  business_zip: string | null;
  service_area: string | null;
  business_license: string | null;
  years_in_business: number | null;
  business_instagram: string | null;
  business_facebook: string | null;
  business_google_profile: string | null;
  business_industry: string | null;
  intake_slug: string | null;
}

async function getProfile(slug: string): Promise<BizProfile | null> {
  const sb = createSupabaseServiceClient();
  const fields = "id,business_name,email,business_email,business_website,business_logo_url,business_tagline,business_description,business_address,business_city,business_state,business_zip,service_area,business_license,years_in_business,business_instagram,business_facebook,business_google_profile,business_industry,intake_slug";

  // 1. Check profiles.intake_slug (account-level page)
  const { data: bySlug } = await sb.from("profiles").select(fields).eq("intake_slug", slug).maybeSingle();
  if (bySlug) return bySlug as BizProfile;

  // 2. Check user_locations.intake_slug (location-specific page)
  const { data: loc } = await sb
    .from("user_locations")
    .select("user_id, loc_address, loc_city, loc_state, loc_zip, loc_tagline, loc_description, loc_service_area, loc_email")
    .eq("intake_slug", slug)
    .maybeSingle();

  if (loc) {
    const { data: ownerProfile } = await sb.from("profiles").select(fields).eq("id", loc.user_id).maybeSingle();
    if (!ownerProfile) return null;
    // Merge: location fields take priority over profile defaults
    return {
      ...ownerProfile,
      ...(loc.loc_address      && { business_address:     loc.loc_address }),
      ...(loc.loc_city         && { business_city:        loc.loc_city }),
      ...(loc.loc_state        && { business_state:       loc.loc_state }),
      ...(loc.loc_zip          && { business_zip:         loc.loc_zip }),
      ...(loc.loc_tagline      && { business_tagline:     loc.loc_tagline }),
      ...(loc.loc_description  && { business_description: loc.loc_description }),
      ...(loc.loc_service_area && { service_area:         loc.loc_service_area }),
      ...(loc.loc_email        && { business_email:       loc.loc_email }),
    } as BizProfile;
  }

  // 3. Fallback: check profiles.id (used for preview before any slug is set)
  const { data: byId } = await sb.from("profiles").select(fields).eq("id", slug).maybeSingle();
  return (byId ?? null) as BizProfile | null;
}

// ── SEO metadata ──────────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProfile(slug);
  const biz   = p?.business_name ?? "Local Service Pro";
  const city  = p?.business_city ?? p?.service_area?.split(",")[0] ?? "Your Area";
  const cfg   = getIndustryConfig(p?.business_industry);
  const desc  = p?.business_description
    ?? `${biz} provides professional ${cfg.group.toLowerCase()} in ${city}. Get a free estimate — fast response guaranteed.`;
  const title = `${biz} — Free Estimates in ${city}`;
  const heroImage = cfg.heroImage;

  return {
    title,
    description: desc,
    keywords: `${biz}, ${cfg.group}, free estimate ${city}, ${p?.service_area ?? city}`,
    alternates: { canonical: `https://clozeflow.com/intake/${slug}` },
    openGraph: { title, description: desc, images: [{ url: heroImage, width: 1260, height: 750 }], type: "website" },
    twitter: { card: "summary_large_image", title, description: desc, images: [heroImage] },
    robots: { index: true, follow: true },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function IntakePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const p = await getProfile(slug);
  if (!p) notFound();

  const accent  = accentFromSlug(slug);
  const ownerId = p.id;
  const cfg     = getIndustryConfig(p.business_industry);

  // Resolved values — graceful fallbacks for every field
  const biz      = p.business_name  || "Your Local Pro";
  const tagline  = p.business_tagline || "Quality Service You Can Count On";
  const desc     = p.business_description || `We are a local ${cfg.group.toLowerCase()} business committed to quality, speed, and care on every job.`;
  const city     = p.business_city  || p.service_area?.split(",")[0] || "Your Area";
  const state    = p.business_state || "";
  const location = [city, state].filter(Boolean).join(", ");
  const contactEmail = p.business_email || p.email || null;

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": cfg.schemaType,
    name: biz,
    description: desc,
    url: p.business_website || undefined,
    email: contactEmail || undefined,
    image: p.business_logo_url || cfg.heroImage,
    address: p.business_address ? {
      "@type": "PostalAddress",
      streetAddress: p.business_address,
      addressLocality: p.business_city || undefined,
      addressRegion: p.business_state || undefined,
      postalCode: p.business_zip || undefined,
      addressCountry: "US",
    } : undefined,
    areaServed: p.service_area || location,
    foundingDate: p.years_in_business ? String(new Date().getFullYear() - p.years_in_business) : undefined,
    sameAs: [p.business_instagram, p.business_facebook, p.business_google_profile, p.business_website].filter(Boolean),
  };

  // Trust bullets — static from config + dynamic from profile
  const trustBullets = [
    ...cfg.trustBullets,
    p.business_license ? `License #${p.business_license}` : "Licensed & Insured",
    p.years_in_business ? `${p.years_in_business}+ Years Serving ${location}` : `Proudly Serving ${location}`,
    "Free Estimates — No Obligation",
  ].slice(0, 4);

  const HOW_IT_WORKS = [
    { n: "01", title: "Fill the Form",       body: "Tell us what you need in under 60 seconds — no calls, no hassle." },
    { n: "02", title: "We Reach Out Fast",   body: "You'll hear from us quickly. We respect your time and inbox." },
    { n: "03", title: cfg.ctaLabel,          body: "We assess your needs and provide a clear, written quote — completely free." },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <style>{`
        :root { --accent: ${accent}; }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        .hero-grid { display: grid; grid-template-columns: 1fr 460px; align-items: center; min-height: 92vh; }
        .hero-text-col { padding: 60px 0 60px 5vw; }
        .hero-form-col { padding: 40px 40px 40px 0; }
        .services-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .how-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        .trust-bar { display: grid; grid-template-columns: repeat(4, 1fr); }
        .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .footer-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 32px; }
        .service-card {
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          padding: 22px 14px; border-radius: 14px;
          border: 1.5px solid #eee; background: #fafafa;
          text-decoration: none; cursor: pointer;
          transition: border-color 0.2s, background 0.2s, transform 0.2s, box-shadow 0.2s;
        }
        .service-card:hover {
          border-color: var(--accent);
          background: color-mix(in srgb, var(--accent) 8%, #fff);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px color-mix(in srgb, var(--accent) 18%, transparent);
        }
        details summary { list-style: none; }
        details summary::-webkit-details-marker { display: none; }
        @media (max-width: 960px) {
          .hero-grid { grid-template-columns: 1fr; min-height: auto; }
          .hero-text-col { padding: 48px 20px 24px; order: 1; }
          .hero-form-col { padding: 0 20px 48px; order: 2; }
          .services-grid { grid-template-columns: repeat(3, 1fr); }
          .how-grid { grid-template-columns: 1fr; gap: 20px; }
          .trust-bar { grid-template-columns: repeat(2, 1fr); }
          .about-grid { grid-template-columns: 1fr; gap: 32px; }
          .footer-grid { grid-template-columns: 1fr; gap: 24px; }
        }
        @media (max-width: 600px) {
          .services-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      {/* ── Sticky Navbar — no phone, form is only CTA ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.96)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.07)",
        padding: "0 5vw",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {p.business_logo_url ? (
              <img src={p.business_logo_url} alt={biz} style={{ height: 36, width: "auto", objectFit: "contain" }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: 9, background: `linear-gradient(135deg, ${accent}, ${accent}bb)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className={`fa-solid ${cfg.services[0]?.icon ?? "fa-star"}`} style={{ fontSize: 15, color: "#fff" }} />
              </div>
            )}
            <span style={{ fontSize: 17, fontWeight: 800, color: "#111" }}>{biz}</span>
          </div>
          <a href="#estimate" style={{
            padding: "9px 22px", borderRadius: 50,
            background: accent, color: "#fff",
            fontSize: 14, fontWeight: 700, textDecoration: "none",
            boxShadow: `0 4px 14px ${accent}44`,
          }}>
            {cfg.ctaLabel}
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: "relative", overflow: "hidden", background: "#0a0a0a" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${cfg.heroImage})`, backgroundSize: "cover", backgroundPosition: "center 30%", opacity: 0.42 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(0,0,0,0.58) 40%, rgba(0,0,0,0.84) 100%)" }} />

        <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", padding: "0 5vw" }}>
          <div className="hero-grid">

            {/* Left: text */}
            <div className="hero-text-col">
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: `${accent}22`, border: `1px solid ${accent}55`, borderRadius: 50, padding: "6px 14px", marginBottom: 22 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "block" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#e5e5e5", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Now Accepting New Clients · {location}
                </span>
              </div>

              <h1 style={{ margin: "0 0 18px", fontSize: "clamp(30px, 4vw, 52px)", fontWeight: 900, color: "#fff", lineHeight: 1.1, letterSpacing: "-1px" }}>
                {city}&apos;s <span style={{ color: accent }}>{cfg.heroHeadlinePrefix}</span>
              </h1>

              <p style={{ margin: "0 0 32px", fontSize: "clamp(15px, 1.8vw, 17px)", color: "rgba(255,255,255,0.72)", lineHeight: 1.7, maxWidth: 440 }}>
                {tagline}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
                {trustBullets.map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, background: `${accent}33`, border: `1.5px solid ${accent}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="fa-solid fa-check" style={{ fontSize: 10, color: accent }} />
                    </div>
                    <span style={{ fontSize: 15, color: "rgba(255,255,255,0.88)", fontWeight: 500 }}>{item}</span>
                  </div>
                ))}
              </div>

              {(p.business_instagram || p.business_facebook || p.business_google_profile) && (
                <div style={{ display: "flex", gap: 10 }}>
                  {p.business_instagram && (
                    <a href={p.business_instagram} target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none" }}>
                      <i className="fa-brands fa-instagram" style={{ fontSize: 15 }} />
                    </a>
                  )}
                  {p.business_facebook && (
                    <a href={p.business_facebook} target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none" }}>
                      <i className="fa-brands fa-facebook" style={{ fontSize: 15 }} />
                    </a>
                  )}
                  {p.business_google_profile && (
                    <a href={p.business_google_profile} target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none" }}>
                      <i className="fa-brands fa-google" style={{ fontSize: 15 }} />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Right: form — ONLY CTA */}
            <div className="hero-form-col" id="estimate">
              <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 24px 80px rgba(0,0,0,0.35)", overflow: "hidden" }}>
                <div style={{ background: `linear-gradient(135deg, ${accent}, ${accent}dd)`, padding: "20px 24px" }}>
                  <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "1.2px" }}>
                    Free — No Obligation
                  </p>
                  <h2 style={{ margin: 0, fontSize: 21, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
                    {cfg.ctaLabel}
                  </h2>
                </div>
                {/* Urgency strip — element of surprise */}
                <div style={{ background: "#fffbeb", borderBottom: "1px solid #fde68a", padding: "9px 20px", display: "flex", alignItems: "center", gap: 8 }}>
                  <p style={{ margin: 0, fontSize: 12, color: "#92400e", fontWeight: 600, lineHeight: 1.4 }}>{cfg.urgencyText}</p>
                </div>
                <div style={{ padding: "20px 24px 26px" }}>
                  <IntakeForm slug={ownerId} businessName={biz} accent={accent} jobTypes={cfg.jobTypes} ctaLabel={cfg.ctaLabel} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <section style={{ background: "#f8f8f8", borderBottom: "1px solid #eee" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 5vw" }}>
          <div className="trust-bar">
            {[
              { icon: "fa-shield-halved",  label: "Licensed & Insured",  sub: "Verified credentials"        },
              { icon: "fa-clock",          label: "Fast Response",        sub: cfg.urgencyText.replace(/^[^ ]+ /,"").split("—")[0].trim() },
              { icon: "fa-star",           label: "5-Star Service",       sub: "Local reputation built daily" },
              { icon: "fa-handshake",      label: "No Obligation",        sub: "Free estimates, always"       },
            ].map((t, i) => (
              <div key={i} style={{ padding: "20px 16px", borderRight: i < 3 ? "1px solid #e5e5e5" : "none", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, flexShrink: 0, background: `${accent}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className={`fa-solid ${t.icon}`} style={{ fontSize: 17, color: accent }} />
                </div>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "#111" }}>{t.label}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#888" }}>{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services Grid ── */}
      <section style={{ padding: "72px 5vw", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "1.5px" }}>
              What We Do
            </p>
            <h2 style={{ margin: "0 0 12px", fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, color: "#111", letterSpacing: "-0.5px" }}>
              {cfg.servicesLabel} in {location}
            </h2>
            <p style={{ margin: "0 auto", fontSize: 15, color: "#666", maxWidth: 500, lineHeight: 1.65 }}>
              Every job handled with care, speed, and expertise — from small repairs to full projects.
            </p>
          </div>
          <div className="services-grid">
            {cfg.services.map(s => (
              <a href="#estimate" key={s.label} className="service-card">
                <div style={{ width: 44, height: 44, borderRadius: 11, background: `${accent}14`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className={`fa-solid ${s.icon}`} style={{ fontSize: 19, color: accent }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#222", textAlign: "center" }}>{s.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ position: "relative", padding: "80px 5vw", background: "#0f172a", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${cfg.heroImage})`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.12 }} />
        <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "1.5px" }}>Simple Process</p>
            <h2 style={{ margin: "0 0 12px", fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>How It Works</h2>
            <p style={{ margin: "0 auto", fontSize: 15, color: "rgba(255,255,255,0.55)", maxWidth: 440, lineHeight: 1.65 }}>
              Getting started is fast, easy, and completely free.
            </p>
          </div>
          <div className="how-grid">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "30px 26px" }}>
                <div style={{ fontSize: 48, fontWeight: 900, color: `${accent}44`, lineHeight: 1, marginBottom: 16, letterSpacing: "-2px" }}>{step.n}</div>
                <h3 style={{ margin: "0 0 10px", fontSize: 19, fontWeight: 800, color: "#fff" }}>{step.title}</h3>
                <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.65 }}>{step.body}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <a href="#estimate" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "15px 34px", borderRadius: 50, background: accent, color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: `0 8px 28px ${accent}55` }}>
              {cfg.ctaLabel}
              <i className="fa-solid fa-arrow-right" style={{ fontSize: 12 }} />
            </a>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section style={{ padding: "80px 5vw", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="about-grid">
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", bottom: -20, left: -20, width: "60%", height: "60%", borderRadius: 18, background: `${accent}12`, zIndex: 0 }} />
              <img
                src={p.business_logo_url ?? cfg.heroImage}
                alt={biz}
                style={{ width: "100%", height: 400, objectFit: "cover", borderRadius: 18, position: "relative", zIndex: 1, boxShadow: "0 20px 60px rgba(0,0,0,0.14)" }}
              />
              {(p.years_in_business || p.business_license) && (
                <div style={{ position: "absolute", bottom: -10, right: -10, zIndex: 2, background: "#fff", borderRadius: 14, padding: "14px 18px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", border: `1px solid ${accent}22`, textAlign: "center", minWidth: 130 }}>
                  {p.years_in_business ? (
                    <>
                      <p style={{ margin: 0, fontSize: 30, fontWeight: 900, color: accent, lineHeight: 1 }}>{p.years_in_business}+</p>
                      <p style={{ margin: "4px 0 0", fontSize: 11, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: "0.7px" }}>Years in Business</p>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-certificate" style={{ fontSize: 26, color: accent }} />
                      <p style={{ margin: "6px 0 0", fontSize: 11, fontWeight: 700, color: "#666", textTransform: "uppercase" }}>Licensed</p>
                    </>
                  )}
                </div>
              )}
            </div>
            <div>
              <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "1.5px" }}>
                {cfg.aboutLabel}
              </p>
              <h2 style={{ margin: "0 0 18px", fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, color: "#111", letterSpacing: "-0.5px", lineHeight: 1.2 }}>
                {biz}
              </h2>
              <p style={{ margin: "0 0 28px", fontSize: 16, color: "#555", lineHeight: 1.78 }}>{desc}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 32 }}>
                {[
                  { icon: "fa-shield-halved", label: "Licensed & Insured" },
                  { icon: "fa-location-dot",  label: p.service_area ?? location },
                  ...(p.business_license ? [{ icon: "fa-certificate", label: `License: ${p.business_license}` }] : []),
                  ...(contactEmail ? [{ icon: "fa-envelope", label: contactEmail }] : []),
                ].map(pill => (
                  <div key={pill.label} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 13px", borderRadius: 50, background: `${accent}0e`, border: `1px solid ${accent}22`, fontSize: 12, fontWeight: 600, color: "#333" }}>
                    <i className={`fa-solid ${pill.icon}`} style={{ fontSize: 10, color: accent }} />
                    {pill.label}
                  </div>
                ))}
              </div>
              <a href="#estimate" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", borderRadius: 50, background: accent, color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: `0 6px 20px ${accent}44` }}>
                {cfg.ctaLabel}
                <i className="fa-solid fa-arrow-right" style={{ fontSize: 12 }} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: "#f8f9fb", padding: "64px 5vw", borderTop: "1px solid #eee" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <h2 style={{ margin: "0 0 10px", fontSize: "clamp(22px, 2.5vw, 30px)", fontWeight: 900, color: "#111", textAlign: "center" }}>
            Frequently Asked Questions
          </h2>
          <p style={{ margin: "0 auto 36px", fontSize: 15, color: "#666", textAlign: "center", maxWidth: 420 }}>
            Everything you need to know before reaching out.
          </p>
          {cfg.faqs.map((faq, i) => (
            <details key={i} style={{ background: "#fff", borderRadius: 12, marginBottom: 10, border: "1px solid #e5e5e5", overflow: "hidden" }}>
              <summary style={{ padding: "17px 20px", fontSize: 15, fontWeight: 700, color: "#111", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {faq.q}
                <i className="fa-solid fa-chevron-down" style={{ fontSize: 11, color: "#aaa", flexShrink: 0, marginLeft: 16 }} />
              </summary>
              <p style={{ margin: 0, padding: "0 20px 16px", fontSize: 14, color: "#555", lineHeight: 1.72 }}>
                {faq.a(city, p.service_area ?? location)}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Footer — no phone number ── */}
      <footer style={{ background: "#0f172a", padding: "52px 5vw 28px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="footer-grid" style={{ marginBottom: 40, paddingBottom: 36, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                {p.business_logo_url ? (
                  <img src={p.business_logo_url} alt={biz} style={{ height: 34, objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.85 }} />
                ) : (
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className={`fa-solid ${cfg.services[0]?.icon ?? "fa-star"}`} style={{ fontSize: 14, color: "#fff" }} />
                  </div>
                )}
                <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{biz}</span>
              </div>
              <p style={{ margin: "0 0 16px", fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 280 }}>{tagline}</p>
              <div style={{ display: "flex", gap: 9 }}>
                {p.business_instagram && (
                  <a href={p.business_instagram} target="_blank" rel="noopener noreferrer" style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none", fontSize: 13 }}>
                    <i className="fa-brands fa-instagram" />
                  </a>
                )}
                {p.business_facebook && (
                  <a href={p.business_facebook} target="_blank" rel="noopener noreferrer" style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none", fontSize: 13 }}>
                    <i className="fa-brands fa-facebook" />
                  </a>
                )}
                {p.business_google_profile && (
                  <a href={p.business_google_profile} target="_blank" rel="noopener noreferrer" style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none", fontSize: 13 }}>
                    <i className="fa-brands fa-google" />
                  </a>
                )}
              </div>
            </div>

            {/* Contact — email only, no phone */}
            <div>
              <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "1.2px" }}>Contact</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {contactEmail && (
                  <a href={`mailto:${contactEmail}`} style={{ display: "flex", alignItems: "center", gap: 9, color: "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>
                    <i className="fa-solid fa-envelope" style={{ fontSize: 11, color: accent, width: 16 }} />
                    {contactEmail}
                  </a>
                )}
                {p.business_address && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 9, color: "rgba(255,255,255,0.65)", fontSize: 14, fontWeight: 500 }}>
                    <i className="fa-solid fa-location-dot" style={{ fontSize: 11, color: accent, width: 16, marginTop: 2 }} />
                    <span>{[p.business_address, city, state, p.business_zip].filter(Boolean).join(", ")}</span>
                  </div>
                )}
                {p.service_area && (
                  <div style={{ display: "flex", alignItems: "center", gap: 9, color: "rgba(255,255,255,0.65)", fontSize: 14, fontWeight: 500 }}>
                    <i className="fa-solid fa-map" style={{ fontSize: 11, color: accent, width: 16 }} />
                    <span>Serving: {p.service_area}</span>
                  </div>
                )}
                {p.business_website && (
                  <a href={p.business_website} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 9, color: "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>
                    <i className="fa-solid fa-globe" style={{ fontSize: 11, color: accent, width: 16 }} />
                    {p.business_website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            </div>

            {/* CTA */}
            <div>
              <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "1.2px" }}>Ready to Start?</p>
              <p style={{ margin: "0 0 20px", fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
                Fill out the form and we&apos;ll reach out quickly with your free, no-obligation quote.
              </p>
              <a href="#estimate" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "12px 22px", borderRadius: 50, background: accent, color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: `0 4px 14px ${accent}44` }}>
                {cfg.ctaLabel}
                <i className="fa-solid fa-arrow-right" style={{ fontSize: 11 }} />
              </a>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.2)" }}>© {new Date().getFullYear()} {biz}. All rights reserved.</p>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.18)" }}>
              Powered by{" "}
              <a href="https://clozeflow.com" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.28)", textDecoration: "none", fontWeight: 600 }}>ClozeFlow</a>
            </p>
          </div>
        </div>
      </footer>

      {/* ── Live ticker ── */}
      <IntakeLiveTicker city={city} accent={accent} />
    </>
  );
}
