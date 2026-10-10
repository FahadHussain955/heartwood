import type { Metadata } from "next";
import Link from "next/link";
import { ShopListing } from "@/components/shop-listing";
import { CtaBand, PageHero } from "@/components/ui";
import { getProducts } from "@/lib/products";
import { catalog, photo } from "@/lib/store";

export const metadata: Metadata = { title: "Shop all furniture", description: "Browse our full range of office, seating, café, study, home and decor furniture." };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q } = await searchParams;
  const products = await getProducts();
  const query = (Array.isArray(q) ? q[0] : q) ?? "";

  return <>
    <PageHero crumbs={[{ label: "Shop" }]} eyebrow={`${products.length} products`} title={query ? `Search: “${query}”` : "Shop all furniture"} text="Office, commercial and home furniture — built in Pakistan, delivered and installed nationwide." image="/banners/shop.jpg" />
    <section className="section section-tight">
      <div className="container">
        <div className="chip-row">{catalog.map((category) => <Link key={category.slug} className="chip chip-img" href={`/shop/${category.slug}`}><span style={{ backgroundImage: `url("${photo(category.image, 120)}")` }} />{category.name}</Link>)}</div>
        <ShopListing key={query} products={products} initialQuery={query} showCategoryFilter />
      </div>
    </section>
    <CtaBand />
  </>;
}
