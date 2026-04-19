import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import IntakeForm from "@/components/IntakeForm";
import IntakeLiveTicker from "@/components/IntakeLiveTicker";

// ── Images ────────────────────────────────────────────────────────────────────
// All sourced from Pexels (free commercial use)
const HERO_IMG   = "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";
const ABOUT_IMG  = "https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=800&dpr=1";
const BG_IMG     = "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";

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
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  business_email: string | null;
  business_phone: string | null;
  business_website: string | null;
  avatar_url: string | null;
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
  intake_slug: string | null;
}

async function getProfile(slug: string): Promise<BizProfile | null> {
  const sb = createSupabaseServiceClient();
  const fields = "id,business_name,first_name,last_name,email,business_email,business_phone,business_website,avatar_url,business_logo_url,business_tagline,business_description,business_address,business_city,business_state,business_zip,service_area,business_license,years_in_business,business_instagram,business_facebook,business_google_profile,intake_slug";

  const { data: bySlug } = await sb.from("profiles").select(fields).eq("intake_slug", slug).maybeSingle();
  if (bySlug) return bySlug as BizProfile;

  const { data: byId } = await sb.from("profiles").select(fields).eq("id", slug).maybeSingle();
  return (byId ?? null) as BizProfile | null;
}

// ── SEO metadata ──────────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProfile(slug);
  const biz  = p?.business_name ?? "Local Home Service Pro";
  const city = p?.business_city ?? p?.service_area?.split(",")[0] ?? "Your Area";
  const desc = p?.business_description
    ?? `${biz} provides professional home services in ${city}. Get a free estimate today — fast response guaranteed.`;

  const title = `${biz} — Free Home Service Estimates in ${city}`;
  const canonical = `https://clozeflow.com/intake/${slug}`;

  return {
    title,
    description: desc,
    keywords: `${biz}, home service contractor, free estimate ${city}, roofing, HVAC, plumbing, remodeling ${city}, local contractor`,
    alternates: { canonical },
    openGraph: {
      title,
      description: desc,
      images: [{ url: HERO_IMG, width: 1260, height: 750, alt: `${biz} — home service contractor` }],
      type: "website",
      url: canonical,
    },
    twitter: { card: "summary_large_image", title, description: desc, images: [HERO_IMG] },
    robots: { index: true, follow: true },
  };
}

// ── Services ──────────────────────────────────────────────────────────────────
const SERVICES = [
  { icon: "fa-house-chimney",    label: "Roofing"              },
  { icon: "fa-ruler-combined",   label: "Siding & Gutters"     },
  { icon: "fa-window-maximize",  label: "Windows & Doors"      },
  { icon: "fa-temperature-half", label: "HVAC"                 },
  { icon: "fa-faucet",           label: "Plumbing"             },
  { icon: "fa-bolt",             label: "Electrical"           },
  { icon: "fa-kitchen-set",      label: "Kitchen Remodel"      },
  { icon: "fa-bath",             label: "Bathroom Remodel"     },
  { icon: "fa-layer-group",      label: "Flooring"             },
  { icon: "fa-paintbrush",       label: "Painting & Drywall"   },
  { icon: "fa-leaf",             label: "Landscaping"          },
  { icon: "fa-person-digging",   label: "General Contracting"  },
];

