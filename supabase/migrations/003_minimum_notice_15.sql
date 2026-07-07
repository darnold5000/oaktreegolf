-- Reduce minimum online booking notice from 60 to 15 minutes
update public.oak_tree_course_settings
set minimum_booking_notice_minutes = 15
where minimum_booking_notice_minutes = 60;
