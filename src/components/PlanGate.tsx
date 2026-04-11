"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLANS, detectCardBrand, type PlanId, type BillingCycle } from "@/lib/subscriptions";

interface Props {
  hasPlan: boolean;
  children: React.ReactNode;
}

const inp = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: "11px",
  color: "#f1f5f9",
  fontSize: "15px",
  padding: "13px 14px",
  width: "100%",
  outline: "none",
  WebkitAppearance: "none" as const,
};

const PLAN_IDS: PlanId[] = ["starter", "growth", "pro"];

export default function PlanGate({ hasPlan, children }: Props) {
  const router = useRouter();

  const [phase,       setPhase]       = useState<"plans" | "checkout">("plans");
  const [cycle,       setCycle]       = useState<BillingCycle>("annual");
  const [selectedPlan, selectPlan]    = useState<PlanId>("growth");
  const [cardName,    setCardName]    = useState("");
  const [cardNumber,  setCardNumber]  = useState("");
  const [cardExpiry,  setCardExpiry]  = useState("");
  const [cardCvc,     setCvc]         = useState("");
  const [cardZip,     setZip]         = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  if (hasPlan) return <>{children}</>;

  const plan  = PLANS[selectedPlan];
  const price = cycle === "annual" ? plan.annualMonthly : plan.monthlyPrice;

  function formatCardNum(v: string) {
    return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  }
  function formatExpiry(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
  }

  async function handleSubscribe() {
    if (!cardName || !cardNumber.replace(/\s/g, "") || !cardExpiry || !cardCvc || !cardZip) {
      setError("Please fill in all payment fields.");
      return;
    }
    setLoading(true);
    setError("");
    const res  = await fetch("/api/stripe/checkout", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        plan:         selectedPlan,
        billingCycle: cycle,
        cardNumber:   cardNumber.replace(/\s/g, ""),
        cardExpiry,
        cardCvc,
        cardZip,
        cardName,
      }),
    });
    const body = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) { setError(body.error ?? "Something went wrong."); return; }
    router.push("/dashboard?welcome=true");
    router.refresh();
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Blurred preview of dashboard */}
      <div style={{
        filter: "blur(7px)",
        opacity: 0.3,
        pointerEvents: "none",
        userSelect: "none",
      }}>
        {children}
      </div>

      {/* Full-viewport overlay */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "linear-gradient(160deg, rgba(10,14,28,0.88) 0%, rgba(20,12,40,0.92) 100%)",
        backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px 16px",
        overflowY: "auto",
      }}>
        <div style={{
          width: "100%", maxWidth: 500,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 28,
          padding: "32px 28px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        }}>

          {phase === "plans" && (
            <>
              {/* Header */}
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{
                  width: 60, height: 60, borderRadius: 18, margin: "0 auto 16px",
                  background: "linear-gradient(135deg,rgba(234,88,12,0.2),rgba(249,115,22,0.1))",
                  border: "1px solid rgba(234,88,12,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <i className="fa-solid fa-lock" style={{ fontSize: 24, color: "#fb923c" }} />
                </div>
                <h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 900, color: "#fff" }}>
                  Your pipeline is ready
                </h2>
                <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                  Pick a plan to unlock ClozeFlow and start<br />turning leads into booked jobs automatically.
                </p>
              </div>

              {/* Cycle toggle */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 20 }}>
                {(["annual", "monthly"] as BillingCycle[]).map(c => (
                  <button
                    key={c}
                    onClick={() => setCycle(c)}
                    style={{
                      padding: "7px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none",
                      background: cycle === c ? "linear-gradient(90deg,#ea580c,#f97316)" : "rgba(255,255,255,0.07)",
                      color: cycle === c ? "#fff" : "rgba(255,255,255,0.45)",
                      transition: "all 0.15s",
                    }}
                  >
                    {c === "annual" ? "Annual · save 30%" : "Monthly"}
                  </button>
                ))}
              </div>

              {/* Plan cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {PLAN_IDS.map(id => {
                  const p        = PLANS[id];
                  const p_price  = cycle === "annual" ? p.annualMonthly : p.monthlyPrice;
                  const isActive = selectedPlan === id;
                  const isPopular = id === "growth";

                  return (
                    <div
                      key={id}
                      onClick={() => selectPlan(id)}
                      style={{
                        position: "relative",
                        padding: "14px 16px", borderRadius: 16, cursor: "pointer",
                        border: isActive ? `2px solid ${p.color}` : "2px solid rgba(255,255,255,0.09)",
                        background: isActive ? `${p.color}12` : "rgba(255,255,255,0.025)",
                        display: "flex", alignItems: "center", gap: 14,
                        transition: "all 0.15s",
                        boxShadow: isActive ? `0 0 0 4px ${p.color}20` : "none",
                      }}
                    >
                      {isPopular && (
                        <div style={{
                          position: "absolute", top: -10, right: 14,
                          background: "linear-gradient(90deg,#7c3aed,#a855f7)",
                          color: "#fff", fontSize: 9, fontWeight: 800,
                          padding: "3px 10px", borderRadius: 20, letterSpacing: "0.5px",
                        }}>
                          MOST POPULAR
                        </div>
                      )}

                      {/* Emoji */}
                      <div style={{
                        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                        background: `${p.color}18`, border: `1px solid ${p.color}30`,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                      }}>{p.emoji}</div>

                      {/* Name + tagline */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 800, color: "#fff" }}>{p.name}</p>
                        <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                          {p.leadLimit ? `${p.leadLimit} leads/mo` : "Unlimited leads"} · {p.coolFeature.label}
                        </p>
                      </div>

                      {/* Price */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: isActive ? p.color : "#fff" }}>
                          ${p_price.toLocaleString()}
                        </p>
                        <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.35)" }}>/mo</p>
                      </div>

                      {/* Check */}
                      {isActive && (
                        <div style={{
                          width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                          background: p.color,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <i className="fa-solid fa-check" style={{ fontSize: 10, color: "#fff" }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* CTA */}
              <button
                onClick={() => setPhase("checkout")}
                style={{
                  width: "100%", padding: "16px", borderRadius: 14, border: "none",
                  background: `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`,
                  color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer",
                  boxShadow: `0 4px 20px ${plan.color}40`,
                  marginBottom: 14,
                  transition: "all 0.15s",
                }}
              >
                {plan.emoji} Get started with {plan.name} — ${price.toLocaleString()}/mo →
              </button>

              <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
                {["Instant access", "No long-term contracts", "Upgrades anytime"].map(t => (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }} />
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{t}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {phase === "checkout" && (
            <>
              {/* Plan summary */}
              <div style={{
                padding: "14px 16px", borderRadius: 14, marginBottom: 20,
                background: `${plan.color}15`, border: `1px solid ${plan.color}30`,
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{plan.emoji}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 1px", fontSize: 14, fontWeight: 800, color: "#fff" }}>
                    {plan.name} Plan · {cycle === "annual" ? "Annual" : "Monthly"}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                    ${price.toLocaleString()}/mo
                    {cycle === "annual" && ` · $${(price * 12).toLocaleString()} billed today`}
                  </p>
                </div>
                <button
                  onClick={() => setPhase("plans")}
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 12 }}
                >
                  Change
                </button>
              </div>

              {/* Test badge */}
              <div style={{
                padding: "9px 12px", borderRadius: 9, marginBottom: 16,
                background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)",
                display: "flex", alignItems: "center", gap: 7,
              }}>
                <i className="fa-solid fa-flask" style={{ fontSize: 11, color: "#fbbf24" }} />
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                  <strong style={{ color: "#fbbf24" }}>Test mode</strong> — any card details will work.
                </span>
              </div>

              {error && (
                <div style={{ marginBottom: 14, padding: "11px 14px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", fontSize: 13 }}>
                  {error}
                </div>
              )}

              {/* Card fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 5 }}>Name on card</label>
                  <input style={inp} placeholder="Jake Rivera" value={cardName} onChange={e => setCardName(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 5 }}>Card number</label>
                  <input
                    style={inp} placeholder="4242 4242 4242 4242" inputMode="numeric"
                    value={cardNumber} onChange={e => setCardNumber(formatCardNum(e.target.value))}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 5 }}>Expiry</label>
                    <input style={inp} placeholder="MM / YY" inputMode="numeric" value={cardExpiry} onChange={e => setCardExpiry(formatExpiry(e.target.value))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 5 }}>CVC</label>
                    <input style={inp} placeholder="123" inputMode="numeric" maxLength={4} value={cardCvc} onChange={e => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 5 }}>ZIP</label>
                    <input style={inp} placeholder="90210" inputMode="numeric" maxLength={5} value={cardZip} onChange={e => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))} />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubscribe}
                disabled={loading}
                style={{
                  width: "100%", padding: "16px", borderRadius: 14, border: "none",
                  background: `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`,
                  color: "#fff", fontSize: 15, fontWeight: 800,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.75 : 1,
                  boxShadow: `0 4px 20px ${plan.color}40`,
                  marginBottom: 12,
                }}
              >
                {loading
                  ? "Processing…"
                  : `Subscribe to ${plan.name} — $${price.toLocaleString()}/mo`}
              </button>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <i className="fa-solid fa-shield-halved" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Secured by Stripe · 256-bit encryption</span>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
