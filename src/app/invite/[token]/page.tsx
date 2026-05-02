import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getMembershipByToken } from "@/lib/team";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import InviteAcceptClient from "./InviteAcceptClient";

export const dynamic = "force-dynamic";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const membership = await getMembershipByToken(token);
  if (!membership || membership.status === "revoked") {
    return <InvalidInvite reason="This invite link is invalid or has been revoked." />;
  }

  // Fetch owner's business name for the UI
  const sb = createSupabaseServiceClient();
  const { data: owner } = await sb
    .from("profiles")
    .select("first_name, business_name")
    .eq("id", membership.owner_id)
    .single();

  // Check if the visitor is logged in
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Already accepted — redirect straight into the org
  if (membership.status === "active") {
    if (user && user.email?.toLowerCase() === membership.email.toLowerCase()) {
      redirect("/dashboard");
    }
    return <InvalidInvite reason="This invite has already been accepted." />;
  }

  return (
    <InviteAcceptClient
      token={token}
      inviteeEmail={membership.email}
      inviteeName={membership.first_name}
      ownerName={owner?.first_name ?? null}
      businessName={owner?.business_name ?? null}
      role={membership.role}
      loggedInEmail={user?.email ?? null}
    />
  );
}

function InvalidInvite({ reason }: { reason: string }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F9F7F2", padding: "20px" }}>
      <div style={{ background: "#fff", border: "1px solid #e6e2db", borderRadius: 20, padding: "48px 40px", maxWidth: 420, textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(239,68,68,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <i className="fa-solid fa-link-slash" style={{ fontSize: 22, color: "#ef4444" }} />
        </div>
        <h1 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 800, color: "#1a1a1a" }}>Invite Unavailable</h1>
        <p style={{ margin: "0 0 28px", fontSize: 14, color: "#78716c", lineHeight: 1.65 }}>{reason}</p>
        <Link href="/dashboard" style={{ display: "inline-block", padding: "11px 24px", borderRadius: 9, background: "#D35400", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