const HOW_IT_WORKS = [
  { n: "01", title: "Fill the Form",        body: "Tell us what you need in under 60 seconds. No phone tag, no hassle." },
  { n: "02", title: "We Reach Out Fast",    body: "You'll hear from us within 1–2 hours. We respect your time." },
  { n: "03", title: "Get Your Free Quote",  body: "We show up, assess the job, and give you a no-obligation estimate." },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function IntakePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const p = await getProfile(slug);
  if (!p) notFound();

  const accent    = accentFromSlug(slug);
  const ownerId   = p.id;

  // Resolved display values
  const biz          = p.business_name  ?? "Your Local Pro";
  const tagline      = p.business_tagline ?? "Quality Home Services You Can Count On";
  const desc         = p.business_description ?? "We're a local home service contractor committed to delivering quality work on time and on budget. From small repairs to major renovations, we handle every project with the craftsmanship and care your home deserves.";
  const city         = p.business_city  ?? p.service_area?.split(",")[0] ?? "Your Area";
  const state        = p.business_state ?? "";
  const location     = [city, state].filter(Boolean).join(", ");
  const contactEmail = p.business_email ?? p.email ?? null;
  const ownerName = [p.first_name, p.last_name].filter(Boolean).join(" ") || biz;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: biz,
    description: desc,
    url: p.business_website ?? undefined,
    telephone: p.business_phone ?? undefined,
    email: contactEmail ?? undefined,
    image: p.business_logo_url ?? HERO_IMG,
    address: p.business_address ? {
      "@type": "PostalAddress",
      streetAddress: p.business_address,
      addressLocality: p.business_city ?? undefined,
      addressRegion: p.business_state ?? undefined,
      postalCode: p.business_zip ?? undefined,
      addressCountry: "US",
    } : undefined,
    areaServed: p.service_area ?? location,
    foundingDate: p.years_in_business ? (new Date().getFullYear() - p.years_in_business).toString() : undefined,
    sameAs: [
      p.business_instagram,
      p.business_facebook,
      p.business_google_profile,
      p.business_website,
    ].filter(Boolean),
  };

  return (
    <>
      {/* ── Structured data ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Responsive styles ── */}
      <style>{`
        :root { --accent: ${accent}; }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        .hero-grid { display: grid; grid-template-columns: 1fr 480px; gap: 0; align-items: center; min-height: 92vh; }
        .hero-form-col { padding: 40px 48px 40px 0; }
        .hero-text-col { padding: 60px 0 60px 5vw; }
        .services-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .how-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        .trust-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; }
        .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .footer-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 32px; }
        .hide-mobile { display: inline; }
        .service-card {
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          padding: 22px 14px; border-radius: 14px;
          border: 1.5px solid #eee; background: #fafafa;
          text-decoration: none; transition: border-color 0.2s, background 0.2s, transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }
        .service-card:hover {
          border-color: var(--accent);
          background: color-mix(in srgb, var(--accent) 8%, #fff);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px color-mix(in srgb, var(--accent) 18%, transparent);
        }
        @media (max-width: 960px) {
          .hero-grid { grid-template-columns: 1fr; min-height: auto; }
          .hero-text-col { padding: 48px 20px 24px; order: 1; }
          .hero-form-col { padding: 0 20px 48px; order: 2; }
          .services-grid { grid-template-columns: repeat(3, 1fr); }
          .how-grid { grid-template-columns: 1fr; gap: 20px; }
          .trust-bar { grid-template-columns: repeat(2, 1fr); }
          .about-grid { grid-template-columns: 1fr; gap: 32px; }
          .hide-mobile { display: none; }
          .footer-grid { grid-template-columns: 1fr; gap: 24px; }
        }
        @media (max-width: 600px) {
          .services-grid { grid-template-columns: repeat(2, 1fr); }
          .trust-bar { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      {/* ── Sticky Navbar ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.07)",
        padding: "0 5vw",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 66,
        }}>
          {/* Logo + name */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {p.business_logo_url ? (
              <img src={p.business_logo_url} alt={biz} style={{ height: 38, width: "auto", objectFit: "contain" }} />
            ) : (
              <div style={{
                width: 38, height: 38, borderRadius: 9,
                background: `linear-gradient(135deg, ${accent}, ${accent}bb)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <i className="fa-solid fa-house-chimney" style={{ fontSize: 16, color: "#fff" }} />
              </div>
            )}
            <span style={{ fontSize: 18, fontWeight: 800, color: "#111" }}>{biz}</span>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {p.business_phone && (
              <a href={`tel:${p.business_phone}`} style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 14, fontWeight: 600, color: "#444", textDecoration: "none",
              }}>
                <i className="fa-solid fa-phone" style={{ fontSize: 12, color: accent }} />
                <span className="hide-mobile">{p.business_phone}</span>
              </a>
            )}
            <a href="#estimate" style={{
              padding: "9px 20px", borderRadius: 50, border: "none",
              background: accent, color: "#fff",
              fontSize: 14, fontWeight: 700, textDecoration: "none",
              boxShadow: `0 4px 14px ${accent}44`,
              transition: "opacity 0.15s",
            }}>
              Get Free Estimate
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section style={{
        position: "relative", overflow: "hidden",
        background: "#0a0a0a",
      }}>
        {/* Background image */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${HERO_IMG})`,
          backgroundSize: "cover", backgroundPosition: "center 30%",
          opacity: 0.45,
        }} />
        {/* Gradient overlay — darker on right so form card pops */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(105deg, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.82) 100%)",
        }} />

        <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", padding: "0 5vw" }}>
          <div className="hero-grid">

            {/* Text column */}
            <div className="hero-text-col">
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: `${accent}22`, border: `1px solid ${accent}55`,
                borderRadius: 50, padding: "6px 14px", marginBottom: 22,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "block" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#e5e5e5", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Now Accepting New Clients · {location}
                </span>
              </div>

              <h1 style={{
                margin: "0 0 18px", fontSize: "clamp(32px, 4.5vw, 54px)",
                fontWeight: 900, color: "#fff", lineHeight: 1.1,
                letterSpacing: "-1px",
              }}>
                {city}&apos;s Most Trusted<br />
                <span style={{ color: accent }}>Home Service</span><br />
                Contractor
              </h1>

              <p style={{
                margin: "0 0 32px", fontSize: "clamp(15px, 1.8vw, 18px)",
                color: "rgba(255,255,255,0.75)", lineHeight: 1.65, maxWidth: 460,
              }}>
                {tagline}
              </p>

              {/* Trust bullets */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 }}>
                {[
                  p.business_license ? `Licensed & Insured — ${p.business_license}` : "Licensed & Fully Insured",
                  p.years_in_business ? `${p.years_in_business}+ Years Serving ${location}` : `Proudly Serving ${location}`,
                  "Free Estimates — No Obligation",
                  "Guaranteed Response Within 2 Hours",
                ].map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                      background: `${accent}33`, border: `1.5px solid ${accent}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <i className="fa-solid fa-check" style={{ fontSize: 10, color: accent }} />
                    </div>
                    <span style={{ fontSize: 15, color: "rgba(255,255,255,0.88)", fontWeight: 500 }}>{item}</span>
                  </div>
                ))}
              </div>

              {/* Social links */}
              {(p.business_instagram || p.business_facebook || p.business_google_profile) && (
                <div style={{ display: "flex", gap: 12 }}>
                  {p.business_instagram && (
                    <a href={p.business_instagram} target="_blank" rel="noopener noreferrer" style={{
                      width: 38, height: 38, borderRadius: 9,
                      background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", textDecoration: "none", fontSize: 16,
                    }}>
                      <i className="fa-brands fa-instagram" />
                    </a>
                  )}
                  {p.business_facebook && (
                    <a href={p.business_facebook} target="_blank" rel="noopener noreferrer" style={{
                      width: 38, height: 38, borderRadius: 9,
                      background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", textDecoration: "none", fontSize: 16,
                    }}>
                      <i className="fa-brands fa-facebook" />
                    </a>
                  )}
                  {p.business_google_profile && (
                    <a href={p.business_google_profile} target="_blank" rel="noopener noreferrer" style={{
                      width: 38, height: 38, borderRadius: 9,
                      background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", textDecoration: "none", fontSize: 16,
                    }}>
                      <i className="fa-brands fa-google" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Form column — the ONLY CTA */}
            <div className="hero-form-col" id="estimate">
              <div style={{
                background: "#fff", borderRadius: 20,
                boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
                overflow: "hidden",
              }}>
                {/* Form card header */}
                <div style={{
                  background: `linear-gradient(135deg, ${accent}, ${accent}dd)`,
                  padding: "20px 24px",
                }}>
                  <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: "1.2px" }}>
                    Free — No Obligation
                  </p>
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
                    Get Your Free Estimate
                  </h2>
                </div>

                {/* Urgency strip — THE ELEMENT OF SURPRISE */}
                <div style={{
                  background: "#fffbeb",
                  borderBottom: "1px solid #fde68a",
                  padding: "10px 20px",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ fontSize: 14 }}>⚡</span>
                  <p style={{ margin: 0, fontSize: 12, color: "#92400e", fontWeight: 600, lineHeight: 1.4 }}>
                    <strong>Guaranteed 2-hour response</strong> — or we call you first, no questions asked.
                  </p>
                </div>

                <div style={{ padding: "22px 24px 28px" }}>
                  <IntakeForm slug={ownerId} businessName={biz} accent={accent} />
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
              { icon: "fa-shield-halved",    label: "Licensed & Insured",       sub: "Verified credentials"         },
              { icon: "fa-clock",            label: "2-Hour Response",           sub: "Or we call you first"         },
              { icon: "fa-star",             label: "5-Star Service",            sub: "Local reputation built daily" },
              { icon: "fa-handshake",        label: "No Obligation",             sub: "Free estimates, always"       },
            ].map((t, i) => (
              <div key={i} style={{
                padding: "22px 20px",
                borderRight: i < 3 ? "1px solid #e5e5e5" : "none",
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: `${accent}12`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <i className={`fa-solid ${t.icon}`} style={{ fontSize: 18, color: accent }} />
                </div>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: "#111" }}>{t.label}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section style={{ padding: "72px 5vw", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "1.5px" }}>
              What We Do
            </p>
            <h2 style={{ margin: "0 0 14px", fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 900, color: "#111", letterSpacing: "-0.5px" }}>
              Home Services in {location}
            </h2>
            <p style={{ margin: "0 auto", fontSize: 16, color: "#666", maxWidth: 540, lineHeight: 1.6 }}>
              From quick repairs to full renovations — we handle every job with care, speed, and craftsmanship.
            </p>
          </div>

          <div className="services-grid">
            {SERVICES.map(s => (
              <a href="#estimate" key={s.label} className="service-card">
                <div style={{
                  width: 46, height: 46, borderRadius: 12,
                  background: `${accent}14`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <i className={`fa-solid ${s.icon}`} style={{ fontSize: 20, color: accent }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#222", textAlign: "center" }}>{s.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{
        padding: "80px 5vw",
        background: "#0f172a",
        backgroundImage: `url(${BG_IMG})`,
        backgroundSize: "cover", backgroundPosition: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.88)" }} />
        <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "1.5px" }}>
              Simple Process
            </p>
            <h2 style={{ margin: "0 0 14px", fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>
              How It Works
            </h2>
            <p style={{ margin: "0 auto", fontSize: 16, color: "rgba(255,255,255,0.6)", maxWidth: 480, lineHeight: 1.6 }}>
              Getting a professional estimate is fast, easy, and completely free.
            </p>
          </div>

          <div className="how-grid">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 18, padding: "32px 28px",
                position: "relative",
              }}>
                <div style={{
                  fontSize: 52, fontWeight: 900, color: `${accent}44`,
                  lineHeight: 1, marginBottom: 18, letterSpacing: "-2px",
                }}>
                  {step.n}
                </div>
                <h3 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 800, color: "#fff" }}>{step.title}</h3>
                <p style={{ margin: 0, fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>{step.body}</p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div style={{
                    position: "absolute", right: -18, top: "50%", transform: "translateY(-50%)",
                    color: "rgba(255,255,255,0.2)", fontSize: 24, zIndex: 1,
                    display: "none", // hidden on mobile; shown via .how-arrow class
                  }} className="how-arrow">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 48 }}>
            <a href="#estimate" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "16px 36px", borderRadius: 50,
              background: accent, color: "#fff",
              fontSize: 16, fontWeight: 800, textDecoration: "none",
              boxShadow: `0 8px 28px ${accent}55`,
              letterSpacing: "0.2px",
            }}>
              Request My Free Estimate
              <i className="fa-solid fa-arrow-right" style={{ fontSize: 13 }} />
            </a>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section style={{ padding: "80px 5vw", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="about-grid">
            {/* Image */}
            <div style={{ position: "relative" }}>
              <div style={{
                position: "absolute", bottom: -20, left: -20,
                width: "65%", height: "65%", borderRadius: 18,
                background: `${accent}14`, zIndex: 0,
              }} />
              <img
                src={p.avatar_url ?? ABOUT_IMG}
                alt={`${ownerName} — ${biz}`}
                style={{
                  width: "100%", height: 420, objectFit: "cover",
                  borderRadius: 18, position: "relative", zIndex: 1,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                }}
              />
              {/* Credential badge */}
              {(p.years_in_business || p.business_license) && (
                <div style={{
                  position: "absolute", bottom: -10, right: -10, zIndex: 2,
                  background: "#fff", borderRadius: 16,
                  padding: "14px 18px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  border: `1px solid ${accent}22`,
                  textAlign: "center", minWidth: 140,
                }}>
                  {p.years_in_business ? (
                    <>
                      <p style={{ margin: 0, fontSize: 32, fontWeight: 900, color: accent, lineHeight: 1 }}>{p.years_in_business}+</p>
                      <p style={{ margin: "4px 0 0", fontSize: 12, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: "0.8px" }}>Years in Business</p>
                    </>
                  ) : p.business_license ? (
                    <>
                      <i className="fa-solid fa-certificate" style={{ fontSize: 28, color: accent }} />
                      <p style={{ margin: "6px 0 0", fontSize: 11, fontWeight: 700, color: "#666", textTransform: "uppercase" }}>Licensed</p>
                    </>
                  ) : null}
                </div>
              )}
            </div>

            {/* Content */}
            <div>
              <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "1.5px" }}>
                About Us
              </p>
              <h2 style={{ margin: "0 0 20px", fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 900, color: "#111", letterSpacing: "-0.5px", lineHeight: 1.15 }}>
                {ownerName}<br />
                <span style={{ color: "#555", fontWeight: 600, fontSize: "0.72em" }}>{biz}</span>
              </h2>
              <p style={{ margin: "0 0 28px", fontSize: 16, color: "#555", lineHeight: 1.75 }}>
                {desc}
              </p>

              {/* Credential pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 32 }}>
                {[
                  { icon: "fa-shield-halved", label: "Licensed & Insured"                                  },
                  { icon: "fa-location-dot",  label: p.service_area ?? location                            },
                  ...(p.business_license ? [{ icon: "fa-certificate", label: `License: ${p.business_license}` }] : []),
                  ...(p.business_phone    ? [{ icon: "fa-phone", label: p.business_phone }] : []),
                ].map(pill => (
                  <div key={pill.label} style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "8px 14px", borderRadius: 50,
                    background: `${accent}0e`, border: `1px solid ${accent}25`,
                    fontSize: 13, fontWeight: 600, color: "#333",
                  }}>
                    <i className={`fa-solid ${pill.icon}`} style={{ fontSize: 11, color: accent }} />
                    {pill.label}
                  </div>
                ))}
              </div>

              <a href="#estimate" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 28px", borderRadius: 50,
                background: accent, color: "#fff",
                fontSize: 15, fontWeight: 700, textDecoration: "none",
                boxShadow: `0 6px 20px ${accent}44`,
              }}>
                Get a Free Estimate Today
                <i className="fa-solid fa-arrow-right" style={{ fontSize: 12 }} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Strip ── */}
      <section style={{ background: "#f8f9fb", padding: "60px 5vw", borderTop: "1px solid #eee" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <h2 style={{ margin: "0 0 32px", fontSize: "clamp(22px, 2.5vw, 30px)", fontWeight: 900, color: "#111", textAlign: "center" }}>
            Frequently Asked Questions
          </h2>
          {[
            { q: "How quickly will I get a response?", a: `We guarantee a response within 2 hours of receiving your request. If we don't reach out in time, we'll call you first — no questions asked.` },
            { q: "Is the estimate really free?",       a: "Yes, 100% free with absolutely no obligation. We show up, assess the job, and give you an honest quote. You decide if you want to move forward." },
            { q: "What areas do you serve?",           a: `We serve ${p.service_area ?? location} and surrounding areas. Fill out the form and we'll confirm we can help with your specific location.` },
            { q: "What types of projects do you take?", a: "We handle everything from small repairs to full renovations — roofing, HVAC, plumbing, electrical, remodeling, and more. See our services above." },
          ].map((faq, i) => (
            <details key={i} style={{
              background: "#fff", borderRadius: 12, marginBottom: 12,
              border: "1px solid #e5e5e5", overflow: "hidden",
            }}>
              <summary style={{
                padding: "18px 22px", fontSize: 15, fontWeight: 700, color: "#111",
                cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                {faq.q}
                <i className="fa-solid fa-chevron-down" style={{ fontSize: 12, color: "#aaa", flexShrink: 0 }} />
              </summary>
              <p style={{ margin: 0, padding: "0 22px 18px", fontSize: 15, color: "#555", lineHeight: 1.7 }}>
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#0f172a", padding: "56px 5vw 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="footer-grid" style={{ marginBottom: 48, paddingBottom: 40, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>

            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                {p.business_logo_url ? (
                  <img src={p.business_logo_url} alt={biz} style={{ height: 36, objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.9 }} />
                ) : (
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className="fa-solid fa-house-chimney" style={{ fontSize: 16, color: "#fff" }} />
                  </div>
                )}
                <span style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>{biz}</span>
              </div>
              <p style={{ margin: "0 0 18px", fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 300 }}>
                {tagline}
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                {p.business_instagram && (
                  <a href={p.business_instagram} target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none", fontSize: 14 }}>
                    <i className="fa-brands fa-instagram" />
                  </a>
                )}
                {p.business_facebook && (
                  <a href={p.business_facebook} target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none", fontSize: 14 }}>
                    <i className="fa-brands fa-facebook" />
                  </a>
                )}
                {p.business_google_profile && (
                  <a href={p.business_google_profile} target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none", fontSize: 14 }}>
                    <i className="fa-brands fa-google" />
                  </a>
                )}
              </div>
            </div>

            {/* Contact */}
            <div>
              <p style={{ margin: "0 0 16px", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1.2px" }}>Contact</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {p.business_phone && (
                  <a href={`tel:${p.business_phone}`} style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>
                    <i className="fa-solid fa-phone" style={{ fontSize: 12, color: accent, width: 16 }} />
                    {p.business_phone}
                  </a>
                )}
                {contactEmail && (
                  <a href={`mailto:${contactEmail}`} style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>
                    <i className="fa-solid fa-envelope" style={{ fontSize: 12, color: accent, width: 16 }} />
                    {contactEmail}
                  </a>
                )}
                {p.business_address && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 500 }}>
                    <i className="fa-solid fa-location-dot" style={{ fontSize: 12, color: accent, width: 16, marginTop: 2 }} />
                    <span>{[p.business_address, city, state, p.business_zip].filter(Boolean).join(", ")}</span>
                  </div>
                )}
                {p.service_area && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 500 }}>
                    <i className="fa-solid fa-map" style={{ fontSize: 12, color: accent, width: 16 }} />
                    <span>Serving: {p.service_area}</span>
                  </div>
                )}
                {p.business_website && (
                  <a href={p.business_website} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>
                    <i className="fa-solid fa-globe" style={{ fontSize: 12, color: accent, width: 16 }} />
                    {p.business_website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            </div>

            {/* CTA */}
            <div>
              <p style={{ margin: "0 0 16px", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1.2px" }}>Ready to Start?</p>
              <p style={{ margin: "0 0 20px", fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.65 }}>
                Fill out the form and we&apos;ll reach out within 2 hours with your free, no-obligation estimate.
              </p>
              <a href="#estimate" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "13px 24px", borderRadius: 50,
                background: accent, color: "#fff",
                fontSize: 14, fontWeight: 700, textDecoration: "none",
                boxShadow: `0 4px 16px ${accent}44`,
              }}>
                Get Free Estimate
                <i className="fa-solid fa-arrow-right" style={{ fontSize: 12 }} />
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
              © {new Date().getFullYear()} {biz}. All rights reserved.
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
              Powered by{" "}
              <a href="https://clozeflow.com" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none", fontWeight: 600 }}>
                ClozeFlow
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* ── Live Social Proof Ticker — Element of Surprise ── */}
      <IntakeLiveTicker city={city} accent={accent} />
    </>
  );
}
