"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { useProducts } from "@/components/products-provider";
import { catalog } from "@/lib/store";

export function ProductTabs() {
  const products = useProducts();
  const [category, setCategory] = useState("all");
  // Ordered by review count — the most popular pieces first.
  const visible = [...products].filter((product) => category === "all" || product.category === category).sort((a, b) => b.reviews - a.reviews).slice(0, 8);

  return <>
    <div className="tabs" role="tablist" aria-label="Filter products">
      {[{ slug: "all", short: "All" }, ...catalog].map((item) => <button key={item.slug} role="tab" aria-selected={category === item.slug} className={category === item.slug ? "is-active" : ""} onClick={() => setCategory(item.slug)}>{item.short}</button>)}
    </div>
    <div className="product-grid">{visible.map((product) => <ProductCard key={product.id} product={product} />)}</div>
    <div className="center-action"><Link className="button button-outline" href={category === "all" ? "/shop" : `/shop/${category}`}>View all products <ArrowRight size={16} /></Link></div>
  </>;
}
