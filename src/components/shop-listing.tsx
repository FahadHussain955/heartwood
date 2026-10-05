"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { catalog, type Product } from "@/lib/store";

const priceRanges = [
  { key: "all", label: "Any price", min: 0, max: Infinity },
  { key: "u25", label: "Under Rs. 25,000", min: 0, max: 25000 },
  { key: "25-75", label: "Rs. 25,000 – 75,000", min: 25000, max: 75000 },
  { key: "75-150", label: "Rs. 75,000 – 150,000", min: 75000, max: 150000 },
  { key: "150", label: "Above Rs. 150,000", min: 150000, max: Infinity },
];
const sorts = {
  featured: { label: "Featured", fn: () => 0 },
  popular: { label: "Most popular", fn: (a: Product, b: Product) => b.reviews - a.reviews },
  "price-asc": { label: "Price: low to high", fn: (a: Product, b: Product) => a.price - b.price },
  "price-desc": { label: "Price: high to low", fn: (a: Product, b: Product) => b.price - a.price },
  rating: { label: "Top rated", fn: (a: Product, b: Product) => b.rating - a.rating },
};
type SortKey = keyof typeof sorts;

export function ShopListing({ products, initialQuery = "", showCategoryFilter = false, subOptions = [] }: { products: Product[]; initialQuery?: string; showCategoryFilter?: boolean; subOptions?: { slug: string; name: string }[] }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("all");
  const [sub, setSub] = useState("all");
  const [price, setPrice] = useState("all");
  const [sort, setSort] = useState<SortKey>("featured");

  const term = query.trim().toLowerCase();
  const range = priceRanges.find((item) => item.key === price)!;
  const visible = products
    .filter((product) => !term || `${product.name} ${product.type} ${product.sub.replaceAll("-", " ")}`.toLowerCase().includes(term))
    .filter((product) => category === "all" || product.category === category)
    .filter((product) => sub === "all" || product.sub === sub)
    .filter((product) => product.price >= range.min && product.price < range.max)
    .sort(sorts[sort].fn);
  const filtered = Boolean(term) || category !== "all" || sub !== "all" || price !== "all";
  const reset = () => { setQuery(""); setCategory("all"); setSub("all"); setPrice("all"); };

  return <div className="listing">
    <div className="listing-toolbar">
      <div className="listing-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search in this range" aria-label="Search in this range" />{query && <button aria-label="Clear search" onClick={() => setQuery("")}><X size={15} /></button>}</div>
      {showCategoryFilter && <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Category"><option value="all">All categories</option>{catalog.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select>}
      {subOptions.length > 0 && <select value={sub} onChange={(event) => setSub(event.target.value)} aria-label="Type"><option value="all">All types</option>{subOptions.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select>}
      <select value={price}onChange={(event) => setPrice(event.target.value)} aria-label="Price range">{priceRanges.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select>
      <div className="listing-sort"><SlidersHorizontal size={15} /><select value={sort} onChange={(event) => setSort(event.target.value as SortKey)} aria-label="Sort by">{Object.entries(sorts).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}</select></div>
    </div>
    <p className="listing-count">{visible.length} {visible.length === 1 ? "product" : "products"}{term && <> for “{query.trim()}”</>}{filtered && <button onClick={reset}>Clear filters</button>}</p>
    {visible.length
      ? <div className="product-grid">{visible.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      : <div className="empty-state"><Search size={34} strokeWidth={1.5} /><h3>No products found</h3><p>Try a different search or clear the filters.</p><button className="button button-dark" onClick={reset}>Clear filters</button></div>}
  </div>;
}
