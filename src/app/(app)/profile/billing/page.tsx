"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PLANS, cardBrandIcon, type PlanId, type BillingCycle, type Subscription } from "@/lib/subscriptions";
import { useRouter } from "next/navigation";

const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";

const PLAN_ORDER: PlanId[] = ["starter", "growth", "pro"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function TabBar({ active }: { active: "account" | "billing" | "flyer" }) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: `1px solid ${BORDER}`, paddingBottom: 0 }}>
      {([
        { id: "account", label: "Account",         href: "/profile"         },
        { id: "billing", label: "Billing",         href: "/profile/billing" },
        { id: "flyer",   label: "Flyer Marketing", href: "/profile/flyer"   },
      ] as const).map(tab => (
        <Link
          key={tab.id}
          href={tab.href}
          style={{
            padding: "10px 16px", fontSize: 14, fontWeight: 700,
            textDecoration: "none",
            color: active === tab.id ? "#D35400" : MUTED,
            borderBottom: active === tab.id ? "2px solid #D35400" : "2px solid transparent",
            marginBottom: -1,
            transition: "color 0.15s",
            whiteSpace: "nowrap",
          }}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

export default function BillingPage() {
  const router                      = useRouter();
  const [sub, setSub]               = useState<Subscription | null | "loading">("loading");
  const [changing, setChanging]     = useState(false);
  const [upgradePlan, setUpgradePlan] = useState<PlanId | null>(null);
  const [upgradeCycle, setUpgradeCycle] = useState<BillingCycle>("annual");
  const [upgradeError, setUpgradeError] = useState("");
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [digestEnabled, setDigestEnabled] = useState(true);

  useEffect(() => {
    fetch("/api/stripe/subscription")
      .then(r => r.json())
      .then(d => setSub(d.subscription ?? null))
      .catch(() => setSub(null));
  }, []);

  async function handlePlanChange() {
    if (!upgradePlan) return;
    setUpgradeLoading(true);
    setUpgradeError("");
    const res = await fetch("/api/stripe/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: upgradePlan, billingCycle: upgradeCycle }),
    });
    const body = await res.json().catch(() => ({}));
    setUpgradeLoading(false);
    if (!res.ok) { setUpgradeError(body.error ?? "Plan change failed."); return; }
    setChanging(false);
    router.refresh();
    fetch("/api/stripe/subscription").then(r => r.json()).then(d => setSub(d.subscription ?? null));
  }

  if (sub === "loading") {
    return (
      <div>
        <TabBar active="billing" />
        <div style={{ padding: "60px 0", textAlign: "center", color: MUTED, fontSize: 14 }}>
          Loading billing info…
        </div>
      </div>
    );
  }

  if (!sub) {
    return (
      <div>
        <TabBar active="billing" />
        <div style={{
          background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 20,
          padding: "40px 24px", textAlign: "center",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 900, color: TEXT }}>No active plan</h2>
          <p style={{ margin: "0 0 24px", fontSize: 15, color: MUTED }}>
            Choose a plan to unlock your full pipeline.
          </p>
          <Link
            href="/onboarding"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "linear-gradient(135deg,#D35400,#e8641c)",
              color: "#fff", fontSize: 15, fontWeight: 700,
              padding: "13px 28px", borderRadius: 14, textDecoration: "none",
              boxShadow: "0 4px 14px rgba(211,84,0,0.25)",
            }}
          >
            <i className="fa-solid fa-rocket" />
            Pick a plan
          </Link>
        </div>
      </div>
    );
  }

  const plan        = PLANS[sub.plan as PlanId];
  const currentIdx  = PLAN_ORDER.indexOf(sub.plan as PlanId);
  const upgradeable = PLAN_ORDER.slice(currentIdx + 1);
  const downgradeable = PLAN_ORDER.slice(0, currentIdx);
  const otherPlans = PLAN_ORDER.filter(id => id !== sub.plan as PlanId);

  return (
    <div>
      <TabBar active="billing" />

      {/* Plan card */}
      <div style={{
        background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 20,
        overflow: "hidden", marginBottom: 16,
      }}>
        {/* Header band */}
        <div style={{
          background: `linear-gradient(135deg, ${plan.color}18, ${plan.color}08)`,
          borderBottom: `1px solid ${plan.color}22`,
          padding: "20px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: `${plan.color}20`, border: `1px solid ${plan.color}35`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
            }}>{plan.emoji}</div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: TEXT }}>{plan.name} Plan</p>
                <span style={{
                  fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20,
                  background: plan.color, color: "#fff",
                }}>
                  {sub.status.toUpperCase()}
                </span>
              </div>
              <p style={{ margin: "3px 0 0", fontSize: 13, color: MUTED }}>
                {sub.billing_cycle === "annual" ? "Annual billing" : "Monthly billing"} ·{" "}
                ${(sub.billing_cycle === "annual" ? plan.annualMonthly : plan.monthlyPrice).toLocaleString()}/mo
              </p>
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{ margin: 0, fontSize: 26, fontWeight: 900, color: plan.color }}>
              ${(sub.billing_cycle === "annual" ? plan.annualMonthly : plan.monthlyPrice).toLocaleString()}
            </p>
            <p style={{ margin: "1px 0 0", fontSize: 11, color: MUTED }}>per month</p>
          </div>
        </div>

        {/* Details */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {sub.current_period_end && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f9f7f4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="fa-solid fa-calendar-check" style={{ fontSize: 15, color: "#27AE60" }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.5px" }}>Next renewal</p>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: TEXT }}>{formatDate(sub.current_period_end)}</p>
              </div>
            </div>
          )}

          {sub.card_last4 && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f9f7f4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className={cardBrandIcon(sub.card_brand ?? "card")} style={{ fontSize: 20, color: TEXT }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.5px" }}>Card on file</p>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: TEXT }}>
                  {(sub.card_brand ?? "Card").charAt(0).toUpperCase() + (sub.card_brand ?? "card").slice(1)} ending ···· {sub.card_last4}
                </p>
              </div>
            </div>
          )}

          {/* Features list */}
          <div style={{ marginTop: 4 }}>
            <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.8px" }}>Your plan includes</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" }}>
              {plan.features.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-check" style={{ fontSize: 10, color: plan.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#44403c" }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Cool feature card ─────────────────────────────────────────────── */}
      <div style={{
        background: "#fff", border: `1px solid ${plan.color}30`,
        borderLeft: `4px solid ${plan.color}`,
        borderRadius: "0 16px 16px 0",
        padding: "18px 20px", marginBottom: 16,
        display: "flex", alignItems: "flex-start", gap: 14,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: `${plan.color}15`, border: `1px solid ${plan.color}25`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <i className={`fa-solid ${plan.coolFeature.icon}`} style={{ fontSize: 18, color: plan.color }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: TEXT }}>{plan.coolFeature.label}</p>
            <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: plan.color, color: "#fff" }}>
              {plan.name.toUpperCase()}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{plan.coolFeature.desc}</p>

          {/* Growth: digest toggle */}
          {sub.plan === "growth" && (
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={() => setDigestEnabled(v => !v)}
                style={{
                  position: "relative", width: 44, height: 24, borderRadius: 12, border: "none",
                  background: digestEnabled ? "linear-gradient(90deg,#7c3aed,#a855f7)" : "rgba(0,0,0,0.12)",
                  cursor: "pointer", flexShrink: 0, transition: "background 0.2s",
                }}
              >
                <div style={{
                  position: "absolute", top: 2, width: 20, height: 20, borderRadius: "50%",
                  background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                  transition: "left 0.2s", left: digestEnabled ? 22 : 2,
                }} />
              </button>
              <span style={{ fontSize: 13, color: digestEnabled ? "#7c3aed" : MUTED, fontWeight: 600 }}>
                {digestEnabled ? "Daily digest active — emails every morning at 7 AM" : "Daily digest paused"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Change plan button ──────────────────────────────────────────────── */}
      {!changing && (
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px 24px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <p style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 800, color: TEXT }}>
                <i className="fa-solid fa-arrows-up-down" style={{ marginRight: 7, color: "#D35400" }} />
                Change your plan
              </p>
              <p style={{ margin: 0, fontSize: 13, color: MUTED }}>
                {upgradeable.length > 0 ? "Upgrade for more power, or downgrade to save." : "Downgrade to a lighter plan."}
              </p>
            </div>
            <button
              onClick={() => {
                setChanging(true);
                setUpgradePlan(upgradeable.length > 0 ? upgradeable[0] : downgradeable[downgradeable.length - 1]);
              }}
              style={{
                flexShrink: 0, padding: "10px 18px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg,#D35400,#e8641c)",
                color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 3px 12px rgba(211,84,0,0.2)",
              }}
            >
              Change plan →
            </button>
          </div>
        </div>
      )}

      {/* Change plan flow */}
      {changing && (
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: TEXT }}>Choose your new plan</p>
            <button onClick={() => { setChanging(false); setUpgradeError(""); }} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: 13 }}>
              Cancel
            </button>
          </div>

          {/* Billing cycle */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {(["annual", "monthly"] as BillingCycle[]).map(c => (
              <button
                key={c}
                onClick={() => setUpgradeCycle(c)}
                style={{
                  padding: "7px 16px", borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: "pointer",
                  border: upgradeCycle === c ? "none" : `1px solid ${BORDER}`,
                  background: upgradeCycle === c ? "linear-gradient(90deg,#D35400,#e8641c)" : "#fff",
                  color: upgradeCycle === c ? "#fff" : MUTED,
                }}
              >
                {c === "annual" ? "Annual (save 30%)" : "Monthly"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {otherPlans.map(id => {
              const p         = PLANS[id];
              const newPrice  = upgradeCycle === "annual" ? p.annualMonthly : p.monthlyPrice;
              const curPrice  = upgradeCycle === "annual" ? plan.annualMonthly : plan.monthlyPrice;
              const isSelected = upgradePlan === id;
              const isUpgrade  = PLAN_ORDER.indexOf(id) > currentIdx;
              return (
                <div
                  key={id}
                  onClick={() => setUpgradePlan(id)}
                  style={{
                    padding: "14px 16px", borderRadius: 14, cursor: "pointer",
                    border: isSelected ? `2px solid ${p.color}` : `1px solid ${BORDER}`,
                    background: isSelected ? `${p.color}08` : "#fff",
                    display: "flex", alignItems: "center", gap: 12,
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{p.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: TEXT }}>{p.name}</p>
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20,
                        background: isUpgrade ? "rgba(211,84,0,0.1)" : "rgba(100,116,139,0.1)",
                        color: isUpgrade ? "#D35400" : "#64748b",
                      }}>
                        {isUpgrade ? "↑ UPGRADE" : "↓ DOWNGRADE"}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: MUTED }}>{p.tagline}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: p.color }}>
                      ${newPrice.toLocaleString()}<span style={{ fontSize: 11, fontWeight: 500 }}>/mo</span>
                    </p>
                    <p style={{ margin: 0, fontSize: 10, color: newPrice > curPrice ? "#27AE60" : newPrice < curPrice ? "#64748b" : MUTED }}>
                      {newPrice > curPrice
                        ? `+$${(newPrice - curPrice).toLocaleString()} more`
                        : newPrice < curPrice
                        ? `-$${(curPrice - newPrice).toLocaleString()} less`
                        : "same price"}
                    </p>
                  </div>
                  {isSelected && <i className="fa-solid fa-circle-check" style={{ color: p.color, fontSize: 18, flexShrink: 0 }} />}
                </div>
              );
            })}
          </div>

          {/* Downgrade warning */}
          {upgradePlan && PLAN_ORDER.indexOf(upgradePlan) < currentIdx && (
            <div style={{
              marginBottom: 14, padding: "12px 14px", borderRadius: 10,
              background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)",
              display: "flex", alignItems: "flex-start", gap: 8,
            }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 13, color: "#d97706", marginTop: 1, flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: 13, color: "#92400e", lineHeight: 1.5 }}>
                Downgrading to <strong>{PLANS[upgradePlan].name}</strong> takes effect at the end of your current billing period.
                {PLANS[upgradePlan].leadLimit ? ` Your lead limit will drop to ${PLANS[upgradePlan].leadLimit}/mo.` : ""}
              </p>
            </div>
          )}

          {upgradeError && (
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "#dc2626" }}>{upgradeError}</p>
          )}

          <p style={{ margin: "0 0 12px", fontSize: 12, color: MUTED }}>
            {upgradePlan && PLAN_ORDER.indexOf(upgradePlan) > currentIdx
              ? "Your saved card on file will be charged. Change takes effect immediately."
              : "No charge today. Downgrade takes effect at end of billing period."}
          </p>

          <button
            onClick={handlePlanChange}
            disabled={upgradeLoading || !upgradePlan}
            style={{
              width: "100%", padding: "14px", borderRadius: 12, border: "none",
              background: upgradePlan ? `linear-gradient(135deg, ${PLANS[upgradePlan].color}, ${PLANS[upgradePlan].color}cc)` : "#e6e2db",
              color: "#fff", fontSize: 15, fontWeight: 700,
              cursor: upgradeLoading || !upgradePlan ? "not-allowed" : "pointer",
              opacity: upgradeLoading ? 0.75 : 1,
            }}
          >
            {upgradeLoading
              ? "Updating…"
              : upgradePlan
              ? `${PLAN_ORDER.indexOf(upgradePlan) > currentIdx ? "Upgrade" : "Downgrade"} to ${PLANS[upgradePlan].name}`
              : "Select a plan above"}
          </button>
        </div>
      )}

      {/* Support */}
      <div style={{
        background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16,
        padding: "20px 24px", display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: "rgba(211,84,0,0.06)", border: "1px solid rgba(211,84,0,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <i className="fa-solid fa-headset" style={{ fontSize: 18, color: "#D35400" }} />
        </div>
        <div>
          <p style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 700, color: TEXT }}>Questions about your plan?</p>
          <p style={{ margin: 0, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
            We're happy to help. Reach out anytime at{" "}
            <a href="mailto:hello@clozeflow.com" style={{ color: "#D35400", fontWeight: 600, textDecoration: "none" }}>
              hello@clozeflow.com
            </a>
          </p>
        </div>
      </div>

    </div>
  );
}
