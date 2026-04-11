"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLANS, detectCardBrand, type PlanId, type BillingCycle } from "@/lib/subscriptions";

interface Props { firstName: string }

const PHASE_COUNT = 5; // 3 education + pricing + checkout

// ── helpers ──────────────────────────────────────────────────────────────────

function PipelineStep({ emoji, label, isLast }: { emoji: string; label: string; isLast?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, flexShrink: 0 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 16, flexShrink: 0,
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
        }}>{emoji}</div>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.55)", textAlign: "center", maxWidth: 70, lineHeight: 1.3 }}>{label}</p>
      </div>
      {!isLast && (
        <div style={{ width: 24, height: 2, background: "rgba(234,88,12,0.4)", margin: "0 4px", marginTop: -16, flexShrink: 0 }} />
      )}
    </div>
  );
}

function TimelineRow({ time, text, done }: { time: string; text: string; done?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: done ? "rgba(234,88,12,0.15)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${done ? "rgba(234,88,12,0.35)" : "rgba(255,255,255,0.1)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 800, color: done ? "#fb923c" : "rgba(255,255,255,0.4)",
      }}>{done ? "✓" : "⏱"}</div>
      <div>
        <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color: "rgba(234,88,12,0.8)", textTransform: "uppercase", letterSpacing: "1px" }}>{time}</p>
        <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{text}</p>
      </div>
    </div>
  );
}

