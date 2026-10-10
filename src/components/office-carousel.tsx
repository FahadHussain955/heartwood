"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { useProducts } from "@/components/products-provider";

// "Tables" and "Office chairs" span several sub-ranges, so their "View all" goes to the office page where the type filter lives.
const groups = [
  { key: "office", label: "Office Furniture", subs: null, href: "/shop/office" },
  { key: "tables", label: "Tables", subs: ["executive-tables", "manager-tables", "meeting-tables", "laptop-tables"], href: "/shop/office#products" },
  { key: "workstations", label: "Workstations", subs: ["workstations"], href: "/shop/office/workstations" },
  { key: "reception", label: "Reception", subs: ["reception-tables"], href: "/shop/office/reception-tables" },
  { key: "chairs", label: "Office Chairs", subs: ["executive-chairs", "manager-chairs", "computer-chairs", "visitor-chairs"], href: "/shop/office#products" },
];

export function OfficeCarousel() {
  const products = useProducts();
  const [active, setActive] = useState(groups[0].key);
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const group = groups.find((item) => item.key === active)!;
  const items = products
    .filter((product) => product.category === "office" && (!group.subs || group.subs.includes(product.sub)))
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 12);

  const updateEdges = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);
  const slide = (direction: 1 | -1) => track.current?.scrollBy({ left: direction * track.current.clientWidth, behavior: "smooth" });
  const choose = (key: string) => {
    setActive(key);
    track.current?.scrollTo({ left: 0 });
  };

  useEffect(() => {
    const frame = requestAnimationFrame(updateEdges);
    window.addEventListener("resize", updateEdges);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", updateEdges); };
  }, [active, updateEdges]);

  return <div className="carousel">
    <div className="carousel-bar">
      <div className="tabs" role="tablist" aria-label="Office furniture ranges">
        {groups.map((item) => <button key={item.key} role="tab" aria-selected={active === item.key} className={active === item.key ? "is-active" : ""} onClick={() => choose(item.key)}>{item.label}</button>)}
      </div>
      <div className="carousel-arrows">
        <button type="button" aria-label="Previous products" disabled={edges.start} onClick={() => slide(-1)}><ArrowLeft size={18} /></button>
        <button type="button" aria-label="Next products" disabled={edges.end} onClick={() => slide(1)}><ArrowRight size={18} /></button>
      </div>
    </div>
    <div className="carousel-track" ref={track} onScroll={updateEdges}>
      {items.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
    <div className="center-action"><Link className="button button-outline" href={group.href}>View all {group.label.toLowerCase()} <ArrowRight size={16} /></Link></div>
  </div>;
}
