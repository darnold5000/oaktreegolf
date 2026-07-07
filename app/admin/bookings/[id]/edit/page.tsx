import { requireStaff } from "@/lib/auth";
import EditBookingClient from "./EditBookingClient";

export default async function EditBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireStaff();
  const { id } = await params;
  return <EditBookingClient profile={profile} bookingId={id} />;
}
