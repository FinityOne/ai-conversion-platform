import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import IntakeForm from "@/components/IntakeForm";
import IntakeLiveTicker from "@/components/IntakeLiveTicker";
import { getIndustryConfig } from "@/lib/industry-config";

// ── Per-business accent palette (slug → unique brand color) ──────────────────
const ACCENT_PALETTE = [
  "#2563eb", // sapphire blue
  "#7c3aed", // violet
  "#0891b2", // teal
  "#16a34a", // emerald
  "#be185d", // rose/pink (med spa)
  "#1d4ed8", // royal blue
];
function accentFromSlug(slug: string) {
  const sum = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return ACCENT_PALETTE[sum % ACCENT_PALETTE.length];
}

// ── ClozeFlow brand base tokens ───────────────────────────────────────────────
const MIDNIGHT_NAVY = "#0D1428";
const SAPPHIRE      = "#2860B0";
const SAPPHIRE_PALE = "#E7EEFB";
const SLATE         = "#4A6274";
const STEEL         = "#8A9DB0";
const CLOUD         = "#DDE4EF";
const FROST         = "#F5F7FB";
const WHITE         = "#FFFFFF";
const GREEN         = "#27AE60";
const FONT_SANS     = `'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
const FONT_DISPLAY  = `'DM Serif Display', Georgia, 'Times New Roman', serif`;

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
  years_in_business: number | null;
  business_instagram: string | null;
  business_facebook: string | null;
  business_google_profile: string | null;
  business_industry: string | null;
  intake_slug: string | null;
}

async function getProfile(slug: string): Promise<BizProfile | null> {
  const sb = createSupabaseServiceClient();
  const fields = "id,business_name,email,business_email,business_website,business_logo_url,business_tagline,business_description,business_address,business_city,business_state,business_zip,service_area,years_in_business,business_instagram,business_facebook,business_google_profile,business_industry,intake_slug";

  const { data: bySlug } = await sb.from("profiles").select(fields).eq("intake_slug", slug).maybeSingle();
  if (bySlug) return bySlug as BizProfile;

  const { data: loc } = await sb
    .from("user_locations")
    .select("user_id, loc_address, loc_city, loc_state, loc_zip, loc_tagline, loc_description, loc_service_area, loc_email")
    .eq("intake_slug", slug)
    .maybeSingle();

  if (loc) {
    const { data: ownerProfile } = await sb.from("profiles").select(fields).eq("id", loc.user_id).maybeSingle();
    if (!ownerProfile) return null;
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

  const { data: byId } = await sb.from("profiles").select(fields).eq("id", slug).maybeSingle();
  return (byId ?? null) as BizProfile | null;
}

// ── SEO metadata ──────────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProfile(slug);
  const biz   = p?.business_name ?? "Medical Practice";
  const city  = p?.business_city ?? p?.service_area?.split(",")[0] ?? "Your Area";
  const cfg   = getIndustryConfig(p?.business_industry);
  const desc  = p?.business_description
    ?? `${biz} is now accepting new patients in ${city}. Book a free consultation — fast, confidential, and no obligation.`;
  const title = `${biz} — Book a Consultation in ${city}`;
  const heroImage = cfg.heroImage;

  return {
    title,
    description: desc,
    keywords: `${biz}, ${cfg.group}, book appointment ${city}, ${p?.service_area ?? city}`,
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

  const accent   = accentFromSlug(slug);
  const ownerId  = p.id;
  const cfg      = getIndustryConfig(p.business_industry);
  const isMedical = cfg.group === "Health, Wellness & Med Services";

  const biz      = p.business_name  || "Your Local Pro";
  const tagline  = p.business_tagline || cfg.heroHeadlinePrefix;
  const desc     = p.business_description || `We are a trusted ${cfg.group.toLowerCase()} provider committed to exceptional care and patient outcomes.`;
  const city     = p.business_city  || p.service_area?.split(",")[0] || "Your Area";
  const state    = p.business_state || "";
  const location = [city, state].filter(Boolean).join(", ");
  const contactEmail = p.business_email || p.email || null;

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

  const trustBullets = [
    ...cfg.trustBullets,
    p.years_in_business ? `${p.years_in_business}+ Years Serving ${location}` : `Proudly Serving ${location}`,
  ].slice(0, 4);

  const HOW_IT_WORKS = [
    { n: "01", icon: "fa-file-pen",       title: "Request in 60 Seconds",  body: "Tell us what you need — no phone calls, no waiting on hold. We make it easy." },
    { n: "02", icon: "fa-bolt",           title: "We Respond Fast",        body: "You'll hear from our team quickly — usually within the hour during business hours." },
    { n: "03", icon: "fa-calendar-check", title: cfg.ctaLabel,             body: "We'll match you with the right provider, confirm your details, and get you scheduled." },
  ];

  const statsItems = [
    { value: "< 1 hr",   label: "Avg response time",          icon: "fa-bolt"          },
    { value: "100%",     label: "Confidential & secure",       icon: "fa-lock"          },
    ...(isMedical ? [
      { value: "HIPAA",  label: "Compliant by design",        icon: "fa-shield-halved" },
    ] : [
      { value: "5 ★",   label: "Local reputation",            icon: "fa-star"          },
    ]),
    { value: p.years_in_business ? `${p.years_in_business}+` : "Local", label: p.years_in_business ? "Years serving " + city : "Business — " + city, icon: "fa-hospital" },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: ${FONT_SANS}; background: ${FROST}; color: #111; }

        :root { --accent: ${accent}; }

        /* ── Nav ── */
        .intake-nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid ${CLOUD};
          padding: 0 5vw;
          box-shadow: 0 1px 12px rgba(0,0,0,0.06);
        }
        .intake-nav-inner {
          max-width: 1200px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          height: 68px; gap: 16px;
        }

        /* ── Hero ── */
        .hero-section {
          background: linear-gradient(160deg, #F8FBFF 0%, ${SAPPHIRE_PALE} 55%, #EEEBF8 100%);
          border-bottom: 1px solid ${CLOUD};
          padding: 72px 5vw 80px;
          position: relative; overflow: hidden;
        }
        .hero-section::before {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(circle at 80% 50%, ${accent}0d 0%, transparent 60%),
                            radial-gradient(circle at 20% 80%, rgba(40,96,176,0.06) 0%, transparent 50%);
          pointer-events: none;
        }
        .hero-grid {
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 440px;
          gap: 60px; align-items: center;
          position: relative; z-index: 1;
        }

        /* ── Stats band ── */
        .stats-band {
          background: ${MIDNIGHT_NAVY};
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .stats-inner {
          max-width: 1200px; margin: 0 auto; padding: 0 5vw;
          display: grid; grid-template-columns: repeat(4, 1fr);
          border-left: 1px solid rgba(255,255,255,0.07);
        }
        .stat-cell {
          padding: 24px 20px; text-align: center;
          border-right: 1px solid rgba(255,255,255,0.07);
          border-top: 1px solid rgba(255,255,255,0.07);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        /* ── Services ── */
        .services-section { background: ${WHITE}; padding: 88px 5vw; }
        .services-inner { max-width: 1200px; margin: 0 auto; }
        .services-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .service-card {
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          padding: 24px 16px; border-radius: 16px;
          border: 1.5px solid ${CLOUD}; background: ${FROST};
          text-decoration: none; cursor: pointer;
          transition: border-color 0.2s, background 0.2s, transform 0.2s, box-shadow 0.2s;
        }
        .service-card:hover {
          border-color: var(--accent);
          background: color-mix(in srgb, var(--accent) 6%, #fff);
          transform: translateY(-3px);
          box-shadow: 0 8px 28px color-mix(in srgb, var(--accent) 16%, transparent);
        }

        /* ── How it works ── */
        .hiw-section { background: ${FROST}; padding: 88px 5vw; border-top: 1px solid ${CLOUD}; }
        .hiw-inner { max-width: 1200px; margin: 0 auto; }
        .hiw-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .hiw-card {
          background: ${WHITE}; border: 1.5px solid ${CLOUD}; border-radius: 20px; padding: 36px 28px;
          position: relative; overflow: hidden;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .hiw-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.08); transform: translateY(-2px); }
        .hiw-card::before {
          content: attr(data-n);
          position: absolute; top: -8px; right: 20px;
          font-size: 80px; font-weight: 900;
          color: color-mix(in srgb, var(--accent) 8%, transparent);
          line-height: 1; letter-spacing: -4px;
          font-family: ${FONT_DISPLAY};
          pointer-events: none;
        }

        /* ── About ── */
        .about-section { background: ${WHITE}; padding: 88px 5vw; border-top: 1px solid ${CLOUD}; }
        .about-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center; }

        /* ── Trust / HIPAA ── */
        .trust-section { background: ${FROST}; padding: 72px 5vw; border-top: 1px solid ${CLOUD}; }
        .trust-inner { max-width: 1200px; margin: 0 auto; }
        .trust-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

        /* ── FAQ ── */
        .faq-section { background: ${WHITE}; padding: 80px 5vw; border-top: 1px solid ${CLOUD}; }
        .faq-inner { max-width: 800px; margin: 0 auto; }
        details summary { list-style: none; }
        details summary::-webkit-details-marker { display: none; }
        details[open] .faq-chevron { transform: rotate(180deg); }
        .faq-chevron { transition: transform 0.2s; }

        /* ── Footer ── */
        .footer-section { background: ${MIDNIGHT_NAVY}; padding: 60px 5vw 28px; }
        .footer-inner { max-width: 1200px; margin: 0 auto; }
        .footer-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 48px; margin-bottom: 40px; padding-bottom: 36px; border-bottom: 1px solid rgba(255,255,255,0.07); }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .services-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr; gap: 32px; }
          .hero-form-col { max-width: 480px; width: 100%; }
          .about-grid { grid-template-columns: 1fr; gap: 40px; }
          .hiw-grid { grid-template-columns: 1fr; }
          .trust-grid { grid-template-columns: 1fr 1fr; }
          .footer-grid { grid-template-columns: 1fr; gap: 32px; }
          .stats-inner { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .services-grid { grid-template-columns: repeat(2, 1fr); }
          .hero-section { padding: 48px 5vw 56px; }
          .trust-grid { grid-template-columns: 1fr; }
          .stat-cell { padding: 18px 14px; }
        }

        /* ── Animations ── */
        @keyframes accentPulse {
          0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 45%, transparent); }
          50%       { box-shadow: 0 0 0 6px color-mix(in srgb, var(--accent) 0%, transparent); }
        }
        .live-dot { animation: accentPulse 2.2s ease-in-out infinite; }
      `}</style>

      {/* ── Navbar ────────────────────────────────────────────────────────────── */}
      <nav className="intake-nav">
        <div className="intake-nav-inner">
          {/* Logo + name */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {p.business_logo_url ? (
              <img src={p.business_logo_url} alt={biz} style={{ height: 38, width: "auto", objectFit: "contain", maxWidth: 140 }} />
            ) : (
              <div style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 4px 14px ${accent}44`,
              }}>
                <i className={`fa-solid ${cfg.services[0]?.icon ?? "fa-stethoscope"}`} style={{ fontSize: 15, color: "#fff" }} />
              </div>
            )}
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: MIDNIGHT_NAVY, lineHeight: 1.1 }}>{biz}</p>
              {location && <p style={{ fontSize: 11, color: STEEL, lineHeight: 1 }}>{location}</p>}
            </div>
          </div>

          {/* Center: HIPAA badge (medical only) */}
          {isMedical && (
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(39,174,96,0.08)", border: "1px solid rgba(39,174,96,0.22)",
              borderRadius: 100, padding: "5px 12px",
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
              <span style={{ fontSize: 11, fontWeight: 700, color: GREEN }}>HIPAA Compliant</span>
            </div>
          )}

          {/* CTA */}
          <a href="#book" style={{
            padding: "10px 22px", borderRadius: 100,
            background: `linear-gradient(135deg, ${accent}, ${accent}dd)`,
            color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none",
            boxShadow: `0 4px 16px ${accent}44`,
            whiteSpace: "nowrap", flexShrink: 0,
          }}>
            {cfg.ctaLabel} →
          </a>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-grid">

          {/* Left: copy */}
          <div>
            {/* Status badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 7,
                background: "rgba(39,174,96,0.09)", border: "1px solid rgba(39,174,96,0.25)",
                borderRadius: 100, padding: "6px 14px",
              }}>
                <span className="live-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: GREEN, flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: GREEN }}>
                  {isMedical ? "Accepting New Patients" : "Now Accepting New Clients"} · {location}
                </span>
              </div>
            </div>

            <h1 style={{
              fontSize: "clamp(32px, 4.5vw, 54px)", fontWeight: 900,
              color: MIDNIGHT_NAVY, lineHeight: 1.07, letterSpacing: "-0.03em",
              marginBottom: 20, fontFamily: FONT_DISPLAY, fontStyle: "italic",
            }}>
              {biz}
            </h1>

            <p style={{ fontSize: "clamp(16px, 1.8vw, 18px)", color: SLATE, lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
              {tagline}
            </p>

            {/* Trust bullets */}
            <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 36 }}>
              {trustBullets.map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                    background: `color-mix(in srgb, ${accent} 12%, transparent)`,
                    border: `1.5px solid color-mix(in srgb, ${accent} 35%, transparent)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l3.5 3.5 6.5-7" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 15, color: MIDNIGHT_NAVY, fontWeight: 500 }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Social links */}
            {(p.business_instagram || p.business_facebook || p.business_google_profile) && (
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: STEEL, fontWeight: 600 }}>Follow us:</span>
                {p.business_instagram && (
                  <a href={p.business_instagram} target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, borderRadius: 9, background: SAPPHIRE_PALE, border: `1px solid ${CLOUD}`, display: "flex", alignItems: "center", justifyContent: "center", color: SAPPHIRE, textDecoration: "none" }}>
                    <i className="fa-brands fa-instagram" style={{ fontSize: 14 }} />
                  </a>
                )}
                {p.business_facebook && (
                  <a href={p.business_facebook} target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, borderRadius: 9, background: SAPPHIRE_PALE, border: `1px solid ${CLOUD}`, display: "flex", alignItems: "center", justifyContent: "center", color: SAPPHIRE, textDecoration: "none" }}>
                    <i className="fa-brands fa-facebook" style={{ fontSize: 14 }} />
                  </a>
                )}
                {p.business_google_profile && (
                  <a href={p.business_google_profile} target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, borderRadius: 9, background: SAPPHIRE_PALE, border: `1px solid ${CLOUD}`, display: "flex", alignItems: "center", justifyContent: "center", color: SAPPHIRE, textDecoration: "none" }}>
                    <i className="fa-brands fa-google" style={{ fontSize: 14 }} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Right: form ──────────────────────────────────────────────────────── */}
          <div className="hero-form-col" id="book">
            <div style={{
              background: WHITE, borderRadius: 22,
              boxShadow: "0 20px 60px rgba(13,20,40,0.14), 0 4px 16px rgba(13,20,40,0.06)",
              border: `1px solid ${CLOUD}`,
              overflow: "hidden",
            }}>
              {/* Form header */}
              <div style={{
                background: `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`,
                padding: "22px 28px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className="fa-solid fa-calendar-check" style={{ fontSize: 14, color: "#fff" }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "1.2px" }}>
                      Free — No Obligation
                    </p>
                    <h2 style={{ margin: 0, fontSize: 19, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
                      {cfg.ctaLabel}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Urgency strip */}
              <div style={{
                background: SAPPHIRE_PALE, borderBottom: `1px solid ${CLOUD}`,
                padding: "10px 24px", display: "flex", alignItems: "center", gap: 8,
              }}>
                <i className="fa-solid fa-bolt" style={{ fontSize: 11, color: accent }} />
                <p style={{ margin: 0, fontSize: 12, color: accent, fontWeight: 600, lineHeight: 1.4 }}>
                  {cfg.urgencyText}
                </p>
              </div>

              {/* IntakeForm */}
              <div style={{ padding: "22px 28px 28px" }}>
                <IntakeForm slug={ownerId} businessName={biz} accent={accent} ctaLabel={cfg.ctaLabel} />
              </div>

              {/* Footer trust strip */}
              {isMedical && (
                <div style={{
                  borderTop: `1px solid ${CLOUD}`, padding: "12px 24px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap",
                  background: FROST,
                }}>
                  {[
                    { icon: "fa-shield-halved", text: "HIPAA Compliant",   color: GREEN    },
                    { icon: "fa-lock",          text: "100% Confidential",  color: SAPPHIRE },
                    { icon: "fa-circle-check",  text: "No Obligation",      color: SLATE    },
                  ].map(t => (
                    <div key={t.text} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <i className={`fa-solid ${t.icon}`} style={{ fontSize: 10, color: t.color }} />
                      <span style={{ fontSize: 11, color: SLATE, fontWeight: 600 }}>{t.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ── Stats Band ────────────────────────────────────────────────────────── */}
      <div className="stats-band">
        <div className="stats-inner">
          {statsItems.map((s) => (
            <div key={s.label} className="stat-cell">
              <i className={`fa-solid ${s.icon}`} style={{ fontSize: 18, color: accent, marginBottom: 8, display: "block" }} />
              <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: WHITE, letterSpacing: "-0.02em", lineHeight: 1 }}>{s.value}</p>
              <p style={{ margin: "5px 0 0", fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500, lineHeight: 1.3 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Services Grid ─────────────────────────────────────────────────────── */}
      <section className="services-section">
        <div className="services-inner">
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: accent, marginBottom: 12 }}>
              {cfg.servicesLabel}
            </p>
            <h2 style={{
              fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 900, color: MIDNIGHT_NAVY,
              letterSpacing: "-0.025em", lineHeight: 1.1,
              fontFamily: FONT_DISPLAY, fontStyle: "italic", marginBottom: 14,
            }}>
              {isMedical ? "Specialties & Treatments" : `${cfg.servicesLabel} in ${location}`}
            </h2>
            <p style={{ fontSize: 15, color: SLATE, maxWidth: 480, margin: "0 auto", lineHeight: 1.65 }}>
              {isMedical
                ? "Select a service below to tell us more about what you need — we'll match you with the right provider."
                : "Every service handled with expertise and care. Click any to request a consultation."}
            </p>
          </div>

          <div className="services-grid">
            {cfg.services.map(s => (
              <a href="#book" key={s.label} className="service-card">
                <div style={{
                  width: 48, height: 48, borderRadius: 13, flexShrink: 0,
                  background: `color-mix(in srgb, ${accent} 10%, transparent)`,
                  border: `1.5px solid color-mix(in srgb, ${accent} 22%, transparent)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <i className={`fa-solid ${s.icon}`} style={{ fontSize: 20, color: accent }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: MIDNIGHT_NAVY, textAlign: "center", lineHeight: 1.3 }}>{s.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────────── */}
      <section className="hiw-section">
        <div className="hiw-inner">
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: accent, marginBottom: 12 }}>
              Simple Process
            </p>
            <h2 style={{
              fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, color: MIDNIGHT_NAVY,
              letterSpacing: "-0.025em", lineHeight: 1.1,
              fontFamily: FONT_DISPLAY, fontStyle: "italic",
            }}>
              Getting started is easy.
            </h2>
          </div>

          <div className="hiw-grid">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="hiw-card" data-n={step.n}>
                <div style={{
                  width: 48, height: 48, borderRadius: 13, marginBottom: 20,
                  background: `color-mix(in srgb, ${accent} 10%, transparent)`,
                  border: `1.5px solid color-mix(in srgb, ${accent} 22%, transparent)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <i className={`fa-solid ${step.icon}`} style={{ fontSize: 19, color: accent }} />
                </div>
                <p style={{ fontSize: 11, fontWeight: 700, color: STEEL, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                  Step {step.n}
                </p>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: MIDNIGHT_NAVY, marginBottom: 12, lineHeight: 1.2, letterSpacing: "-0.01em" }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 14, color: SLATE, lineHeight: 1.7 }}>{step.body}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 44 }}>
            <a href="#book" style={{
              display: "inline-flex", alignItems: "center", gap: 9, padding: "14px 32px",
              borderRadius: 100, background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
              color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none",
              boxShadow: `0 8px 28px ${accent}44`,
            }}>
              {cfg.ctaLabel}
              <i className="fa-solid fa-arrow-right" style={{ fontSize: 12 }} />
            </a>
          </div>
        </div>
      </section>

      {/* ── About ─────────────────────────────────────────────────────────────── */}
      <section className="about-section">
        <div className="about-grid">
          {/* Image */}
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", bottom: -16, left: -16, width: "55%", height: "55%",
              borderRadius: 20, background: `color-mix(in srgb, ${accent} 8%, transparent)`,
              border: `1.5px solid color-mix(in srgb, ${accent} 15%, transparent)`, zIndex: 0,
            }} />
            <img
              src={p.business_logo_url ?? cfg.heroImage}
              alt={biz}
              style={{ width: "100%", height: 400, objectFit: "cover", borderRadius: 20, position: "relative", zIndex: 1, boxShadow: "0 24px 64px rgba(13,20,40,0.16)", display: "block" }}
            />
            {p.years_in_business && (
              <div style={{
                position: "absolute", bottom: -12, right: -12, zIndex: 2,
                background: WHITE, borderRadius: 16, padding: "16px 20px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)", border: `1.5px solid ${CLOUD}`,
                textAlign: "center", minWidth: 136,
              }}>
                <p style={{ margin: 0, fontSize: 32, fontWeight: 900, color: accent, lineHeight: 1 }}>{p.years_in_business}+</p>
                <p style={{ margin: "4px 0 0", fontSize: 11, fontWeight: 700, color: STEEL, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Years in Practice
                </p>
              </div>
            )}
          </div>

          {/* Copy */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>
              {cfg.aboutLabel}
            </p>
            <h2 style={{
              fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 900, color: MIDNIGHT_NAVY,
              letterSpacing: "-0.025em", lineHeight: 1.1, marginBottom: 18,
              fontFamily: FONT_DISPLAY, fontStyle: "italic",
            }}>
              {biz}
            </h2>
            <p style={{ fontSize: 16, color: SLATE, lineHeight: 1.8, marginBottom: 28 }}>{desc}</p>

            {/* Info pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 32 }}>
              {[
                { icon: "fa-certificate",    label: isMedical ? "Licensed Providers" : "Licensed & Insured" },
                { icon: "fa-location-dot",   label: p.service_area ?? location },
                ...(contactEmail ? [{ icon: "fa-envelope", label: contactEmail }] : []),
                ...(p.business_website ? [{ icon: "fa-globe", label: "Visit Website" }] : []),
              ].map(pill => (
                <div key={pill.label} style={{
                  display: "flex", alignItems: "center", gap: 7, padding: "8px 14px",
                  borderRadius: 100, background: `color-mix(in srgb, ${accent} 8%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${accent} 20%, transparent)`,
                  fontSize: 12, fontWeight: 600, color: MIDNIGHT_NAVY,
                }}>
                  <i className={`fa-solid ${pill.icon}`} style={{ fontSize: 10, color: accent }} />
                  {pill.label}
                </div>
              ))}
            </div>

            <a href="#book" style={{
              display: "inline-flex", alignItems: "center", gap: 9, padding: "13px 28px",
              borderRadius: 100, background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
              color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none",
              boxShadow: `0 6px 20px ${accent}44`,
            }}>
              {cfg.ctaLabel}
              <i className="fa-solid fa-arrow-right" style={{ fontSize: 12 }} />
            </a>
          </div>
        </div>
      </section>

      {/* ── Medical Trust Section (medical only) ──────────────────────────────── */}
      {isMedical && (
        <section className="trust-section">
          <div className="trust-inner">
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: accent, marginBottom: 12 }}>
                Your Privacy & Safety
              </p>
              <h2 style={{
                fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 900, color: MIDNIGHT_NAVY,
                letterSpacing: "-0.02em", lineHeight: 1.1, fontFamily: FONT_DISPLAY, fontStyle: "italic",
              }}>
                Built on trust. Designed for healthcare.
              </h2>
            </div>

            <div className="trust-grid">
              {[
                { icon: "fa-shield-halved", color: GREEN,       bg: "rgba(39,174,96,0.08)",  border: "rgba(39,174,96,0.2)",   title: "HIPAA Compliant",           body: "Your health information is handled under HIPAA-compliant standards. Your privacy is our first priority." },
                { icon: "fa-lock",          color: SAPPHIRE,    bg: SAPPHIRE_PALE,            border: `rgba(40,96,176,0.2)`,    title: "100% Confidential",         body: "Everything you share stays private. We never sell or share your personal or health information." },
                { icon: "fa-circle-check",  color: "#7c3aed",   bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.2)",  title: "No Obligation",             body: "Submitting a request doesn't commit you to anything. Explore your options with zero pressure." },
              ].map(({ icon, color, bg, border, title, body }) => (
                <div key={title} style={{ background: WHITE, borderRadius: 18, padding: "28px 24px", border: `1.5px solid ${CLOUD}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 13, background: bg, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <i className={`fa-solid ${icon}`} style={{ fontSize: 20, color }} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: MIDNIGHT_NAVY, marginBottom: 8, letterSpacing: "-0.01em" }}>{title}</h3>
                  <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.65 }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ───────────────────────────────────────────────────────────────── */}
      <section className="faq-section">
        <div className="faq-inner">
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: accent, marginBottom: 10 }}>
              FAQ
            </p>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 900, color: MIDNIGHT_NAVY, letterSpacing: "-0.02em" }}>
              Frequently asked questions
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {cfg.faqs.map((faq, i) => (
              <details key={i} style={{ background: FROST, borderRadius: 14, border: `1.5px solid ${CLOUD}`, overflow: "hidden" }}>
                <summary style={{
                  padding: "18px 22px", fontSize: 15, fontWeight: 700, color: MIDNIGHT_NAVY,
                  cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
                  listStyle: "none",
                }}>
                  {faq.q}
                  <i className="fa-solid fa-chevron-down faq-chevron" style={{ fontSize: 11, color: STEEL, flexShrink: 0 }} />
                </summary>
                <p style={{ margin: 0, padding: "0 22px 18px", fontSize: 14, color: SLATE, lineHeight: 1.75, borderTop: `1px solid ${CLOUD}`, paddingTop: 14 }}>
                  {faq.a(city, p.service_area ?? location)}
                </p>
              </details>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 40 }}>
            <a href="#book" style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px",
              borderRadius: 100, background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
              color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none",
              boxShadow: `0 6px 20px ${accent}44`,
            }}>
              {cfg.ctaLabel} →
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer className="footer-section">
        <div className="footer-inner">
          <div className="footer-grid">

            {/* Brand col */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                {p.business_logo_url ? (
                  <img src={p.business_logo_url} alt={biz} style={{ height: 36, objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.85 }} />
                ) : (
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className={`fa-solid ${cfg.services[0]?.icon ?? "fa-stethoscope"}`} style={{ fontSize: 14, color: "#fff" }} />
                  </div>
                )}
                <span style={{ fontSize: 17, fontWeight: 800, color: WHITE }}>{biz}</span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.42)", lineHeight: 1.7, maxWidth: 280, marginBottom: 18 }}>{tagline}</p>

              {/* Social */}
              <div style={{ display: "flex", gap: 9, marginBottom: 20 }}>
                {p.business_instagram && (
                  <a href={p.business_instagram} target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
                    <i className="fa-brands fa-instagram" style={{ fontSize: 13 }} />
                  </a>
                )}
                {p.business_facebook && (
                  <a href={p.business_facebook} target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
                    <i className="fa-brands fa-facebook" style={{ fontSize: 13 }} />
                  </a>
                )}
                {p.business_google_profile && (
                  <a href={p.business_google_profile} target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
                    <i className="fa-brands fa-google" style={{ fontSize: 13 }} />
                  </a>
                )}
              </div>

              {isMedical && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(39,174,96,0.1)", border: "1px solid rgba(39,174,96,0.2)", borderRadius: 100, padding: "5px 12px" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                  <span style={{ fontSize: 11, fontWeight: 700, color: GREEN }}>HIPAA Compliant</span>
                </div>
              )}
            </div>

            {/* Contact col */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 18 }}>
                Contact
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {contactEmail && (
                  <a href={`mailto:${contactEmail}`} style={{ display: "flex", alignItems: "center", gap: 9, color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>
                    <i className="fa-solid fa-envelope" style={{ fontSize: 11, color: accent, width: 16 }} />
                    {contactEmail}
                  </a>
                )}
                {p.business_address && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 9, color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
                    <i className="fa-solid fa-location-dot" style={{ fontSize: 11, color: accent, width: 16, marginTop: 3 }} />
                    <span>{[p.business_address, city, state, p.business_zip].filter(Boolean).join(", ")}</span>
                  </div>
                )}
                {p.service_area && (
                  <div style={{ display: "flex", alignItems: "center", gap: 9, color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
                    <i className="fa-solid fa-map" style={{ fontSize: 11, color: accent, width: 16 }} />
                    <span>Serving {p.service_area}</span>
                  </div>
                )}
                {p.business_website && (
                  <a href={p.business_website} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 9, color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>
                    <i className="fa-solid fa-globe" style={{ fontSize: 11, color: accent, width: 16 }} />
                    {p.business_website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            </div>

            {/* CTA col */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 18 }}>
                Ready to get started?
              </p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 22 }}>
                {isMedical
                  ? "Fill out the form above and our team will reach out to confirm your appointment — usually within the hour."
                  : "Fill out the form and we'll reach out quickly with your free, no-obligation quote."}
              </p>
              <a href="#book" style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px",
                borderRadius: 100, background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none",
                boxShadow: `0 4px 16px ${accent}44`,
              }}>
                {cfg.ctaLabel}
                <i className="fa-solid fa-arrow-right" style={{ fontSize: 11 }} />
              </a>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>© {new Date().getFullYear()} {biz}. All rights reserved.</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.18)" }}>
              Powered by{" "}
              <a href="https://clozeflow.com" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none", fontWeight: 600 }}>ClozeFlow</a>
            </p>
          </div>
        </div>
      </footer>

      {/* ── Live ticker ─────────────────────────────────────────────────────────── */}
      <IntakeLiveTicker city={city} accent={accent} />
    </>
  );
}
