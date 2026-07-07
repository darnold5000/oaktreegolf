import { NextResponse } from "next/server";
import { z } from "zod";
import { createBooking } from "@/lib/bookings";
import { isNextResponse, requireStaffApi } from "@/lib/auth";

const schema = z.object({
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tee_time: z.string(),
  customer_name: z.string().min(2),
  customer_phone: z.string().optional().nullable(),
  customer_email: z.string().email().optional().nullable(),
  players: z.number().int().min(1).max(4),
  cart_preference: z.enum(["walking", "cart", "unknown"]).optional(),
  source: z.enum(["phone", "walk_in", "staff", "league", "other", "online"]),
  notes: z.string().optional().nullable(),
  status: z.enum(["reserved", "checked_in", "cancelled", "no_show"]).optional(),
});

export async function POST(request: Request) {
  const auth = await requireStaffApi();
  if (isNextResponse(auth)) return auth;
  const profile = auth;
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking data" }, { status: 400 });
  }

  const { data, error } = await createBooking({
    ...parsed.data,
    created_by: profile.id,
  });

  if (error) {
    return NextResponse.json({ error }, { status: 409 });
  }

  return NextResponse.json({ booking: data }, { status: 201 });
}

export async function GET() {
  const auth = await requireStaffApi();
  if (isNextResponse(auth)) return auth;
  return NextResponse.json({ ok: true });
}
