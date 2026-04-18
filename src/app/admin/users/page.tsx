import { getAdminUsers, getAdminSubscriptions } from "@/lib/admin";
import UsersClient from "./UsersClient";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const [users, subs] = await Promise.all([
    getAdminUsers(),
    getAdminSubscriptions(),
  ]);

  // Build a map of user_id → subscription for O(1) lookup in the client
  const subMap = Object.fromEntries(subs.map(s => [s.user_id, s]));

  return <UsersClient users={users} initialSubMap={subMap} />;
}
