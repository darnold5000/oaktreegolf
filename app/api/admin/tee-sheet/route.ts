import { NextResponse } from "next/server";
import { buildTeeSheet, formatDateInTimezone, getDayOfWeekInTimezone } from "@/lib/availability";
import { getBookingsForDate } from "@/lib/bookings";
import { isNextResponse, requireStaffApi } from "@/lib/auth";
import {
  getBlockedTimesForDate,
  getCourseSettings,
  getCourseStatus,
  getDailyHours,
} from "@/lib/data";

export async function GET(request: Request) {
  const auth = await requireStaffApi();
  if (isNextResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const settings = await getCourseSettings();
  const date = searchParams.get("date") ?? formatDateInTimezone(new Date(), settings.timezone);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  try {
    const dailyHours = await getDailyHours(getDayOfWeekInTimezone(date, settings.timezone));
    const bookings = await getBookingsForDate(date);
    const blocks = await getBlockedTimesForDate(date);
    const status = await getCourseStatus(date);

    const slots = buildTeeSheet({
      date,
      settings,
      dailyHours,
      bookings,
      blocks,
    });

    return NextResponse.json({ date, slots, status, settings, bookings });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load tee sheet" }, { status: 500 });
  }
}
