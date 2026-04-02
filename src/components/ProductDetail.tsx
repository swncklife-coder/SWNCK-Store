import { useEffect, useState } from "react";
import type { Product, ProductVariant } from "@/types/commerce";
import type { PdpTemplate } from "@/types/pdp-template";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";
import { resolvePublicAssetUrl } from "@/lib/site-url";

export type CartPayload = {
  variantId: string;
  productTitle: string;
  size: string;
  color: string;
  qty: number;
  unitPriceInr: number;
};

type Props = {
  product: Product;
  variants: ProductVariant[];
  template: PdpTemplate;
  onAddToCart: (item: CartPayload) => void;
  /** When true, skip motion for lighter admin preview */
  preview?: boolean;
};

export function ProductDetail({ product, variants, template, onAddToCart, preview }: Props) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");

  useEffect(() => {
    if (variants.length > 0) setSelectedVariantId(variants[0].id);
  }, [product.id, variants]);

  const selected = variants.find((v) => v.id === selectedVariantId) || variants[0];
  const rawImage = selected?.image_url || product.primary_image_url || "https://placehold.co/800x1000/e8e8e8/888888?text=SWNCK";
  const imageUrl = typeof rawImage === "string" ? (resolvePublicAssetUrl(rawImage) ?? rawImage) : rawImage;

  const detailsBlock = (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">{product.category?.name}</p>
        <h1 className="text-3xl font-semibold tracking-tight mt-1">{product.title}</h1>
        {selected && <p className="text-xl font-medium mt-3">{formatInr(selected.price_inr)}</p>}
      </div>
      {product.description ? <p className="text-muted-foreground leading-relaxed">{product.description}</p> : null}

      {template.showSustainability && product.sustainability_story ? (
        <div className="rounded-lg border bg-card/50 p-4">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2">Sustainability</p>
          <p className="text-sm leading-relaxed">{product.sustainability_story}</p>
        </div>
      ) : null}

      {template.showFitNotes && product.fit_notes ? (
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1">Fit</p>
          <p className="text-sm text-muted-foreground">{product.fit_notes}</p>
        </div>
      ) : null}

      {template.showCare && product.care_instructions ? (
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1">Care</p>
          <p className="text-sm text-muted-foreground">{product.care_instructions}</p>
        </div>
      ) : null}

      {variants.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Variant</p>
          {template.variantPickerStyle === "select" ? (
            <select
              className="w-full border rounded-md px-3 py-2 bg-background"
              value={selectedVariantId}
              onChange={(e) => setSelectedVariantId(e.target.value)}
            >
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.size} / {v.color} — {formatInr(v.price_inr)}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariantId(v.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    v.id === selectedVariantId ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted",
                  )}
                >
                  {v.size} · {v.color}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selected && (
        <button
          type="button"
          className="rounded-md bg-foreground text-background px-6 py-3 text-sm font-medium tracking-wide"
          onClick={() =>
            onAddToCart({
              variantId: selected.id,
              productTitle: product.title,
              size: selected.size,
              color: selected.color,
              qty: 1,
              unitPriceInr: selected.price_inr,
            })
          }
        >
          Add to cart
        </button>
      )}
    </div>
  );

  const imageBlock = (
    <div className={cn("overflow-hidden rounded-lg border bg-muted/20", preview && "aspect-[3/4]")}>
      <img src={imageUrl} alt={product.title} className="h-full w-full object-cover" width={800} height={1000} />
    </div>
  );

  if (template.layout === "stacked") {
    return (
      <div className="space-y-8">
        {imageBlock}
        {detailsBlock}
      </div>
    );
  }

  const imageFirst = template.imagePosition === "left";
  return (
    <div className={cn("grid gap-8 md:grid-cols-2 md:gap-12 items-start", preview && "text-[0.95rem]")}>
      {imageFirst ? (
        <>
          {imageBlock}
          {detailsBlock}
        </>
      ) : (
        <>
          <div className="md:order-2">{imageBlock}</div>
          <div className="md:order-1">{detailsBlock}</div>
        </>
      )}
    </div>
  );
}
