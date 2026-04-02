-- SWNCK ecommerce foundation for India-focused sustainable fashion

create extension if not exists "pgcrypto";

create table if not exists product_category (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  slug text unique not null,
  description text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists product (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  slug text unique not null,
  description text,
  category_id text not null references product_category(id) on delete cascade,
  sustainability_story text,
  fit_notes text,
  care_instructions text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists product_variant (
  id text primary key default gen_random_uuid()::text,
  product_id text not null references product(id) on delete cascade,
  sku text unique not null,
  size text not null,
  color text not null,
  material text not null,
  inventory_qty int not null default 0,
  price_inr int not null check (price_inr >= 0),
  compare_at_price_inr int check (compare_at_price_inr >= 0),
  weight_grams int,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists cms_page (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  slug text unique not null,
  content_md text not null,
  is_published boolean not null default false,
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists site_setting (
  id text primary key default gen_random_uuid()::text,
  key text unique not null,
  value text not null,
  updated_at timestamptz not null default now()
);

create table if not exists customer_order (
  id text primary key default gen_random_uuid()::text,
  customer_name text not null,
  phone text not null,
  email text,
  shipping_address text not null,
  payment_method text not null check (payment_method in ('upi', 'card', 'cod')),
  payment_status text not null default 'pending',
  order_status text not null default 'pending',
  currency text not null default 'INR',
  total_inr int not null check (total_inr >= 0),
  created_at timestamptz not null default now()
);

create table if not exists customer_order_item (
  id text primary key default gen_random_uuid()::text,
  order_id text not null references customer_order(id) on delete cascade,
  variant_id text not null references product_variant(id),
  quantity int not null check (quantity > 0),
  unit_price_inr int not null check (unit_price_inr >= 0),
  line_total_inr int not null check (line_total_inr >= 0)
);

alter table product_category enable row level security;
alter table product enable row level security;
alter table product_variant enable row level security;
alter table cms_page enable row level security;
alter table site_setting enable row level security;
alter table customer_order enable row level security;
alter table customer_order_item enable row level security;

-- Public read on active catalog and published pages.
drop policy if exists "public read active categories" on product_category;
create policy "public read active categories"
on product_category for select
to anon, authenticated
using (is_active = true);

drop policy if exists "public read active products" on product;
create policy "public read active products"
on product for select
to anon, authenticated
using (is_active = true);

drop policy if exists "public read active variants" on product_variant;
create policy "public read active variants"
on product_variant for select
to anon, authenticated
using (is_active = true);

drop policy if exists "public read published pages" on cms_page;
create policy "public read published pages"
on cms_page for select
to anon, authenticated
using (is_published = true);

drop policy if exists "public read site settings" on site_setting;
create policy "public read site settings"
on site_setting for select
to anon, authenticated
using (true);

drop policy if exists "public can create orders" on customer_order;
create policy "public can create orders"
on customer_order for insert
to anon, authenticated
with check (true);

drop policy if exists "public can create order items" on customer_order_item;
create policy "public can create order items"
on customer_order_item for insert
to anon, authenticated
with check (true);

-- Admin write policies based on Supabase Auth metadata claim: app_metadata.role = 'admin'
drop policy if exists "admin full access categories" on product_category;
create policy "admin full access categories"
on product_category for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admin full access products" on product;
create policy "admin full access products"
on product for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admin full access variants" on product_variant;
create policy "admin full access variants"
on product_variant for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admin full access pages" on cms_page;
create policy "admin full access pages"
on cms_page for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admin full access settings" on site_setting;
create policy "admin full access settings"
on site_setting for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admin read orders" on customer_order;
create policy "admin read orders"
on customer_order for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admin read order items" on customer_order_item;
create policy "admin read order items"
on customer_order_item for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into site_setting (key, value) values
  ('brand_name', 'SWNCK'),
  ('currency', 'INR'),
  ('country', 'India'),
  ('shipping_policy', 'Free shipping over INR 1499'),
  ('return_policy', '7-day return for unworn items'),
  ('gst_number', ''),
  ('support_whatsapp', ''),
  ('support_email', '')
on conflict (key) do nothing;
