import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Calendar, Clock, MapPin, Tag } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { CtaBand, PageHero, SectionHeading } from "@/components/ui";
import { getProducts } from "@/lib/products";
import { getProduct, photo, projects } from "@/lib/store";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  return project ? { title: `${project.title} — ${project.place}`, description: project.summary } : {};
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const index = projects.findIndex((item) => item.slug === slug);
  if (index === -1) notFound();
  const project = projects[index];
  const products = await getProducts();
  const next = projects[(index + 1) % projects.length];
  const used = project.products.map((id) => getProduct(products, id)).filter((product) => product !== undefined);

  return <>
    <PageHero crumbs={[{ label: "Projects", href: "/projects" }, { label: project.title }]} eyebrow={project.sector} title={project.title} text={project.summary} image={project.image}>
      <ul className="hero-points"><li><MapPin size={16} /> {project.place}</li><li><Calendar size={16} /> {project.year}</li><li><Clock size={16} /> {project.timeline}</li><li><Tag size={16} /> {project.scope}</li></ul>
    </PageHero>

    <section className="section">
      <div className="container case-study">
        <div className="case-text">
          <h2>The challenge</h2>
          <p>{project.challenge}</p>
          <h2>Our solution</h2>
          <p>{project.solution}</p>
        </div>
        <aside className="case-facts">
          <dl className="facts facts-stack">{project.facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}<div><dt>Location</dt><dd>{project.place}</dd></div><div><dt>Completed</dt><dd>{project.year}</dd></div></dl>
          <Link className="button button-dark" href="/contact">Start a similar project <ArrowRight size={16} /></Link>
        </aside>
      </div>
      <div className="container case-gallery">{[project.image, ...project.gallery].map((image, i) => <span key={image} className={i === 0 ? "is-wide" : ""} style={{ backgroundImage: `url("${photo(image, i === 0 ? 1600 : 900)}")` }} />)}</div>
    </section>

    {used.length > 0 && <section className="section section-tight">
      <div className="container">
        <SectionHeading eyebrow="Furniture used" title="Products in this project" />
        <div className="product-grid">{used.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </div>
    </section>}

    <section className="section section-tight">
      <div className="container">
        <Link className="next-project" href={`/projects/${next.slug}`}>
          <span style={{ backgroundImage: `url("${photo(next.image, 1200)}")` }} />
          <div><p className="eyebrow">Next project</p><h2>{next.title}</h2><p>{next.place}</p></div>
          <ArrowRight size={28} />
        </Link>
      </div>
    </section>
    <CtaBand />
  </>;
}
