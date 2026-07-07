# Oak Tree Golf Course

Modern website and tee time booking system for Oak Tree Golf Course in Plainfield, Indiana.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth, Postgres, RLS)
- Resend (booking confirmation emails)
- Vercel (deployment target)

## Getting Started

1. Copy environment variables:

```bash
cp .env.example .env.local
```

2. Create a Supabase project and run the migration:

```bash
# Apply supabase/migrations/001_initial.sql in the Supabase SQL editor
# Then run supabase/seed.sql for default settings
```

3. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only) |
| `RESEND_API_KEY` | Resend API key for emails |
| `RESEND_FROM_EMAIL` | Verified sender address |
| `STAFF_NOTIFICATION_EMAIL` | Staff alert recipient |

## Staff Setup

1. Create a user in Supabase Auth
2. Set their profile role to `admin` or `staff` in the `profiles` table
3. Log in at `/admin/login`

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
