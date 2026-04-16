import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#F9F7F2", color: "#2C3E50" }}
    >
      {/* Minimal auth header */}
      <header className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #e6e2db", background: "#ffffff" }}>
        <Link href="/" className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#D35400,#e8641c)" }}
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-black text-base tracking-tight" style={{ color: "#2C3E50" }}>
            Cloze<span style={{ background: "linear-gradient(90deg,#D35400,#e8641c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Flow</span>
          </span>
        </Link>
      </header>

      {/* Page content */}
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
