import { notFound } from "next/navigation";
import { getAdminUserDetail } from "@/lib/admin";
import UserDetailClient from "./UserDetailClient";

export const dynamic = "force-dynamic";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getAdminUserDetail(id);
  if (!user) notFound();
  return <UserDetailClient user={user} />;
}
