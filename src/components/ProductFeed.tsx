import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import prod1 from "@/assets/product-bamboo-tee.jpg";
import prod2 from "@/assets/product-organic-top.jpg";
import prod3 from "@/assets/product-bamboo-black.jpg";
import prod4 from "@/assets/product-organic-sage.jpg";

const products = [
  {
    img: prod1,
    name: "Bamboo Crew Tee — Olive",
    category: "Unisex",
    material: "100% Bamboo",
    price: "$68",
  },
  {
    img: prod2,
    name: "Organic Cotton Top — Ivory",
    category: "Women",
    material: "Organic Cotton",
    price: "$74",
  },
  {
    img: prod3,
    name: "Bamboo Crew Tee — Black",
    category: "Unisex",
    material: "100% Bamboo",
    price: "$68",
  },
  {
    img: prod4,
    name: "Organic Blouse — Sage",
    category: "Women",
    material: "Organic Cotton",
    price: "$82",
  },
];

const ProductFeed = () => {
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
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors group"
          >
            View all
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, i) => (
            <motion.a
              key={product.name}
              href="#"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group block"
            >
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
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductFeed;
