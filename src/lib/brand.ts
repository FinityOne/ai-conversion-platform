/**
 * ClozeFlow Brand Tokens — Version 2.0 (Sapphire + Lavender, 2026)
 *
 * Single source of truth for all brand colors, gradients, and typography.
 * Import from here — never hardcode brand values in components.
 *
 * Brand guide: /brand-assets/ClozeFlow Brand Guide 2026.pdf
 */

// ─── Primary: Sapphire Blues ──────────────────────────────────────────────────
export const MIDNIGHT_NAVY  = "#0D1428"; // Dark backgrounds, footer
export const DEEP_NAVY      = "#141E38"; // Nav, header, dark UI
export const SAPPHIRE_DARK  = "#1C488A"; // Primary CTAs, links, icons
export const SAPPHIRE       = "#2860B0"; // Hover states, pressed CTAs  ★ KEY
export const SAPPHIRE_PALE  = "#E7EEFB"; // Backgrounds, badges

// ─── Accent: Lavender-Violet ──────────────────────────────────────────────────
export const LAVENDER_DARK  = "#6A52B0"; // Hover on accent elements
export const LAVENDER       = "#8B6FC4"; // Gradient, tags            ★ KEY
export const LAVENDER_PALE  = "#EEEBF8"; // Soft backgrounds, med spa

// ─── Neutrals ─────────────────────────────────────────────────────────────────
export const SLATE          = "#4A6274"; // Body text
export const STEEL          = "#8A9DB0"; // Muted text, captions
export const CLOUD          = "#DDE4EF"; // Borders, dividers
export const FROST          = "#F5F7FB"; // Page background
export const WHITE          = "#FFFFFF"; // Cards, modals, inputs

// ─── Segment Accent Colors ────────────────────────────────────────────────────
export const SEG_MED_SPA    = "#8B6FC4"; // Med Spa & Aesthetics — Lavender
export const SEG_CHIRO      = "#2860B0"; // Chiropractic & PT    — Sapphire
export const SEG_MEDICAL    = "#1C488A"; // Medical Clinics      — Sapphire Dark
export const SEG_DENTAL     = "#3D7A8A"; // Dental Practices     — Slate Teal

// ─── Semantic aliases (preferred names for use in components) ─────────────────
/** Primary brand color — use for interactive elements, links, icons */
export const PRIMARY        = SAPPHIRE;
/** Accent color — use for gradient endpoint, tags, secondary highlights */
export const ACCENT         = LAVENDER;
/** Page/app background */
export const BG             = FROST;
/** Primary heading color */
export const TEXT           = MIDNIGHT_NAVY;
/** Body / paragraph text */
export const BODY           = SLATE;
/** Muted / caption text */
export const MUTED          = STEEL;
/** Dividers, card borders */
export const BORDER         = CLOUD;

// ─── Gradients ────────────────────────────────────────────────────────────────
/** CTAs, hero banners, key highlights */
export const GRAD_PRIMARY   = `linear-gradient(135deg, ${SAPPHIRE} 0%, ${LAVENDER} 100%)`;
/** Hero section background */
export const GRAD_HERO_BG   = `linear-gradient(160deg, #F8FBFF 0%, ${SAPPHIRE_PALE} 60%, ${LAVENDER_PALE} 100%)`;
/** Dark sections, feature backgrounds */
export const GRAD_DARK      = `linear-gradient(135deg, ${DEEP_NAVY} 0%, ${SAPPHIRE} 100%)`;
/** Med spa / aesthetics highlights */
export const GRAD_REVERSED  = `linear-gradient(135deg, ${LAVENDER} 0%, ${SAPPHIRE} 100%)`;
/** Progress bars, accents */
export const GRAD_ACCENT    = `linear-gradient(90deg, ${SAPPHIRE}, ${LAVENDER})`;

// ─── Typography ───────────────────────────────────────────────────────────────
/** Display / headings — DM Serif Display, italic, -0.02em */
export const FONT_DISPLAY   = `'DM Serif Display', Georgia, 'Times New Roman', serif`;
/** UI / body — DM Sans */
export const FONT_SANS      = `'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;

// ─── Component token shortcuts ────────────────────────────────────────────────

/** Primary CTA button styles */
export const BTN_PRIMARY = {
  background:  GRAD_PRIMARY,
  color:       WHITE,
  fontWeight:  600,
  borderRadius: 10,
  border:      "none",
  boxShadow:   `0 4px 20px rgba(40,96,176,0.28)`,
} as const;

/** Secondary / outline button styles */
export const BTN_SECONDARY = {
  background:  WHITE,
  color:       SAPPHIRE,
  fontWeight:  600,
  borderRadius: 10,
  border:      `1.5px solid #C5D5EF`,
  boxShadow:   "none",
} as const;

/** Ghost link style */
export const BTN_GHOST = {
  background:  "transparent",
  color:       SAPPHIRE,
  fontWeight:  600,
  border:      "none",
} as const;