function PlanCard({
  id, cycle, selected, onSelect,
}: {
  id: PlanId; cycle: BillingCycle; selected: boolean; onSelect: () => void;
}) {
  const plan = PLANS[id];
  const price = cycle === "annual" ? plan.annualMonthly : plan.monthlyPrice;
  const isPopular = id === "growth";

  return (
    <div
      onClick={onSelect}
      style={{
        position: "relative", padding: "20px 18px", borderRadius: 18, cursor: "pointer",
        border: selected ? `2px solid ${plan.color}` : "2px solid rgba(255,255,255,0.1)",
        background: selected ? `rgba(255,255,255,0.07)` : "rgba(255,255,255,0.03)",
        transition: "all 0.15s",
        boxShadow: selected ? `0 0 0 4px ${plan.color}22` : "none",
      }}
    >
      {isPopular && (
        <div style={{
          position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)",
          background: "linear-gradient(90deg,#7c3aed,#a855f7)",
          color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 12px", borderRadius: 20,
          letterSpacing: "0.5px", whiteSpace: "nowrap",
        }}>
          MOST POPULAR
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 800, color: plan.color }}>
            {plan.emoji} {plan.name}
          </p>
          <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{plan.tagline}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1 }}>
            ${price.toLocaleString()}
          </p>
          <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>/mo</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10 }}>
        {plan.features.slice(0, 3).map(f => (
          <div key={f} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <i className="fa-solid fa-check" style={{ fontSize: 10, color: plan.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{f}</span>
          </div>
        ))}
      </div>

      <div style={{
        padding: "8px 10px", borderRadius: 8,
        background: `${plan.color}18`, border: `1px solid ${plan.color}33`,
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <i className={`fa-solid ${plan.coolFeature.icon}`} style={{ fontSize: 11, color: plan.color }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: plan.color }}>{plan.coolFeature.label}</span>
      </div>

      {selected && (
        <div style={{
          position: "absolute", top: 14, right: 14,
          width: 20, height: 20, borderRadius: "50%",
          background: plan.color,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <i className="fa-solid fa-check" style={{ fontSize: 9, color: "#fff" }} />
        </div>
      )}
    </div>
  );
}

// ── Main wizard ───────────────────────────────────────────────────────────────

export default function OnboardingWizard({ firstName }: Props) {
  const router = useRouter();
  const [phase, setPhase]           = useState(1);
  const [billingCycle, setCycle]    = useState<BillingCycle>("annual");
  const [selectedPlan, setPlan]     = useState<PlanId>("growth");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCvc]           = useState("");
  const [cardZip, setZip]           = useState("");
  const [cardName, setCardName]     = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  const planIds: PlanId[] = ["starter", "growth", "pro"];

  function formatCardNumber(v: string) {
    return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  }
  function formatExpiry(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
  }

  async function handleCheckout() {
    if (!cardNumber.replace(/\s/g, "") || !cardExpiry || !cardCvc || !cardZip || !cardName) {
      setError("Please fill in all payment fields.");
      return;
    }
    setLoading(true);
    setError("");
    const res  = await fetch("/api/stripe/checkout", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        plan:        selectedPlan,
        billingCycle,
        cardNumber:  cardNumber.replace(/\s/g, ""),
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
  }

  const plan = PLANS[selectedPlan];
  const price = billingCycle === "annual" ? plan.annualMonthly : plan.monthlyPrice;

  // ── Input style ─────────────────────────────────────────────────────────────
  const inp = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "12px",
    color: "#f1f5f9",
    fontSize: "16px",
    padding: "14px 16px",
    width: "100%",
    outline: "none",
    WebkitAppearance: "none" as const,
  };

  // ── Phase 1: How it works ────────────────────────────────────────────────────
  const Phase1 = (
    <div>
      <div style={{ marginBottom: 28, textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>⚡</div>
        <h1 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
          Never lose a lead again,<br />{firstName}
        </h1>
        <p style={{ margin: 0, fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
          ClozeFlow turns every inquiry into<br />an automatic follow-up machine.
        </p>
      </div>

      <div style={{
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20, padding: "20px 16px", marginBottom: 24,
      }}>
        <p style={{ margin: "0 0 16px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
          Your automated lead pipeline
        </p>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", flexWrap: "wrap", gap: 4 }}>
          <PipelineStep emoji="🧑" label="Lead Added" />
          <PipelineStep emoji="📧" label="Auto Email" />
          <PipelineStep emoji="📋" label="Project Form" />
          <PipelineStep emoji="📅" label="Booking" />
          <PipelineStep emoji="🏆" label="Job Won!" isLast />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {[
          { icon: "fa-bolt-lightning", color: "#ea580c", title: "Instant response", desc: "Email sent within 60 seconds of a lead coming in — before your competitor even picks up the phone." },
          { icon: "fa-robot",          color: "#7c3aed", title: "Fully automated",  desc: "Follow-ups, project forms, booking requests — all on autopilot while you're on the job." },
          { icon: "fa-chart-line",     color: "#0891b2", title: "AI lead scoring",  desc: "Every lead gets a score so you always know who to call first." },
        ].map(item => (
          <div key={item.icon} style={{
            display: "flex", alignItems: "flex-start", gap: 12,
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14, padding: "14px 16px",
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: `${item.color}1a`, border: `1px solid ${item.color}33`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <i className={`fa-solid ${item.icon}`} style={{ fontSize: 15, color: item.color }} />
            </div>
            <div>
              <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700, color: "#fff" }}>{item.title}</p>
              <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Phase 2: Lead journey ────────────────────────────────────────────────────
  const Phase2 = (
    <div>
      <div style={{ marginBottom: 28, textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🗺️</div>
        <h1 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
          From cold to booked<br />in 48 hours
        </h1>
        <p style={{ margin: 0, fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
          Here's what happens automatically<br />the moment a lead comes in.
        </p>
      </div>

      <div style={{
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20, padding: "20px", marginBottom: 24,
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        <TimelineRow time="0 minutes"  text="Lead fills out your intake form or you add them manually" done />
        <TimelineRow time="&lt; 1 min" text="ClozeFlow sends a branded confirmation email instantly" done />
        <TimelineRow time="24 hours"   text="Follow-up with a link to submit project details & photos" done />
        <TimelineRow time="48 hours"   text="Booking request sent — lead picks a consultation time" done />
        <TimelineRow time="You show up" text="Consultation confirmed. You close the job. 🏆" done />
      </div>

      <div style={{
        background: "linear-gradient(135deg, rgba(234,88,12,0.12), rgba(249,115,22,0.06))",
        border: "1px solid rgba(234,88,12,0.2)", borderRadius: 16, padding: "16px 18px",
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: "rgba(234,88,12,0.15)", border: "1px solid rgba(234,88,12,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <i className="fa-solid fa-stopwatch" style={{ fontSize: 18, color: "#fb923c" }} />
        </div>
        <div>
          <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 800, color: "#fb923c" }}>Speed = money</p>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
            Contractors who follow up within 5 minutes convert 21× more than those who wait a day.
          </p>
        </div>
      </div>
    </div>
  );

  // ── Phase 3: ROI ─────────────────────────────────────────────────────────────
  const Phase3 = (
    <div>
      <div style={{ marginBottom: 28, textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>💰</div>
        <h1 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
          One deal pays for<br />a full year
        </h1>
        <p style={{ margin: 0, fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
          Most contractors close 3–5 extra jobs per month<br />just from faster follow-ups.
        </p>
      </div>

      {/* Comparison */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        <div style={{
          padding: "20px 16px", borderRadius: 18, textAlign: "center",
          background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)",
        }}>
          <i className="fa-solid fa-credit-card" style={{ fontSize: 22, color: "#f87171", marginBottom: 10 }} />
          <p style={{ margin: "8px 0 4px", fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>ClozeFlow cost</p>
          <p style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#f87171" }}>$99</p>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>per month</p>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>= $1,188 / year</p>
        </div>
        <div style={{
          padding: "20px 16px", borderRadius: 18, textAlign: "center",
          background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)",
        }}>
          <i className="fa-solid fa-briefcase" style={{ fontSize: 22, color: "#4ade80", marginBottom: 10 }} />
          <p style={{ margin: "8px 0 4px", fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Average job value</p>
          <p style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#4ade80" }}>$5,000</p>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>per job</p>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>$60,000+ / year</p>
        </div>
      </div>

      {/* ROI badge */}
      <div style={{
        background: "linear-gradient(135deg, rgba(234,88,12,0.15), rgba(124,58,237,0.1))",
        border: "1px solid rgba(234,88,12,0.25)", borderRadius: 18, padding: "20px",
        textAlign: "center", marginBottom: 24,
      }}>
        <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "1px" }}>
          Break-even point
        </p>
        <p style={{ margin: "0 0 4px", fontSize: 38, fontWeight: 900, color: "#fb923c" }}>
          1 extra job
        </p>
        <p style={{ margin: "0 0 12px", fontSize: 15, color: "rgba(255,255,255,0.6)" }}>
          closes the entire year of ClozeFlow
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
          {[["30×", "Avg. ROI"], ["48%", "Faster close"], ["5 min", "Response time"]].map(([val, lbl]) => (
            <div key={lbl} style={{ textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#fff" }}>{val}</p>
              <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{lbl}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Phase 4: Pricing ─────────────────────────────────────────────────────────
  const Phase4 = (
    <div>
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 900, color: "#fff" }}>
          Choose your plan
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.45)" }}>
          Cancel anytime. Billed {billingCycle === "annual" ? "annually" : "monthly"}.
        </p>
      </div>

      {/* Cycle toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
        {(["annual", "monthly"] as BillingCycle[]).map(c => (
          <button
            key={c}
            onClick={() => setCycle(c)}
            style={{
              padding: "7px 18px", borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none",
              background: billingCycle === c ? "linear-gradient(90deg,#ea580c,#f97316)" : "rgba(255,255,255,0.07)",
              color: billingCycle === c ? "#fff" : "rgba(255,255,255,0.5)",
              transition: "all 0.15s",
            }}
          >
            {c === "annual" ? "Annual (save 30%)" : "Monthly"}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {planIds.map(id => (
          <PlanCard
            key={id}
            id={id}
            cycle={billingCycle}
            selected={selectedPlan === id}
            onSelect={() => setPlan(id)}
          />
        ))}
      </div>

      {billingCycle === "annual" && (
        <div style={{
          padding: "12px 16px", borderRadius: 12, marginBottom: 20,
          background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.18)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <i className="fa-solid fa-tag" style={{ fontSize: 13, color: "#4ade80" }} />
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
            Annual billing saves you <strong style={{ color: "#4ade80" }}>30%</strong> vs month-to-month.
          </span>
        </div>
      )}
    </div>
  );

  // ── Phase 5: Checkout ────────────────────────────────────────────────────────
  const Phase5 = (
    <div>
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 10 }}>🔐</div>
        <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 900, color: "#fff" }}>
          Complete your subscription
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.45)" }}>
          Secured by Stripe
        </p>
      </div>

      {/* Plan summary */}
      <div style={{
        background: `${plan.color}15`, border: `1px solid ${plan.color}30`,
        borderRadius: 16, padding: "16px 18px", marginBottom: 20,
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{
          width: 46, height: 46, borderRadius: 12, flexShrink: 0,
          background: `${plan.color}22`, border: `1px solid ${plan.color}40`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
        }}>{plan.emoji}</div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 800, color: "#fff" }}>
            {plan.name} Plan
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
            {billingCycle === "annual" ? "Billed annually" : "Billed monthly"}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: plan.color }}>
            ${price.toLocaleString()}<span style={{ fontSize: 13, fontWeight: 500 }}>/mo</span>
          </p>
          {billingCycle === "annual" && (
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
              ${(price * 12).toLocaleString()} billed today
            </p>
          )}
        </div>
      </div>

      {/* Test mode notice */}
      <div style={{
        padding: "10px 14px", borderRadius: 10, marginBottom: 18,
        background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <i className="fa-solid fa-flask" style={{ fontSize: 12, color: "#fbbf24" }} />
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
          <strong style={{ color: "#fbbf24" }}>Test mode</strong> — any card details will work.
        </span>
      </div>

      {error && (
        <div style={{ marginBottom: 14, padding: "12px 14px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Card form */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>
            Name on card
          </label>
          <input
            style={inp} placeholder="Jake Rivera"
            value={cardName} onChange={e => setCardName(e.target.value)}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>
            Card number
          </label>
          <input
            style={inp} placeholder="4242 4242 4242 4242" inputMode="numeric"
            value={cardNumber}
            onChange={e => setCardNumber(formatCardNumber(e.target.value))}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>Expiry</label>
            <input style={inp} placeholder="MM / YY" inputMode="numeric" value={cardExpiry} onChange={e => setCardExpiry(formatExpiry(e.target.value))} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>CVC</label>
            <input style={inp} placeholder="123" inputMode="numeric" maxLength={4} value={cardCvc} onChange={e => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>ZIP</label>
            <input style={inp} placeholder="90210" inputMode="numeric" maxLength={5} value={cardZip} onChange={e => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))} />
          </div>
        </div>
      </div>
    </div>
  );

  const phases = [Phase1, Phase2, Phase3, Phase4, Phase5];

  // ── CTAs ─────────────────────────────────────────────────────────────────────
  const isLastPhase  = phase === PHASE_COUNT;
  const isPricingPhase = phase === 4;

  function handleNext() {
    if (phase < PHASE_COUNT) setPhase(p => p + 1);
  }

  const ctaLabel = isLastPhase
    ? (loading ? "Starting your subscription…" : `Subscribe to ${plan.name} — $${price.toLocaleString()}/mo`)
    : isPricingPhase
      ? `Continue with ${PLANS[selectedPlan].name} →`
      : phase === 3
        ? "Let's pick a plan →"
        : "Got it, next →";

  const ctaBg = isLastPhase
    ? `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`
    : "linear-gradient(90deg,#ea580c,#f97316)";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", minHeight: "100vh", padding: "32px 20px 60px" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, justifyContent: "center" }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#ea580c,#f97316)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg style={{ width: 16, height: 16, color: "#fff" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span style={{ fontSize: 17, fontWeight: 900, color: "#fff", letterSpacing: "-0.3px" }}>
            Cloze<span style={{ color: "#ea580c" }}>Flow</span>
          </span>
        </div>

        {/* Step dots */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 32 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <div
              key={n}
              style={{
                width: n === phase ? 24 : 8, height: 8, borderRadius: 4,
                background: n < phase ? "#ea580c" : n === phase ? "linear-gradient(90deg,#ea580c,#f97316)" : "rgba(255,255,255,0.15)",
                transition: "all 0.3s",
              }}
            />
          ))}
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: 4 }}>
            {phase < 4 ? `${phase} of 3` : phase === 4 ? "Pricing" : "Checkout"}
          </span>
        </div>

        {/* Phase content */}
        <div key={phase} style={{ animation: "fadeInUp 0.25s ease" }}>
          {phases[phase - 1]}
        </div>

        {/* CTA button */}
        <button
          onClick={isLastPhase ? handleCheckout : handleNext}
          disabled={loading}
          style={{
            width: "100%", padding: "17px", borderRadius: 16, border: "none",
            background: ctaBg,
            color: "#fff", fontSize: 15, fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.75 : 1,
            boxShadow: "0 4px 20px rgba(234,88,12,0.35)",
            marginBottom: 16,
          }}
        >
          {ctaLabel}
        </button>

        {/* Skip (phases 1-3 only) */}
        {phase < 4 && (
          <button
            onClick={() => setPhase(4)}
            style={{ width: "100%", background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 13, cursor: "pointer", padding: "8px" }}
          >
            Skip intro →
          </button>
        )}

        {/* Back (phase 2+) */}
        {phase > 1 && (
          <button
            onClick={() => setPhase(p => p - 1)}
            style={{
              display: "flex", alignItems: "center", gap: 6, margin: "12px auto 0",
              background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 13, cursor: "pointer",
            }}
          >
            <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} />
            Back
          </button>
        )}

      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
