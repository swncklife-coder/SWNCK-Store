# SWNCK Ecommerce (Vercel + Supabase)

Production-oriented ecommerce foundation for sustainable fashion in India, inspired by architecture patterns used in Zipowatt.

## What is implemented

- Storefront routes: home, shop, product detail, cart, checkout.
- Admin route: `/admin` with Supabase magic-link auth and modules to manage:
  - products
  - variants
  - CMS pages
  - site settings
- Supabase-first data model and RLS policies in:
  - `supabase/migrations/001_swnck_ecommerce_foundation.sql`
- India-focused order model:
  - INR prices
  - UPI / card / COD payment options
  - policy settings for GST, shipping, returns

## Stack

- Frontend: React + Vite + TypeScript + React Query
- Backend: Supabase Postgres + Supabase Auth + RLS
- Deploy: GitHub + Vercel

## Environment variables

Create `.env.local`:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Local development

```bash
npm install
npm run dev
```

## Supabase setup

1. Create a Supabase project.
2. Run SQL migration from:
   - `supabase/migrations/001_swnck_ecommerce_foundation.sql`
   - `supabase/migrations/002_admin_cms_expansion.sql`
   - `supabase/migrations/003_storage_uploads_rls.sql` (image uploads bucket + policies)
3. Enable Email OTP / Magic Link sign-in in Supabase Auth.

## Seeded admin login model

- Admin panel URL: `/admin`
- Admin authorization now uses `admin_user` table (seeded in migration 002).
- Update seeded placeholder admin email after migration:

```sql
update admin_user
set email = 'your-real-admin-email@example.com', full_name = 'SWNCK Admin'
where email = 'admin@swnck.com';
```

- Sign in on `/admin` with that same email using magic link.

## Seed your first catalog

Recommended initial categories:
- Women
- Unisex
- New Arrivals

Initial products:
- Bamboo T-shirt (Unisex)
- Organic Cotton Top (Women)

For each product, add size/color variants (S, M, L, XL as relevant), SKUs, inventory and INR pricing from `/admin`.

## Vercel deployment

1. Push repo to GitHub.
2. Import project in Vercel.
3. Add env vars:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy.

## Next upgrades to complete full production

- Integrate payment gateway webhook (Razorpay/Cashfree) to update `payment_status`.
- Add shipping API integration (Shiprocket/Pickrr) and AWB tracking.
- Add discount engine and coupon tables.
- Add order management UI (status transitions, refunds, exchanges).
- Add image upload pipeline using Supabase Storage buckets.
