import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { formatInr } from "@/lib/format";
import { ProductDetail } from "@/components/ProductDetail";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import type { Product, ProductCategory, ProductCollection, ProductVariant } from "@/types/commerce";
import { DEFAULT_PDP_TEMPLATE, parsePdpTemplate, type PdpTemplate } from "@/types/pdp-template";
import { resolveCollectionProducts } from "@/lib/collection-resolve";
import {
  DEFAULT_COLLECTION_AUTO_RULE,
  parseCollectionAutoRule,
  type CollectionAutoRule,
  type CollectionAutoRuleType,
} from "@/types/collection-rules";

const RULE_OPTIONS: { value: CollectionAutoRuleType; label: string }[] = [
  { value: "all_active", label: "All active products" },
  { value: "featured", label: "Featured only" },
  { value: "new_arrivals", label: "New arrivals (by created date)" },
  { value: "category", label: "Single category" },
  { value: "material_contains", label: "Material keyword (variants)" },
  { value: "price_under_inr", label: "Min price under ₹" },
  { value: "price_over_inr", label: "Min price at least ₹" },
];

type ProductDraft = {
  title: string;
  slug: string;
  description: string;
  category_id: string;
  primary_image_url: string;
  sustainability_story: string;
  fit_notes: string;
  care_instructions: string;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
};

function emptyProductDraft(): ProductDraft {
  return {
    title: "",
    slug: "",
    description: "",
    category_id: "",
    primary_image_url: "",
    sustainability_story: "",
    fit_notes: "",
    care_instructions: "",
    is_featured: false,
    is_active: true,
    sort_order: 0,
  };
}

