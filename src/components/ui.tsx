import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, MessageCircle, Phone } from "lucide-react";
import { photo, site, telLink, whatsappLink } from "@/lib/store";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return <nav className="breadcrumbs-nav" aria-label="Breadcrumb">
    <ol>
      <li><Link href="/">Home</Link></li>
      {items.map((item) => <li key={item.label}><ChevronRight size={13} />{item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</li>)}
    </ol>
  </nav>;
}

export function PageHero({ crumbs, eyebrow, title, text, image, children }: { crumbs: Crumb[]; eyebrow?: string; title: string; text?: string; image?: string; children?: ReactNode }) {
  return <section className={image ? "page-hero has-image" : "page-hero"}>
    {image && <span className="page-hero-bg" style={{ backgroundImage: `url("${photo(image, 1800)}")` }} />}
    <div className="container page-hero-inner">
      <Breadcrumbs items={crumbs} />
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {text && <p className="page-hero-text">{text}</p>}
      {children}
    </div>
  </section>;
}

export function SectionHeading({ eyebrow, title, text, link }: { eyebrow: string; title: string; text?: string; link?: { label: string; href: string } }) {
  return <div className="section-heading">
    <div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{text && <p className="section-text">{text}</p>}</div>
    {link && <Link className="text-link" href={link.href}>{link.label} <ArrowRight size={16} /></Link>}
  </div>;
}

export function CtaBand({ title = "Need help choosing?", text = "Talk to our furniture consultants for a free quotation, layout plan or fabric samples." }: { title?: string; text?: string }) {
  return <section className="cta-band">
    <div className="container cta-band-inner">
      <div><h2>{title}</h2><p>{text}</p></div>
      <div className="cta-actions">
        <a className="button button-accent" href={whatsappLink(`Hi ${site.name}, I need help choosing furniture.`)} target="_blank" rel="noreferrer"><MessageCircle size={17} /> WhatsApp us</a>
        <a className="button button-ghost" href={telLink}><Phone size={16} /> {site.phone}</a>
        <Link className="button button-ghost" href="/contact">Get a quote</Link>
      </div>
    </div>
  </section>;
}
