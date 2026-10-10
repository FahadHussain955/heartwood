import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Award, Hammer, HeartHandshake, Leaf, Quote, Ruler, Wrench } from "lucide-react";
import { CtaBand, PageHero, SectionHeading } from "@/components/ui";
import { photo, sectors, site, stats } from "@/lib/store";

export const metadata: Metadata = { title: "About us", description: `The story behind ${site.name} — furniture designed and built in Pakistan.` };

const values = [
  { icon: Hammer, title: "Made in-house", text: "Our own factory and craftsmen, so we control quality from raw timber to final finish." },
  { icon: Ruler, title: "Built to fit", text: "Custom sizes, fabrics and finishes for offices, restaurants and homes." },
  { icon: Award, title: "Quality-checked", text: "Every piece is inspected before dispatch." },
  { icon: Wrench, title: "Installed by us", text: "Our own team delivers and installs (charges depend on your order)." },
  { icon: HeartHandshake, title: "After-sales care", text: "Repairs, spare parts and re-upholstery long after the sale." },
  { icon: Leaf, title: "Responsible materials", text: "Kiln-dried timber, low-VOC finishes and durable designs that last." },
];

export default function AboutPage() {
  return <>
    <PageHero crumbs={[{ label: "About us" }]} eyebrow="Our story" title="Furniture that works as hard as you do" text={`${site.name} designs and manufactures office, commercial and home furniture in Pakistan — and delivers it with the care of a small workshop.`} image="1556761175-4b46a572b786" />

    <section className="section">
      <div className="container split">
        <div className="split-img" style={{ backgroundImage: `url("${photo("1571624436279-b272aff752b5", 1200)}")` }} />
        <div>
          <p className="eyebrow">Who we are</p>
          <h2>From one workshop to offices across Pakistan</h2>
          <p>We started {site.name} with a small workshop and a simple belief — that good furniture changes how people work and live. Today we furnish corporate headquarters, banks, schools, cafés and homes, while still building every piece ourselves.</p>
          <p>Our designers, carpenters, upholsterers and installers work under one roof. That means honest prices, reliable timelines and furniture made to fit your space exactly.</p>
          <Link className="button button-dark" href="/projects">See our projects <ArrowRight size={16} /></Link>
        </div>
      </div>
    </section>

    <section className="section about-section">
      <div className="container about">
        <div className="about-copy">
          <p className="eyebrow">A message from our founder</p>
          <Quote size={36} className="about-quote" />
          <blockquote>Every piece we make is designed in-house, built by our own craftsmen and checked before it leaves the factory. When you buy from us, you are buying from the people who made it.</blockquote>
          <p className="about-sign">Founder & CEO, {site.name}</p>
        </div>
        <div className="stats">{stats.map((stat) => <div key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <SectionHeading eyebrow="What we stand for" title="Why customers choose us" />
        <div className="value-grid">{values.map((value) => <div className="value-card" key={value.title}><value.icon size={26} /><h3>{value.title}</h3><p>{value.text}</p></div>)}</div>
        <div className="sectors"><span className="sectors-label">Sectors we serve</span>{sectors.map((sector) => <span key={sector}>{sector}</span>)}</div>
      </div>
    </section>
    <CtaBand title="Come visit a showroom" text="Sit in our chairs, feel the fabrics and talk to our designers in Lahore." />
  </>;
}
