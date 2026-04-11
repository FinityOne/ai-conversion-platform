export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e1035 50%, #0c1a2e 100%)",
      overflowX: "hidden",
    }}>
      {children}
    </div>
  );
}
