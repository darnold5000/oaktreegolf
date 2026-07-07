import { Suspense } from "react";
import { requireStaff } from "@/lib/auth";
import NewBookingClient from "./NewBookingClient";

export default async function NewBookingPage() {
  const profile = await requireStaff();
  return (
    <Suspense>
      <NewBookingClient profile={profile} />
    </Suspense>
  );
}
