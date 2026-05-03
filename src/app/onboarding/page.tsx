import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Access control is handled entirely by (app)/layout.tsx.
  // Redirect everyone to the dashboard — paid/invited users get full access,
  // unapproved users see the NoAccessShell.
  redirect("/dashboard");
}
