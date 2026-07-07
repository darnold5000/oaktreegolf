import { requireAdmin } from "@/lib/auth";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const profile = await requireAdmin();
  return <SettingsClient profile={profile} />;
}
