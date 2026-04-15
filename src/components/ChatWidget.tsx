"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

// ── Types ────────────────────────────────────────────────────────────────────

type QuickReply = { label: string; value: string };

type ChatMessage = {
  id: string;
  role: "bot" | "user";
  text: string;
  buttons?: QuickReply[];
  showForm?: boolean;
};

type Intent = "book_demo" | "speak_expert" | "learn_more" | null;
type ConvStep = "greeting" | "info" | "form" | "submitted";

// ── Conversation scripts ─────────────────────────────────────────────────────

const GREETING_BUTTONS: QuickReply[] = [
  { label: "📅  Book a demo",         value: "book_demo"    },
  { label: "💬  Speak to an expert",  value: "speak_expert" },
  { label: "✨  I want to learn more", value: "learn_more"  },
  { label: "❓  What is ClozeFlow?",   value: "what_is"     },
];

const BRANCH: Record<string, { messages: string[]; nextButtons?: QuickReply[] }> = {
  book_demo: {
    messages: [
      "Great choice! 🎉 Demo slots are filling up fast this week.",
      "Let me grab a few quick details and we'll get you on the calendar — our team will follow up within 2 hours!",
    ],
  },
  speak_expert: {
    messages: [
      "Perfect timing! 💪 Our team loves connecting with contractors who are serious about growing.",
      "Just share a few details and an expert will reach out within 2 hours — zero pressure, all value.",
    ],
  },
  learn_more: {
    messages: [
      "Love it! Here's the quick version ⚡\n\nClozeFlow responds to every lead in under 60 seconds, follows up automatically, scores your pipeline, and books jobs straight to your calendar — all while you're out running crews.",
      "Contractors using ClozeFlow see an average 55% close rate improvement in their first month. 🚀\n\nWant someone from our team to walk through your numbers with you?",
    ],
    nextButtons: [
      { label: "📅  Book a demo",        value: "book_demo"    },
      { label: "💬  Speak to an expert", value: "speak_expert" },
    ],
  },
  what_is: {
    messages: [
      "Great question! ✨\n\nClozeFlow is a lead automation platform built for home service contractors — plumbers, HVAC techs, roofers, electricians, and more.",
      "It responds to every new lead in under 60 seconds, qualifies them with AI scoring, sends follow-up sequences automatically, and books appointments to your calendar. Most contractors recoup the cost on their very first booked job.",
    ],
    nextButtons: [
      { label: "📅  Book a demo",         value: "book_demo"    },
      { label: "💬  Speak to an expert",  value: "speak_expert" },
      { label: "✨  I want to learn more", value: "learn_more"  },
    ],
  },
};

const FORM_INTROS: Record<string, string> = {
  book_demo:    "Amazing — this takes about 30 seconds. 👇",
  speak_expert: "We've got you covered. Fill this in and we'll call or text you. 👇",
  learn_more:   "Awesome! Let's connect you with the right person. 👇",
};

function uid() {
  return Math.random().toString(36).slice(2);
}

function botMsg(text: string, extra?: Partial<ChatMessage>): ChatMessage {
  return { id: uid(), role: "bot", text, ...extra };
}

// ── Avatar ───────────────────────────────────────────────────────────────────

function AvaAvatar({ size = 40 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "linear-gradient(135deg, #D35400 0%, #e8641c 50%, #f59e0b 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 900, color: "#fff",
      boxShadow: "0 2px 8px rgba(211,84,0,0.35)",
      position: "relative",
      userSelect: "none",
    }}>
      A
      <span style={{
        position: "absolute", bottom: 0, right: 0,
        width: size * 0.27, height: size * 0.27, borderRadius: "50%",
        background: "#22c55e", border: "2px solid #fff",
      }} />
    </div>
  );
}

