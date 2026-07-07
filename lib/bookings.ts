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

export async function createBooking(input: CreateBookingInput): Promise<{ data: Booking | null; error: string | null }> {
  if (!hasSupabaseConfig()) {
    return { data: null, error: "Booking system is not configured." };
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
      status: input.status ?? "reserved",
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { data: null, error: "That tee time was just booked. Please choose another time." };
    }
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

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from(OAK_TREE_TABLES.bookings)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { data: null, error: "That tee time is already booked." };
    }
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
