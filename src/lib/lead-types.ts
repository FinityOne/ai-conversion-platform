// Shared types and pure utilities — no server-only imports.
// Import from here in Client Components; import from leads.ts in Server Components.
export type { LeadStatus } from "./scoring";

export type CustomFieldKey = "cf_1" | "cf_2" | "cf_3";

export interface CustomFieldDef {
  key: CustomFieldKey;
  label: string;
  type: "text" | "dropdown" | "boolean";
  options?: string[];
}

export interface Lead {
  id: string;
  user_id: string;
  location_id: string | null;
  name: string;
  first_name: string;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  job_type: string | null;
  description: string | null;
  status: import("./scoring").LeadStatus;
  score: number;
  source: "manual" | "intake_form";
  import_id: string | null;
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
  custom_fields?: Record<string, string | boolean | null>;
}

export function leadFullName(lead: { first_name?: string | null; last_name?: string | null; name?: string }): string {
  if (lead.first_name?.trim()) return [lead.first_name.trim(), lead.last_name?.trim()].filter(Boolean).join(" ");
  return lead.name ?? "";
}

export interface EmailLogEntry {
  id: string;
  lead_id: string;
  type: string;
  subject: string | null;
  to_email: string;
  resend_id: string | null;
  email_status: string;
  opened_at: string | null;
  clicked_at: string | null;
  created_at: string;
}

export interface ProjectDetails {
  id: string;
  token: string;
  job_type: string | null;
  description: string | null;
  property_type: string | null;
  budget_range: string | null;
  timeline: string | null;
  address: string | null;
  additional_notes: string | null;
  photo_urls: string[];
  submitted_at: string | null;
  created_at: string;
}

export interface LeadStats {
  total: number;
  today: number;
  thisWeek: number;
  new: number;
  contacted: number;
  followUpSent: number;
  replied: number;
  projectSubmitted: number;
  booked: number;
  closedWon: number;
  closedLost: number;
}
