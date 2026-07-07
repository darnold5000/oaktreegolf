import { requireStaff } from "@/lib/auth";
import BlocksClient from "./BlocksClient";

export default async function BlocksPage() {
  const profile = await requireStaff();
  return <BlocksClient profile={profile} />;
}
