import { motion } from "framer-motion";
import craftImg from "@/assets/collection-2.jpg";

const Story = () => {
  return (
    <section id="story" className="py-24 md:py-36 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <img
            src={craftImg}
            alt="Artisan craftsmanship"
            className="w-full aspect-[3/4] object-cover"
            loading="lazy"
            width={800}
            height={1024}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
            Our Story
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-6 leading-tight">
            Born from
            <br />
            intention.
          </h2>
          <div className="space-y-5 text-muted-foreground leading-relaxed">
            <p>
              SWNCK was founded on a simple belief: fashion should never cost the earth. We bridge the gap between high design and deep responsibility.
            </p>
            <p>
              Every garment begins with ethically sourced materials — organic cotton, recycled fibers, plant-based dyes — and is brought to life by artisans who are paid fairly for their craft.
            </p>
            <p>
              We don't follow seasons. We create timeless pieces designed to outlast trends, reduce waste, and make you feel extraordinary.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-10">
            {[
              { num: "100%", label: "Organic Materials" },
              { num: "Zero", label: "Waste Goal" },
              { num: "Fair", label: "Trade Certified" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.num}</p>
                <p className="text-xs tracking-widest uppercase text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Story;