// ── Typing indicator ─────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 16px" }}>
      <AvaAvatar size={30} />
      <div style={{
        background: "#fff", border: "1px solid #e6e2db",
        borderRadius: "18px 18px 18px 4px",
        padding: "10px 16px", display: "flex", gap: 5, alignItems: "center",
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#D35400",
            display: "inline-block",
            animation: `cfDot 1.2s ${i * 0.2}s infinite ease-in-out`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isBot = msg.role === "bot";

  return (
    <div style={{
      display: "flex", gap: 8, flexDirection: isBot ? "row" : "row-reverse",
      padding: "4px 12px",
      animation: "cfFadeUp 0.25s ease both",
    }}>
      {isBot && <div style={{ flexShrink: 0, alignSelf: "flex-end", marginBottom: 2 }}><AvaAvatar size={30} /></div>}
      <div style={{
        maxWidth: "78%",
        background: isBot ? "#fff" : "linear-gradient(135deg,#D35400,#e8641c)",
        color: isBot ? "#2C3E50" : "#fff",
        border: isBot ? "1px solid #e6e2db" : "none",
        borderRadius: isBot ? "18px 18px 18px 4px" : "18px 18px 4px 18px",
        padding: "10px 14px",
        fontSize: 14,
        lineHeight: 1.55,
        boxShadow: isBot ? "0 1px 4px rgba(0,0,0,0.06)" : "0 2px 10px rgba(211,84,0,0.25)",
        whiteSpace: "pre-line",
      }}>
        {msg.text}
      </div>
    </div>
  );
}

// ── Quick reply buttons ───────────────────────────────────────────────────────

function QuickReplies({ buttons, onSelect }: { buttons: QuickReply[]; onSelect: (v: string, l: string) => void }) {
  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: 8,
      padding: "6px 12px 12px 52px",
      animation: "cfFadeUp 0.25s 0.1s ease both", opacity: 1,
    }}>
      {buttons.map(btn => (
        <button
          key={btn.value}
          onClick={() => onSelect(btn.value, btn.label)}
          style={{
            padding: "8px 14px", borderRadius: 20,
            border: "1.5px solid #D35400",
            background: "rgba(211,84,0,0.05)",
            color: "#D35400", fontSize: 13, fontWeight: 600,
            cursor: "pointer", transition: "all 0.15s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "#D35400";
            (e.currentTarget as HTMLButtonElement).style.color = "#fff";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(211,84,0,0.05)";
            (e.currentTarget as HTMLButtonElement).style.color = "#D35400";
          }}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}

// ── Inline form ───────────────────────────────────────────────────────────────

function InlineForm({ onSubmit, submitting }: {
  onSubmit: (data: { name: string; phone: string; email: string }) => void;
  submitting: boolean;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Required";
    if (!phone.trim()) e.phone = "Required";
    if (!email.trim() || !email.includes("@")) e.email = "Valid email required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (validate()) onSubmit({ name, phone, email });
  }

  const inputStyle = (err?: string): React.CSSProperties => ({
    width: "100%", padding: "10px 12px",
    borderRadius: 8, fontSize: 14, color: "#2C3E50",
    border: `1.5px solid ${err ? "#ef4444" : "#e6e2db"}`,
    outline: "none", background: "#fff",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  });

  return (
    <div style={{ padding: "4px 12px 12px 52px", animation: "cfFadeUp 0.25s ease both" }}>
      <div style={{
        background: "#fff", border: "1px solid #e6e2db",
        borderRadius: 14, padding: "16px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#78716c", display: "block", marginBottom: 4 }}>
              Your name
            </label>
            <input
              type="text" placeholder="e.g. Mike Johnson"
              value={name} onChange={e => setName(e.target.value)}
              style={inputStyle(errors.name)}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = "#D35400"}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = errors.name ? "#ef4444" : "#e6e2db"}
            />
            {errors.name && <p style={{ fontSize: 11, color: "#ef4444", margin: "3px 0 0" }}>{errors.name}</p>}
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#78716c", display: "block", marginBottom: 4 }}>
              Phone number
            </label>
            <input
              type="tel" placeholder="(555) 000-0000"
              value={phone} onChange={e => setPhone(e.target.value)}
              style={inputStyle(errors.phone)}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = "#D35400"}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = errors.phone ? "#ef4444" : "#e6e2db"}
            />
            {errors.phone && <p style={{ fontSize: 11, color: "#ef4444", margin: "3px 0 0" }}>{errors.phone}</p>}
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#78716c", display: "block", marginBottom: 4 }}>
              Email address
            </label>
            <input
              type="email" placeholder="you@company.com"
              value={email} onChange={e => setEmail(e.target.value)}
              style={inputStyle(errors.email)}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = "#D35400"}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = errors.email ? "#ef4444" : "#e6e2db"}
            />
            {errors.email && <p style={{ fontSize: 11, color: "#ef4444", margin: "3px 0 0" }}>{errors.email}</p>}
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: 4,
              padding: "12px", borderRadius: 10,
              background: submitting ? "#f0ede8" : "linear-gradient(135deg,#D35400,#e8641c)",
              color: submitting ? "#a8a29e" : "#fff",
              border: "none", fontWeight: 800, fontSize: 14,
              cursor: submitting ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              boxShadow: submitting ? "none" : "0 3px 12px rgba(211,84,0,0.3)",
            }}
          >
            {submitting ? "Sending…" : "Get in touch →"}
          </button>
          <p style={{ textAlign: "center", fontSize: 11, color: "#a8a29e", margin: 0 }}>
            We'll reach back within 2 hours · No spam, ever.
          </p>
        </form>
      </div>
    </div>
  );
}

