export type CollectionAutoRuleType =
  | "all_active"
  | "featured"
  | "new_arrivals"
  | "category"
  | "material_contains"
  | "price_under_inr"
  | "price_over_inr";

export type CollectionAutoRule = {
  type: CollectionAutoRuleType;
  /** For type === category */
  category_id?: string | null;
  /** Substring match on variant.material (case-insensitive) */
  material_keyword?: string | null;
  /** For price_under_inr / price_over_inr — compared to minimum variant price per product */
  price_inr?: number | null;
  /** Cap how many products appear in preview / storefront */
  max_products?: number | null;
};

export const DEFAULT_COLLECTION_AUTO_RULE: CollectionAutoRule = {
  type: "featured",
  category_id: null,
  material_keyword: null,
  price_inr: null,
  max_products: 12,
};

const ALLOWED_RULE_TYPES: CollectionAutoRuleType[] = [
  "all_active",
  "featured",
  "new_arrivals",
  "category",
  "material_contains",
  "price_under_inr",
  "price_over_inr",
];

export function parseCollectionAutoRule(raw: unknown): CollectionAutoRule {
  const base: CollectionAutoRule = { ...DEFAULT_COLLECTION_AUTO_RULE };
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;
  const typeStr = String(o.type || "");
  if (ALLOWED_RULE_TYPES.includes(typeStr as CollectionAutoRuleType)) {
    base.type = typeStr as CollectionAutoRuleType;
  }
  base.category_id = (o.category_id as string) ?? null;
  base.material_keyword = (o.material_keyword as string) ?? null;
  base.price_inr = typeof o.price_inr === "number" ? o.price_inr : o.price_inr != null ? Number(o.price_inr) : null;
  base.max_products =
    typeof o.max_products === "number" ? o.max_products : o.max_products != null ? Number(o.max_products) : 12;
  return base;
}
