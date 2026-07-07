import { requireStaff } from "@/lib/auth";
import TeeSheetPage from "./TeeSheetClient";

export default async function AdminTeeSheetPage() {
  const profile = await requireStaff();
  return <TeeSheetPage profile={profile} />;
}
