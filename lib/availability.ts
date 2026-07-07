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
import type {
  BlockedTime,
  Booking,
  CourseSettings,
  DailyHours,
  AvailableSlot,
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

function isSlotBooked(time: string, bookings: Booking[]): Booking | undefined {
  return bookings.find(
    (b) => b.tee_time.slice(0, 8) === time.slice(0, 8) && ["reserved", "checked_in"].includes(b.status),
  );
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

  if (!settings.public_booking_enabled) return [];
  if (players < 1 || players > settings.max_players_per_booking) return [];

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
      if (isSlotBooked(time, bookings)) return false;
      if (isSlotBlocked(time, blocks)) return false;

      const slotDateTime = parse(
        `${date} ${time.slice(0, 5)}`,
        "yyyy-MM-dd HH:mm",
        new Date(),
      );
      const zonedSlot = toZonedTime(slotDateTime, timezone);

      if (isBefore(zonedSlot, minNoticeCutoff)) return false;

      return true;
    })
    .map((time) => ({ time, label: formatTimeLabel(time) }));
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

  if (dailyHours?.is_closed) return [];

  const openTime = (dailyHours?.open_time ?? settings.first_tee_time).slice(0, 8);
  const closeTime = (dailyHours?.close_time ?? settings.last_tee_time).slice(0, 8);
  const slots = generateTimeSlots(openTime, closeTime, settings.tee_interval_minutes);

  return slots.map((time) => {
    const booking = isSlotBooked(time, bookings);
    if (booking) {
      return {
        time,
        label: formatTimeLabel(time),
        type: "booking" as const,
        booking,
      };
    }

    const block = isSlotBlocked(time, blocks);
    if (block) {
      return {
        time,
        label: formatTimeLabel(time),
        type: "blocked" as const,
        block,
      };
    }

    return {
      time,
      label: formatTimeLabel(time),
      type: "open" as const,
    };
  });
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
  availableSlots: AvailableSlot[],
): boolean {
  return availableSlots.some((s) => s.time.slice(0, 8) === time.slice(0, 8));
}
