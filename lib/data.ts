import { format } from "date-fns";
import { createServiceClient } from "@/lib/supabase/server";
import { OAK_TREE_TABLES } from "@/lib/supabase/tables";
import type { BlockedTime, CourseSettings, CourseStatus, DailyHours } from "@/lib/types/database";

const DEFAULT_SETTINGS: CourseSettings = {
  id: "default",
  course_name: "Oak Tree Golf Course",
  tee_interval_minutes: 10,
  max_players_per_booking: 4,
  booking_window_days: 14,
  minimum_booking_notice_minutes: 15,
  public_booking_enabled: true,
  timezone: "America/Indiana/Indianapolis",
  first_tee_time: "07:00:00",
  last_tee_time: "18:00:00",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEFAULT_HOURS: DailyHours = {
  id: "default",
  day_of_week: new Date().getDay(),
  open_time: "07:00:00",
  close_time: "18:00:00",
  is_closed: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEFAULT_STATUS: CourseStatus = {
  id: "default",
  status_date: format(new Date(), "yyyy-MM-dd"),
  course_status: "Open",
  range_status: "Open",
  cart_status: "Available",
  announcement: null,
  first_available_time: "07:00:00",
  updated_by: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

function hasSupabaseConfig(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function getCourseSettings(): Promise<CourseSettings> {
  if (!hasSupabaseConfig()) return DEFAULT_SETTINGS;

  try {
    const supabase = createServiceClient();
    const { data } = await supabase.from(OAK_TREE_TABLES.courseSettings).select("*").limit(1).single();
    return (data as CourseSettings) ?? DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function getDailyHours(dayOfWeek: number): Promise<DailyHours> {
  if (!hasSupabaseConfig()) {
    return { ...DEFAULT_HOURS, day_of_week: dayOfWeek };
  }

  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from(OAK_TREE_TABLES.dailyHours)
      .select("*")
      .eq("day_of_week", dayOfWeek)
      .single();
    return (data as DailyHours) ?? { ...DEFAULT_HOURS, day_of_week: dayOfWeek };
  } catch {
    return { ...DEFAULT_HOURS, day_of_week: dayOfWeek };
  }
}

export async function getCourseStatus(date?: string): Promise<CourseStatus> {
  const statusDate = date ?? format(new Date(), "yyyy-MM-dd");

  if (!hasSupabaseConfig()) {
    return { ...DEFAULT_STATUS, status_date: statusDate };
  }

  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from(OAK_TREE_TABLES.courseStatus)
      .select("*")
      .eq("status_date", statusDate)
      .single();

    if (data) return data as CourseStatus;

    const { data: latest } = await supabase
      .from(OAK_TREE_TABLES.courseStatus)
      .select("*")
      .order("status_date", { ascending: false })
      .limit(1)
      .single();

    return (latest as CourseStatus) ?? { ...DEFAULT_STATUS, status_date: statusDate };
  } catch {
    return { ...DEFAULT_STATUS, status_date: statusDate };
  }
}

export async function getBlockedTimesForDate(date: string): Promise<BlockedTime[]> {
  if (!hasSupabaseConfig()) return [];

  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from(OAK_TREE_TABLES.blockedTimes)
      .select("*")
      .eq("block_date", date)
      .order("start_time", { ascending: true });
    return (data as BlockedTime[]) ?? [];
  } catch {
    return [];
  }
}

export async function getAllDailyHours(): Promise<DailyHours[]> {
  if (!hasSupabaseConfig()) {
    return Array.from({ length: 7 }, (_, i) => ({ ...DEFAULT_HOURS, day_of_week: i }));
  }

  try {
    const supabase = createServiceClient();
    const { data } = await supabase.from(OAK_TREE_TABLES.dailyHours).select("*").order("day_of_week");
    return (data as DailyHours[]) ?? [];
  } catch {
    return [];
  }
}
