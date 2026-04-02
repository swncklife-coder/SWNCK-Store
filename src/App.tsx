import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { BrowserRouter, Link, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/NotFound.tsx";
import { supabase } from "@/lib/supabase";
import type { CmsPage, Product, ProductCategory, ProductVariant, SiteSetting } from "@/types/commerce";
import { formatInr } from "@/lib/format";

const queryClient = new QueryClient();

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
  const product = (products.data || []).find((p) => p.slug === slug);
  const relatedVariants = (variants.data || []).filter((v) => v.product_id === product?.id);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");

  useEffect(() => {
    if (relatedVariants.length > 0) setSelectedVariantId(relatedVariants[0].id);
  }, [slug, relatedVariants.length]);

  const selectedVariant = relatedVariants.find((v) => v.id === selectedVariantId);
  if (!product) return <NotFound />;

  return (
    <AppShell>
      <main className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <h1 className="text-3xl font-semibold">{product.title}</h1>
        <p className="text-muted-foreground">{product.description}</p>
        <p>{product.sustainability_story}</p>
        <select
          className="border rounded px-3 py-2"
          value={selectedVariantId}
          onChange={(e) => setSelectedVariantId(e.target.value)}
        >
          {relatedVariants.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {variant.size} / {variant.color} - {formatInr(variant.price_inr)}
            </option>
          ))}
        </select>
        {!!selectedVariant && (
          <button
            className="rounded bg-foreground text-background px-4 py-2"
            onClick={() =>
              onAddToCart({
                variantId: selectedVariant.id,
                productTitle: product.title,
                size: selectedVariant.size,
                color: selectedVariant.color,
                qty: 1,
                unitPriceInr: selectedVariant.price_inr,
              })
            }
          >
            Add to cart
          </button>
        )}
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
  const [email, setEmail] = useState("");
  const [session, setSession] = useState<boolean>(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [variantProductId, setVariantProductId] = useState("");
  const [variantSku, setVariantSku] = useState("");
  const [variantSize, setVariantSize] = useState("M");
  const [variantColor, setVariantColor] = useState("Natural");
  const [variantMaterial, setVariantMaterial] = useState("Bamboo");
  const [variantPrice, setVariantPrice] = useState(0);
  const [pageTitle, setPageTitle] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [pageContent, setPageContent] = useState("");
  const [settingKey, setSettingKey] = useState("");
  const [settingValue, setSettingValue] = useState("");

  const categories = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => (await supabase.from("product_category").select("*").order("sort_order")).data as ProductCategory[],
  });
  const products = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => (await supabase.from("product").select("*").order("sort_order")).data as Product[],
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(Boolean(data.session)));
  }, []);

  async function loginWithMagicLink() {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else alert("Magic link sent. Open your email to sign in.");
  }

  async function createProduct() {
    const { error } = await supabase.from("product").insert({ title, slug, category_id: categoryId, is_active: true, sort_order: 0 });
    if (error) alert(error.message);
    else window.location.reload();
  }

  async function createVariant() {
    const { error } = await supabase.from("product_variant").insert({
      product_id: variantProductId,
      sku: variantSku,
      size: variantSize,
      color: variantColor,
      material: variantMaterial,
      inventory_qty: 10,
      price_inr: variantPrice,
      is_active: true,
    });
    if (error) alert(error.message);
    else window.location.reload();
  }

  async function createPage() {
    const { error } = await supabase
      .from("cms_page")
      .insert({ title: pageTitle, slug: pageSlug, content_md: pageContent, is_published: true });
    if (error) alert(error.message);
    else window.location.reload();
  }

  async function upsertSetting() {
    const { error } = await supabase.from("site_setting").upsert({ key: settingKey, value: settingValue }, { onConflict: "key" });
    if (error) alert(error.message);
    else window.location.reload();
  }

  if (!session) {
    return (
      <AppShell>
        <main className="max-w-lg mx-auto px-4 py-16 space-y-4">
          <h1 className="text-3xl font-semibold">Admin sign-in</h1>
          <p className="text-sm text-muted-foreground">Use a Supabase-authenticated admin email.</p>
          <input className="border rounded w-full p-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" />
          <button onClick={loginWithMagicLink} className="rounded bg-foreground text-background px-4 py-2">Send magic link</button>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        <h1 className="text-3xl font-semibold">SWNCK Admin</h1>
        <section className="space-y-3 border rounded-lg p-4">
          <h2 className="text-xl font-medium">Products</h2>
          <div className="grid md:grid-cols-4 gap-3">
            <input className="border rounded p-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
            <input className="border rounded p-2" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug" />
            <select className="border rounded p-2" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Category</option>
              {(categories.data || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button className="rounded bg-foreground text-background px-4 py-2" onClick={createProduct}>Create</button>
          </div>
          {(products.data || []).map((p) => <p key={p.id} className="text-sm">{p.title} ({p.slug})</p>)}
        </section>

        <section className="space-y-3 border rounded-lg p-4">
          <h2 className="text-xl font-medium">Variants</h2>
          <div className="grid md:grid-cols-7 gap-2">
            <select className="border rounded p-2" value={variantProductId} onChange={(e) => setVariantProductId(e.target.value)}>
              <option value="">Product</option>
              {(products.data || []).map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <input className="border rounded p-2" value={variantSku} onChange={(e) => setVariantSku(e.target.value)} placeholder="SKU" />
            <input className="border rounded p-2" value={variantSize} onChange={(e) => setVariantSize(e.target.value)} placeholder="Size" />
            <input className="border rounded p-2" value={variantColor} onChange={(e) => setVariantColor(e.target.value)} placeholder="Color" />
            <input className="border rounded p-2" value={variantMaterial} onChange={(e) => setVariantMaterial(e.target.value)} placeholder="Material" />
            <input className="border rounded p-2" type="number" value={variantPrice} onChange={(e) => setVariantPrice(Number(e.target.value))} placeholder="Price INR" />
            <button className="rounded bg-foreground text-background px-4 py-2" onClick={createVariant}>Create</button>
          </div>
          {(variants.data || []).map((v) => <p key={v.id} className="text-sm">{v.sku} - {formatInr(v.price_inr)}</p>)}
        </section>

        <section className="space-y-3 border rounded-lg p-4">
          <h2 className="text-xl font-medium">CMS Pages</h2>
          <div className="grid gap-2">
            <input className="border rounded p-2" value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} placeholder="Page title" />
            <input className="border rounded p-2" value={pageSlug} onChange={(e) => setPageSlug(e.target.value)} placeholder="Page slug" />
            <textarea className="border rounded p-2" rows={4} value={pageContent} onChange={(e) => setPageContent(e.target.value)} placeholder="Markdown content" />
            <button className="rounded bg-foreground text-background px-4 py-2 w-fit" onClick={createPage}>Create page</button>
          </div>
          {(pages.data || []).map((p) => <p key={p.id} className="text-sm">{p.title} ({p.slug})</p>)}
        </section>

        <section className="space-y-3 border rounded-lg p-4">
          <h2 className="text-xl font-medium">Site Settings</h2>
          <div className="grid md:grid-cols-3 gap-2">
            <input className="border rounded p-2" value={settingKey} onChange={(e) => setSettingKey(e.target.value)} placeholder="key (eg gst_number)" />
            <input className="border rounded p-2" value={settingValue} onChange={(e) => setSettingValue(e.target.value)} placeholder="value" />
            <button className="rounded bg-foreground text-background px-4 py-2" onClick={upsertSetting}>Save setting</button>
          </div>
          {(settings.data || []).map((s) => <p key={s.id} className="text-sm">{s.key}: {s.value}</p>)}
        </section>
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
      <Route path="/" element={<HomePage />} />
      <Route path="/shop" element={<ShopPage onAddToCart={addToCart} />} />
      <Route path="/products/:slug" element={<ProductPage onAddToCart={addToCart} />} />
      <Route path="/cart" element={<CartPage cart={cart} onUpdateQty={updateQty} />} />
      <Route path="/checkout" element={<CheckoutPage cart={cart} onClearCart={() => setCart([])} />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
