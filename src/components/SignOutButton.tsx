"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const sb = createSupabaseBrowserClient();
    await sb.auth.signOut();
    router.push("/login");
  }

  return (
    <button
      onClick={handleSignOut}
      style={{
        width: "100%", padding: "16px", borderRadius: 12,
        border: "1.5px solid #fee2e2",
        background: "#fff",
        color: "#dc2626", fontSize: 15, fontWeight: 700,
        cursor: "pointer", display: "flex", alignItems: "center",
        justifyContent: "center", gap: 8,
      }}
    >
      <i className="fa-solid fa-arrow-right-from-bracket" />
      Sign Out
    </button>
  );
}
