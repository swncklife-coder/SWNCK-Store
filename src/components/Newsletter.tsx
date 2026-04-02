import { motion } from "framer-motion";
import { useState } from "react";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  return (
    <section id="newsletter" className="py-24 md:py-36 px-6 md:px-12 bg-card">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">Stay Connected</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Join the movement.
          </h2>
          <p className="text-muted-foreground mb-10 max-w-md mx-auto">
            Be the first to know about new drops, behind-the-scenes stories, and our sustainability journey.
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="flex-1 bg-background border border-border px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
            />
            <button
              type="submit"
              className="bg-foreground text-background px-8 py-3.5 text-sm font-semibold tracking-widest uppercase hover:bg-accent hover:text-accent-foreground transition-all duration-300 whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;
