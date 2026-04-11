import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import AppShell from "@/components/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, business_name")
    .eq("id", user.id)
    .single();

  return (
    <AppShell
      firstName={profile?.first_name ?? null}
      businessName={profile?.business_name ?? null}
      email={user.email ?? null}
    >
      {children}
    </AppShell>
  );
}
