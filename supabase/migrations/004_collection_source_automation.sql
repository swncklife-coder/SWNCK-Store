-- Manual vs automatic collections

alter table product_collection
  add column if not exists source_type text not null default 'manual';

alter table product_collection
  drop constraint if exists product_collection_source_type_check;

alter table product_collection
  add constraint product_collection_source_type_check
  check (source_type in ('manual', 'automatic'));

alter table product_collection
  add column if not exists auto_rule jsonb;

comment on column product_collection.source_type is 'manual: use product_collection_item rows; automatic: compute products from auto_rule';
comment on column product_collection.auto_rule is 'JSON rule for automatic membership (type, filters, max_products, etc.)';
