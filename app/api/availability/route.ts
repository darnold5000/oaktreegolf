import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getAvailableSlots,
  getDayOfWeek,
  getFirstAvailableSlot,
} from "@/lib/availability";
import { getBookingsForDate } from "@/lib/bookings";
import {
  getBlockedTimesForDate,
  getCourseSettings,
  getDailyHours,
} from "@/lib/data";

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  players: z.coerce.number().int().min(1).max(4).default(4),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    date: searchParams.get("date"),
    players: searchParams.get("players") ?? 4,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const { date, players } = parsed.data;

  try {
    const settings = await getCourseSettings();
    const dailyHours = await getDailyHours(getDayOfWeek(date));
    const bookings = await getBookingsForDate(date);
    const blocks = await getBlockedTimesForDate(date);

    const slots = getAvailableSlots({
      date,
      players,
      settings,
      dailyHours,
      bookings,
      blocks,
    });

    const firstAvailable = getFirstAvailableSlot(slots);

    return NextResponse.json({
      date,
      players,
      slots,
      firstAvailable,
      publicBookingEnabled: settings.public_booking_enabled,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load availability" }, { status: 500 });
  }
}
