import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#05091a", color: "#f1f5f9" }}
    >
      {/* Minimal auth header */}
      <header className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/" className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#ea580c,#f97316)" }}
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-black text-base tracking-tight text-white">
            Cloze<span style={{ background: "linear-gradient(90deg,#ea580c,#f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Flow</span>
          </span>
        </Link>
      </header>

      {/* Page content */}
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
