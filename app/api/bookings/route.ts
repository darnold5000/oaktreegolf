import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getAvailableSlots,
  getDayOfWeek,
  isSlotAvailableForBooking,
} from "@/lib/availability";
import { createBooking, getBookingsForDate } from "@/lib/bookings";
import {
  getBlockedTimesForDate,
  getCourseSettings,
  getDailyHours,
} from "@/lib/data";
import { sendBookingConfirmation, sendStaffBookingNotification } from "@/lib/email";

const bookingSchema = z.object({
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tee_time: z.string(),
  customer_name: z.string().min(2).max(100),
  customer_phone: z.string().min(7).max(20),
  customer_email: z.string().email(),
  players: z.number().int().min(1).max(4),
  cart_preference: z.enum(["walking", "cart", "unknown"]).optional(),
  notes: z.string().max(500).optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid booking data" }, { status: 400 });
    }

    const data = parsed.data;
    const settings = await getCourseSettings();

    if (!settings.public_booking_enabled) {
      return NextResponse.json(
        { error: "Online booking is currently unavailable. Please call the pro shop." },
        { status: 403 },
      );
    }

    const dailyHours = await getDailyHours(getDayOfWeek(data.booking_date));
    const bookings = await getBookingsForDate(data.booking_date);
    const blocks = await getBlockedTimesForDate(data.booking_date);

    const availableSlots = getAvailableSlots({
      date: data.booking_date,
      players: data.players,
      settings,
      dailyHours,
      bookings,
      blocks,
    });

    if (!isSlotAvailableForBooking(data.tee_time, availableSlots)) {
      return NextResponse.json(
        {
          error: "That tee time is no longer available. Please choose another time.",
          suggestedSlots: availableSlots.slice(0, 6),
        },
        { status: 409 },
      );
    }

    const { data: booking, error } = await createBooking({
      ...data,
      source: "online",
      status: "reserved",
    });

    if (error || !booking) {
      return NextResponse.json(
        {
          error: error ?? "Booking failed",
          suggestedSlots: availableSlots.slice(0, 6),
        },
        { status: 409 },
      );
    }

    await Promise.all([
      sendBookingConfirmation(booking),
      sendStaffBookingNotification(booking),
    ]);

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
