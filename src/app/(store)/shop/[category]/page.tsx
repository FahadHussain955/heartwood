import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check } from "lucide-react";
import { ShopListing } from "@/components/shop-listing";
import { CtaBand, PageHero, SectionHeading } from "@/components/ui";
import { getProducts } from "@/lib/products";
import { catalog, getCategory, photo, productsIn } from "@/lib/store";

type Props = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return catalog.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = getCategory((await params).category);
  return category ? { title: category.name, description: category.description } : {};
}

export default async function CategoryPage({ params }: Props) {
  const category = getCategory((await params).category);
  if (!category) notFound();
  const products = await getProducts();
  const items = productsIn(products, category.slug);

  return <>
    <PageHero crumbs={[{ label: "Shop", href: "/shop" }, { label: category.name }]} eyebrow={`${items.length} products · ${category.subcategories.length} ranges`} title={category.name} text={category.description} image={category.image}>
      <ul className="hero-points"><li><Check size={16} /> Delivery & installation on request</li><li><Check size={16} /> Custom sizes & finishes</li></ul>
    </PageHero>

    <section className="section section-tight">
      <div className="container">
        <SectionHeading eyebrow="Browse by range" title={`Shop ${category.short.toLowerCase()} by type`} />
        <div className="sub-grid">{category.subcategories.map((sub) => <Link className="sub-card" href={`/shop/${category.slug}/${sub.slug}`} key={sub.slug}>
          <span className="sub-img" style={{ backgroundImage: `url("${photo(sub.image, 500)}")` }} />
          <div><h3>{sub.name}</h3><span>{productsIn(products, category.slug, sub.slug).length} products</span></div>
          <ArrowUpRight size={18} />
        </Link>)}</div>
      </div>
    </section>

    <section className="section section-tight" id="products">
      <div className="container">
        <SectionHeading eyebrow="All products" title={`${category.name} collection`} />
        <ShopListing products={items} subOptions={category.subcategories} />
      </div>
    </section>
    <CtaBand />
  </>;
}
