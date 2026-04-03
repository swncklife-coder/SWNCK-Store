import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query";
import { BrowserRouter, Link, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import NotFound from "./pages/NotFound.tsx";
import Index from "./pages/Index.tsx";
import Hero from "@/components/Hero";
import { ProductDetail } from "@/components/ProductDetail";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { AdminCatalogPanel } from "@/components/admin/AdminCatalogPanel";
import { MarkdownContent } from "@/lib/markdown";
import { supabase } from "@/lib/supabase";
import type { CmsPage, HomepageSection, Product, ProductCategory, ProductCollection, ProductVariant, SiteSetting } from "@/types/commerce";
import { DEFAULT_PDP_TEMPLATE, type PdpTemplate, parsePdpTemplate } from "@/types/pdp-template";
import { formatInr } from "@/lib/format";

const queryClient = new QueryClient();

const PDP_PREVIEW_MOCK_PRODUCT: Product = {
  id: "__pdp_preview__",
  title: "Bamboo Crew Tee — Preview",
  slug: "preview-product",
  description: "Soft, breathable fabric for daily wear. This is sample copy so you can see how your template looks.",
  category_id: "",
  primary_image_url: null,
  sustainability_story: "Lower-impact fibres and mindful production — preview block.",
  fit_notes: "Relaxed through the body. Model wears M.",
  care_instructions: "Machine wash cold. Hang dry for best longevity.",
  is_active: true,
  is_featured: true,
  sort_order: 0,
  category: { id: "", name: "Unisex", slug: "unisex", description: null, is_active: true, sort_order: 0 },
};

const PDP_PREVIEW_MOCK_VARIANTS: ProductVariant[] = [
  {
    id: "__pv1__",
    product_id: "__pdp_preview__",
    sku: "PREVIEW-OLV-M",
    size: "M",
    color: "Olive",
    material: "Bamboo viscose",
    inventory_qty: 99,
    price_inr: 1899,
    compare_at_price_inr: 2199,
    weight_grams: 180,
    image_url: null,
    is_active: true,
  },
  {
    id: "__pv2__",
    product_id: "__pdp_preview__",
    sku: "PREVIEW-OLV-L",
    size: "L",
    color: "Olive",
    material: "Bamboo viscose",
    inventory_qty: 99,
    price_inr: 1899,
    compare_at_price_inr: null,
    weight_grams: 190,
    image_url: null,
    is_active: true,
  },
];

type CartItem = {
  variantId: string;
  productTitle: string;
  size: string;
  color: string;
  qty: number;
  unitPriceInr: number;
};

function useStoreData() {
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("product_category").select("*").eq("is_active", true).order("sort_order");
      if (error) throw error;
      return (data || []) as ProductCategory[];
    },
  });

  const products = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product")
        .select("*, category:product_category(*)")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return (data || []) as Product[];
    },
  });

  const variants = useQuery({
    queryKey: ["variants"],
    queryFn: async () => {
      const { data, error } = await supabase.from("product_variant").select("*").eq("is_active", true);
      if (error) throw error;
      return (data || []) as ProductVariant[];
    },
  });

  return { categories, products, variants };
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold tracking-widest">SWNCK</Link>
          <nav className="flex items-center gap-5 text-sm">
            <NavLink to="/shop">Shop</NavLink>
            <NavLink to="/cart">Cart</NavLink>
            <NavLink to="/checkout">Checkout</NavLink>
            <NavLink to="/admin">Admin</NavLink>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}

