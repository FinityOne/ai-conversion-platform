/**
 * Twilio SMS utility — no SDK, just fetch against the REST API.
 * Requires env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 */

import { formatPhoneE164 } from "@/lib/phone";

export interface SmsSendResult {
  sid:   string | null;
  error: string | null;
}

/** Twilio error codes relevant to trial accounts */
const TRIAL_ERRORS: Record<number, string> = {
  21219: "unverified destination",
  21408: "unverified destination",
  21610: "number opted out",
  21211: "invalid To number",
  21614: "not a mobile number",
};

export async function sendSms(to: string, body: string): Promise<SmsSendResult> {
  // Normalize to E.164 — Twilio requires +1XXXXXXXXXX
  const normalized = formatPhoneE164(to);
  if (!normalized) {
    return { sid: null, error: `Invalid US phone number: "${to}"` };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const from       = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !from) {
    console.error("[sms] Missing Twilio env vars — check .env.local");
    return { sid: null, error: "SMS not configured on this server" };
  }

  const url    = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const params = new URLSearchParams({ To: normalized, From: from, Body: body });

  let res: Response;
  let data: Record<string, unknown> = {};

  try {
    res  = await fetch(url, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/x-www-form-urlencoded",
        "Authorization": "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
      },
      body: params.toString(),
    });
    data = await res.json().catch(() => ({}));
  } catch (networkErr) {
    console.error("[sms] Network error reaching Twilio:", networkErr);
    return { sid: null, error: "Network error — could not reach Twilio" };
  }

  // ── Log full response for debugging ──────────────────────────────────
  console.log("[sms] Twilio response:", {
    httpStatus: res.status,
    sid:        data.sid,
    status:     data.status,
    errorCode:  data.code,
    errorMsg:   data.message,
    to:         normalized,
    from,
  });

  // ── HTTP error (4xx / 5xx) ────────────────────────────────────────────
  if (!res.ok) {
    const code    = typeof data.code === "number" ? data.code : 0;
    const rawMsg  = typeof data.message === "string" ? data.message : `Twilio error ${res.status}`;

    // Friendly message for trial-account unverified-number errors
    if (TRIAL_ERRORS[code] === "unverified destination") {
      const friendly = `SMS blocked: ${normalized} is not a verified number in your Twilio trial account. ` +
        `Add it at console.twilio.com → Phone Numbers → Verified Caller IDs.`;
      console.error("[sms]", friendly);
      return { sid: null, error: friendly };
    }

    console.error("[sms] Twilio error:", code, rawMsg);
    return { sid: null, error: rawMsg };
  }

  // ── Twilio accepted (201) but message may still be failed/undelivered ─
  // This catches trial accounts silently dropping messages.
  const msgStatus = typeof data.status === "string" ? data.status : "";
  if (msgStatus === "failed" || msgStatus === "undelivered") {
    const errMsg = typeof data.error_message === "string"
      ? data.error_message
      : "Message was not delivered. Make sure the destination number is verified in your Twilio account.";
    console.error("[sms] Twilio delivery failed:", data.error_code, errMsg);
    return { sid: null, error: errMsg };
  }

  return { sid: typeof data.sid === "string" ? data.sid : null, error: null };
}
