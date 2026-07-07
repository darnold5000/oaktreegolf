import type { Booking, BookingStatus } from "@/lib/types/database";

export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = ["reserved", "checked_in"];

export function normalizeTeeTime(time: string): string {
  return time.slice(0, 8);
}

export function isActiveBooking(status: BookingStatus): boolean {
  return ACTIVE_BOOKING_STATUSES.includes(status);
}

export function getActiveBookingsForSlot(
  bookings: Booking[],
  teeTime: string,
  excludeId?: string,
): Booking[] {
  const normalized = normalizeTeeTime(teeTime);
  return bookings.filter(
    (b) =>
      normalizeTeeTime(b.tee_time) === normalized &&
      isActiveBooking(b.status) &&
      b.id !== excludeId,
  );
}

export function getBookedPlayersForSlot(
  bookings: Booking[],
  teeTime: string,
  excludeId?: string,
): number {
  return getActiveBookingsForSlot(bookings, teeTime, excludeId).reduce(
    (sum, booking) => sum + booking.players,
    0,
  );
}

export function getRemainingSpots(
  bookings: Booking[],
  teeTime: string,
  maxPlayers: number,
  excludeId?: string,
): number {
  const booked = getBookedPlayersForSlot(bookings, teeTime, excludeId);
  return Math.max(0, maxPlayers - booked);
}

export function canFitPlayers(
  bookings: Booking[],
  teeTime: string,
  maxPlayers: number,
  requestedPlayers: number,
  excludeId?: string,
): boolean {
  return getRemainingSpots(bookings, teeTime, maxPlayers, excludeId) >= requestedPlayers;
}

export function getSlotCapacityStatus(
  bookings: Booking[],
  teeTime: string,
  maxPlayers: number,
): "open" | "partial" | "full" {
  const booked = getBookedPlayersForSlot(bookings, teeTime);
  if (booked === 0) return "open";
  if (booked >= maxPlayers) return "full";
  return "partial";
}
