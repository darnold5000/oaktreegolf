/**
 * Pine Tree table names in the shared Dugout Intel Supabase project.
 * Prefixed to avoid collisions with existing Dugout Intel tables.
 */
export const OAK_TREE_TABLES = {
  profiles: "oak_tree_profiles",
  courseSettings: "oak_tree_course_settings",
  dailyHours: "oak_tree_daily_hours",
  bookings: "oak_tree_bookings",
  blockedTimes: "oak_tree_blocked_times",
  courseStatus: "oak_tree_course_status",
} as const;
