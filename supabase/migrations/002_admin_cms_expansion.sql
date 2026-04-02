-- Admin, CMS, branding, and collection expansion

create table if not exists admin_user (
  email text primary key,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists homepage_section (
  id text primary key default gen_random_uuid()::text,
  section_key text unique not null,
  title text not null,
  subtitle text,
  description text,
  image_url text,
  cta_label text,
  cta_href text,
  updated_at timestamptz not null default now()
);

create table if not exists product_collection (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists product_collection_item (
  id text primary key default gen_random_uuid()::text,
  collection_id text not null references product_collection(id) on delete cascade,
  product_id text not null references product(id) on delete cascade,
  sort_order int not null default 0,
  unique (collection_id, product_id)
);

alter table product_category add column if not exists image_url text;
alter table product add column if not exists primary_image_url text;

alter table admin_user enable row level security;
alter table homepage_section enable row level security;
alter table product_collection enable row level security;
alter table product_collection_item enable row level security;

drop policy if exists "public read homepage sections" on homepage_section;
create policy "public read homepage sections"
on homepage_section for select
to anon, authenticated
using (true);

drop policy if exists "public read collections" on product_collection;
create policy "public read collections"
on product_collection for select
to anon, authenticated
using (is_active = true);

drop policy if exists "public read collection items" on product_collection_item;
create policy "public read collection items"
on product_collection_item for select
to anon, authenticated
using (true);

drop policy if exists "public read admin users disabled" on admin_user;
create policy "public read admin users disabled"
on admin_user for select
to authenticated
using (false);

-- Use admin_user table for write authorization.
drop policy if exists "admin full access categories" on product_category;
create policy "admin full access categories"
on product_category for all
to authenticated
using (exists (select 1 from admin_user au where au.email = auth.jwt() ->> 'email'))
with check (exists (select 1 from admin_user au where au.email = auth.jwt() ->> 'email'));

drop policy if exists "admin full access products" on product;
create policy "admin full access products"
on product for all
to authenticated
using (exists (select 1 from admin_user au where au.email = auth.jwt() ->> 'email'))
with check (exists (select 1 from admin_user au where au.email = auth.jwt() ->> 'email'));

drop policy if exists "admin full access variants" on product_variant;
create policy "admin full access variants"
on product_variant for all
to authenticated
using (exists (select 1 from admin_user au where au.email = auth.jwt() ->> 'email'))
with check (exists (select 1 from admin_user au where au.email = auth.jwt() ->> 'email'));

drop policy if exists "admin full access pages" on cms_page;
create policy "admin full access pages"
on cms_page for all
to authenticated
using (exists (select 1 from admin_user au where au.email = auth.jwt() ->> 'email'))
with check (exists (select 1 from admin_user au where au.email = auth.jwt() ->> 'email'));

drop policy if exists "admin full access settings" on site_setting;
create policy "admin full access settings"
on site_setting for all
to authenticated
using (exists (select 1 from admin_user au where au.email = auth.jwt() ->> 'email'))
with check (exists (select 1 from admin_user au where au.email = auth.jwt() ->> 'email'));

drop policy if exists "admin read orders" on customer_order;
create policy "admin read orders"
on customer_order for select
to authenticated
using (exists (select 1 from admin_user au where au.email = auth.jwt() ->> 'email'));

drop policy if exists "admin read order items" on customer_order_item;
create policy "admin read order items"
on customer_order_item for select
to authenticated
using (exists (select 1 from admin_user au where au.email = auth.jwt() ->> 'email'));

drop policy if exists "admin full access homepage sections" on homepage_section;
create policy "admin full access homepage sections"
on homepage_section for all
to authenticated
using (exists (select 1 from admin_user au where au.email = auth.jwt() ->> 'email'))
with check (exists (select 1 from admin_user au where au.email = auth.jwt() ->> 'email'));

drop policy if exists "admin full access collections" on product_collection;
create policy "admin full access collections"
on product_collection for all
to authenticated
using (exists (select 1 from admin_user au where au.email = auth.jwt() ->> 'email'))
with check (exists (select 1 from admin_user au where au.email = auth.jwt() ->> 'email'));

drop policy if exists "admin full access collection items" on product_collection_item;
create policy "admin full access collection items"
on product_collection_item for all
to authenticated
using (exists (select 1 from admin_user au where au.email = auth.jwt() ->> 'email'))
with check (exists (select 1 from admin_user au where au.email = auth.jwt() ->> 'email'));

insert into homepage_section (section_key, title, subtitle, description, cta_label, cta_href)
values
  ('hero', 'Wear the change.', 'Sustainable Fashion - Redefined', 'Conscious design meets uncompromising style.', 'Explore', '#collections'),
  ('story', 'Born from nature.', 'Our Story', 'Crafted with lower-impact materials and designed for longevity.', 'Read Story', '#story')
on conflict (section_key) do nothing;

insert into site_setting (key, value) values
  ('logo_url', ''),
  ('favicon_url', ''),
  ('contact_phone', ''),
  ('contact_email', ''),
  ('contact_whatsapp', ''),
  ('contact_address', '')
on conflict (key) do nothing;

insert into cms_page (title, slug, content_md, is_published) values
  ('About Us', 'about-us', 'About SWNCK', true),
  ('Privacy Policy', 'privacy-policy', 'Privacy policy content', true),
  ('Terms and Conditions', 'terms-and-conditions', 'Terms and conditions content', true),
  ('Return Policy', 'return-policy', 'Return policy content', true),
  ('Contact Us', 'contact-us', 'Contact SWNCK', true)
on conflict (slug) do nothing;

-- Seed your first admin user email (replace with your real email after migration).
insert into admin_user (email, full_name)
values ('admin@swnck.com', 'Initial Admin')
on conflict (email) do nothing;
