import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import heroImg from "@/assets/hero-fashion.jpg";
import { supabase } from "@/lib/supabase";
import type { HomepageSection } from "@/types/commerce";
import { cn } from "@/lib/utils";
import { resolvePublicAssetUrl } from "@/lib/site-url";

export type HeroPreview = Partial<
  Pick<HomepageSection, "title" | "subtitle" | "description" | "image_url" | "cta_label" | "cta_href">
>;

type HeroProps = {
  /** Live preview from admin: merged on top of loaded CMS data */
  preview?: HeroPreview | null;
  /** Compact layout for admin preview panel */
  variant?: "default" | "compact";
};

function Hero({ preview = null, variant = "default" }: HeroProps) {
  const heroQuery = useQuery({
    queryKey: ["homepage-hero"],
    queryFn: async () => {
      const { data, error } = await supabase.from("homepage_section").select("*").eq("section_key", "hero").maybeSingle();
      if (error) throw error;
      return (data || null) as HomepageSection | null;
    },
  });
  const hero = heroQuery.data;
  const display = { ...(hero ?? {}), ...(preview ?? {}) } as Partial<HomepageSection>;
  const heroImageRaw = display?.image_url || heroImg;
  const heroImage =
    typeof heroImageRaw === "string" ? (resolvePublicAssetUrl(heroImageRaw) ?? heroImageRaw) : heroImageRaw;
  const ctaHrefRaw = display?.cta_href || "#collections";
  const ctaHref = resolvePublicAssetUrl(ctaHrefRaw) ?? ctaHrefRaw;

  const isCompact = variant === "compact";

  return (
    <section
      className={cn(
        "relative flex items-end overflow-hidden",
        isCompact ? "min-h-[280px] md:min-h-[320px]" : "min-h-screen",
      )}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="SWNCK sustainable fashion editorial"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      {/* Content */}
      <div className={cn("relative z-10 w-full px-6 md:px-12", isCompact ? "pb-8 pt-12" : "pb-16 md:pb-24")}>
        <div className="max-w-5xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={cn("tracking-[0.3em] uppercase text-muted-foreground mb-4", isCompact ? "text-xs" : "text-sm md:text-base")}
          >
            {display?.subtitle || "Sustainable Fashion — Redefined"}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className={cn(
              "font-bold tracking-tight leading-[0.9] text-foreground mb-6",
              isCompact ? "text-2xl md:text-4xl" : "text-4xl md:text-7xl lg:text-8xl",
            )}
          >
            {display?.title || (
              <>
                Wear the
                <br />
                change.
              </>
            )}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className={cn(
              "text-muted-foreground max-w-md leading-relaxed mb-8",
              isCompact ? "text-xs md:text-sm line-clamp-3" : "text-base md:text-lg",
            )}
          >
            {display?.description || "Conscious design meets uncompromising style. Every piece crafted with intention, built to last."}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className={cn("flex gap-4", isCompact && "flex-wrap")}
          >
            <a
              href={ctaHref}
              className={cn(
                "inline-block bg-foreground text-background font-semibold tracking-widest uppercase hover:bg-accent hover:text-accent-foreground transition-all duration-300",
                isCompact ? "px-4 py-2 text-xs" : "px-8 py-3.5 text-sm",
              )}
            >
              {display?.cta_label || "Explore"}
            </a>
            {!isCompact && (
              <a
                href="#story"
                className="inline-block border border-foreground text-foreground px-8 py-3.5 text-sm font-semibold tracking-widest uppercase hover:bg-foreground hover:text-background transition-all duration-300"
              >
                Our Story
              </a>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