// ── Main widget ───────────────────────────────────────────────────────────────

export default function ChatWidget() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [step, setStep]         = useState<ConvStep>("greeting");
  const [intent, setIntent]     = useState<Intent>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notifDot, setNotifDot] = useState(true);
  const [activeButtons, setActiveButtons] = useState<QuickReply[] | null>(null);

  const bottomRef    = useRef<HTMLDivElement>(null);
  const queueRef     = useRef<{ text: string; buttons?: QuickReply[]; showForm?: boolean }[]>([]);
  const processingRef = useRef(false);
  const msgCountRef  = useRef(0);
  const submittedNameRef = useRef("");

  // Init conversation when opened
  useEffect(() => {
    if (open && messages.length === 0) {
      setNotifDot(false);
      queueMessages([
        { text: "Hi there! 👋 I'm Ava, your ClozeFlow guide." },
        { text: "How can I help you today?", buttons: GREETING_BUTTONS },
      ]);
    }
  }, [open]); // eslint-disable-line

  // Scroll to bottom on new messages or typing
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const processQueue = useCallback(() => {
    if (processingRef.current || queueRef.current.length === 0) return;
    processingRef.current = true;
    const item = queueRef.current.shift()!;

    setIsTyping(true);
    const delay = 700 + item.text.length * 18 + Math.random() * 200;

    setTimeout(() => {
      setIsTyping(false);
      const id = uid();
      setMessages(prev => [
        ...prev,
        { id, role: "bot", text: item.text, buttons: item.buttons, showForm: item.showForm },
      ]);
      if (item.buttons) setActiveButtons(item.buttons);
      processingRef.current = false;
      // Process next after a small pause
      setTimeout(processQueue, 320);
    }, Math.min(delay, 1800));
  }, []);

  function queueMessages(items: typeof queueRef.current) {
    // Clear previous active buttons when new messages come
    setActiveButtons(null);
    queueRef.current.push(...items);
    processQueue();
  }

  function handleQuickReply(value: string, label: string) {
    // Dismiss buttons
    setActiveButtons(null);

    // Add user bubble
    setMessages(prev => [...prev, { id: uid(), role: "user", text: label }]);

    if (value === "book_demo" || value === "speak_expert") {
      const branch = BRANCH[value];
      const intentKey = value as Intent;
      setIntent(intentKey);
      setStep("form");
      queueMessages([
        { text: branch.messages[0] },
        { text: branch.messages[1] },
        { text: FORM_INTROS[value], showForm: true },
      ]);
    } else if (value === "learn_more" || value === "what_is") {
      const branch = BRANCH[value];
      setStep("info");
      queueMessages([
        { text: branch.messages[0] },
        { text: branch.messages[1], buttons: branch.nextButtons },
      ]);
    }
  }

  async function handleFormSubmit(data: { name: string; phone: string; email: string }) {
    setSubmitting(true);
    submittedNameRef.current = data.name.split(" ")[0];

    // Build transcript for storage
    const transcript = messages.map(m => ({ role: m.role, text: m.text }));

    try {
      await fetch("/api/chat-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: intent ?? "learn_more",
          name: data.name,
          phone: data.phone,
          email: data.email,
          messages: transcript,
        }),
      });
    } catch {
      // continue optimistically
    }

    setSubmitting(false);
    setStep("submitted");
    // Hide the form bubble by removing showForm flag
    setMessages(prev => prev.map(m => ({ ...m, showForm: false })));
    queueMessages([
      {
        text: `You're all set, ${submittedNameRef.current}! 🎉`,
      },
      {
        text: "Our team will reach out within 2 hours via phone or text.\n\nWhile you wait, feel free to explore pricing and features — we can't wait to show you what's possible! 🚀",
      },
    ]);
  }

  const panelOpen = open;

  return (
    <>
      {/* ── Global keyframes ── */}
      <style>{`
        @keyframes cfDot {
          0%, 80%, 100% { transform: scale(0.55); opacity: 0.35; }
          40%            { transform: scale(1);    opacity: 1;    }
        }
        @keyframes cfFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        @keyframes cfSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes cfPulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.12); }
        }
        @keyframes cfFloatIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
      `}</style>

      {/* ── Chat panel ── */}
      {panelOpen && (
        <div
          style={{
            position: "fixed", bottom: 88, right: 20, zIndex: 9999,
            width: 370,
            maxWidth: "calc(100vw - 32px)",
            borderRadius: 20,
            background: "#F9F7F2",
            boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 20px rgba(211,84,0,0.12)",
            border: "1px solid rgba(211,84,0,0.15)",
            overflow: "hidden",
            animation: "cfSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
            display: "flex", flexDirection: "column",
          }}
        >
          {/* Header */}
          <div style={{
            background: "#fff",
            borderBottom: "1px solid #e6e2db",
            padding: "14px 16px",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <AvaAvatar size={44} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#2C3E50" }}>Ava</p>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                <p style={{ margin: 0, fontSize: 12, color: "#78716c", fontWeight: 500 }}>
                  ClozeFlow Guide · Typically replies instantly
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                width: 30, height: 30, borderRadius: "50%",
                border: "none", background: "#f0ede8",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                color: "#78716c", fontSize: 16, fontWeight: 700,
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "12px 0",
            maxHeight: 360, minHeight: 200,
          }}>
            {messages.map((msg) => (
              <div key={msg.id}>
                <MessageBubble msg={msg} />
                {msg.showForm && (
                  <InlineForm onSubmit={handleFormSubmit} submitting={submitting} />
                )}
              </div>
            ))}

            {isTyping && <TypingDots />}

            {/* Active quick reply buttons (always at bottom) */}
            {activeButtons && !isTyping && step !== "form" && step !== "submitted" && (
              <QuickReplies buttons={activeButtons} onSelect={handleQuickReply} />
            )}

            <div ref={bottomRef} />
          </div>

          {/* Footer */}
          {step === "submitted" && (
            <div style={{
              borderTop: "1px solid #e6e2db", padding: "12px 16px",
              display: "flex", gap: 8,
            }}>
              <Link
                href="/pricing"
                style={{
                  flex: 1, textAlign: "center", padding: "10px",
                  borderRadius: 10, textDecoration: "none",
                  background: "linear-gradient(135deg,#D35400,#e8641c)",
                  color: "#fff", fontSize: 13, fontWeight: 700,
                }}
              >
                See Pricing →
              </Link>
              <Link
                href="/features"
                style={{
                  flex: 1, textAlign: "center", padding: "10px",
                  borderRadius: 10, textDecoration: "none",
                  background: "#f0ede8", color: "#2C3E50",
                  fontSize: 13, fontWeight: 700,
                  border: "1px solid #e6e2db",
                }}
              >
                See Features →
              </Link>
            </div>
          )}

          {/* Branding */}
          <div style={{
            background: "#fff", borderTop: "1px solid #e6e2db",
            padding: "8px 16px", textAlign: "center",
          }}>
            <p style={{ margin: 0, fontSize: 11, color: "#c4bfb8", fontWeight: 500 }}>
              Powered by <span style={{ color: "#D35400", fontWeight: 700 }}>ClozeFlow</span>
            </p>
          </div>
        </div>
      )}

      {/* ── Floating CTA pills (shown when chat is closed) ── */}
      {!open && (
        <div style={{
          position: "fixed", bottom: 92, right: 20, zIndex: 9998,
          display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8,
        }}>
          {[
            { label: "📅 Book a demo",        value: "book_demo",    delay: "0.1s"  },
            { label: "💬 Speak to an expert", value: "speak_expert", delay: "0.22s" },
          ].map(({ label, value, delay }) => (
            <button
              key={value}
              onClick={() => {
                setOpen(true);
                setNotifDot(false);
                // Kick off that branch after chat opens + greeting finishes (~2s)
                setTimeout(() => {
                  setMessages(prev => [...prev, { id: uid(), role: "user", text: label }]);
                  const branch = BRANCH[value];
                  const intentKey = value as Intent;
                  setIntent(intentKey);
                  setStep("form");
                  queueMessages([
                    { text: branch.messages[0] },
                    { text: branch.messages[1] },
                    { text: FORM_INTROS[value], showForm: true },
                  ]);
                }, 2600);
              }}
              style={{
                padding: "10px 18px",
                borderRadius: 24,
                border: "none",
                background: "#fff",
                color: "#2C3E50",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 18px rgba(0,0,0,0.13), 0 1px 4px rgba(0,0,0,0.07)",
                whiteSpace: "nowrap",
                animation: `cfFloatIn 0.35s ${delay} cubic-bezier(0.34,1.56,0.64,1) both`,
                display: "flex", alignItems: "center", gap: 6,
                transition: "box-shadow 0.15s, transform 0.15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 24px rgba(211,84,0,0.2), 0 1px 4px rgba(0,0,0,0.08)";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 18px rgba(0,0,0,0.13), 0 1px 4px rgba(0,0,0,0.07)";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              }}
            >
              {label}
              <span style={{
                width: 18, height: 18, borderRadius: "50%",
                background: "linear-gradient(135deg,#D35400,#e8641c)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ── Floating button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: "fixed", bottom: 20, right: 20, zIndex: 9999,
          width: 60, height: 60, borderRadius: "50%",
          background: open
            ? "#fff"
            : "linear-gradient(135deg,#D35400,#e8641c)",
          border: open ? "2px solid #e6e2db" : "none",
          boxShadow: open
            ? "0 4px 20px rgba(0,0,0,0.12)"
            : "0 4px 20px rgba(211,84,0,0.4), 0 0 0 0 rgba(211,84,0,0.3)",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.25s",
          animation: !open ? "cfPulse 3s 2s infinite ease-in-out" : "none",
        }}
        aria-label="Chat with us"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#78716c" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="white" fillOpacity="0.9" />
            <circle cx="8.5" cy="10.5" r="1" fill="#D35400" />
            <circle cx="12" cy="10.5" r="1" fill="#D35400" />
            <circle cx="15.5" cy="10.5" r="1" fill="#D35400" />
          </svg>
        )}

        {/* Notification dot */}
        {notifDot && !open && (
          <span style={{
            position: "absolute", top: 4, right: 4,
            width: 14, height: 14, borderRadius: "50%",
            background: "#22c55e", border: "2px solid #fff",
            animation: "cfPulse 1.5s infinite",
          }} />
        )}
      </button>
    </>
  );
}
