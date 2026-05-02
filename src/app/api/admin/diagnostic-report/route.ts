import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

// ─── Website analysis ─────────────────────────────────────────────────────────

interface ScrapedData {
  title: string | null;
  metaDesc: string | null;
  h1: string | null;
  hasCanonical: boolean;
  hasSchema: boolean;
  hasOgTags: boolean;
  hasViewport: boolean;
  hasPhone: boolean;
  hasAddress: boolean;
  hasBookingLink: boolean;
  hasChatWidget: boolean;
  hasContactForm: boolean;
  hasFacebook: boolean;
  hasInstagram: boolean;
  hasTwitter: boolean;
  hasLinkedIn: boolean;
  hasTikTok: boolean;
  hasYoutube: boolean;
  hasGoogleTag: boolean;
  hasFbPixel: boolean;
  hasGoogleMaps: boolean;
  hasReviewLink: boolean;
  https: boolean;
  fetchedOk: boolean;
}

async function scrapeWebsite(rawUrl: string): Promise<ScrapedData> {
  const defaults: ScrapedData = {
    title: null, metaDesc: null, h1: null,
    hasCanonical: false, hasSchema: false, hasOgTags: false,
    hasViewport: false, hasPhone: false, hasAddress: false,
    hasBookingLink: false, hasChatWidget: false, hasContactForm: false,
    hasFacebook: false, hasInstagram: false, hasTwitter: false,
    hasLinkedIn: false, hasTikTok: false, hasYoutube: false,
    hasGoogleTag: false, hasFbPixel: false,
    hasGoogleMaps: false, hasReviewLink: false,
    https: false, fetchedOk: false,
  };

  let url = rawUrl.trim();
  if (!url.startsWith("http")) url = "https://" + url;
  defaults.https = url.startsWith("https://");

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ClozeFlowBot/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return defaults;

    const html = await res.text();
    defaults.fetchedOk = true;
    const low = html.toLowerCase();

    // Title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    defaults.title = titleMatch?.[1]?.trim().replace(/\s+/g, " ") ?? null;

    // Meta description
    const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
      ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    defaults.metaDesc = metaDescMatch?.[1]?.trim() ?? null;

    // H1
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    defaults.h1 = h1Match?.[1]?.replace(/<[^>]+>/g, "").trim() ?? null;

    defaults.hasCanonical  = low.includes('rel="canonical"') || low.includes("rel='canonical'");
    defaults.hasSchema     = low.includes('"@context"') || low.includes("application/ld+json");
    defaults.hasOgTags     = low.includes('property="og:') || low.includes("property='og:");
    defaults.hasViewport   = low.includes('name="viewport"') || low.includes("name='viewport'");

    defaults.hasPhone      = /(\+?1[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(html);
    defaults.hasAddress    = /\d+\s+\w+(\s+\w+)?\s+(st|street|ave|avenue|blvd|boulevard|rd|road|dr|drive|ln|lane|way|court|ct|pl|place)/i.test(html);

    defaults.hasBookingLink = /book|appointment|schedule|calendly|acuity|mindbody|zocdoc|healthgrades/i.test(html);
    defaults.hasChatWidget  = /tawk|intercom|zendesk|crisp|tidio|drift|hubspot|freshchat|livechat/i.test(html);
    defaults.hasContactForm = /<form/i.test(html) && /contact|reach|message|inquiry/i.test(html);

    defaults.hasFacebook   = /facebook\.com/i.test(html);
    defaults.hasInstagram  = /instagram\.com/i.test(html);
    defaults.hasTwitter    = /twitter\.com|x\.com/i.test(html);
    defaults.hasLinkedIn   = /linkedin\.com/i.test(html);
    defaults.hasTikTok     = /tiktok\.com/i.test(html);
    defaults.hasYoutube    = /youtube\.com/i.test(html);

    defaults.hasGoogleTag  = /gtag|google-analytics|googletagmanager/i.test(html);
    defaults.hasFbPixel    = /fbq\(|facebook pixel|fbevents\.js/i.test(html);

    defaults.hasGoogleMaps = /maps\.google|google\.com\/maps|maps\.googleapis/i.test(html);
    defaults.hasReviewLink = /google.*review|yelp\.com|healthgrades|vitals\.com|zocdoc/i.test(html);

  } catch {
    // Fetch failed — return defaults
  }

  return defaults;
}

// ─── Score computation ────────────────────────────────────────────────────────

interface Scores {
  seo:        number;
  website:    number;
  local:      number;
  competitor: number;
  social:     number;
  followup:   number;
  ads:        number;
  overall:    number;
}

function computeScores(d: ScrapedData): Scores {
  // SEO (0–100)
  let seo = 0;
  if (d.title)            seo += 18;
  if (d.title && d.title.length > 30) seo += 7;
  if (d.metaDesc)         seo += 18;
  if (d.metaDesc && d.metaDesc.length > 50) seo += 7;
  if (d.h1)               seo += 15;
  if (d.hasCanonical)     seo += 12;
  if (d.hasSchema)        seo += 13;
  if (d.hasOgTags)        seo += 10;

  // Website (0–100)
  let website = 0;
  if (d.https)            website += 20;
  if (d.hasViewport)      website += 18;
  if (d.hasBookingLink)   website += 22;
  if (d.hasContactForm)   website += 18;
  if (d.fetchedOk)        website += 12; // loads at all
  if (d.title)            website += 10; // basic content

  // Local (0–100)
  let local = 0;
  if (d.hasPhone)         local += 22;
  if (d.hasAddress)       local += 20;
  if (d.hasGoogleMaps)    local += 18;
  if (d.hasReviewLink)    local += 18;
  if (d.hasBookingLink)   local += 12;
  if (d.hasContactForm)   local += 10;

  // Social (0–100)
  let social = 0;
  if (d.hasFacebook)      social += 22;
  if (d.hasInstagram)     social += 22;
  if (d.hasTwitter)       social += 14;
  if (d.hasLinkedIn)      social += 12;
  if (d.hasTikTok)        social += 16;
  if (d.hasYoutube)       social += 14;

  // Follow-up (0–100)
  let followup = 0;
  if (d.hasChatWidget)    followup += 35;
  if (d.hasContactForm)   followup += 25;
  if (d.hasBookingLink)   followup += 25;
  if (d.hasPhone)         followup += 15;

  // Ads (0–100)
  let ads = 0;
  if (d.hasGoogleTag)     ads += 40;
  if (d.hasFbPixel)       ads += 40;
  if (d.hasGoogleTag && d.hasFbPixel) ads += 20;

  // Competitor: hard to measure, base on inverse of ads investment
  const competitor = Math.round(Math.max(10, Math.min(55, ads * 0.5 + local * 0.2)));

  seo        = Math.min(100, seo);
  website    = Math.min(100, website);
  local      = Math.min(100, local);
  social     = Math.min(100, social);
  followup   = Math.min(100, followup);
  ads        = Math.min(100, ads);

  // Overall: weighted average
  const overall = Math.round(
    seo * 0.20 +
    website * 0.18 +
    local * 0.18 +
    competitor * 0.12 +
    social * 0.12 +
    followup * 0.12 +
    ads * 0.08
  );

  return { seo, website, local, competitor, social, followup, ads, overall };
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: { leadId?: string; businessName: string; websiteUrl?: string; city?: string; state?: string; industry?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { leadId, businessName, websiteUrl, city, state, industry = "healthcare" } = body;
  if (!businessName?.trim()) return NextResponse.json({ error: "Business name is required" }, { status: 400 });

  // Scrape and score
  const scraped = websiteUrl ? await scrapeWebsite(websiteUrl) : {} as ScrapedData;
  const scores  = computeScores(scraped as ScrapedData);

  const sb = createSupabaseServiceClient();
  const { data: report, error } = await sb
    .from("diagnostic_reports")
    .insert({
      lead_id:       leadId ?? null,
      admin_user_id: user.id,
      business_name: businessName.trim(),
      website_url:   websiteUrl?.trim() || null,
      city:          city?.trim() || null,
      state:         state?.trim() || null,
      industry,
      scores,
      scraped_data:  scraped,
    })
    .select("token")
    .single();

  if (error || !report) {
    return NextResponse.json({ error: error?.message ?? "Failed to create report" }, { status: 500 });
  }

  return NextResponse.json({ token: report.token });
}