export function AdminCatalogPanel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [catalogSub, setCatalogSub] = useState("categories");

  const categories = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("product_category").select("*").order("sort_order");
      if (error) throw error;
      return (data || []) as ProductCategory[];
    },
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
    queryFn: async () => {
      const { data, error } = await supabase.from("product_variant").select("*");
      if (error) throw error;
      return (data || []) as ProductVariant[];
    },
  });
  const collections = useQuery({
    queryKey: ["admin-collections"],
    queryFn: async () => {
      const { data, error } = await supabase.from("product_collection").select("*").order("sort_order");
      if (error) throw error;
      return (data || []) as ProductCollection[];
    },
  });
  const pdpTemplateQuery = useQuery({
    queryKey: ["pdp-template"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_setting").select("value").eq("key", "pdp_template").maybeSingle();
      if (error) throw error;
      return parsePdpTemplate(data?.value);
    },
  });
  const pdpTemplate: PdpTemplate = pdpTemplateQuery.data ?? DEFAULT_PDP_TEMPLATE;

  const invalidateCatalog = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-variants"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-collections"] }),
      queryClient.invalidateQueries({ queryKey: ["categories"] }),
      queryClient.invalidateQueries({ queryKey: ["products"] }),
      queryClient.invalidateQueries({ queryKey: ["variants"] }),
    ]);
  }, [queryClient]);

  /** Categories */
  const [showCatForm, setShowCatForm] = useState(false);
  const [catId, setCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catImage, setCatImage] = useState("");
  const [catActive, setCatActive] = useState(true);
  const [catSort, setCatSort] = useState(0);

  const resetCategoryForm = useCallback(() => {
    setShowCatForm(false);
    setCatId(null);
    setCatName("");
    setCatSlug("");
    setCatDesc("");
    setCatImage("");
    setCatActive(true);
    setCatSort(0);
  }, []);

  const openCategory = useCallback((c: ProductCategory | null) => {
    setShowCatForm(true);
    if (!c) {
      setCatId(null);
      setCatName("");
      setCatSlug("");
      setCatDesc("");
      setCatImage("");
      setCatActive(true);
      setCatSort(0);
      return;
    }
    setCatId(c.id);
    setCatName(c.name);
    setCatSlug(c.slug);
    setCatDesc(c.description || "");
    setCatImage(c.image_url || "");
    setCatActive(c.is_active);
    setCatSort(c.sort_order);
  }, []);

  async function saveCategory() {
    if (!catName.trim() || !catSlug.trim()) {
      toast({ title: "Name and slug required", variant: "destructive" });
      return;
    }
    if (catId) {
      const { error } = await supabase
        .from("product_category")
        .update({
          name: catName.trim(),
          slug: catSlug.trim(),
          description: catDesc.trim() || null,
          image_url: catImage || null,
          is_active: catActive,
          sort_order: catSort,
        })
        .eq("id", catId);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
    } else {
      const { error } = await supabase.from("product_category").insert({
        name: catName.trim(),
        slug: catSlug.trim(),
        description: catDesc.trim() || null,
        image_url: catImage || null,
        is_active: catActive,
        sort_order: catSort,
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
    }
    await invalidateCatalog();
    toast({ title: "Saved", description: "Category updated." });
    resetCategoryForm();
  }

  /** Products */
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [productDraft, setProductDraft] = useState<ProductDraft>(emptyProductDraft);

  const baseProduct = useMemo(
    () => (products.data || []).find((p) => p.id === selectedProductId),
    [products.data, selectedProductId],
  );

  useEffect(() => {
    if (!baseProduct) {
      setProductDraft(emptyProductDraft());
      return;
    }
    setProductDraft({
      title: baseProduct.title,
      slug: baseProduct.slug,
      description: baseProduct.description || "",
      category_id: baseProduct.category_id,
      primary_image_url: baseProduct.primary_image_url || "",
      sustainability_story: baseProduct.sustainability_story || "",
      fit_notes: baseProduct.fit_notes || "",
      care_instructions: baseProduct.care_instructions || "",
      is_featured: baseProduct.is_featured,
      is_active: baseProduct.is_active,
      sort_order: baseProduct.sort_order,
    });
  }, [baseProduct]);

  const previewProduct = useMemo((): Product | null => {
    if (!baseProduct) return null;
    const cat =
      (categories.data || []).find((c) => c.id === productDraft.category_id) || baseProduct.category || undefined;
    return {
      ...baseProduct,
      ...productDraft,
      description: productDraft.description || null,
      primary_image_url: productDraft.primary_image_url || null,
      sustainability_story: productDraft.sustainability_story || null,
      fit_notes: productDraft.fit_notes || null,
      care_instructions: productDraft.care_instructions || null,
      category: cat,
    };
  }, [baseProduct, productDraft, categories.data]);

  const previewVariantsRaw = useMemo(
    () => (variants.data || []).filter((v) => v.product_id === selectedProductId && v.is_active),
    [variants.data, selectedProductId],
  );

  const previewVariants = useMemo((): ProductVariant[] => {
    if (previewVariantsRaw.length || !selectedProductId) return previewVariantsRaw;
    return [
      {
        id: `__admin_pv_${selectedProductId}`,
        product_id: selectedProductId,
        sku: "ADD-VARIANT",
        size: "—",
        color: "Preview",
        material: "—",
        inventory_qty: 0,
        price_inr: 0,
        compare_at_price_inr: null,
        weight_grams: null,
        image_url: null,
        is_active: true,
      },
    ];
  }, [previewVariantsRaw, selectedProductId]);

  async function saveProduct() {
    if (!selectedProductId) return;
    const { error } = await supabase
      .from("product")
      .update({
        title: productDraft.title,
        slug: productDraft.slug,
        description: productDraft.description || null,
        category_id: productDraft.category_id,
        primary_image_url: productDraft.primary_image_url || null,
        sustainability_story: productDraft.sustainability_story || null,
        fit_notes: productDraft.fit_notes || null,
        care_instructions: productDraft.care_instructions || null,
        is_featured: productDraft.is_featured,
        is_active: productDraft.is_active,
        sort_order: productDraft.sort_order,
      })
      .eq("id", selectedProductId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    await invalidateCatalog();
    toast({ title: "Saved", description: "Product updated." });
  }

  async function createNewProduct() {
    const first = (categories.data || [])[0];
    if (!first) {
      toast({ title: "Create a category first", variant: "destructive" });
      return;
    }
    const stub = `new-item-${Date.now().toString(36)}`;
    const { data, error } = await supabase
      .from("product")
      .insert({
        title: "New product",
        slug: stub,
        category_id: first.id,
        is_active: false,
        is_featured: false,
        sort_order: 0,
        description: null,
        sustainability_story: null,
        fit_notes: null,
        care_instructions: null,
      })
      .select("id")
      .single();
    if (error || !data) {
      toast({ title: "Error", description: error?.message, variant: "destructive" });
      return;
    }
    await invalidateCatalog();
    setSelectedProductId(data.id);
    setCatalogSub("products");
    toast({ title: "Created", description: "Fill in details and save." });
  }

  const [vSku, setVSku] = useState("");
  const [vSize, setVSize] = useState("M");
  const [vColor, setVColor] = useState("Natural");
  const [vMaterial, setVMaterial] = useState("Bamboo");
  const [vPrice, setVPrice] = useState(0);
  const [vImage, setVImage] = useState("");

  async function addVariant() {
    if (!selectedProductId || !vSku.trim()) {
      toast({ title: "Select a product and enter SKU", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("product_variant").insert({
      product_id: selectedProductId,
      sku: vSku.trim(),
      size: vSize,
      color: vColor,
      material: vMaterial,
      inventory_qty: 10,
      price_inr: vPrice,
      is_active: true,
      image_url: vImage || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    await invalidateCatalog();
    setVSku("");
    toast({ title: "Variant added" });
  }

  /** Collections */
  const [showCollForm, setShowCollForm] = useState(false);
  const [collId, setCollId] = useState<string | null>(null);
  const [collName, setCollName] = useState("");
  const [collSlug, setCollSlug] = useState("");
  const [collDesc, setCollDesc] = useState("");
  const [collImage, setCollImage] = useState("");
  const [collActive, setCollActive] = useState(true);
  const [collSort, setCollSort] = useState(0);
  const [collSource, setCollSource] = useState<"manual" | "automatic">("manual");
  const [collAutoRule, setCollAutoRule] = useState<CollectionAutoRule>({ ...DEFAULT_COLLECTION_AUTO_RULE });
  const [manualProductIds, setManualProductIds] = useState<string[]>([]);

  const collectionItemsQuery = useQuery({
    queryKey: ["admin-collection-items", collId],
    enabled: Boolean(collId) && collSource === "manual",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_collection_item")
        .select("product_id, sort_order")
        .eq("collection_id", collId!)
        .order("sort_order");
      if (error) throw error;
      return ((data || []) as { product_id: string }[]).map((r) => r.product_id);
    },
  });

  useEffect(() => {
    if (collSource !== "manual" || !collId) return;
    if (collectionItemsQuery.data) setManualProductIds([...collectionItemsQuery.data]);
  }, [collSource, collId, collectionItemsQuery.data]);

  const resetCollectionForm = useCallback(() => {
    setShowCollForm(false);
    setCollId(null);
    setCollName("");
    setCollSlug("");
    setCollDesc("");
    setCollImage("");
    setCollActive(true);
    setCollSort(0);
    setCollSource("manual");
    setCollAutoRule({ ...DEFAULT_COLLECTION_AUTO_RULE });
    setManualProductIds([]);
  }, []);

  const openCollection = useCallback((row: ProductCollection | null) => {
    setShowCollForm(true);
    if (!row) {
      setCollId(null);
      setCollName("");
      setCollSlug("");
      setCollDesc("");
      setCollImage("");
      setCollActive(true);
      setCollSort(0);
      setCollSource("manual");
      setCollAutoRule({ ...DEFAULT_COLLECTION_AUTO_RULE });
      setManualProductIds([]);
      return;
    }
    setCollId(row.id);
    setCollName(row.name);
    setCollSlug(row.slug);
    setCollDesc(row.description || "");
    setCollImage(row.image_url || "");
    setCollActive(row.is_active);
    setCollSort(row.sort_order);
    const st = row.source_type === "automatic" ? "automatic" : "manual";
    setCollSource(st);
    setCollAutoRule(parseCollectionAutoRule(row.auto_rule));
    if (st === "manual") {
      setManualProductIds([]);
    }
  }, []);

  const previewCollectionProducts = useMemo(
    () =>
      resolveCollectionProducts({
        collection: { id: collId || "draft", source_type: collSource, auto_rule: collAutoRule },
        products: products.data || [],
        variants: variants.data || [],
        manualProductIds: collSource === "manual" ? manualProductIds : [],
      }),
    [collId, collSource, collAutoRule, products.data, variants.data, manualProductIds],
  );

  function toggleManualProduct(pid: string) {
    setManualProductIds((prev) => (prev.includes(pid) ? prev.filter((x) => x !== pid) : [...prev, pid]));
  }

  async function saveCollection() {
    if (!collName.trim() || !collSlug.trim()) {
      toast({ title: "Name and slug required", variant: "destructive" });
      return;
    }
    const base = {
      name: collName.trim(),
      slug: collSlug.trim(),
      description: collDesc.trim() || null,
      image_url: collImage || null,
      is_active: collActive,
      sort_order: collSort,
      source_type: collSource,
      auto_rule: collSource === "automatic" ? collAutoRule : null,
    };

    let targetId = collId;
    if (collId) {
      const { error } = await supabase.from("product_collection").update(base).eq("id", collId);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
    } else {
      const { data, error } = await supabase.from("product_collection").insert(base).select("id").single();
      if (error || !data) {
        toast({ title: "Error", description: error?.message, variant: "destructive" });
        return;
      }
      targetId = data.id;
      setCollId(data.id);
    }

    if (!targetId) return;

    await supabase.from("product_collection_item").delete().eq("collection_id", targetId);
    if (collSource === "manual" && manualProductIds.length) {
      await supabase.from("product_collection_item").insert(
        manualProductIds.map((product_id, i) => ({
          collection_id: targetId!,
          product_id,
          sort_order: i,
        })),
      );
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-collections"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-collection-items"] }),
    ]);
    toast({ title: "Saved", description: "Collection saved." });
  }

  const lowestPrice = useCallback(
    (productId: string) => {
      const ps = (variants.data || []).filter((v) => v.product_id === productId && v.is_active).map((v) => v.price_inr);
      return ps.length ? Math.min(...ps) : 0;
    },
    [variants.data],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Catalog</CardTitle>
        <CardDescription>Categories, products (with PDP-style preview), and manual or rule-based collections.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={catalogSub} onValueChange={setCatalogSub} className="w-full">
          <TabsList className="mb-4 flex flex-wrap h-auto gap-1">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">All categories appear below. Use “New category” to add another.</p>
              <Button onClick={() => openCategory(null)}>New category</Button>
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(categories.data || []).map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                      <TableCell>{c.is_active ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => openCategory(c)}>
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {showCatForm && (
              <div className="rounded-xl border p-6 space-y-4 bg-card/50">
                <h3 className="font-semibold">{catId ? "Edit category" : "New category"}</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <input className="border rounded-md px-3 py-2 w-full bg-background" value={catName} onChange={(e) => setCatName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <input className="border rounded-md px-3 py-2 w-full bg-background" value={catSlug} onChange={(e) => setCatSlug(e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Description</Label>
                    <textarea className="border rounded-md px-3 py-2 w-full bg-background min-h-[80px]" value={catDesc} onChange={(e) => setCatDesc(e.target.value)} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={catActive} onCheckedChange={setCatActive} id="cat-active" />
                    <Label htmlFor="cat-active">Active in storefront</Label>
                  </div>
                  <div className="space-y-2">
                    <Label>Sort order</Label>
                    <input type="number" className="border rounded-md px-3 py-2 w-full bg-background" value={catSort} onChange={(e) => setCatSort(Number(e.target.value))} />
                  </div>
                </div>
                <ImageUploadField label="Category image" helperText="Optional hero / listing image." value={catImage} onChange={setCatImage} />
                <div className="flex gap-2">
                  <Button onClick={saveCategory}>Save category</Button>
                  <Button variant="ghost" onClick={resetCategoryForm}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex flex-wrap gap-2 justify-between items-center">
              <div className="flex flex-wrap gap-2 flex-1 min-w-[200px]">
                <Label className="sr-only">Product</Label>
                <select
                  className="border rounded-md px-3 py-2 bg-background min-w-[220px]"
                  value={selectedProductId || ""}
                  onChange={(e) => setSelectedProductId(e.target.value || null)}
                >
                  <option value="">Select a product…</option>
                  {(products.data || []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={createNewProduct}>New product</Button>
            </div>

            {previewProduct ? (
              <div className="grid xl:grid-cols-2 gap-8 items-start">
                <div className="space-y-4 rounded-xl border p-6">
                  <h3 className="font-semibold">Edit product</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <input className="border rounded-md px-3 py-2 w-full bg-background" value={productDraft.title} onChange={(e) => setProductDraft((d) => ({ ...d, title: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Slug</Label>
                      <input className="border rounded-md px-3 py-2 w-full bg-background" value={productDraft.slug} onChange={(e) => setProductDraft((d) => ({ ...d, slug: e.target.value }))} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Category</Label>
                      <select
                        className="border rounded-md px-3 py-2 w-full bg-background"
                        value={productDraft.category_id}
                        onChange={(e) => setProductDraft((d) => ({ ...d, category_id: e.target.value }))}
                      >
                        {(categories.data || []).map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Description</Label>
                      <textarea className="border rounded-md px-3 py-2 w-full bg-background min-h-[72px]" value={productDraft.description} onChange={(e) => setProductDraft((d) => ({ ...d, description: e.target.value }))} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Sustainability</Label>
                      <textarea className="border rounded-md px-3 py-2 w-full bg-background min-h-[60px]" value={productDraft.sustainability_story} onChange={(e) => setProductDraft((d) => ({ ...d, sustainability_story: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Fit notes</Label>
                      <input className="border rounded-md px-3 py-2 w-full bg-background" value={productDraft.fit_notes} onChange={(e) => setProductDraft((d) => ({ ...d, fit_notes: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Care</Label>
                      <input className="border rounded-md px-3 py-2 w-full bg-background" value={productDraft.care_instructions} onChange={(e) => setProductDraft((d) => ({ ...d, care_instructions: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Sort order</Label>
                      <input type="number" className="border rounded-md px-3 py-2 w-full bg-background" value={productDraft.sort_order} onChange={(e) => setProductDraft((d) => ({ ...d, sort_order: Number(e.target.value) }))} />
                    </div>
                    <div className="flex flex-col gap-3 md:col-span-2">
                      <div className="flex items-center gap-2">
                        <Switch checked={productDraft.is_active} onCheckedChange={(v) => setProductDraft((d) => ({ ...d, is_active: v }))} id="p-active" />
                        <Label htmlFor="p-active">Active</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={productDraft.is_featured} onCheckedChange={(v) => setProductDraft((d) => ({ ...d, is_featured: v }))} id="p-feat" />
                        <Label htmlFor="p-feat">Featured</Label>
                      </div>
                    </div>
                  </div>
                  <ImageUploadField label="Primary image" value={productDraft.primary_image_url} onChange={(u) => setProductDraft((d) => ({ ...d, primary_image_url: u }))} />
                  <Button onClick={saveProduct}>Save product</Button>

                  <div className="pt-6 border-t space-y-3">
                    <h4 className="text-sm font-semibold">Variants (selected product)</h4>
                    <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-2">
                      <input className="border rounded-md px-2 py-2 bg-background md:col-span-2" placeholder="SKU" value={vSku} onChange={(e) => setVSku(e.target.value)} />
                      <input className="border rounded-md px-2 py-2 bg-background" placeholder="Size" value={vSize} onChange={(e) => setVSize(e.target.value)} />
                      <input className="border rounded-md px-2 py-2 bg-background" placeholder="Color" value={vColor} onChange={(e) => setVColor(e.target.value)} />
                      <input className="border rounded-md px-2 py-2 bg-background" placeholder="Material" value={vMaterial} onChange={(e) => setVMaterial(e.target.value)} />
                      <input type="number" className="border rounded-md px-2 py-2 bg-background" placeholder="₹" value={vPrice} onChange={(e) => setVPrice(Number(e.target.value))} />
                    </div>
                    <ImageUploadField label="Variant image" value={vImage} onChange={setVImage} />
                    <Button type="button" variant="secondary" onClick={addVariant}>
                      Add variant
                    </Button>
                    <ul className="text-xs text-muted-foreground space-y-1 max-h-32 overflow-auto">
                      {(variants.data || [])
                        .filter((v) => v.product_id === selectedProductId)
                        .map((v) => (
                          <li key={v.id}>
                            {v.sku} · {v.size}/{v.color} · {formatInr(v.price_inr)}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-xl border p-4 bg-muted/20 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">PDP preview</p>
                  <p className="text-xs text-muted-foreground">Updates as you edit — matches your live template from Site Content → PDP.</p>
                  <div className="rounded-lg border bg-background overflow-hidden max-h-[85vh] overflow-y-auto">
                    <ProductDetail
                      product={previewProduct}
                      variants={previewVariants}
                      template={pdpTemplate}
                      preview
                      onAddToCart={() => undefined}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Choose a product or create a new one.</p>
            )}
          </TabsContent>

          <TabsContent value="collections" className="space-y-6">
            <div className="flex flex-wrap justify-between gap-2">
              <p className="text-sm text-muted-foreground">Manual lists or automatic rules. Preview updates instantly.</p>
              <Button onClick={() => openCollection(null)}>New collection</Button>
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(collections.data || []).map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.source_type === "automatic" ? "Automatic" : "Manual"}</TableCell>
                      <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => openCollection(c)}>
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {showCollForm && (
              <div className="grid xl:grid-cols-2 gap-8 items-start">
                <div className="rounded-xl border p-6 space-y-4 bg-card/50">
                  <h3 className="font-semibold">{collId ? "Edit collection" : "New collection"}</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <input className="border rounded-md px-3 py-2 w-full bg-background" value={collName} onChange={(e) => setCollName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Slug</Label>
                      <input className="border rounded-md px-3 py-2 w-full bg-background" value={collSlug} onChange={(e) => setCollSlug(e.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Description</Label>
                      <textarea className="border rounded-md px-3 py-2 w-full bg-background min-h-[72px]" value={collDesc} onChange={(e) => setCollDesc(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={collActive} onCheckedChange={setCollActive} id="coll-act" />
                      <Label htmlFor="coll-act">Active</Label>
                    </div>
                    <div className="space-y-2">
                      <Label>Sort order</Label>
                      <input type="number" className="border rounded-md px-3 py-2 w-full bg-background" value={collSort} onChange={(e) => setCollSort(Number(e.target.value))} />
                    </div>
                  </div>
                  <ImageUploadField label="Cover image" value={collImage} onChange={setCollImage} />

                  <div className="space-y-2">
                    <Label>Membership</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="coll-src" checked={collSource === "manual"} onChange={() => setCollSource("manual")} />
                        Manual
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="coll-src" checked={collSource === "automatic"} onChange={() => setCollSource("automatic")} />
                        Automatic
                      </label>
                    </div>
                  </div>

                  {collSource === "automatic" ? (
                    <div className="space-y-3 rounded-lg border p-4 bg-background">
                      <div className="space-y-2">
                        <Label>Rule</Label>
                        <select
                          className="border rounded-md px-3 py-2 w-full bg-background"
                          value={collAutoRule.type}
                          onChange={(e) =>
                            setCollAutoRule((r) => ({ ...r, type: e.target.value as CollectionAutoRuleType }))
                          }
                        >
                          {RULE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {collAutoRule.type === "category" ? (
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <select
                            className="border rounded-md px-3 py-2 w-full bg-background"
                            value={collAutoRule.category_id || ""}
                            onChange={(e) => setCollAutoRule((r) => ({ ...r, category_id: e.target.value || null }))}
                          >
                            <option value="">Select…</option>
                            {(categories.data || []).map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : null}
                      {collAutoRule.type === "material_contains" ? (
                        <div className="space-y-2">
                          <Label>Material contains</Label>
                          <input
                            className="border rounded-md px-3 py-2 w-full bg-background"
                            placeholder="e.g. bamboo"
                            value={collAutoRule.material_keyword || ""}
                            onChange={(e) => setCollAutoRule((r) => ({ ...r, material_keyword: e.target.value || null }))}
                          />
                        </div>
                      ) : null}
                      {(collAutoRule.type === "price_under_inr" || collAutoRule.type === "price_over_inr") ? (
                        <div className="space-y-2">
                          <Label>Amount (INR)</Label>
                          <input
                            type="number"
                            className="border rounded-md px-3 py-2 w-full bg-background"
                            value={collAutoRule.price_inr ?? ""}
                            onChange={(e) =>
                              setCollAutoRule((r) => ({
                                ...r,
                                price_inr: e.target.value === "" ? null : Number(e.target.value),
                              }))
                            }
                          />
                        </div>
                      ) : null}
                      <div className="space-y-2">
                        <Label>Max products in preview</Label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          className="border rounded-md px-3 py-2 w-full bg-background"
                          value={collAutoRule.max_products ?? 12}
                          onChange={(e) => setCollAutoRule((r) => ({ ...r, max_products: Number(e.target.value) }))}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border p-4 max-h-56 overflow-y-auto space-y-2 bg-background">
                      <Label>Include products</Label>
                      {(products.data || [])
                        .filter((p) => p.is_active)
                        .map((p) => (
                          <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={manualProductIds.includes(p.id)}
                              onChange={() => toggleManualProduct(p.id)}
                            />
                            <span>{p.title}</span>
                          </label>
                        ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={saveCollection}>Save collection</Button>
                    <Button variant="ghost" onClick={resetCollectionForm}>
                      Clear form
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl border p-4 space-y-3 bg-muted/20">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Live preview</p>
                  <p className="text-sm text-muted-foreground">{previewCollectionProducts.length} product(s) — updates when you change rules or checkboxes.</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {previewCollectionProducts.map((p) => {
                      const img = p.primary_image_url || "https://placehold.co/400x500/e8e8e8/888888?text=SWNCK";
                      return (
                        <div key={p.id} className="border rounded-lg overflow-hidden bg-background">
                          <img src={img} alt="" className="w-full aspect-[4/5] object-cover" />
                          <div className="p-3 space-y-1">
                            <p className="text-xs text-muted-foreground">{p.category?.name}</p>
                            <p className="font-medium text-sm leading-snug">{p.title}</p>
                            <p className="text-sm">{formatInr(lowestPrice(p.id))}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {!previewCollectionProducts.length ? (
                    <p className="text-sm text-muted-foreground italic">No products match this setup yet.</p>
                  ) : null}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
