-- Oak Tree Golf Course schema for the shared Dugout Intel Supabase project.
-- Creates ONLY oak_tree_* tables, functions, triggers, and policies.
-- Does NOT modify Dugout Intel tables, auth triggers, RLS, or storage.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Trigger helper (no table dependencies)
-- ---------------------------------------------------------------------------

create or replace function public.oak_tree_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.oak_tree_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.oak_tree_course_settings (
  id uuid primary key default gen_random_uuid(),
  course_name text not null default 'Oak Tree Golf Course',
  tee_interval_minutes int not null default 10,
  max_players_per_booking int not null default 4,
  booking_window_days int not null default 14,
  minimum_booking_notice_minutes int not null default 60,
  public_booking_enabled boolean not null default true,
  timezone text not null default 'America/Indiana/Indianapolis',
  first_tee_time time not null default '07:00:00',
  last_tee_time time not null default '18:00:00',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.oak_tree_daily_hours (
  id uuid primary key default gen_random_uuid(),
  day_of_week int not null check (day_of_week between 0 and 6),
  open_time time,
  close_time time,
  is_closed boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (day_of_week)
);

create table if not exists public.oak_tree_bookings (
  id uuid primary key default gen_random_uuid(),
  booking_date date not null,
  tee_time time not null,
  customer_name text not null,
  customer_phone text,
  customer_email text,
  players int not null check (players between 1 and 4),
  cart_preference text check (cart_preference in ('walking', 'cart', 'unknown')) default 'unknown',
  source text not null check (source in ('online', 'phone', 'walk_in', 'staff', 'league', 'other')),
  status text not null check (status in ('reserved', 'checked_in', 'cancelled', 'no_show')) default 'reserved',
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists oak_tree_bookings_date_idx
  on public.oak_tree_bookings (booking_date);

create index if not exists oak_tree_bookings_status_idx
  on public.oak_tree_bookings (status);

-- Capacity per tee time is enforced in the application layer (multiple bookings allowed).

create table if not exists public.oak_tree_blocked_times (
  id uuid primary key default gen_random_uuid(),
  block_date date not null,
  start_time time not null,
  end_time time not null,
  reason text not null,
  public_note text,
  internal_note text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists oak_tree_blocked_times_date_idx
  on public.oak_tree_blocked_times (block_date);

create table if not exists public.oak_tree_course_status (
  id uuid primary key default gen_random_uuid(),
  status_date date not null unique,
  course_status text default 'Open',
  range_status text default 'Open',
  cart_status text default 'Available',
  announcement text,
  first_available_time time,
  updated_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- RLS helper functions (must run AFTER oak_tree_profiles exists)
-- ---------------------------------------------------------------------------

create or replace function public.oak_tree_is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.oak_tree_profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'staff')
  );
$$;

create or replace function public.oak_tree_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.oak_tree_profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Updated_at triggers
-- ---------------------------------------------------------------------------

drop trigger if exists oak_tree_profiles_updated_at on public.oak_tree_profiles;
create trigger oak_tree_profiles_updated_at
  before update on public.oak_tree_profiles
  for each row execute procedure public.oak_tree_set_updated_at();

drop trigger if exists oak_tree_course_settings_updated_at on public.oak_tree_course_settings;
create trigger oak_tree_course_settings_updated_at
  before update on public.oak_tree_course_settings
  for each row execute procedure public.oak_tree_set_updated_at();

drop trigger if exists oak_tree_daily_hours_updated_at on public.oak_tree_daily_hours;
create trigger oak_tree_daily_hours_updated_at
  before update on public.oak_tree_daily_hours
  for each row execute procedure public.oak_tree_set_updated_at();

drop trigger if exists oak_tree_bookings_updated_at on public.oak_tree_bookings;
create trigger oak_tree_bookings_updated_at
  before update on public.oak_tree_bookings
  for each row execute procedure public.oak_tree_set_updated_at();

drop trigger if exists oak_tree_blocked_times_updated_at on public.oak_tree_blocked_times;
create trigger oak_tree_blocked_times_updated_at
  before update on public.oak_tree_blocked_times
  for each row execute procedure public.oak_tree_set_updated_at();

drop trigger if exists oak_tree_course_status_updated_at on public.oak_tree_course_status;
create trigger oak_tree_course_status_updated_at
  before update on public.oak_tree_course_status
  for each row execute procedure public.oak_tree_set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.oak_tree_profiles enable row level security;
alter table public.oak_tree_course_settings enable row level security;
alter table public.oak_tree_daily_hours enable row level security;
alter table public.oak_tree_bookings enable row level security;
alter table public.oak_tree_blocked_times enable row level security;
alter table public.oak_tree_course_status enable row level security;

-- oak_tree_profiles
drop policy if exists "oak_tree_users_read_own_profile" on public.oak_tree_profiles;
create policy "oak_tree_users_read_own_profile"
  on public.oak_tree_profiles for select
  using (auth.uid() = id);

drop policy if exists "oak_tree_admins_read_all_profiles" on public.oak_tree_profiles;
create policy "oak_tree_admins_read_all_profiles"
  on public.oak_tree_profiles for select
  using (public.oak_tree_is_admin());

drop policy if exists "oak_tree_admins_update_profiles" on public.oak_tree_profiles;
create policy "oak_tree_admins_update_profiles"
  on public.oak_tree_profiles for update
  using (public.oak_tree_is_admin());

drop policy if exists "oak_tree_admins_insert_profiles" on public.oak_tree_profiles;
create policy "oak_tree_admins_insert_profiles"
  on public.oak_tree_profiles for insert
  with check (public.oak_tree_is_admin());

-- oak_tree_course_settings (public read; admin write)
drop policy if exists "oak_tree_public_read_course_settings" on public.oak_tree_course_settings;
create policy "oak_tree_public_read_course_settings"
  on public.oak_tree_course_settings for select
  using (true);

drop policy if exists "oak_tree_admin_update_course_settings" on public.oak_tree_course_settings;
create policy "oak_tree_admin_update_course_settings"
  on public.oak_tree_course_settings for update
  using (public.oak_tree_is_admin());

drop policy if exists "oak_tree_admin_insert_course_settings" on public.oak_tree_course_settings;
create policy "oak_tree_admin_insert_course_settings"
  on public.oak_tree_course_settings for insert
  with check (public.oak_tree_is_admin());

-- oak_tree_daily_hours (public read; admin manage)
drop policy if exists "oak_tree_public_read_daily_hours" on public.oak_tree_daily_hours;
create policy "oak_tree_public_read_daily_hours"
  on public.oak_tree_daily_hours for select
  using (true);

drop policy if exists "oak_tree_admin_manage_daily_hours" on public.oak_tree_daily_hours;
create policy "oak_tree_admin_manage_daily_hours"
  on public.oak_tree_daily_hours for all
  using (public.oak_tree_is_admin());

-- oak_tree_bookings (staff manage; public inserts via service role only)
drop policy if exists "oak_tree_staff_read_bookings" on public.oak_tree_bookings;
create policy "oak_tree_staff_read_bookings"
  on public.oak_tree_bookings for select
  using (public.oak_tree_is_staff());

drop policy if exists "oak_tree_staff_insert_bookings" on public.oak_tree_bookings;
create policy "oak_tree_staff_insert_bookings"
  on public.oak_tree_bookings for insert
  with check (public.oak_tree_is_staff());

drop policy if exists "oak_tree_staff_update_bookings" on public.oak_tree_bookings;
create policy "oak_tree_staff_update_bookings"
  on public.oak_tree_bookings for update
  using (public.oak_tree_is_staff());

-- oak_tree_blocked_times
drop policy if exists "oak_tree_staff_read_blocked_times" on public.oak_tree_blocked_times;
create policy "oak_tree_staff_read_blocked_times"
  on public.oak_tree_blocked_times for select
  using (public.oak_tree_is_staff());

drop policy if exists "oak_tree_staff_manage_blocked_times" on public.oak_tree_blocked_times;
create policy "oak_tree_staff_manage_blocked_times"
  on public.oak_tree_blocked_times for all
  using (public.oak_tree_is_staff());

-- oak_tree_course_status
drop policy if exists "oak_tree_public_read_course_status" on public.oak_tree_course_status;
create policy "oak_tree_public_read_course_status"
  on public.oak_tree_course_status for select
  using (true);

drop policy if exists "oak_tree_staff_manage_course_status" on public.oak_tree_course_status;
create policy "oak_tree_staff_manage_course_status"
  on public.oak_tree_course_status for all
  using (public.oak_tree_is_staff());
