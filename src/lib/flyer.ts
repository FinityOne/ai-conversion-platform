// ── Types & constants for the Flyer Marketing feature ─────────────────────────

export const FLYER_THEMES = {
  orange: { bg: "#ea580c", text: "#fff", light: "#fff7ed", accent: "#c2410c", name: "Orange" },
  blue:   { bg: "#1d4ed8", text: "#fff", light: "#eff6ff", accent: "#1e40af", name: "Blue"   },
  green:  { bg: "#15803d", text: "#fff", light: "#f0fdf4", accent: "#166534", name: "Green"  },
  dark:   { bg: "#18181b", text: "#fff", light: "#f4f4f5", accent: "#3f3f46", name: "Dark"   },
} as const;

export type ColorTheme = keyof typeof FLYER_THEMES;

export interface FlyerData {
  id?:            string;
  user_id?:       string;
  business_name:  string;
  tagline:        string;
  promo_headline: string;
  services:       string[];
  areas_served:   string[];
  phone:          string;
  email_contact:  string;
  footer_note:    string;
  color_theme:    ColorTheme;
}

export const FLYER_EMPTY: FlyerData = {
  business_name:  "",
  tagline:        "",
  promo_headline: "",
  services:       ["", ""],
  areas_served:   [""],
  phone:          "",
  email_contact:  "",
  footer_note:    "",
  color_theme:    "orange",
};

// Character limits per field
export const LIMITS = {
  business_name:  50,
  tagline:        80,
  promo_headline: 100,
  service_item:   40,
  area_item:      30,
  phone:          20,
  email_contact:  60,
  footer_note:    80,
};
