"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLANS, type PlanId, type BillingCycle } from "@/lib/subscriptions";

interface Props { firstName: string }

const PHASE_COUNT = 5;

// ── Brand palette ─────────────────────────────────────────────────────────────
const TEXT    = "#2C3E50";
const MUTED   = "#78716c";
const BORDER  = "#e6e2db";
const SURFACE = "#ffffff";
const ORANGE  = "#D35400";

// ── Helpers ───────────────────────────────────────────────────────────────────

function PipelineStep({ icon, label, isLast }: { icon: React.ReactNode; label: string; isLast?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, flexShrink: 0 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 16, flexShrink: 0,
          background: "rgba(211,84,0,0.07)", border: "1px solid rgba(211,84,0,0.18)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{icon}</div>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: MUTED, textAlign: "center", maxWidth: 70, lineHeight: 1.3 }}>{label}</p>
      </div>
      {!isLast && (
        <div style={{ width: 24, height: 2, background: "rgba(211,84,0,0.3)", margin: "0 4px", marginTop: -16, flexShrink: 0 }} />
      )}
    </div>
  );
}

function TimelineRow({ time, text, done }: { time: string; text: string; done?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: done ? "rgba(211,84,0,0.1)" : "#F9F7F2",
        border: `1px solid ${done ? "rgba(211,84,0,0.25)" : BORDER}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 800,
        color: done ? ORANGE : MUTED,
      }}>
        {done
          ? <i className="fa-solid fa-check" style={{ fontSize: 12 }} />
          : <i className="fa-regular fa-clock" style={{ fontSize: 12 }} />
        }
      </div>
      <div>
        <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color: ORANGE, textTransform: "uppercase", letterSpacing: "1px" }}>{time}</p>
        <p style={{ margin: 0, fontSize: 14, color: TEXT, lineHeight: 1.5 }}>{text}</p>
      </div>
    </div>
  );
}

// ── Plan icon (no emoji) ──────────────────────────────────────────────────────
function PlanIcon({ id }: { id: PlanId }) {
  if (id === "starter") return (
    <svg style={{ width: 20, height: 20, color: ORANGE }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
  if (id === "growth") return (
    <svg style={{ width: 20, height: 20, color: ORANGE }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  );
  return (
    <svg style={{ width: 20, height: 20, color: TEXT }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}

// ── Plan card colors ──────────────────────────────────────────────────────────
function planColor(id: PlanId) {
  if (id === "pro") return TEXT;
  return ORANGE;
}

function PlanCard({
  id, cycle, selected, onSelect,
}: {
  id: PlanId; cycle: BillingCycle; selected: boolean; onSelect: () => void;
}) {
  const plan  = PLANS[id];
  const price = cycle === "annual" ? plan.annualMonthly : plan.monthlyPrice;
  const color = planColor(id);
  const isPopular = id === "growth";

  return (
    <div
      onClick={onSelect}
      style={{
        position: "relative", padding: "20px 18px", borderRadius: 18, cursor: "pointer",
        border: selected ? `2px solid ${color}` : `1.5px solid ${BORDER}`,
        background: selected ? (id === "pro" ? "rgba(44,62,80,0.04)" : "rgba(211,84,0,0.04)") : SURFACE,
        transition: "all 0.15s",
        boxShadow: selected ? `0 0 0 3px ${color}18` : "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {isPopular && (
        <div style={{
          position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)",
          background: "linear-gradient(90deg,#D35400,#e8641c)",
          color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 12px", borderRadius: 20,
          letterSpacing: "0.5px", whiteSpace: "nowrap",
        }}>
          MOST POPULAR
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: id === "pro" ? "rgba(44,62,80,0.08)" : "rgba(211,84,0,0.08)",
            border: `1px solid ${id === "pro" ? "rgba(44,62,80,0.15)" : "rgba(211,84,0,0.2)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <PlanIcon id={id} />
          </div>
          <div>
            <p style={{ margin: "0 0 1px", fontSize: 14, fontWeight: 800, color }}>
              {plan.name}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: MUTED }}>{plan.tagline}</p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: TEXT, lineHeight: 1 }}>
            ${price.toLocaleString()}
          </p>
          <p style={{ margin: 0, fontSize: 10, color: MUTED }}>/mo</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10 }}>
        {plan.features.slice(0, 3).map(f => (
          <div key={f} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <i className="fa-solid fa-check" style={{ fontSize: 10, color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: MUTED }}>{f}</span>
          </div>
        ))}
      </div>

      <div style={{
        padding: "8px 10px", borderRadius: 8,
        background: id === "pro" ? "rgba(44,62,80,0.06)" : "rgba(211,84,0,0.07)",
        border: `1px solid ${id === "pro" ? "rgba(44,62,80,0.12)" : "rgba(211,84,0,0.15)"}`,
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <i className={`fa-solid ${plan.coolFeature.icon}`} style={{ fontSize: 11, color }} />
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{plan.coolFeature.label}</span>
      </div>

      {selected && (
        <div style={{
          position: "absolute", top: 14, right: 14,
          width: 20, height: 20, borderRadius: "50%",
          background: color,
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

  const plan  = PLANS[selectedPlan];
  const price = billingCycle === "annual" ? plan.annualMonthly : plan.monthlyPrice;
  const planC = planColor(selectedPlan);

  // ── Input style ──────────────────────────────────────────────────────────────
  const inp: React.CSSProperties = {
    background: SURFACE,
    border: `1px solid ${BORDER}`,
    borderRadius: "12px",
    color: TEXT,
    fontSize: "16px",
    padding: "14px 16px",
    width: "100%",
    outline: "none",
    WebkitAppearance: "none",
  };

  // ── Phase 1: How it works ────────────────────────────────────────────────────
  const Phase1 = (
    <div>
      <div style={{ marginBottom: 28, textAlign: "center" }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18, margin: "0 auto 16px",
          background: "rgba(211,84,0,0.09)", border: "1px solid rgba(211,84,0,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <i className="fa-solid fa-bolt-lightning" style={{ fontSize: 26, color: ORANGE }} />
        </div>
        <h1 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 900, color: TEXT, lineHeight: 1.2 }}>
          Never lose a lead again,<br />{firstName}
        </h1>
        <p style={{ margin: 0, fontSize: 15, color: MUTED, lineHeight: 1.6 }}>
          ClozeFlow turns every inquiry into<br />an automatic follow-up machine.
        </p>
      </div>

      <div style={{
        background: SURFACE, border: `1px solid ${BORDER}`,
        borderRadius: 20, padding: "20px 16px", marginBottom: 24,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}>
        <p style={{ margin: "0 0 16px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: MUTED, textAlign: "center" }}>
          Your automated lead pipeline
        </p>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", flexWrap: "wrap", gap: 4 }}>
          <PipelineStep icon={<i className="fa-solid fa-user" style={{ fontSize: 18, color: ORANGE }} />} label="Lead Added" />
          <PipelineStep icon={<i className="fa-solid fa-envelope" style={{ fontSize: 18, color: ORANGE }} />} label="Auto Email" />
          <PipelineStep icon={<i className="fa-solid fa-clipboard-list" style={{ fontSize: 18, color: ORANGE }} />} label="Project Form" />
          <PipelineStep icon={<i className="fa-solid fa-calendar" style={{ fontSize: 18, color: ORANGE }} />} label="Booking" />
          <PipelineStep icon={<i className="fa-solid fa-trophy" style={{ fontSize: 18, color: ORANGE }} />} label="Job Won!" isLast />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {[
          { icon: "fa-bolt-lightning", title: "Instant response", desc: "Email sent within 60 seconds of a lead coming in — before your competitor even picks up the phone." },
          { icon: "fa-robot",          title: "Fully automated",  desc: "Follow-ups, project forms, booking requests — all on autopilot while you're on the job." },
          { icon: "fa-chart-line",     title: "AI lead scoring",  desc: "Every lead gets a score so you always know who to call first." },
        ].map(item => (
          <div key={item.icon} style={{
            display: "flex", alignItems: "flex-start", gap: 12,
            background: SURFACE, border: `1px solid ${BORDER}`,
            borderRadius: 14, padding: "14px 16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: "rgba(211,84,0,0.08)", border: "1px solid rgba(211,84,0,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <i className={`fa-solid ${item.icon}`} style={{ fontSize: 15, color: ORANGE }} />
            </div>
            <div>
              <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700, color: TEXT }}>{item.title}</p>
              <p style={{ margin: 0, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{item.desc}</p>
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
        <div style={{
          width: 64, height: 64, borderRadius: 18, margin: "0 auto 16px",
          background: "rgba(211,84,0,0.09)", border: "1px solid rgba(211,84,0,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <i className="fa-solid fa-route" style={{ fontSize: 24, color: ORANGE }} />
        </div>
        <h1 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 900, color: TEXT, lineHeight: 1.2 }}>
          From cold to booked<br />in 48 hours
        </h1>
        <p style={{ margin: 0, fontSize: 15, color: MUTED, lineHeight: 1.6 }}>
          Here&apos;s what happens automatically<br />the moment a lead comes in.
        </p>
      </div>

      <div style={{
        background: SURFACE, border: `1px solid ${BORDER}`,
        borderRadius: 20, padding: "20px", marginBottom: 24,
        display: "flex", flexDirection: "column", gap: 16,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}>
        <TimelineRow time="0 minutes"   text="Lead fills out your intake form or you add them manually" done />
        <TimelineRow time="&lt; 1 min"  text="ClozeFlow sends a branded confirmation email instantly" done />
        <TimelineRow time="24 hours"    text="Follow-up with a link to submit project details &amp; photos" done />
        <TimelineRow time="48 hours"    text="Booking request sent — lead picks a consultation time" done />
        <TimelineRow time="You show up" text="Consultation confirmed. You close the job." done />
      </div>

      <div style={{
        background: "rgba(211,84,0,0.05)",
        border: "1px solid rgba(211,84,0,0.18)", borderRadius: 16, padding: "16px 18px",
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: "rgba(211,84,0,0.12)", border: "1px solid rgba(211,84,0,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <i className="fa-solid fa-stopwatch" style={{ fontSize: 18, color: ORANGE }} />
        </div>
        <div>
          <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 800, color: ORANGE }}>Speed = money</p>
          <p style={{ margin: 0, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
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
        <div style={{
          width: 64, height: 64, borderRadius: 18, margin: "0 auto 16px",
          background: "rgba(211,84,0,0.09)", border: "1px solid rgba(211,84,0,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <i className="fa-solid fa-chart-column" style={{ fontSize: 24, color: ORANGE }} />
        </div>
        <h1 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 900, color: TEXT, lineHeight: 1.2 }}>
          One deal pays for<br />a full year
        </h1>
        <p style={{ margin: 0, fontSize: 15, color: MUTED, lineHeight: 1.6 }}>
          Most contractors close 3–5 extra jobs per month<br />just from faster follow-ups.
        </p>
      </div>

      {/* Comparison */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        <div style={{
          padding: "20px 16px", borderRadius: 18, textAlign: "center",
          background: SURFACE, border: "1px solid rgba(220,38,38,0.15)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}>
          <i className="fa-solid fa-credit-card" style={{ fontSize: 22, color: "#dc2626", marginBottom: 10 }} />
          <p style={{ margin: "8px 0 4px", fontSize: 12, color: MUTED, fontWeight: 600 }}>ClozeFlow cost</p>
          <p style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#dc2626" }}>$99</p>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: MUTED }}>per month</p>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: MUTED }}>= $1,188 / year</p>
        </div>
        <div style={{
          padding: "20px 16px", borderRadius: 18, textAlign: "center",
          background: SURFACE, border: "1px solid rgba(22,163,74,0.2)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}>
          <i className="fa-solid fa-briefcase" style={{ fontSize: 22, color: "#16a34a", marginBottom: 10 }} />
          <p style={{ margin: "8px 0 4px", fontSize: 12, color: MUTED, fontWeight: 600 }}>Average job value</p>
          <p style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#16a34a" }}>$5,000</p>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: MUTED }}>per job</p>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: MUTED }}>$60,000+ / year</p>
        </div>
      </div>

      {/* ROI badge */}
      <div style={{
        background: "rgba(211,84,0,0.05)",
        border: "1px solid rgba(211,84,0,0.18)", borderRadius: 18, padding: "20px",
        textAlign: "center", marginBottom: 24,
      }}>
        <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "1px" }}>
          Break-even point
        </p>
        <p style={{ margin: "0 0 4px", fontSize: 38, fontWeight: 900, color: ORANGE }}>
          1 extra job
        </p>
        <p style={{ margin: "0 0 12px", fontSize: 15, color: MUTED }}>
          closes the entire year of ClozeFlow
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
          {[["30×", "Avg. ROI"], ["48%", "Faster close"], ["5 min", "Response time"]].map(([val, lbl]) => (
            <div key={lbl} style={{ textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: TEXT }}>{val}</p>
              <p style={{ margin: 0, fontSize: 10, color: MUTED }}>{lbl}</p>
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
        <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 900, color: TEXT }}>
          Choose your plan
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: MUTED }}>
          Cancel anytime. Billed {billingCycle === "annual" ? "annually" : "monthly"}.
        </p>
      </div>

      {/* Cycle toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
        {(["annual", "monthly"] as BillingCycle[]).map(c => (
          <button
            key={c}
            onClick={() => setCycle(c)}
            style={{
              padding: "7px 18px", borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: "pointer",
              border: billingCycle === c ? "none" : `1px solid ${BORDER}`,
              background: billingCycle === c ? "linear-gradient(90deg,#D35400,#e8641c)" : SURFACE,
              color: billingCycle === c ? "#fff" : MUTED,
              transition: "all 0.15s",
              boxShadow: billingCycle === c ? "0 2px 8px rgba(211,84,0,0.25)" : "none",
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
          background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.2)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <i className="fa-solid fa-tag" style={{ fontSize: 13, color: "#16a34a" }} />
          <span style={{ fontSize: 13, color: MUTED }}>
            Annual billing saves you <strong style={{ color: "#16a34a" }}>30%</strong> vs month-to-month.
          </span>
        </div>
      )}
    </div>
  );

  // ── Phase 5: Checkout ────────────────────────────────────────────────────────
  const Phase5 = (
    <div>
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18, margin: "0 auto 16px",
          background: "rgba(211,84,0,0.09)", border: "1px solid rgba(211,84,0,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <i className="fa-solid fa-lock" style={{ fontSize: 24, color: ORANGE }} />
        </div>
        <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 900, color: TEXT }}>
          Complete your subscription
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: MUTED }}>
          Secured by Stripe
        </p>
      </div>

      {/* Plan summary */}
      <div style={{
        background: SURFACE, border: `1px solid ${BORDER}`,
        borderRadius: 16, padding: "16px 18px", marginBottom: 20,
        display: "flex", alignItems: "center", gap: 14,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}>
        <div style={{
          width: 46, height: 46, borderRadius: 12, flexShrink: 0,
          background: selectedPlan === "pro" ? "rgba(44,62,80,0.08)" : "rgba(211,84,0,0.09)",
          border: `1px solid ${selectedPlan === "pro" ? "rgba(44,62,80,0.15)" : "rgba(211,84,0,0.2)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <PlanIcon id={selectedPlan} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 800, color: TEXT }}>
            {plan.name} Plan
          </p>
          <p style={{ margin: 0, fontSize: 13, color: MUTED }}>
            {billingCycle === "annual" ? "Billed annually" : "Billed monthly"}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: planC }}>
            ${price.toLocaleString()}<span style={{ fontSize: 13, fontWeight: 500, color: MUTED }}>/mo</span>
          </p>
          {billingCycle === "annual" && (
            <p style={{ margin: "2px 0 0", fontSize: 11, color: MUTED }}>
              ${(price * 12).toLocaleString()} billed today
            </p>
          )}
        </div>
      </div>

      {/* Test mode notice */}
      <div style={{
        padding: "10px 14px", borderRadius: 10, marginBottom: 18,
        background: "rgba(217,119,6,0.07)", border: "1px solid rgba(217,119,6,0.2)",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <i className="fa-solid fa-flask" style={{ fontSize: 12, color: "#d97706" }} />
        <span style={{ fontSize: 12, color: MUTED }}>
          <strong style={{ color: "#d97706" }}>Test mode</strong> — any card details will work.
        </span>
      </div>

      {error && (
        <div style={{ marginBottom: 14, padding: "12px 14px", borderRadius: 10, background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", color: "#b91c1c", fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Card form */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: MUTED, display: "block", marginBottom: 6 }}>
            Name on card
          </label>
          <input
            style={inp} placeholder="Jake Rivera"
            value={cardName} onChange={e => setCardName(e.target.value)}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: MUTED, display: "block", marginBottom: 6 }}>
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
            <label style={{ fontSize: 12, fontWeight: 600, color: MUTED, display: "block", marginBottom: 6 }}>Expiry</label>
            <input style={inp} placeholder="MM / YY" inputMode="numeric" value={cardExpiry} onChange={e => setCardExpiry(formatExpiry(e.target.value))} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: MUTED, display: "block", marginBottom: 6 }}>CVC</label>
            <input style={inp} placeholder="123" inputMode="numeric" maxLength={4} value={cardCvc} onChange={e => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: MUTED, display: "block", marginBottom: 6 }}>ZIP</label>
            <input style={inp} placeholder="90210" inputMode="numeric" maxLength={5} value={cardZip} onChange={e => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))} />
          </div>
        </div>
      </div>
    </div>
  );

  const phases = [Phase1, Phase2, Phase3, Phase4, Phase5];

  // ── CTAs ─────────────────────────────────────────────────────────────────────
  const isLastPhase    = phase === PHASE_COUNT;
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

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", minHeight: "100vh", padding: "32px 20px 60px" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, justifyContent: "center" }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#D35400,#e8641c)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg style={{ width: 16, height: 16, color: "#fff" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span style={{ fontSize: 17, fontWeight: 900, color: TEXT, letterSpacing: "-0.3px" }}>
            Cloze<span style={{ color: ORANGE }}>Flow</span>
          </span>
        </div>

        {/* Step dots */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 32 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <div
              key={n}
              style={{
                width: n === phase ? 24 : 8, height: 8, borderRadius: 4,
                background: n < phase ? ORANGE : n === phase ? "linear-gradient(90deg,#D35400,#e8641c)" : BORDER,
                transition: "all 0.3s",
              }}
            />
          ))}
          <span style={{ fontSize: 11, color: MUTED, marginLeft: 4 }}>
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
            background: "linear-gradient(135deg,#D35400,#e8641c)",
            color: "#fff", fontSize: 15, fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.75 : 1,
            boxShadow: "0 4px 20px rgba(211,84,0,0.3)",
            marginBottom: 16,
          }}
        >
          {ctaLabel}
        </button>

        {/* Skip (phases 1-3 only) */}
        {phase < 4 && (
          <button
            onClick={() => setPhase(4)}
            style={{ width: "100%", background: "none", border: "none", color: MUTED, fontSize: 13, cursor: "pointer", padding: "8px" }}
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
              background: "none", border: "none", color: MUTED, fontSize: 13, cursor: "pointer",
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
