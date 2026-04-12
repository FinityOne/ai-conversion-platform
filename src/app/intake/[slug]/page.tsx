import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import IntakeForm from "@/components/IntakeForm";

const OG_IMAGE = "https://www.essentialhome.eu/inspirations/wp-content/uploads/2023/10/CAPA-INSPIRATIONS-2.png";

// Deterministic accent color from the slug (consistent per business, varies across businesses)
const ACCENT_PALETTE = [
  "#ea580c", // orange
  "#16a34a", // green
  "#2563eb", // blue
  "#7c3aed", // purple
  "#0891b2", // teal
  "#e11d48", // rose
];

function accentFromSlug(slug: string): string {
  const sum = slug.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return ACCENT_PALETTE[sum % ACCENT_PALETTE.length];
}

async function getProfile(slug: string) {
  const sb = createSupabaseServiceClient();

  // Try custom intake_slug first
  const { data: bySlug } = await sb
    .from("profiles")
    .select("id, business_name, first_name")
    .eq("intake_slug", slug)
    .maybeSingle();
  if (bySlug) return bySlug;

  // Fall back to raw UUID (existing links keep working)
  const { data: byId } = await sb
    .from("profiles")
    .select("id, business_name, first_name")
    .eq("id", slug)
    .maybeSingle();
  return byId ?? null;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfile(slug);
  const biz = profile?.business_name ?? "A Local Home Service Pro";

  return {
    title: `${biz} — Get Your Free Estimate`,
    description: `Fill out this quick form to get connected with ${biz}. We'll respond within 24 hours.`,
    openGraph: {
      title: `${biz} — Get Your Free Estimate`,
      description: `Tap to request a free estimate from ${biz}. Fast response guaranteed.`,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Beautiful home interior" }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${biz} — Get Your Free Estimate`,
      description: `Fast, free estimates from ${biz}.`,
      images: [OG_IMAGE],
    },
  };
}

export default async function IntakePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const profile = await getProfile(slug);
  if (!profile) notFound();

  const businessName = profile.business_name ?? "Your Local Pro";
  const accent       = accentFromSlug(slug);
  // Always pass the stable user UUID to the form POST — not the custom slug
  const ownerId      = profile.id;

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 16px 60px" }}>

      {/* Hero image */}
      <div style={{
        width: "100%", height: 200, marginBottom: 0,
        backgroundImage: `url(${OG_IMAGE})`,
        backgroundSize: "cover", backgroundPosition: "center 40%",
        borderRadius: "0 0 24px 24px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.55))",
        }} />
        {/* Business name over image */}
        <div style={{
          position: "absolute", bottom: 20, left: 20, right: 20,
        }}>
          <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "1.5px" }}>
            Free Estimate
          </p>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.2, textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>
            {businessName}
          </h1>
        </div>
      </div>

      {/* Trust bar */}
      <div style={{
        background: "#fff", borderRadius: "0 0 16px 16px",
        padding: "12px 20px", marginBottom: 24,
        display: "flex", justifyContent: "space-around",
        borderBottom: `3px solid ${accent}`,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}>
        {[
          { icon: "fa-bolt", label: "Fast response" },
          { icon: "fa-shield-halved", label: "No obligation" },
          { icon: "fa-star", label: "Local & trusted" },
        ].map(t => (
          <div key={t.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <i className={`fa-solid ${t.icon}`} style={{ fontSize: 16, color: accent }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#78716c" }}>{t.label}</span>
          </div>
        ))}
      </div>

      {/* Headline */}
      <div style={{ marginBottom: 24, paddingLeft: 4 }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 900, color: "#1c1917", lineHeight: 1.25 }}>
          Tell us what you need — it takes under 60 seconds.
        </h2>
        <p style={{ margin: 0, fontSize: 15, color: "#78716c", lineHeight: 1.6 }}>
          Fill out the form below and {businessName} will get back to you fast with a free estimate.
        </p>
      </div>

      {/* Form card */}
      <div style={{
        background: "#fff", borderRadius: 20,
        border: "1px solid #e6e2db",
        padding: "28px 22px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}>
        <IntakeForm slug={ownerId} businessName={businessName} accent={accent} />
      </div>

      {/* Footer note */}
      <p style={{ margin: "24px 0 0", textAlign: "center", fontSize: 12, color: "#c4bfb8" }}>
        Powered by ClozeFlow · Your info is never shared or sold.
      </p>
    </div>
  );
}
