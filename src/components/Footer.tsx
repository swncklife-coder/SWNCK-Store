import logo from "@/assets/swnck-logo.png";
import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { resolvePublicAssetUrl } from "@/lib/site-url";

const footerLinks = {
  Shop: ["Collections", "New Arrivals", "Bestsellers", "Sale"],
  Company: ["Our Story", "Sustainability", "Careers", "Press"],
  Help: ["FAQ", "Shipping", "Returns", "Contact"],
};

const Footer = () => {
  const { settings } = useSiteSettings();
  const logoFromSettings = settings.get("logo_url");
  const logoUrl = logoFromSettings ? (resolvePublicAssetUrl(logoFromSettings) ?? logoFromSettings) : logo;
  const contactEmail = settings.get("contact_email") || "hello@swnck.in";
  const contactPhone = settings.get("contact_phone") || "+91-00000-00000";

  return (
    <footer className="border-t border-border px-6 md:px-12 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div>
            <img src={logoUrl} alt="SWNCK" className="h-20 md:h-24 w-auto mb-4" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sustainable fashion for a conscious future. Made with intention, worn with pride.
            </p>
            <p className="text-sm text-muted-foreground mt-3">{contactEmail}</p>
            <p className="text-sm text-muted-foreground">{contactPhone}</p>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold tracking-widest uppercase text-foreground mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 SWNCK. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs tracking-widest uppercase">
            <Link to="/pages/about-us" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link to="/pages/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/pages/terms-and-conditions" className="text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
            <Link to="/pages/return-policy" className="text-muted-foreground hover:text-foreground transition-colors">Returns</Link>
            <Link to="/pages/contact-us" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
