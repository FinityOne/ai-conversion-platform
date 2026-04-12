/**
 * US phone number utilities — all inputs are treated as US (+1) numbers.
 */

/** Strip all non-digit characters */
function digits(s: string): string {
  return s.replace(/\D/g, "");
}

/**
 * Progressive formatter for typing — returns (XXX) XXX-XXXX as digits accumulate.
 * Strips non-digits and caps at 10 digits.
 */
export function formatPhoneInput(raw: string): string {
  const d = digits(raw).slice(0, 10);
  if (d.length === 0)  return "";
  if (d.length <= 3)   return `(${d}`;
  if (d.length <= 6)   return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/**
 * Normalize any US phone string to E.164 (+1XXXXXXXXXX) for Twilio.
 * Returns null if the number can't be resolved to 10 US digits.
 */
export function formatPhoneE164(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const d = digits(phone);
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  return null;
}

/**
 * Human-readable display format: (XXX) XXX-XXXX.
 * Works with E.164 (+1XXXXXXXXXX), raw 10-digit, or already-formatted strings.
 * Falls back to the original string if it can't be parsed.
 */
export function formatPhoneDisplay(phone: string | null | undefined): string {
  if (!phone) return "";
  const d = digits(phone).replace(/^1/, ""); // strip leading country code
  if (d.length !== 10) return phone;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}
