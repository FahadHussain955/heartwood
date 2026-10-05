"use client";

import { useState, type FormEvent } from "react";
import { Pencil, Search, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { catalog, money, photo } from "@/lib/store";
import { LOW_STOCK, includes, type DbProduct, type StockView } from "./shared";

const blank = { name: "", type: "", category: catalog[0].slug, sub: catalog[0].subcategories[0].slug, price: "", stock: "0", sku: "", tag: "" };
const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const dropImage = (publicId: string | null) => publicId && fetch(`/api/upload?publicId=${encodeURIComponent(publicId)}`, { method: "DELETE" });
const categoryName = (slug: string) => catalog.find((category) => category.slug === slug)?.short ?? slug;

type ListProps = {
  items: DbProduct[]; loading: boolean; filter: string; setFilter: (value: string) => void;
  stock: StockView; setStock: (value: StockView) => void;
  onEdit: (product: DbProduct) => void; onChanged: () => void; onNotice: (message: string) => void;
};

export function Products({ items, loading, filter, setFilter, stock, setStock, onEdit, onChanged, onNotice }: ListProps) {
  const [category, setCategory] = useState("all");
  const out = items.filter((product) => product.stock === 0).length;
  const low = items.filter((product) => product.stock > 0 && product.stock <= LOW_STOCK).length;
  const stockMatch = (product: DbProduct) => stock === "all" || (stock === "out" ? product.stock === 0 : product.stock > 0 && product.stock <= LOW_STOCK);
  const visible = items.filter((product) => stockMatch(product) && (category === "all" || product.category === category) && includes(filter, product.name, product.sku, product.type, product.id));

  const remove = async (product: DbProduct) => {
    if (!window.confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    const { error } = await createClient().from("products").delete().eq("id", product.id);
    if (error) return onNotice(error.message);
    dropImage(product.image_public_id);
    onNotice("Product deleted.");
    onChanged();
  };

  return <section className="admin-panel">
    <div className="panel-toolbar">
      <div className="filter-chips">
        <button className={category === "all" ? "chip-button active" : "chip-button"} onClick={() => setCategory("all")}>All <span>{items.length}</span></button>
        {catalog.map((item) => <button key={item.slug} className={category === item.slug ? "chip-button active" : "chip-button"} onClick={() => setCategory(item.slug)}>{item.short} <span>{items.filter((product) => product.category === item.slug).length}</span></button>)}
      </div>
      <div className="filter-chips">
        <button className={stock === "low" ? "chip-button active" : "chip-button"} onClick={() => setStock(stock === "low" ? "all" : "low")}>Low stock <span>{low}</span></button>
        <button className={stock === "out" ? "chip-button active" : "chip-button"} onClick={() => setStock(stock === "out" ? "all" : "out")}>Out of stock <span>{out}</span></button>
      </div>
      <label className="admin-filter"><Search size={14} /><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Name or SKU" /></label>
    </div>
    <div className="table-wrap"><table>
      <thead><tr><th>PRODUCT</th><th>CATEGORY</th><th>PRICE</th><th>STOCK</th><th /></tr></thead>
      <tbody>
        {visible.length === 0 && <tr><td colSpan={5}>{loading ? "Loading…" : items.length ? "No products match this search." : "No products yet — add your first one."}</td></tr>}
        {visible.map((product) => <tr key={product.id}>
          <td><div className="inventory-product"><div className="mini-product-image" style={product.image_url ? { backgroundImage: `url(${photo(product.image_url, 120)})` } : undefined} /><strong>{product.name}</strong></div></td>
          <td>{categoryName(product.category)}</td>
          <td className="order-amount">{money(product.price)}</td>
          <td className={product.stock === 0 ? "stock-out" : product.stock <= LOW_STOCK ? "stock-low" : undefined}>{product.stock} units</td>
          <td className="row-actions">
            <button className="more-button" aria-label={`Edit ${product.name}`} onClick={() => onEdit(product)}><Pencil size={16} /></button>
            <button className="more-button" aria-label={`Delete ${product.name}`} onClick={() => remove(product)}><Trash2 size={16} /></button>
          </td>
        </tr>)}
      </tbody>
    </table></div>
  </section>;
}

type EditorProps = { product: DbProduct | "new"; onClose: () => void; onSaved: (message: string) => void };

export function ProductEditor({ product, onClose, onSaved }: EditorProps) {
  const [form, setForm] = useState(() => product === "new" ? blank : {
    name: product.name, type: product.type, category: product.category, sub: product.sub, price: String(product.price),
    stock: String(product.stock), sku: product.sku ?? "", tag: product.tag ?? "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof typeof blank, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const subs = catalog.find((category) => category.slug === form.category)?.subcategories ?? [];

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      let image: { image_url?: string; image_public_id?: string } = {};
      if (file) {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Image upload failed");
        image = { image_url: json.url, image_public_id: json.publicId };
      }
      const row = {
        name: form.name.trim(), type: form.type.trim(), category: form.category, sub: form.sub,
        price: Number(form.price),
        stock: Number(form.stock) || 0, sku: form.sku.trim() || null, tag: form.tag.trim() || null, ...image,
      };
      const supabase = createClient();
      const { error } = product === "new"
        ? await supabase.from("products").insert({ id: `${slugify(row.name)}-${Math.random().toString(36).slice(2, 6)}`, ...row })
        : await supabase.from("products").update(row).eq("id", product.id);
      if (error) throw new Error(error.message);
      if (file && product !== "new") dropImage(product.image_public_id);
      onSaved(product === "new" ? "Product added." : "Product updated.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong");
      setBusy(false);
    }
  };

  return <div className="modal-backdrop" onClick={onClose}>
    <form className="product-modal product-modal-wide" onSubmit={save} onClick={(event) => event.stopPropagation()}>
      <div className="modal-heading">
        <div><p className="eyebrow">CATALOGUE</p><h2>{product === "new" ? "Add a product" : "Edit product"}</h2></div>
        <button type="button" className="admin-icon" onClick={onClose} aria-label="Close"><X size={18} /></button>
      </div>
      <div className="form-grid">
        <label className="span-2">Name<input required value={form.name} onChange={(event) => set("name", event.target.value)} /></label>
        <label className="span-2">Short description<input value={form.type} onChange={(event) => set("type", event.target.value)} placeholder="e.g. High-back leather chair" /></label>
        <label>Category<select value={form.category} onChange={(event) => { set("category", event.target.value); set("sub", catalog.find((category) => category.slug === event.target.value)!.subcategories[0].slug); }}>{catalog.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select></label>
        <label>Subcategory<select value={form.sub} onChange={(event) => set("sub", event.target.value)}>{subs.map((sub) => <option key={sub.slug} value={sub.slug}>{sub.name}</option>)}</select></label>
        <label>Price (Rs.)<input required type="number" min="0" value={form.price} onChange={(event) => set("price", event.target.value)} /></label>
        <label>Stock<input type="number" min="0" value={form.stock} onChange={(event) => set("stock", event.target.value)} /></label>
        <label>SKU<input value={form.sku} onChange={(event) => set("sku", event.target.value)} /></label>
        <label className="span-2">Tag (optional)<input value={form.tag} onChange={(event) => set("tag", event.target.value)} placeholder="New, Bestseller…" /></label>
        <label className="span-2">Image{product !== "new" && product.image_url ? " (leave empty to keep the current one)" : ""}<input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /></label>
      </div>
      {error && <p className="admin-error">{error}</p>}
      <div className="modal-actions">
        <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
        <button type="submit" className="admin-primary-button" disabled={busy}>{busy ? "Saving…" : "Save product"}</button>
      </div>
    </form>
  </div>;
}
