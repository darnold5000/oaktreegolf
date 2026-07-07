import { NextResponse } from "next/server";
import { z } from "zod";
import { getBookingById, updateBooking } from "@/lib/bookings";
import { isNextResponse, requireStaffApi } from "@/lib/auth";

const patchSchema = z.object({
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  tee_time: z.string().optional(),
  customer_name: z.string().min(2).optional(),
  customer_phone: z.string().optional().nullable(),
  customer_email: z.string().email().optional().nullable(),
  players: z.number().int().min(1).max(4).optional(),
  cart_preference: z.enum(["walking", "cart", "unknown"]).optional(),
  source: z.enum(["phone", "walk_in", "staff", "league", "other", "online"]).optional(),
  notes: z.string().optional().nullable(),
  status: z.enum(["reserved", "checked_in", "cancelled", "no_show"]).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireStaffApi();
  if (isNextResponse(auth)) return auth;

  const { id } = await params;
  const booking = await getBookingById(id);

  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ booking });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireStaffApi();
  if (isNextResponse(auth)) return auth;

  const { id } = await params;
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update data" }, { status: 400 });
  }

  const { data, error } = await updateBooking(id, parsed.data);

  if (error) {
    return NextResponse.json({ error }, { status: 409 });
  }

  return NextResponse.json({ booking: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireStaffApi();
  if (isNextResponse(auth)) return auth;

  const { id } = await params;
  const { data, error } = await updateBooking(id, { status: "cancelled" });

  if (error) {
    return NextResponse.json({ error }, { status: 409 });
  }

  return NextResponse.json({ booking: data });
}
