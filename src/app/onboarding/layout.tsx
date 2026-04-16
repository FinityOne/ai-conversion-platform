export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#F9F7F2",
      overflowX: "hidden",
    }}>
      {children}
    </div>
  );
}
