import logo from "@/assets/swnck-logo.png";

const footerLinks = {
  Shop: ["Collections", "New Arrivals", "Bestsellers", "Sale"],
  Company: ["Our Story", "Sustainability", "Careers", "Press"],
  Help: ["FAQ", "Shipping", "Returns", "Contact"],
};

const Footer = () => {
  return (
    <footer className="border-t border-border px-6 md:px-12 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div>
            <img src={logo} alt="SWNCK" className="h-20 md:h-24 w-auto mb-4" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sustainable fashion for a conscious future. Made with intention, worn with pride.
            </p>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold tracking-widest uppercase text-foreground mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
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
          <div className="flex gap-6">
            {["Instagram", "Twitter", "TikTok"].map((s) => (
              <a key={s} href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors tracking-widest uppercase">
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
