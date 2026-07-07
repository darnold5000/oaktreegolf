import {
  addDays,
  addMinutes,
  format,
  getDay,
  isBefore,
  parse,
} from "date-fns";
import { fromZonedTime, formatInTimeZone } from "date-fns-tz";
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

export type AvailabilityEmptyReason =
  | "booking_disabled"
  | "course_closed"
  | "past_date"
  | "outside_window"
  | "too_late_today"
  | "fully_booked"
  | "no_times";

export function getSlotInstant(date: string, time: string, timezone: string): Date {
  return fromZonedTime(`${date} ${time.slice(0, 5)}:00`, timezone);
}

export function isSlotInBookableFuture(
  date: string,
  time: string,
  timezone: string,
  now: Date,
  minimumNoticeMinutes: number,
  isToday: boolean,
): boolean {
  if (!isToday) return true;
  const slotInstant = getSlotInstant(date, time, timezone);
  const earliestBookable = addMinutes(now, minimumNoticeMinutes);
  return !isBefore(slotInstant, earliestBookable);
}

export function getDayOfWeekInTimezone(dateStr: string, timezone: string): number {
  return getDay(fromZonedTime(`${dateStr} 12:00:00`, timezone));
}

function formatAvailabilityLabel(time: string, spotsRemaining: number): string {
  const timeLabel = formatTimeLabel(time);
  if (spotsRemaining === 1) {
    return `${timeLabel} — 1 spot left`;
  }
  return `${timeLabel} — ${spotsRemaining} spots left`;
}

function getScheduleSlots(
  settings: CourseSettings,
  dailyHours: DailyHours | null,
): string[] {
  if (dailyHours?.is_closed) return [];
  if (!dailyHours?.open_time && !settings.first_tee_time) return [];

  const openTime = (dailyHours?.open_time ?? settings.first_tee_time).slice(0, 8);
  const closeTime = (dailyHours?.close_time ?? settings.last_tee_time).slice(0, 8);
  return generateTimeSlots(openTime, closeTime, settings.tee_interval_minutes);
}

function getDateContext(date: string, settings: CourseSettings, now: Date) {
  const timezone = settings.timezone;
  const todayInCourseTz = formatInTimeZone(now, timezone, "yyyy-MM-dd");
  const maxDate = formatInTimeZone(
    addDays(now, settings.booking_window_days),
    timezone,
    "yyyy-MM-dd",
  );

  return {
    timezone,
    todayInCourseTz,
    isToday: date === todayInCourseTz,
    isPastDate: date < todayInCourseTz,
    isOutsideWindow: date > maxDate,
  };
}

export function explainAvailabilityEmpty(input: AvailabilityInput): AvailabilityEmptyReason {
  const { date, players, settings, dailyHours, bookings, blocks, now = new Date() } = input;
  const maxPlayers = settings.max_players_per_booking;

  if (!settings.public_booking_enabled) return "booking_disabled";
  if (players < 1 || players > maxPlayers) return "no_times";

  const { timezone, isToday, isPastDate, isOutsideWindow } = getDateContext(date, settings, now);
  if (isPastDate) return "past_date";
  if (isOutsideWindow) return "outside_window";
  if (dailyHours?.is_closed) return "course_closed";

  const slots = getScheduleSlots(settings, dailyHours);
  if (slots.length === 0) return "course_closed";

  const openByTime = slots.filter((time) =>
    isSlotInBookableFuture(
      date,
      time,
      timezone,
      now,
      settings.minimum_booking_notice_minutes,
      isToday,
    ),
  );
  if (openByTime.length === 0) return "too_late_today";

  const openByCapacity = openByTime.filter(
    (time) => !isSlotBlocked(time, blocks) && canFitPlayers(bookings, time, maxPlayers, players),
  );
  if (openByCapacity.length === 0) return "fully_booked";

  return "no_times";
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

  const { timezone, isToday, isPastDate, isOutsideWindow } = getDateContext(date, settings, now);
  if (isPastDate || isOutsideWindow) return [];
  if (dailyHours?.is_closed) return [];

  const slots = getScheduleSlots(settings, dailyHours);

  return slots
    .filter((time) => {
      if (isSlotBlocked(time, blocks)) return false;
      if (!canFitPlayers(bookings, time, maxPlayers, players)) return false;
      if (
        !isSlotInBookableFuture(
          date,
          time,
          timezone,
          now,
          settings.minimum_booking_notice_minutes,
          isToday,
        )
      ) {
        return false;
      }
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

export const ADMIN_AVAILABLE_PAST_GRACE_MINUTES = 7;

export function isSlotWithinAdminAvailableWindow(
  date: string,
  time: string,
  timezone: string,
  now: Date = new Date(),
): boolean {
  const slotInstant = getSlotInstant(date, time, timezone);
  const earliestVisible = addMinutes(now, -ADMIN_AVAILABLE_PAST_GRACE_MINUTES);
  return !isBefore(slotInstant, earliestVisible);
}

export interface TeeSheetFilterContext {
  sheetDate: string;
  timezone: string;
  now?: Date;
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
  context?: TeeSheetFilterContext,
): boolean {
  if (filter === "all") return true;
  if (filter === "available") {
    if (slot.type !== "open" && slot.type !== "partial") return false;
    if (!context) return true;

    const { sheetDate, timezone, now = new Date() } = context;
    const todayInCourseTz = formatInTimeZone(now, timezone, "yyyy-MM-dd");
    if (sheetDate < todayInCourseTz) return false;
    if (sheetDate > todayInCourseTz) return true;
    return isSlotWithinAdminAvailableWindow(sheetDate, slot.time, timezone, now);
  }
  if (filter === "empty") return slot.type === "open";
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
  return getDay(parse(dateStr, "yyyy-MM-dd", new Date()));
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
