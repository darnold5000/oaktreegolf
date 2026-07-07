-- Oak Tree seed data (safe to run on shared Dugout Intel Supabase project)

insert into public.oak_tree_course_settings (
  course_name,
  tee_interval_minutes,
  max_players_per_booking,
  booking_window_days,
  minimum_booking_notice_minutes,
  public_booking_enabled,
  timezone,
  first_tee_time,
  last_tee_time
)
select
  'Oak Tree Golf Course',
  10,
  4,
  14,
  15,
  true,
  'America/Indiana/Indianapolis',
  '07:00:00',
  '18:00:00'
where not exists (select 1 from public.oak_tree_course_settings);

-- Daily hours: 0=Sunday through 6=Saturday
insert into public.oak_tree_daily_hours (day_of_week, open_time, close_time, is_closed)
select v.day_of_week, v.open_time, v.close_time, v.is_closed
from (
  values
    (0, '07:00:00'::time, '18:00:00'::time, false),
    (1, '07:00:00'::time, '18:00:00'::time, false),
    (2, '07:00:00'::time, '18:00:00'::time, false),
    (3, '07:00:00'::time, '18:00:00'::time, false),
    (4, '07:00:00'::time, '18:00:00'::time, false),
    (5, '07:00:00'::time, '18:00:00'::time, false),
    (6, '07:00:00'::time, '18:00:00'::time, false)
) as v(day_of_week, open_time, close_time, is_closed)
on conflict (day_of_week) do nothing;

insert into public.oak_tree_course_status (
  status_date,
  course_status,
  range_status,
  cart_status,
  announcement,
  first_available_time
)
select
  current_date,
  'Open',
  'Open',
  'Available',
  null,
  '07:00:00'
where not exists (
  select 1 from public.oak_tree_course_status where status_date = current_date
);
