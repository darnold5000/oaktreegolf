import { Suspense } from "react";
import { BookingForm } from "@/components/booking/BookingForm";
import { explainAvailabilityEmpty, formatDateInTimezone, getAvailableSlots, getDayOfWeekInTimezone } from "@/lib/availability";
import { getBookingsForDate } from "@/lib/bookings";
import { getBlockedTimesForDate, getCourseSettings, getDailyHours } from "@/lib/data";

export const metadata = {
  title: "Book a Tee Time",
};

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; players?: string; time?: string }>;
}) {
  const params = await searchParams;
  const settings = await getCourseSettings();
  const today = formatDateInTimezone(new Date(), settings.timezone);
  const date = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : today;
  const players = Math.min(4, Math.max(1, parseInt(params.players ?? "4", 10) || 4));

  const dailyHours = await getDailyHours(getDayOfWeekInTimezone(date, settings.timezone));
  const bookings = await getBookingsForDate(date);
  const blocks = await getBlockedTimesForDate(date);

  const availabilityInput = {
    date,
    players,
    settings,
    dailyHours,
    bookings,
    blocks,
  };

  const initialSlots = getAvailableSlots(availabilityInput);
  const initialEmptyReason =
    initialSlots.length === 0 ? explainAvailabilityEmpty(availabilityInput) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-4xl font-semibold">Book a Tee Time</h1>
        <p className="mt-2 text-muted-foreground">
          Reserve your spot online. Payment is due at the course.
        </p>
      </div>
      <Suspense fallback={<p className="text-center text-muted-foreground">Loading...</p>}>
        <BookingForm initialSlots={initialSlots} initialEmptyReason={initialEmptyReason} />
      </Suspense>
    </div>
  );
}
