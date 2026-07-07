-- Allow multiple bookings per tee time (capacity enforced in application layer)

drop index if exists public.oak_tree_unique_active_tee_time;
