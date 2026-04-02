import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import col1 from "@/assets/collection-1.jpg";
import col2 from "@/assets/collection-2.jpg";
import col3 from "@/assets/collection-3.jpg";
import { supabase } from "@/lib/supabase";
import type { ProductCategory, Product } from "@/types/commerce";

const fallbackCollections = [
  { img: col1, title: "Essentials", desc: "Everyday pieces, elevated.", tag: "SS26" },
  { img: col2, title: "Craft", desc: "Handwoven. Heritage-inspired.", tag: "Artisan" },
  { img: col3, title: "Silhouette", desc: "Bold forms. Dark palette.", tag: "AW26" },
];

const Collections = () => {
  const categoriesQuery = useQuery({
    queryKey: ["landing-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_category")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(3);
      if (error) throw error;
      return (data || []) as ProductCategory[];
    },
  });

  const productsQuery = useQuery({
    queryKey: ["landing-collections-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("product").select("id, category_id").eq("is_active", true);
      if (error) throw error;
      return (data || []) as Pick<Product, "id" | "category_id">[];
    },
  });

  const categoryCount = new Map<string, number>();
  (productsQuery.data || []).forEach((product) => {
    categoryCount.set(product.category_id, (categoryCount.get(product.category_id) || 0) + 1);
  });

  const dynamicCollections = (categoriesQuery.data || []).map((category, idx) => {
    const image = [col1, col2, col3][idx % 3];
    const count = categoryCount.get(category.id) || 0;
    return {
      img: image,
      title: category.name,
      desc: category.description || `${count} styles in conscious fabrics.`,
      tag: `${count} Styles`,
    };
  });

  const displayCollections = dynamicCollections.length > 0 ? dynamicCollections : fallbackCollections;

  return (
    <section id="collections" className="py-24 md:py-36 px-6 md:px-12 bg-card">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">Collections</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Curated with care.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {displayCollections.map((col, i) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="group cursor-pointer"
            >
              <Link to="/shop" className="block">
                <div className="relative overflow-hidden mb-5">
                  <img
                    src={col.img}
                    alt={col.title}
                    className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    width={800}
                    height={1024}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-background/90 text-foreground text-xs tracking-widest uppercase px-3 py-1.5 font-medium">
                      {col.tag}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground tracking-tight mb-1">{col.title}</h3>
                <p className="text-sm text-muted-foreground">{col.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Collections;
