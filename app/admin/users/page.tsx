import { requireAdmin } from "@/lib/auth";
import UsersClient from "./UsersClient";

export default async function UsersPage() {
  const profile = await requireAdmin();
  return <UsersClient profile={profile} />;
}
