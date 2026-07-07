import { NextResponse } from "next/server";
import { format } from "date-fns";
import { buildTeeSheet, getDayOfWeek } from "@/lib/availability";
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
  const date = searchParams.get("date") ?? format(new Date(), "yyyy-MM-dd");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  try {
    const settings = await getCourseSettings();
    const dailyHours = await getDailyHours(getDayOfWeek(date));
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

    return NextResponse.json({ date, slots, status, settings });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load tee sheet" }, { status: 500 });
  }
}