function HomePage() {
  const { products, variants } = useStoreData();
  const featured = (products.data || []).filter((p) => p.is_featured).slice(0, 4);
  const lowestPriceByProduct = useMemo(() => {
    const map = new Map<string, number>();
    (variants.data || []).forEach((v) => {
      const prev = map.get(v.product_id);
      if (prev === undefined || v.price_inr < prev) map.set(v.product_id, v.price_inr);
    });
    return map;
  }, [variants.data]);

  return (
    <AppShell>
      <main className="max-w-6xl mx-auto px-4 py-12 space-y-10">
        <section className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Sustainable Fashion, India</p>
          <h1 className="text-4xl md:text-6xl font-semibold">Bamboo and Organic Cotton essentials.</h1>
          <p className="text-muted-foreground max-w-2xl">
            Built for everyday comfort with conscious sourcing, durable stitching, and low-impact materials.
          </p>
          <Link to="/shop" className="inline-block rounded-md bg-foreground text-background px-5 py-2 text-sm">Shop collection</Link>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Featured</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {featured.map((product) => (
              <Link key={product.id} to={`/products/${product.slug}`} className="border rounded-lg p-4 hover:border-foreground/50">
                <p className="text-sm text-muted-foreground">{product.category?.name}</p>
                <h3 className="font-medium mt-1">{product.title}</h3>
                <p className="text-sm mt-2">{formatInr(lowestPriceByProduct.get(product.id) || 0)}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}

function ShopPage({ onAddToCart }: { onAddToCart: (item: CartItem) => void }) {
  const { categories, products, variants } = useStoreData();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const filtered = (products.data || []).filter((p) => selectedCategory === "all" || p.category_id === selectedCategory);

  const firstVariantByProduct = useMemo(() => {
    const map = new Map<string, ProductVariant>();
    (variants.data || []).forEach((variant) => {
      if (!map.has(variant.product_id)) map.set(variant.product_id, variant);
    });
    return map;
  }, [variants.data]);

  return (
    <AppShell>
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-semibold mb-6">Shop</h1>
        <div className="flex gap-2 flex-wrap mb-6">
          <button onClick={() => setSelectedCategory("all")} className="border rounded px-3 py-1">All</button>
          {(categories.data || []).map((category) => (
            <button key={category.id} onClick={() => setSelectedCategory(category.id)} className="border rounded px-3 py-1">
              {category.name}
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {filtered.map((product) => {
            const variant = firstVariantByProduct.get(product.id);
            if (!variant) return null;
            return (
              <article key={product.id} className="border rounded-lg p-4 space-y-3">
                <Link to={`/products/${product.slug}`} className="font-medium block">{product.title}</Link>
                <p className="text-sm text-muted-foreground">{product.sustainability_story || "Sustainable material composition."}</p>
                <p className="text-sm">{formatInr(variant.price_inr)}</p>
                <button
                  onClick={() =>
                    onAddToCart({
                      variantId: variant.id,
                      productTitle: product.title,
                      size: variant.size,
                      color: variant.color,
                      qty: 1,
                      unitPriceInr: variant.price_inr,
                    })
                  }
                  className="text-sm rounded bg-foreground text-background px-3 py-2"
                >
                  Add to cart
                </button>
              </article>
            );
          })}
        </div>
      </main>
    </AppShell>
  );
}

function ProductPage({ onAddToCart }: { onAddToCart: (item: CartItem) => void }) {
  const { slug } = useParams();
  const { products, variants } = useStoreData();
  const pdpTemplateQuery = useQuery({
    queryKey: ["pdp-template"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_setting").select("value").eq("key", "pdp_template").maybeSingle();
      if (error) throw error;
      return parsePdpTemplate(data?.value);
    },
  });

  const product = (products.data || []).find((p) => p.slug === slug);
  const relatedVariants = (variants.data || []).filter((v) => v.product_id === product?.id);
  if (!product) return <NotFound />;

  const template = pdpTemplateQuery.data ?? DEFAULT_PDP_TEMPLATE;

  return (
    <AppShell>
      <main className="max-w-6xl mx-auto px-4 py-10">
        <ProductDetail product={product} variants={relatedVariants} template={template} onAddToCart={onAddToCart} />
      </main>
    </AppShell>
  );
}

function CartPage({ cart, onUpdateQty }: { cart: CartItem[]; onUpdateQty: (variantId: string, qty: number) => void }) {
  const total = cart.reduce((sum, item) => sum + item.qty * item.unitPriceInr, 0);
  return (
    <AppShell>
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-semibold mb-6">Cart</h1>
        <div className="space-y-3">
          {cart.map((item) => (
            <div key={item.variantId} className="border rounded p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{item.productTitle}</p>
                <p className="text-sm text-muted-foreground">{item.size} / {item.color}</p>
              </div>
              <input
                type="number"
                min={1}
                className="border rounded w-20 px-2 py-1"
                value={item.qty}
                onChange={(e) => onUpdateQty(item.variantId, Number(e.target.value))}
              />
              <p>{formatInr(item.qty * item.unitPriceInr)}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 text-right font-semibold">Total: {formatInr(total)}</div>
      </main>
    </AppShell>
  );
}

function CheckoutPage({ cart, onClearCart }: { cart: CartItem[]; onClearCart: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const navigate = useNavigate();
  const total = cart.reduce((sum, item) => sum + item.qty * item.unitPriceInr, 0);

  async function placeOrder() {
    if (!cart.length) return;
    const { data: order, error: orderError } = await supabase
      .from("customer_order")
      .insert({
        customer_name: name,
        phone,
        email,
        shipping_address: address,
        payment_method: paymentMethod,
        order_status: "pending",
        total_inr: total,
      })
      .select("*")
      .single();
    if (orderError || !order) {
      alert(orderError?.message || "Could not create order.");
      return;
    }

    const orderItems = cart.map((item) => ({
      order_id: order.id,
      variant_id: item.variantId,
      quantity: item.qty,
      unit_price_inr: item.unitPriceInr,
      line_total_inr: item.unitPriceInr * item.qty,
    }));

    const { error: itemError } = await supabase.from("customer_order_item").insert(orderItems);
    if (itemError) {
      alert(itemError.message);
      return;
    }

    onClearCart();
    alert("Order placed. Configure Razorpay/Cashfree webhook next for payment confirmation.");
    navigate("/");
  }

  return (
    <AppShell>
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        <h1 className="text-3xl font-semibold">Checkout</h1>
        <input placeholder="Full name" className="border rounded w-full p-2" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Phone" className="border rounded w-full p-2" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input placeholder="Email" className="border rounded w-full p-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        <textarea placeholder="Shipping address" className="border rounded w-full p-2" value={address} onChange={(e) => setAddress(e.target.value)} />
        <select className="border rounded w-full p-2" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <option value="upi">UPI</option>
          <option value="card">Card</option>
          <option value="cod">Cash on Delivery</option>
        </select>
        <div className="font-semibold">Payable: {formatInr(total)}</div>
        <button onClick={placeOrder} className="rounded bg-foreground text-background px-4 py-2">Place order</button>
      </main>
    </AppShell>
  );
}

function AdminPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [session, setSession] = useState<boolean>(false);
  const [pageTitle, setPageTitle] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [pageContent, setPageContent] = useState("");
  const [cmsSelectedSlug, setCmsSelectedSlug] = useState<string>("");
  const [pdpDraft, setPdpDraft] = useState<PdpTemplate>(DEFAULT_PDP_TEMPLATE);
  const [settingKey, setSettingKey] = useState("");
  const [settingValue, setSettingValue] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroDescription, setHeroDescription] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [heroCtaLabel, setHeroCtaLabel] = useState("");
  const [heroCtaHref, setHeroCtaHref] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [editMode, setEditMode] = useState<Record<string, boolean>>({
    hero: false,
    pages: false,
    branding: false,
    contact: false,
    advanced: false,
    pdp: false,
  });

  const categories = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => (await supabase.from("product_category").select("*").order("sort_order")).data as ProductCategory[],
  });
  const products = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("product").select("*, category:product_category(*)").order("sort_order");
      if (error) throw error;
      return (data || []) as Product[];
    },
  });
  const variants = useQuery({
    queryKey: ["admin-variants"],
    queryFn: async () => (await supabase.from("product_variant").select("*")).data as ProductVariant[],
  });
  const pages = useQuery({
    queryKey: ["admin-pages"],
    queryFn: async () => (await supabase.from("cms_page").select("*").order("title")).data as CmsPage[],
  });
  const settings = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => (await supabase.from("site_setting").select("*").order("key")).data as SiteSetting[],
  });
  const collections = useQuery({
    queryKey: ["admin-collections"],
    queryFn: async () => (await supabase.from("product_collection").select("*").order("sort_order")).data as ProductCollection[],
  });
  const homepage = useQuery({
    queryKey: ["admin-homepage"],
    queryFn: async () => (await supabase.from("homepage_section").select("*")).data as HomepageSection[],
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(Boolean(data.session)));
  }, []);

  async function loginWithPassword() {
    if (!email || !password) {
      toast({ title: "Missing credentials", description: "Enter both email and password.", variant: "destructive" });
      return;
    }
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setAuthLoading(false);
    if (error) {
      toast({ title: "Sign-in failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Signed in", description: "Admin session started." });
      const { data } = await supabase.auth.getSession();
      setSession(Boolean(data.session));
    }
  }

  async function saveCmsPage() {
    const { error } = await supabase.from("cms_page").upsert(
      { title: pageTitle, slug: pageSlug, content_md: pageContent, is_published: true },
      { onConflict: "slug" },
    );
    if (error) alert(error.message);
    else {
      await queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      toast({ title: "Saved", description: "Page published successfully." });
      setEditMode((prev) => ({ ...prev, pages: false }));
    }
  }

  async function savePdpTemplate() {
    const { error } = await supabase.from("site_setting").upsert(
      { key: "pdp_template", value: JSON.stringify(pdpDraft) },
      { onConflict: "key" },
    );
    if (error) alert(error.message);
    else {
      await queryClient.invalidateQueries({ queryKey: ["pdp-template"] });
      toast({ title: "Saved", description: "Product page template updated." });
      setEditMode((prev) => ({ ...prev, pdp: false }));
    }
  }

  async function upsertSetting() {
    const { error } = await supabase.from("site_setting").upsert({ key: settingKey, value: settingValue }, { onConflict: "key" });
    if (error) alert(error.message);
    else {
      await queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast({ title: "Saved", description: "Setting updated." });
      setEditMode((prev) => ({ ...prev, advanced: false }));
    }
  }

  async function saveBranding() {
    const payload = [
      { key: "logo_url", value: logoUrl || "" },
      { key: "favicon_url", value: faviconUrl || "" },
    ];
    const { error } = await supabase.from("site_setting").upsert(payload, { onConflict: "key" });
    if (error) alert(error.message);
    else {
      await queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast({ title: "Saved", description: "Branding updated." });
      setEditMode((prev) => ({ ...prev, branding: false }));
    }
  }

  async function saveContactDetails() {
    const payload = [
      { key: "contact_phone", value: contactPhone || "" },
      { key: "contact_email", value: contactEmail || "" },
      { key: "contact_whatsapp", value: contactWhatsapp || "" },
      { key: "contact_address", value: contactAddress || "" },
    ];
    const { error } = await supabase.from("site_setting").upsert(payload, { onConflict: "key" });
    if (error) alert(error.message);
    else {
      await queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast({ title: "Saved", description: "Contact details updated." });
      setEditMode((prev) => ({ ...prev, contact: false }));
    }
  }

  async function saveHeroSection() {
    const { error } = await supabase.from("homepage_section").upsert(
      {
        section_key: "hero",
        title: heroTitle,
        subtitle: heroSubtitle,
        description: heroDescription,
        image_url: heroImageUrl,
        cta_label: heroCtaLabel,
        cta_href: heroCtaHref,
      },
      { onConflict: "section_key" },
    );
    if (error) alert(error.message);
    else {
      await queryClient.invalidateQueries({ queryKey: ["admin-homepage"] });
      await queryClient.invalidateQueries({ queryKey: ["homepage-hero"] });
      toast({ title: "Saved", description: "Homepage hero updated." });
      setEditMode((prev) => ({ ...prev, hero: false }));
    }
  }

  useEffect(() => {
    const settingMap = new Map((settings.data || []).map((s) => [s.key, s.value]));
    setLogoUrl(settingMap.get("logo_url") || "");
    setFaviconUrl(settingMap.get("favicon_url") || "");
    setContactPhone(settingMap.get("contact_phone") || "");
    setContactEmail(settingMap.get("contact_email") || "");
    setContactWhatsapp(settingMap.get("contact_whatsapp") || "");
    setContactAddress(settingMap.get("contact_address") || "");
    setPdpDraft(parsePdpTemplate(settingMap.get("pdp_template")));
  }, [settings.data]);

  useEffect(() => {
    const hero = (homepage.data || []).find((s) => s.section_key === "hero");
    if (!hero) return;
    setHeroTitle(hero.title || "");
    setHeroSubtitle(hero.subtitle || "");
    setHeroDescription(hero.description || "");
    setHeroImageUrl(hero.image_url || "");
    setHeroCtaLabel(hero.cta_label || "");
    setHeroCtaHref(hero.cta_href || "");
  }, [homepage.data]);

  if (!session) {
    return (
      <AppShell>
        <main className="max-w-lg mx-auto px-4 py-16 space-y-4">
          <h1 className="text-3xl font-semibold">Admin sign-in</h1>
          <p className="text-sm text-muted-foreground">
            Use a Supabase-authenticated admin email and password with access to the SWNCK project.
          </p>
          <input className="border rounded w-full p-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" />
          <input
            className="border rounded w-full p-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <Button onClick={loginWithPassword} disabled={authLoading}>
            {authLoading ? "Signing in..." : "Sign in"}
          </Button>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="max-w-7xl mx-auto px-4 py-10 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">SWNCK Admin</CardTitle>
            <CardDescription>Manage catalog, homepage content, policies, and branding from one place.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-5 gap-3">
            <div className="rounded-lg border p-4"><p className="text-sm text-muted-foreground">Categories</p><p className="text-2xl font-semibold">{(categories.data || []).length}</p></div>
            <div className="rounded-lg border p-4"><p className="text-sm text-muted-foreground">Products</p><p className="text-2xl font-semibold">{(products.data || []).length}</p></div>
            <div className="rounded-lg border p-4"><p className="text-sm text-muted-foreground">Variants</p><p className="text-2xl font-semibold">{(variants.data || []).length}</p></div>
            <div className="rounded-lg border p-4"><p className="text-sm text-muted-foreground">Collections</p><p className="text-2xl font-semibold">{(collections.data || []).length}</p></div>
            <div className="rounded-lg border p-4"><p className="text-sm text-muted-foreground">CMS Pages</p><p className="text-2xl font-semibold">{(pages.data || []).length}</p></div>
          </CardContent>
        </Card>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <div className="grid lg:grid-cols-[220px_1fr] gap-6">
            <TabsList className="h-fit w-full flex flex-col items-stretch gap-1 rounded-xl border bg-card p-2">
              <TabsTrigger value="dashboard" className="justify-start">Dashboard</TabsTrigger>
              <TabsTrigger value="catalog" className="justify-start">Catalog</TabsTrigger>
              <TabsTrigger value="content" className="justify-start">Content</TabsTrigger>
              <TabsTrigger value="brand" className="justify-start">Brand & Contact</TabsTrigger>
              <TabsTrigger value="advanced" className="justify-start">Advanced</TabsTrigger>
            </TabsList>
            <div className="space-y-4">
          <TabsContent value="dashboard">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Dashboard</CardTitle>
                <CardDescription>Quick snapshot and suggested admin flow.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>1) Update homepage hero and branding.</p>
                <p>2) Create categories, then products and variants.</p>
                <p>3) Build collections and assign products.</p>
                <p>4) Finalize About/Privacy/Terms/Returns/Contact pages.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="catalog">
            <AdminCatalogPanel />
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Site Content</CardTitle>
                <CardDescription>Edit homepage sections and legal/informational pages.</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple">
                  <AccordionItem value="hero">
                    <AccordionTrigger>Homepage Hero</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Button variant="outline" onClick={() => setEditMode((p) => ({ ...p, hero: true }))}>Edit</Button>
                        <Button onClick={saveHeroSection} disabled={!editMode.hero}>Save Changes</Button>
                        <p className="text-xs text-muted-foreground w-full">Changes show instantly in the live preview before you save.</p>
                      </div>
                      <div className="grid xl:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <input disabled={!editMode.hero} className="border rounded p-2 w-full disabled:opacity-60" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="Hero title" />
                          <input disabled={!editMode.hero} className="border rounded p-2 w-full disabled:opacity-60" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} placeholder="Hero subtitle" />
                          <textarea disabled={!editMode.hero} className="border rounded p-2 w-full disabled:opacity-60" rows={3} value={heroDescription} onChange={(e) => setHeroDescription(e.target.value)} placeholder="Hero description" />
                          <ImageUploadField
                            label="Hero background image"
                            disabled={!editMode.hero}
                            value={heroImageUrl}
                            onChange={setHeroImageUrl}
                          />
                          <div className="grid md:grid-cols-2 gap-2">
                            <input disabled={!editMode.hero} className="border rounded p-2 disabled:opacity-60" value={heroCtaLabel} onChange={(e) => setHeroCtaLabel(e.target.value)} placeholder="CTA label" />
                            <input disabled={!editMode.hero} className="border rounded p-2 disabled:opacity-60" value={heroCtaHref} onChange={(e) => setHeroCtaHref(e.target.value)} placeholder="CTA href (#collections or /shop)" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Live preview</p>
                          <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
                            <Hero
                              variant="compact"
                              preview={{
                                title: heroTitle || undefined,
                                subtitle: heroSubtitle || undefined,
                                description: heroDescription || undefined,
                                image_url: heroImageUrl || undefined,
                                cta_label: heroCtaLabel || undefined,
                                cta_href: heroCtaHref || undefined,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="pdp">
                    <AccordionTrigger>Product page template</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Button variant="outline" onClick={() => setEditMode((p) => ({ ...p, pdp: true }))}>Edit</Button>
                        <Button onClick={savePdpTemplate} disabled={!editMode.pdp}>Save Changes</Button>
                        <p className="text-xs text-muted-foreground w-full">Preview uses your first catalog product, or a built-in sample if the catalog is empty.</p>
                      </div>
                      <div className="grid xl:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Layout</Label>
                            <select
                              disabled={!editMode.pdp}
                              className="w-full border rounded-md p-2 bg-background disabled:opacity-60"
                              value={pdpDraft.layout}
                              onChange={(e) => setPdpDraft((d) => ({ ...d, layout: e.target.value as PdpTemplate["layout"] }))}
                            >
                              <option value="split">Split — image + details</option>
                              <option value="stacked">Stacked — image above details</option>
                            </select>
                          </div>
                          {pdpDraft.layout === "split" && (
                            <div className="space-y-2">
                              <Label>Image position</Label>
                              <select
                                disabled={!editMode.pdp}
                                className="w-full border rounded-md p-2 bg-background disabled:opacity-60"
                                value={pdpDraft.imagePosition}
                                onChange={(e) => setPdpDraft((d) => ({ ...d, imagePosition: e.target.value as PdpTemplate["imagePosition"] }))}
                              >
                                <option value="left">Left</option>
                                <option value="right">Right</option>
                              </select>
                            </div>
                          )}
                          <div className="space-y-2">
                            <Label>Variant picker</Label>
                            <select
                              disabled={!editMode.pdp}
                              className="w-full border rounded-md p-2 bg-background disabled:opacity-60"
                              value={pdpDraft.variantPickerStyle}
                              onChange={(e) =>
                                setPdpDraft((d) => ({ ...d, variantPickerStyle: e.target.value as PdpTemplate["variantPickerStyle"] }))
                              }
                            >
                              <option value="select">Dropdown</option>
                              <option value="buttons">Buttons</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <Label htmlFor="pdp-sust">Show sustainability block</Label>
                            <Switch
                              id="pdp-sust"
                              disabled={!editMode.pdp}
                              checked={pdpDraft.showSustainability}
                              onCheckedChange={(c) => setPdpDraft((d) => ({ ...d, showSustainability: c }))}
                            />
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <Label htmlFor="pdp-fit">Show fit notes</Label>
                            <Switch
                              id="pdp-fit"
                              disabled={!editMode.pdp}
                              checked={pdpDraft.showFitNotes}
                              onCheckedChange={(c) => setPdpDraft((d) => ({ ...d, showFitNotes: c }))}
                            />
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <Label htmlFor="pdp-care">Show care instructions</Label>
                            <Switch
                              id="pdp-care"
                              disabled={!editMode.pdp}
                              checked={pdpDraft.showCare}
                              onCheckedChange={(c) => setPdpDraft((d) => ({ ...d, showCare: c }))}
                            />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Live preview</p>
                          <div className="rounded-xl border bg-background p-4 shadow-sm max-h-[560px] overflow-y-auto">
                            {(() => {
                              const first = (products.data || [])[0];
                              const sample = first || PDP_PREVIEW_MOCK_PRODUCT;
                              const vList =
                                first
                                  ? (variants.data || []).filter((v) => v.product_id === first.id)
                                  : PDP_PREVIEW_MOCK_VARIANTS;
                              return (
                                <ProductDetail
                                  preview
                                  product={sample}
                                  variants={vList.length ? vList : PDP_PREVIEW_MOCK_VARIANTS}
                                  template={pdpDraft}
                                  onAddToCart={() => undefined}
                                />
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="pages">
                    <AccordionTrigger>Pages (About, Privacy, Terms, Returns, Contact)</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Button variant="outline" onClick={() => setEditMode((p) => ({ ...p, pages: true }))}>Edit</Button>
                        <Button onClick={saveCmsPage} disabled={!editMode.pages}>Save Changes</Button>
                      </div>
                      <div className="space-y-3 mb-4">
                        <div className="space-y-1">
                          <Label>Load existing page</Label>
                          <select
                            className="w-full border rounded-md p-2 bg-background"
                            value={cmsSelectedSlug}
                            onChange={(e) => {
                              const s = e.target.value;
                              setCmsSelectedSlug(s);
                              const p = (pages.data || []).find((x) => x.slug === s);
                              if (p) {
                                setPageTitle(p.title);
                                setPageSlug(p.slug);
                                setPageContent(p.content_md);
                              }
                            }}
                          >
                            <option value="">New page…</option>
                            {(pages.data || []).map((p) => (
                              <option key={p.id} value={p.slug}>
                                {p.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setCmsSelectedSlug("");
                            setPageTitle("");
                            setPageSlug("");
                            setPageContent("");
                          }}
                        >
                          Clear form
                        </Button>
                      </div>
                      <div className="grid xl:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <input disabled={!editMode.pages} className="border rounded p-2 w-full disabled:opacity-60" value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} placeholder="Page title" />
                          <input disabled={!editMode.pages} className="border rounded p-2 w-full disabled:opacity-60" value={pageSlug} onChange={(e) => setPageSlug(e.target.value)} placeholder="URL slug (e.g. privacy-policy)" />
                          <textarea disabled={!editMode.pages} className="border rounded p-2 w-full disabled:opacity-60 font-mono text-sm" rows={14} value={pageContent} onChange={(e) => setPageContent(e.target.value)} placeholder="Markdown content" />
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Live preview</p>
                          <div className="rounded-xl border bg-card p-6 min-h-[320px] max-h-[520px] overflow-y-auto">
                            {pageTitle ? <h2 className="text-2xl font-semibold mb-4">{pageTitle}</h2> : null}
                            <MarkdownContent content={pageContent || "*Start typing to preview…*"} />
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 space-y-1 text-sm text-muted-foreground">{(pages.data || []).map((p) => <p key={p.id}>{p.title} — /pages/{p.slug}</p>)}</div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="brand">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Brand, Contact & Assets</CardTitle>
                <CardDescription>Update visible brand identity and contact metadata.</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple">
                  <AccordionItem value="branding">
                    <AccordionTrigger>Logo and Favicon</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex gap-2 mb-3">
                        <Button variant="outline" onClick={() => setEditMode((p) => ({ ...p, branding: true }))}>Edit</Button>
                        <Button onClick={saveBranding} disabled={!editMode.branding}>Save Changes</Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <ImageUploadField label="Logo" disabled={!editMode.branding} value={logoUrl} onChange={setLogoUrl} />
                        <ImageUploadField label="Favicon" helperText="PNG, ICO, or SVG." disabled={!editMode.branding} value={faviconUrl} onChange={setFaviconUrl} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="contact">
                    <AccordionTrigger>Contact Details</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex gap-2 mb-3">
                        <Button variant="outline" onClick={() => setEditMode((p) => ({ ...p, contact: true }))}>Edit</Button>
                        <Button onClick={saveContactDetails} disabled={!editMode.contact}>Save Changes</Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2 mb-2">
                        <input disabled={!editMode.contact} className="border rounded p-2 disabled:opacity-60" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Phone" />
                        <input disabled={!editMode.contact} className="border rounded p-2 disabled:opacity-60" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="Email" />
                        <input disabled={!editMode.contact} className="border rounded p-2 disabled:opacity-60" value={contactWhatsapp} onChange={(e) => setContactWhatsapp(e.target.value)} placeholder="WhatsApp" />
                        <input disabled={!editMode.contact} className="border rounded p-2 disabled:opacity-60" value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} placeholder="Address" />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Advanced Settings</CardTitle>
                <CardDescription>Use key-value settings for custom platform flags and metadata.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-3">
                  <Button variant="outline" onClick={() => setEditMode((p) => ({ ...p, advanced: true }))}>Edit</Button>
                  <Button onClick={upsertSetting} disabled={!editMode.advanced}>Save Changes</Button>
                </div>
                <div className="grid md:grid-cols-3 gap-2 mb-3">
                  <input disabled={!editMode.advanced} className="border rounded p-2 disabled:opacity-60" value={settingKey} onChange={(e) => setSettingKey(e.target.value)} placeholder="key (e.g. gst_number)" />
                  <input disabled={!editMode.advanced} className="border rounded p-2 disabled:opacity-60" value={settingValue} onChange={(e) => setSettingValue(e.target.value)} placeholder="value" />
                </div>
                <div className="space-y-1 text-sm">{(settings.data || []).map((s) => <p key={s.id}>{s.key}: {s.value}</p>)}</div>
              </CardContent>
            </Card>
          </TabsContent>
            </div>
          </div>
        </Tabs>
      </main>
    </AppShell>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<RootRoutes />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const CART_KEY = "swnck_cart_v1";

function RootRoutes() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const existing = localStorage.getItem(CART_KEY);
    if (existing) setCart(JSON.parse(existing) as CartItem[]);
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    supabase
      .from("site_setting")
      .select("value")
      .eq("key", "favicon_url")
      .maybeSingle()
      .then(({ data }) => {
        const faviconUrl = data?.value;
        if (!faviconUrl) return;
        let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.href = faviconUrl;
      });
  }, []);

  function addToCart(item: CartItem) {
    setCart((prev) => {
      const found = prev.find((p) => p.variantId === item.variantId);
      if (found) return prev.map((p) => (p.variantId === item.variantId ? { ...p, qty: p.qty + item.qty } : p));
      return [...prev, item];
    });
  }

  function updateQty(variantId: string, qty: number) {
    setCart((prev) => prev.map((item) => (item.variantId === variantId ? { ...item, qty: Math.max(1, qty) } : item)));
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/shop" element={<ShopPage onAddToCart={addToCart} />} />
      <Route path="/products/:slug" element={<ProductPage onAddToCart={addToCart} />} />
      <Route path="/cart" element={<CartPage cart={cart} onUpdateQty={updateQty} />} />
      <Route path="/checkout" element={<CheckoutPage cart={cart} onClearCart={() => setCart([])} />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/pages/:slug" element={<CmsPageView />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function CmsPageView() {
  const { slug } = useParams();
  const pageQuery = useQuery({
    queryKey: ["cms-page", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_page")
        .select("*")
        .eq("slug", slug || "")
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return (data || null) as CmsPage | null;
    },
  });

  if (!pageQuery.data) return <NotFound />;
  return (
    <AppShell>
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <h1 className="text-3xl font-semibold">{pageQuery.data.title}</h1>
        <MarkdownContent content={pageQuery.data.content_md} />
      </main>
    </AppShell>
  );
}

export default App;
