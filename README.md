# Oak Tree Golf Course

Modern website and tee time booking system for Oak Tree Golf Course in Plainfield, Indiana.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (shared Dugout Intel project — `oak_tree_*` tables)
- Resend (booking confirmation emails)
- Vercel (deployment target)

## Getting Started

1. Copy environment variables:

```bash
cp .env.example .env.local
```

2. Use the **existing Dugout Intel Supabase project** credentials in `.env.local`, then run the Oak Tree migration in the Supabase SQL editor:

```bash
# 1. Apply supabase/migrations/001_initial.sql  (creates oak_tree_* tables only)
# 2. Run supabase/seed.sql                      (default course settings)
```

This migration does **not** modify Dugout Intel tables, auth triggers, or storage.

3. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Shared Dugout Intel Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Shared Dugout Intel anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Shared Dugout Intel service role key (server only) |
| `RESEND_API_KEY` | Resend API key for emails |
| `RESEND_FROM_EMAIL` | Verified sender address |
| `STAFF_NOTIFICATION_EMAIL` | Staff alert recipient |

## Staff Setup

Oak Tree uses **shared Supabase Auth** with roles stored in `oak_tree_profiles` (not Dugout Intel profile tables).

1. Create or reuse a user in Supabase Auth
2. Insert a row into `oak_tree_profiles` with that user's `id` and role `admin` or `staff`
3. Log in at `/admin/login`

Example (run in Supabase SQL editor after creating the auth user):

```sql
insert into public.oak_tree_profiles (id, full_name, role)
values ('<auth-user-uuid>', 'Ben Weaver', 'admin');
```

## Features

### Public
- Homepage with booking CTA, course status, and rates preview
- Online tee time booking (no payment in v1)
- Rates, course, scorecard, outings, junior golf, pro shop, gallery, contact pages

### Admin
- Tee sheet dashboard (tablet-friendly)
- Phone/walk-in/staff bookings
- Edit, cancel, check-in bookings
- Block time ranges
- Course settings and homepage status banner
- Staff user list (admin only)

## Deployment

Deploy to Vercel and add the environment variables above. Point your domain to the Vercel deployment.
