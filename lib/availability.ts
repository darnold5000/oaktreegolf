import {
  addDays,
  addMinutes,
  format,
  isAfter,
  isBefore,
  parse,
  startOfDay,
} from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import {
  canFitPlayers,
  getActiveBookingsForSlot,
  getBookedPlayersForSlot,
  getRemainingSpots,
  getSlotCapacityStatus,
  isActiveBooking,
  normalizeTeeTime,
} from "@/lib/booking-capacity";
import type {
  BlockedTime,
  Booking,
  CourseSettings,
  DailyHours,
  AvailableSlot,
  TeeSheetFilter,
  TeeSheetSlot,
} from "@/lib/types/database";

const TIME_FORMAT = "HH:mm:ss";
const DISPLAY_FORMAT = "h:mm a";

export function parseTime(time: string): Date {
  return parse(time.slice(0, 8), TIME_FORMAT, new Date());
}

export function formatTimeLabel(time: string): string {
  return format(parseTime(time), DISPLAY_FORMAT);
}

export function timeToMinutes(time: string): number {
  const d = parseTime(time);
  return d.getHours() * 60 + d.getMinutes();
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:00`;
}

export function generateTimeSlots(
  openTime: string,
  closeTime: string,
  intervalMinutes: number,
): string[] {
  const slots: string[] = [];
  let current = timeToMinutes(openTime);
  const end = timeToMinutes(closeTime);

  while (current <= end) {
    slots.push(minutesToTime(current));
    current += intervalMinutes;
  }

  return slots;
}

function isSlotBlocked(time: string, blocks: BlockedTime[]): BlockedTime | undefined {
  const slotMinutes = timeToMinutes(time);
  return blocks.find((block) => {
    const start = timeToMinutes(block.start_time);
    const end = timeToMinutes(block.end_time);
    return slotMinutes >= start && slotMinutes <= end;
  });
}

function formatAvailabilityLabel(time: string, spotsRemaining: number): string {
  const timeLabel = formatTimeLabel(time);
  if (spotsRemaining >= 4) {
    return `${timeLabel} — ${spotsRemaining} spots left`;
  }
  if (spotsRemaining === 1) {
    return `${timeLabel} — 1 spot left`;
  }
  return `${timeLabel} — ${spotsRemaining} spots left`;
}

export interface AvailabilityInput {
  date: string;
  players: number;
  settings: CourseSettings;
  dailyHours: DailyHours | null;
  bookings: Booking[];
  blocks: BlockedTime[];
  now?: Date;
}

export function getAvailableSlots(input: AvailabilityInput): AvailableSlot[] {
  const {
    date,
    players,
    settings,
    dailyHours,
    bookings,
    blocks,
    now = new Date(),
  } = input;

  const maxPlayers = settings.max_players_per_booking;

  if (!settings.public_booking_enabled) return [];
  if (players < 1 || players > maxPlayers) return [];

  const timezone = settings.timezone;
  const selectedDate = parse(date, "yyyy-MM-dd", new Date());
  const zonedNow = toZonedTime(now, timezone);
  const zonedSelected = toZonedTime(selectedDate, timezone);

  const daysDiff = Math.floor(
    (startOfDay(zonedSelected).getTime() - startOfDay(zonedNow).getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysDiff < 0 || daysDiff > settings.booking_window_days) return [];

  if (dailyHours?.is_closed) return [];
  if (!dailyHours?.open_time && !settings.first_tee_time) return [];

  const openTime = (dailyHours?.open_time ?? settings.first_tee_time).slice(0, 8);
  const closeTime = (dailyHours?.close_time ?? settings.last_tee_time).slice(0, 8);
  const slots = generateTimeSlots(openTime, closeTime, settings.tee_interval_minutes);

  const minNoticeCutoff = addMinutes(zonedNow, settings.minimum_booking_notice_minutes);

  return slots
    .filter((time) => {
      if (isSlotBlocked(time, blocks)) return false;
      if (!canFitPlayers(bookings, time, maxPlayers, players)) return false;

      const slotDateTime = parse(
        `${date} ${time.slice(0, 5)}`,
        "yyyy-MM-dd HH:mm",
        new Date(),
      );
      const zonedSlot = toZonedTime(slotDateTime, timezone);

      if (isBefore(zonedSlot, minNoticeCutoff)) return false;

      return true;
    })
    .map((time) => {
      const spotsRemaining = getRemainingSpots(bookings, time, maxPlayers);
      const bookedPlayers = getBookedPlayersForSlot(bookings, time);
      return {
        time,
        label: formatAvailabilityLabel(time, spotsRemaining),
        spotsRemaining,
        bookedPlayers,
        maxPlayers,
      };
    });
}

export function getFirstAvailableSlot(slots: AvailableSlot[]): AvailableSlot | null {
  return slots[0] ?? null;
}

export interface TeeSheetInput {
  date: string;
  settings: CourseSettings;
  dailyHours: DailyHours | null;
  bookings: Booking[];
  blocks: BlockedTime[];
}

export function buildTeeSheet(input: TeeSheetInput): TeeSheetSlot[] {
  const { settings, dailyHours, bookings, blocks } = input;
  const maxPlayers = settings.max_players_per_booking;

  if (dailyHours?.is_closed) return [];

  const openTime = (dailyHours?.open_time ?? settings.first_tee_time).slice(0, 8);
  const closeTime = (dailyHours?.close_time ?? settings.last_tee_time).slice(0, 8);
  const slotTimes = generateTimeSlots(openTime, closeTime, settings.tee_interval_minutes);

  return slotTimes.map((time) => {
    const block = isSlotBlocked(time, blocks);
    if (block) {
      return {
        time,
        label: formatTimeLabel(time),
        type: "blocked" as const,
        bookings: [],
        bookedPlayers: 0,
        maxPlayers,
        spotsRemaining: 0,
        block,
      };
    }

    const activeBookings = getActiveBookingsForSlot(bookings, time).sort((a, b) =>
      a.created_at.localeCompare(b.created_at),
    );
    const bookedPlayers = getBookedPlayersForSlot(bookings, time);
    const spotsRemaining = getRemainingSpots(bookings, time, maxPlayers);
    const capacityStatus = getSlotCapacityStatus(bookings, time, maxPlayers);

    return {
      time,
      label: formatTimeLabel(time),
      type: capacityStatus,
      bookings: activeBookings,
      bookedPlayers,
      maxPlayers,
      spotsRemaining,
    };
  });
}

export function getCancelledBookingsForSlot(bookings: Booking[], teeTime: string): Booking[] {
  const normalized = normalizeTeeTime(teeTime);
  return bookings.filter(
    (b) => normalizeTeeTime(b.tee_time) === normalized && b.status === "cancelled",
  );
}

export function slotMatchesFilter(
  slot: TeeSheetSlot,
  filter: TeeSheetFilter,
  allBookings: Booking[],
): boolean {
  if (filter === "all") return true;
  if (filter === "open") return slot.type === "open";
  if (filter === "partial") return slot.type === "partial";
  if (filter === "full") return slot.type === "full";
  if (filter === "checked_in") {
    return slot.bookings.some((b) => b.status === "checked_in");
  }
  if (filter === "cancelled") {
    return getCancelledBookingsForSlot(allBookings, slot.time).length > 0;
  }
  return true;
}

export function slotMatchesSearch(slot: TeeSheetSlot, query: string, allBookings: Booking[]): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  const slotBookings = [
    ...slot.bookings,
    ...getCancelledBookingsForSlot(allBookings, slot.time),
  ];
  return slotBookings.some(
    (b) =>
      b.customer_name.toLowerCase().includes(q) ||
      (b.customer_phone?.toLowerCase().includes(q) ?? false) ||
      (b.customer_email?.toLowerCase().includes(q) ?? false),
  );
}

export function formatDateInTimezone(date: Date, timezone: string, fmt = "yyyy-MM-dd"): string {
  return formatInTimeZone(date, timezone, fmt);
}

export function getDayOfWeek(dateStr: string): number {
  return parse(dateStr, "yyyy-MM-dd", new Date()).getDay();
}

export function getDefaultBookingDates(timezone: string, windowDays: number): string[] {
  const now = new Date();
  return Array.from({ length: windowDays + 1 }, (_, i) =>
    formatDateInTimezone(addDays(now, i), timezone),
  );
}

export function isSlotAvailableForBooking(
  time: string,
  players: number,
  availableSlots: AvailableSlot[],
): boolean {
  const normalized = normalizeTeeTime(time);
  const slot = availableSlots.find((s) => normalizeTeeTime(s.time) === normalized);
  return !!slot && slot.spotsRemaining >= players;
}

export { isActiveBooking };
