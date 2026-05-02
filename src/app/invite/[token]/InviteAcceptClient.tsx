"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ORANGE = "#D35400";
const TEXT   = "#1a1a1a";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";

interface Props {
  token:          string;
  inviteeEmail:   string;
  inviteeName:    string;
  ownerName:      string | null;
  businessName:   string | null;
  role:           string;
  loggedInEmail:  string | null;
}

export default function InviteAcceptClient({
  token, inviteeEmail, inviteeName, ownerName, businessName, role, loggedInEmail,
}: Props) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "accepting" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const isCorrectUser = loggedInEmail?.toLowerCase() === inviteeEmail.toLowerCase();
  const isLoggedIn    = !!loggedInEmail;

  async function acceptInvite() {
    setState("accepting");
    try {
      const res  = await fetch(`/api/invite/${token}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong.");
        setState("error");
        return;
      }
      // Switch into the org immediately
      await fetch("/api/org/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerId: data.ownerId }),
      });
      setState("done");
      setTimeout(() => router.push("/dashboard"), 1400);
    } catch {
      setErrorMsg("Network error. Please try again.");
      setState("error");
    }
  }

  const roleLabel    = role === "admin" ? "Admin" : "Team Member";
  const inviterLabel = ownerName ? `${ownerName}` : "Someone";
  const bizLabel     = businessName ?? "their team";

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F9F7F2", padding: "20px" }}>
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 20, overflow: "hidden", maxWidth: 440, width: "100%", boxShadow: "0 8px 40px rgba(0,0,0,0.07)" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#D35400,#e8641c)", padding: "28px 36px" }}>
          <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Team Invitation
          </p>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.4px" }}>
            {businessName ?? "ClozeFlow"}
          </p>
        </div>

        <div style={{ padding: "32px 36px" }}>
          {state === "done" ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(34,197,94,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <i className="fa-solid fa-circle-check" style={{ fontSize: 26, color: "#22c55e" }} />
              </div>
              <p style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, color: TEXT }}>You&apos;re in!</p>
              <p style={{ margin: 0, fontSize: 13, color: MUTED }}>Redirecting to your workspace…</p>
            </div>
          ) : (
            <>
              <p style={{ margin: "0 0 20px", fontSize: 15, color: TEXT, lineHeight: 1.65 }}>
                Hi <strong>{inviteeName}</strong>, {inviterLabel} has invited you to join{" "}
                <strong>{bizLabel}</strong> as a <strong>{roleLabel}</strong>.
              </p>

              {/* Account status */}
              {!isLoggedIn ? (
                <div style={{ padding: "14px 16px", borderRadius: 12, background: "#fffbeb", border: "1px solid #fde68a", marginBottom: 20 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "#92400e" }}>Sign in to accept</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#78716c", lineHeight: 1.55 }}>
                    This invite was sent to <strong>{inviteeEmail}</strong>. Sign in or create an account with that email to join.
                  </p>
                </div>
              ) : !isCorrectUser ? (
                <div style={{ padding: "14px 16px", borderRadius: 12, background: "#fef2f2", border: "1px solid #fecaca", marginBottom: 20 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "#991b1b" }}>Wrong account</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#78716c", lineHeight: 1.55 }}>
                    You&apos;re signed in as <strong>{loggedInEmail}</strong>, but this invite is for{" "}
                    <strong>{inviteeEmail}</strong>. Please sign in with the correct account.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)", marginBottom: 20 }}>
                  <i className="fa-solid fa-circle-check" style={{ fontSize: 14, color: "#22c55e" }} />
                  <p style={{ margin: 0, fontSize: 13, color: "#166534" }}>
                    Signed in as <strong>{loggedInEmail}</strong> — ready to accept.
                  </p>
                </div>
              )}

              {state === "error" && (
                <div style={{ padding: "12px 14px", borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca", marginBottom: 16 }}>
                  <p style={{ margin: 0, fontSize: 13, color: "#991b1b" }}>{errorMsg}</p>
                </div>
              )}

              {/* CTA */}
              {!isLoggedIn ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Link
                    href={`/signup?email=${encodeURIComponent(inviteeEmail)}&redirect=/invite/${token}`}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", borderRadius: 10, background: "linear-gradient(135deg,#D35400,#e8641c)", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none" }}
                  >
                    Create account & accept
                  </Link>
                  <Link
                    href={`/login?email=${encodeURIComponent(inviteeEmail)}&redirect=/invite/${token}`}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "13px", borderRadius: 10, background: "#fff", border: `1px solid ${BORDER}`, color: TEXT, fontSize: 14, fontWeight: 600, textDecoration: "none" }}
                  >
                    Sign in instead
                  </Link>
                </div>
              ) : !isCorrectUser ? (
                <Link
                  href={`/login?email=${encodeURIComponent(inviteeEmail)}&redirect=/invite/${token}`}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "13px", borderRadius: 10, background: "linear-gradient(135deg,#D35400,#e8641c)", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none" }}
                >
                  Sign in as {inviteeEmail}
                </Link>
              ) : (
                <button
                  onClick={acceptInvite}
                  disabled={state === "accepting"}
                  style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#D35400,#e8641c)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: state === "accepting" ? "wait" : "pointer", opacity: state === "accepting" ? 0.8 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  {state === "accepting"
                    ? <><i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 13 }} /> Accepting…</>
                    : "Accept Invitation"}
                </button>
              )}
            </>
          )}
        </div>

        <div style={{ padding: "16px 36px", background: "#f9f7f2", borderTop: `1px solid ${BORDER}` }}>
          <p style={{ margin: 0, fontSize: 11, color: "#aaa", textAlign: "center" }}>
            Powered by <span style={{ color: ORANGE, fontWeight: 700 }}>ClozeFlow</span>
          </p>
        </div>
      </div>
    </div>
  );
}
