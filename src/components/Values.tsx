import { motion } from "framer-motion";
import { Leaf, Recycle, Heart, Shield } from "lucide-react";

const values = [
  {
    icon: Leaf,
    title: "Organic First",
    desc: "Every fiber is traceable. We use only certified organic and regenerative materials.",
  },
  {
    icon: Recycle,
    title: "Circular by Design",
    desc: "Built for longevity. Every garment can be returned, repaired, or recycled.",
  },
  {
    icon: Heart,
    title: "Fair Labor",
    desc: "Our makers earn living wages. No exceptions, no compromises.",
  },
  {
    icon: Shield,
    title: "Radical Transparency",
    desc: "Full supply chain visibility. Know exactly where your clothes come from.",
  },
];

const Values = () => {
  return (
    <section id="sustainability" className="py-24 md:py-36 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">Our Values</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground max-w-2xl mx-auto">
            Fashion with a conscience.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-background p-8 md:p-10 group"
            >
              <v.icon className="w-6 h-6 text-accent mb-6 group-hover:text-foreground transition-colors" strokeWidth={1.5} />
              <h3 className="text-lg font-semibold text-foreground mb-3 tracking-tight">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Values;
