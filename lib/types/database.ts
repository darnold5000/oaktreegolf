export type UserRole = "admin" | "staff";
export type BookingSource = "online" | "phone" | "walk_in" | "staff" | "league" | "other";
export type BookingStatus = "reserved" | "checked_in" | "cancelled" | "no_show";
export type CartPreference = "walking" | "cart" | "unknown";

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface CourseSettings {
  id: string;
  course_name: string;
  tee_interval_minutes: number;
  max_players_per_booking: number;
  booking_window_days: number;
  minimum_booking_notice_minutes: number;
  public_booking_enabled: boolean;
  timezone: string;
  first_tee_time: string;
  last_tee_time: string;
  created_at: string;
  updated_at: string;
}

export interface DailyHours {
  id: string;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  booking_date: string;
  tee_time: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  players: number;
  cart_preference: CartPreference;
  source: BookingSource;
  status: BookingStatus;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlockedTime {
  id: string;
  block_date: string;
  start_time: string;
  end_time: string;
  reason: string;
  public_note: string | null;
  internal_note: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseStatus {
  id: string;
  status_date: string;
  course_status: string;
  range_status: string;
  cart_status: string;
  announcement: string | null;
  first_available_time: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeeSheetSlot {
  time: string;
  label: string;
  type: "open" | "partial" | "full" | "blocked";
  bookings: Booking[];
  bookedPlayers: number;
  maxPlayers: number;
  spotsRemaining: number;
  block?: BlockedTime;
}

export interface AvailableSlot {
  time: string;
  label: string;
  spotsRemaining: number;
  bookedPlayers: number;
  maxPlayers: number;
}

export type TeeSheetFilter =
  | "all"
  | "open"
  | "partial"
  | "full"
  | "checked_in"
  | "cancelled";
