-- Seed data for Oak Tree Golf Course

insert into course_settings (
  course_name,
  tee_interval_minutes,
  max_players_per_booking,
  booking_window_days,
  minimum_booking_notice_minutes,
  public_booking_enabled,
  timezone,
  first_tee_time,
  last_tee_time
) values (
  'Oak Tree Golf Course',
  10,
  4,
  14,
  60,
  true,
  'America/Indiana/Indianapolis',
  '07:00:00',
  '18:00:00'
);

-- Daily hours: 0=Sunday through 6=Saturday
insert into daily_hours (day_of_week, open_time, close_time, is_closed) values
  (0, '07:00:00', '18:00:00', false),
  (1, '07:00:00', '18:00:00', false),
  (2, '07:00:00', '18:00:00', false),
  (3, '07:00:00', '18:00:00', false),
  (4, '07:00:00', '18:00:00', false),
  (5, '07:00:00', '18:00:00', false),
  (6, '07:00:00', '18:00:00', false);

-- Today's course status
insert into course_status (
  status_date,
  course_status,
  range_status,
  cart_status,
  announcement,
  first_available_time
) values (
  current_date,
  'Open',
  'Open',
  'Available',
  null,
  '07:00:00'
) on conflict (status_date) do nothing;
