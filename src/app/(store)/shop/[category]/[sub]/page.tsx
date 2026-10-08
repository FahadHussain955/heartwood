import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { ShopListing } from "@/components/shop-listing";
import { CtaBand, PageHero } from "@/components/ui";
import { getProducts } from "@/lib/products";
import { catalog, getCategory, getSubcategory, productsIn } from "@/lib/store";

type Props = { params: Promise<{ category: string; sub: string }> };

export function generateStaticParams() {
  return catalog.flatMap((category) => category.subcategories.map((sub) => ({ category: category.slug, sub: sub.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, sub } = await params;
  const range = getSubcategory(category, sub);
  return range ? { title: range.name, description: range.blurb } : {};
}

export default async function SubcategoryPage({ params }: Props) {
  const { category: categorySlug, sub: subSlug } = await params;
  const category = getCategory(categorySlug);
  const sub = getSubcategory(categorySlug, subSlug);
  if (!category || !sub) notFound();
  const items = productsIn(await getProducts(), category.slug, sub.slug);

  return <>
    <PageHero crumbs={[{ label: "Shop", href: "/shop" }, { label: category.name, href: `/shop/${category.slug}` }, { label: sub.name }]} eyebrow={category.name} title={sub.name} text={sub.blurb} image={sub.image}>
      <div className="chip-row chip-row-light">{category.subcategories.map((item) => <Link key={item.slug} className={item.slug === sub.slug ? "chip is-active" : "chip"} href={`/shop/${category.slug}/${item.slug}`}>{item.name}</Link>)}</div>
    </PageHero>

    <section className="section section-tight">
      <div className="container">
        <ShopListing products={items} />
      </div>
    </section>

    <section className="section range-info">
      <div className="container range-info-inner">
        <div>
          <p className="eyebrow">Why our {sub.name.toLowerCase()}</p>
          <h2>Built for everyday use</h2>
          <ul className="feature-list">{sub.features.map((feature) => <li key={feature}><BadgeCheck size={20} /><div><strong>{feature}</strong></div></li>)}</ul>
          {sub.madeToOrder && <p className="note">This range is made to order in your chosen size and finish.</p>}
        </div>
        <div>
          <p className="eyebrow">Typical specifications</p>
          <table className="spec-table"><tbody>{Object.entries(sub.specs).map(([key, value]) => <tr key={key}><th>{key}</th><td>{value}</td></tr>)}</tbody></table>
        </div>
      </div>
    </section>
    <CtaBand title={`Need ${sub.name.toLowerCase()} in bulk?`} text="Get a corporate quotation with custom sizes and finishes." />
  </>;
}
