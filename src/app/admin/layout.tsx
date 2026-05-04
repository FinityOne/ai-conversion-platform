import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import AdminShell from "@/components/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const service = createSupabaseServiceClient();
  const { count: demoLeadCount } = await service
    .from("internal_leads")
    .select("id", { count: "exact", head: true })
    .in("source", ["healthcare_landing", "homepage_demo"])
    .eq("status", "new");

  return (
    <AdminShell
      firstName={profile?.first_name ?? null}
      email={user.email ?? null}
      demoLeadCount={demoLeadCount ?? 0}
    >
      {children}
    </AdminShell>
  );
}
