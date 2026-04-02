export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url?: string | null;
  is_active: boolean;
  sort_order: number;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category_id: string;
  primary_image_url?: string | null;
  sustainability_story: string | null;
  fit_notes: string | null;
  care_instructions: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at?: string;
  category?: ProductCategory;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  sku: string;
  size: string;
  color: string;
  material: string;
  inventory_qty: number;
  price_inr: number;
  compare_at_price_inr: number | null;
  image_url: string | null;
  weight_grams: number | null;
  is_active: boolean;
};

export type CmsPage = {
  id: string;
  title: string;
  slug: string;
  content_md: string;
  is_published: boolean;
  meta_title: string | null;
  meta_description: string | null;
};

export type SiteSetting = {
  id: string;
  key: string;
  value: string;
};

export type HomepageSection = {
  id: string;
  section_key: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_href: string | null;
};

export type ProductCollection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  source_type?: "manual" | "automatic";
  auto_rule?: unknown | null;
};
