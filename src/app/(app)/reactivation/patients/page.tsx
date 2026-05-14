import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getPatients } from "@/lib/reactivation";
import PatientsClient from "./PatientsClient";

export default async function PatientsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const patients = await getPatients(user.id);

  return <PatientsClient initialPatients={patients} />;
}
