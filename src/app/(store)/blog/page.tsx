import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/ui";
import { photo, posts } from "@/lib/store";

export const metadata: Metadata = { title: "Journal", description: "Buying guides and ideas for offices, cafés and homes." };

export default function BlogPage() {
  const [lead, ...rest] = posts;
  return <>
    <PageHero crumbs={[{ label: "Journal" }]} eyebrow="From the journal" title="Ideas & buying guides" text="Practical advice on choosing, planning and caring for furniture at work and at home." />
    <section className="section section-tight">
      <div className="container">
        <Link className="post-lead" href={`/blog/${lead.slug}`}>
          <span style={{ backgroundImage: `url("${photo(lead.image, 1400)}")` }} />
          <div><p className="post-date">{lead.date} · {lead.readTime}</p><h2>{lead.title}</h2><p>{lead.excerpt}</p><span className="text-link">Read article <ArrowRight size={15} /></span></div>
        </Link>
        <div className="post-grid post-grid-2">{rest.map((post) => <Link className="post-card" href={`/blog/${post.slug}`} key={post.slug}>
          <span className="post-img" style={{ backgroundImage: `url("${photo(post.image, 800)}")` }} />
          <p className="post-date">{post.date} · {post.readTime}</p><h3>{post.title}</h3><p>{post.excerpt}</p><span className="text-link">Read more <ArrowRight size={15} /></span>
        </Link>)}</div>
      </div>
    </section>
  </>;
}
