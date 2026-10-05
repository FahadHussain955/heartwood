import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Breadcrumbs, CtaBand, SectionHeading } from "@/components/ui";
import { getProducts } from "@/lib/products";
import { photo, posts } from "@/lib/store";

type Props = { params: Promise<{ slug: string }> };

// Products shown under each article.
const relatedBySlug: Record<string, string[]> = {
  "how-to-choose-an-ergonomic-office-chair": ["aurum-executive-chair", "flexmesh-pro-chair", "nimbus-task-chair", "axis-operator-chair"],
  "planning-a-workstation-layout": ["pod-4-workstation", "linear-6-bench", "skyline-cluster-desk", "tower-shelf-unit"],
  "cafe-seating-that-survives-the-rush": ["oslo-cafe-chair", "loop-cafe-chair", "round-bistro-table", "brasserie-booth"],
};

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);
  return post ? { title: post.title, description: post.excerpt } : {};
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);
  if (!post) notFound();
  const related = (await getProducts()).filter((product) => relatedBySlug[post.slug]?.includes(product.id));
  const others = posts.filter((item) => item.slug !== post.slug);

  return <>
    <article className="section article">
      <div className="container narrow">
        <Breadcrumbs items={[{ label: "Journal", href: "/blog" }, { label: post.title }]} />
        <p className="post-date">{post.date} · {post.readTime}</p>
        <h1>{post.title}</h1>
        <p className="article-lead">{post.excerpt}</p>
      </div>
      <div className="container article-cover" style={{ backgroundImage: `url("${photo(post.image, 1800)}")` }} />
      <div className="container narrow article-body">
        {post.body.map(([heading, text]) => <section key={heading}><h2>{heading}</h2><p>{text}</p></section>)}
      </div>
    </article>

    {related.length > 0 && <section className="section section-tight">
      <div className="container">
        <SectionHeading eyebrow="Shop the article" title="Products mentioned" />
        <div className="product-grid">{related.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </div>
    </section>}

    <section className="section section-tight">
      <div className="container">
        <SectionHeading eyebrow="Keep reading" title="More from the journal" link={{ label: "All articles", href: "/blog" }} />
        <div className="post-grid post-grid-2">{others.map((item) => <Link className="post-card" href={`/blog/${item.slug}`} key={item.slug}>
          <span className="post-img" style={{ backgroundImage: `url("${photo(item.image, 800)}")` }} />
          <p className="post-date">{item.date} · {item.readTime}</p><h3>{item.title}</h3><span className="text-link">Read more <ArrowRight size={15} /></span>
        </Link>)}</div>
      </div>
    </section>
    <CtaBand />
  </>;
}
