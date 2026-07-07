import { canFitPlayers, isActiveBooking } from "@/lib/booking-capacity";
import { getCourseSettings } from "@/lib/data";
import { createServiceClient } from "@/lib/supabase/server";
import { OAK_TREE_TABLES } from "@/lib/supabase/tables";
import type { Booking, BookingSource, BookingStatus, CartPreference } from "@/lib/types/database";

function hasSupabaseConfig(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export interface CreateBookingInput {
  booking_date: string;
  tee_time: string;
  customer_name: string;
  customer_phone?: string | null;
  customer_email?: string | null;
  players: number;
  cart_preference?: CartPreference;
  source: BookingSource;
  notes?: string | null;
  created_by?: string | null;
  status?: BookingStatus;
}

export async function validateBookingCapacity(params: {
  booking_date: string;
  tee_time: string;
  players: number;
  status: BookingStatus;
  excludeBookingId?: string;
}): Promise<{ ok: boolean; error: string | null }> {
  if (!isActiveBooking(params.status)) {
    return { ok: true, error: null };
  }

  const settings = await getCourseSettings();
  const bookings = await getBookingsForDate(params.booking_date);
  const maxPlayers = settings.max_players_per_booking;

  if (params.players > maxPlayers) {
    return { ok: false, error: `Maximum ${maxPlayers} players per booking.` };
  }

  if (
    !canFitPlayers(
      bookings,
      params.tee_time,
      maxPlayers,
      params.players,
      params.excludeBookingId,
    )
  ) {
    const remaining = maxPlayers - bookings
      .filter(
        (b) =>
          b.tee_time.slice(0, 8) === params.tee_time.slice(0, 8) &&
          isActiveBooking(b.status) &&
          b.id !== params.excludeBookingId,
      )
      .reduce((sum, b) => sum + b.players, 0);

    return {
      ok: false,
      error: `Only ${Math.max(0, remaining)} spot(s) remaining at this tee time.`,
    };
  }

  return { ok: true, error: null };
}

export async function createBooking(
  input: CreateBookingInput,
): Promise<{ data: Booking | null; error: string | null }> {
  if (!hasSupabaseConfig()) {
    return { data: null, error: "Booking system is not configured." };
  }

  const status = input.status ?? "reserved";
  const capacity = await validateBookingCapacity({
    booking_date: input.booking_date,
    tee_time: input.tee_time,
    players: input.players,
    status,
  });

  if (!capacity.ok) {
    return { data: null, error: capacity.error };
  }

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from(OAK_TREE_TABLES.bookings)
    .insert({
      booking_date: input.booking_date,
      tee_time: input.tee_time,
      customer_name: input.customer_name,
      customer_phone: input.customer_phone ?? null,
      customer_email: input.customer_email ?? null,
      players: input.players,
      cart_preference: input.cart_preference ?? "unknown",
      source: input.source,
      notes: input.notes ?? null,
      created_by: input.created_by ?? null,
      status,
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as Booking, error: null };
}

export async function updateBooking(
  id: string,
  updates: Partial<Omit<Booking, "id" | "created_at">>,
): Promise<{ data: Booking | null; error: string | null }> {
  if (!hasSupabaseConfig()) {
    return { data: null, error: "Booking system is not configured." };
  }

  const existing = await getBookingById(id);
  if (!existing) {
    return { data: null, error: "Booking not found." };
  }

  const merged = {
    booking_date: updates.booking_date ?? existing.booking_date,
    tee_time: updates.tee_time ?? existing.tee_time,
    players: updates.players ?? existing.players,
    status: updates.status ?? existing.status,
  };

  const capacity = await validateBookingCapacity({
    booking_date: merged.booking_date,
    tee_time: merged.tee_time,
    players: merged.players,
    status: merged.status,
    excludeBookingId: id,
  });

  if (!capacity.ok) {
    return { data: null, error: capacity.error };
  }

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from(OAK_TREE_TABLES.bookings)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as Booking, error: null };
}

export async function getBookingById(id: string): Promise<Booking | null> {
  if (!hasSupabaseConfig()) return null;

  const supabase = createServiceClient();
  const { data } = await supabase.from(OAK_TREE_TABLES.bookings).select("*").eq("id", id).single();
  return (data as Booking) ?? null;
}

export async function getBookingsForDate(date: string): Promise<Booking[]> {
  if (!hasSupabaseConfig()) return [];

  const supabase = createServiceClient();
  const { data } = await supabase
    .from(OAK_TREE_TABLES.bookings)
    .select("*")
    .eq("booking_date", date)
    .order("tee_time", { ascending: true });
  return (data as Booking[]) ?? [];
}

export async function cancelBooking(id: string): Promise<{ error: string | null }> {
  const { error } = await updateBooking(id, { status: "cancelled" });
  return { error };
}
