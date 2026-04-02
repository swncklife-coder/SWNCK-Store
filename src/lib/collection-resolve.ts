import type { Product, ProductVariant } from "@/types/commerce";
import type { CollectionAutoRule } from "@/types/collection-rules";
import { parseCollectionAutoRule } from "@/types/collection-rules";

export type CollectionRow = {
  id: string;
  source_type: "manual" | "automatic";
  auto_rule: unknown;
};

function minActivePrice(productId: string, variants: ProductVariant[]): number {
  const prices = variants.filter((v) => v.product_id === productId && v.is_active).map((v) => v.price_inr);
  if (!prices.length) return Number.POSITIVE_INFINITY;
  return Math.min(...prices);
}

export function resolveAutomaticProducts(products: Product[], variants: ProductVariant[], rule: CollectionAutoRule): Product[] {
  let list = products.filter((p) => p.is_active);

  switch (rule.type) {
    case "all_active":
      break;
    case "featured":
      list = list.filter((p) => p.is_featured);
      break;
    case "new_arrivals":
      list = [...list].sort((a, b) => {
        const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
        const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
        return tb - ta;
      });
      break;
    case "category":
      if (rule.category_id) list = list.filter((p) => p.category_id === rule.category_id);
      break;
    case "material_contains": {
      const kw = (rule.material_keyword || "").toLowerCase();
      if (kw) {
        list = list.filter((p) =>
          variants.some((v) => v.product_id === p.id && v.is_active && v.material.toLowerCase().includes(kw)),
        );
      }
      break;
    }
    case "price_under_inr":
      if (rule.price_inr != null && !Number.isNaN(rule.price_inr)) {
        list = list.filter((p) => minActivePrice(p.id, variants) < rule.price_inr!);
      }
      break;
    case "price_over_inr":
      if (rule.price_inr != null && !Number.isNaN(rule.price_inr)) {
        list = list.filter((p) => minActivePrice(p.id, variants) >= rule.price_inr!);
      }
      break;
    default:
      break;
  }

  const max = Math.min(Math.max(rule.max_products ?? 24, 1), 100);
  return list.slice(0, max);
}

export function resolveCollectionProducts(params: {
  collection: CollectionRow;
  products: Product[];
  variants: ProductVariant[];
  manualProductIds: string[];
}): Product[] {
  const { collection, products, variants, manualProductIds } = params;
  if (collection.source_type === "manual") {
    const set = new Set(manualProductIds);
    return products.filter((p) => p.is_active && set.has(p.id));
  }
  const rule = parseCollectionAutoRule(collection.auto_rule);
  return resolveAutomaticProducts(products, variants, rule);
}
