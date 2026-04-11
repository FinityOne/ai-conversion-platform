import Nav from "@/components/Nav";
import MarketingFooter from "@/components/MarketingFooter";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#faf9f7", minHeight: "100vh" }}>
      <Nav variant="marketing" />
      <main style={{ paddingTop: 64 }}>{children}</main>
      <MarketingFooter />
    </div>
  );
}
