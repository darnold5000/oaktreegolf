-- Oak Tree Golf Course initial schema

create extension if not exists "pgcrypto";

-- Profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Course settings (single row)
create table course_settings (
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

-- Daily hours by day of week
create table daily_hours (
  id uuid primary key default gen_random_uuid(),
  day_of_week int not null check (day_of_week between 0 and 6),
  open_time time,
  close_time time,
  is_closed boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (day_of_week)
);

-- Bookings
create table bookings (
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

create unique index unique_active_tee_time
on bookings (booking_date, tee_time)
where status in ('reserved', 'checked_in');

create index bookings_date_idx on bookings (booking_date);
create index bookings_status_idx on bookings (status);

-- Blocked times
create table blocked_times (
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

create index blocked_times_date_idx on blocked_times (block_date);

-- Course status (daily)
create table course_status (
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

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', coalesce(new.raw_user_meta_data->>'role', 'staff'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on profiles for each row execute procedure set_updated_at();
create trigger course_settings_updated_at before update on course_settings for each row execute procedure set_updated_at();
create trigger daily_hours_updated_at before update on daily_hours for each row execute procedure set_updated_at();
create trigger bookings_updated_at before update on bookings for each row execute procedure set_updated_at();
create trigger blocked_times_updated_at before update on blocked_times for each row execute procedure set_updated_at();
create trigger course_status_updated_at before update on course_status for each row execute procedure set_updated_at();

-- RLS
alter table profiles enable row level security;
alter table course_settings enable row level security;
alter table daily_hours enable row level security;
alter table bookings enable row level security;
alter table blocked_times enable row level security;
alter table course_status enable row level security;

-- Profiles policies
create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Admins can read all profiles"
  on profiles for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admins can update profiles"
  on profiles for update
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Course settings policies
create policy "Public can read safe course settings"
  on course_settings for select
  using (true);

create policy "Admins can update course settings"
  on course_settings for update
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Daily hours policies
create policy "Public can read daily hours"
  on daily_hours for select
  using (true);

create policy "Admins can manage daily hours"
  on daily_hours for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Bookings policies
create policy "Staff can read bookings"
  on bookings for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin', 'staff')));

create policy "Staff can insert bookings"
  on bookings for insert
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin', 'staff')));

create policy "Staff can update bookings"
  on bookings for update
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin', 'staff')));

-- Blocked times policies
create policy "Staff can read blocked times"
  on blocked_times for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin', 'staff')));

create policy "Staff can manage blocked times"
  on blocked_times for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin', 'staff')));

-- Course status policies
create policy "Public can read course status"
  on course_status for select
  using (true);

create policy "Staff can manage course status"
  on course_status for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin', 'staff')));
