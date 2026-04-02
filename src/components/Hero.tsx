import { motion } from "framer-motion";
import heroImg from "@/assets/hero-fashion.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-end overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="SWNCK sustainable fashion editorial"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-6 md:px-12 pb-16 md:pb-24">
        <div className="max-w-5xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm md:text-base tracking-[0.3em] uppercase text-muted-foreground mb-4"
          >
            Sustainable Fashion — Redefined
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] text-foreground mb-6"
          >
            Wear the
            <br />
            change.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-base md:text-lg text-muted-foreground max-w-md leading-relaxed mb-8"
          >
            Conscious design meets uncompromising style. Every piece crafted with intention, built to last.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex gap-4"
          >
            <a
              href="#collections"
              className="inline-block bg-foreground text-background px-8 py-3.5 text-sm font-semibold tracking-widest uppercase hover:bg-accent hover:text-accent-foreground transition-all duration-300"
            >
              Explore
            </a>
            <a
              href="#story"
              className="inline-block border border-foreground text-foreground px-8 py-3.5 text-sm font-semibold tracking-widest uppercase hover:bg-foreground hover:text-background transition-all duration-300"
            >
              Our Story
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
