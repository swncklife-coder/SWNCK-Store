import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import prod1 from "@/assets/product-bamboo-tee.jpg";
import prod2 from "@/assets/product-organic-top.jpg";
import prod3 from "@/assets/product-bamboo-black.jpg";
import prod4 from "@/assets/product-organic-sage.jpg";
import { supabase } from "@/lib/supabase";
import type { Product, ProductVariant } from "@/types/commerce";
import { formatInr } from "@/lib/format";
import { resolvePublicAssetUrl } from "@/lib/site-url";

const fallbackProducts = [
  {
    img: prod1,
    name: "Bamboo Crew Tee — Olive",
    category: "Unisex",
    material: "100% Bamboo",
    price: "INR 1,899",
    href: "/shop",
  },
  {
    img: prod2,
    name: "Organic Cotton Top — Ivory",
    category: "Women",
    material: "Organic Cotton",
    price: "INR 2,199",
    href: "/shop",
  },
  {
    img: prod3,
    name: "Bamboo Crew Tee — Black",
    category: "Unisex",
    material: "100% Bamboo",
    price: "INR 1,899",
    href: "/shop",
  },
  {
    img: prod4,
    name: "Organic Blouse — Sage",
    category: "Women",
    material: "Organic Cotton",
    price: "INR 2,399",
    href: "/shop",
  },
];

const ProductFeed = () => {
  const productsQuery = useQuery({
    queryKey: ["landing-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product")
        .select("*, category:product_category(*)")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .limit(8);
      if (error) throw error;
      return (data || []) as Product[];
    },
  });

  const variantsQuery = useQuery({
    queryKey: ["landing-variants"],
    queryFn: async () => {
      const { data, error } = await supabase.from("product_variant").select("*").eq("is_active", true);
      if (error) throw error;
      return (data || []) as ProductVariant[];
    },
  });

  const firstVariantByProduct = new Map<string, ProductVariant>();
  (variantsQuery.data || []).forEach((variant) => {
    if (!firstVariantByProduct.has(variant.product_id)) {
      firstVariantByProduct.set(variant.product_id, variant);
    }
  });

  const dynamicProducts = (productsQuery.data || []).map((product, idx) => {
    const variant = firstVariantByProduct.get(product.id);
    const fallbackImage = fallbackProducts[idx % fallbackProducts.length]?.img || prod1;
    const rawImg = variant?.image_url || product.primary_image_url;
    const img =
      typeof rawImg === "string" && rawImg
        ? (resolvePublicAssetUrl(rawImg) ?? rawImg)
        : fallbackImage;
    return {
      img,
      name: product.title,
      category: product.category?.name || "Collection",
      material: variant?.material || "Sustainable Fabric",
      price: variant ? formatInr(variant.price_inr) : "Coming soon",
      href: `/products/${product.slug}`,
    };
  });

  const displayProducts = dynamicProducts.length > 0 ? dynamicProducts.slice(0, 4) : fallbackProducts;

  return (
    <section id="shop" className="py-24 md:py-36 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-4"
        >
          <div>
            <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
              Shop
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              New drops.
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors group"
          >
            View all
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {displayProducts.map((product, i) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group"
            >
              <Link to={product.href} className="block">
                <div className="relative overflow-hidden mb-4 bg-card">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    width={800}
                    height={1024}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-xs tracking-widest uppercase text-foreground">
                      Quick view
                    </span>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-foreground truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {product.category} · {product.material}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-foreground shrink-0">
                    {product.price}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductFeed;
