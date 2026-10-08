import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, HelpCircle, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { CtaBand, PageHero } from "@/components/ui";
import { faqs } from "@/lib/store";

export const metadata: Metadata = { title: "Help & FAQs", description: "Delivery, installation, warranty, returns and payment information." };

const topics = [
  { id: "delivery", icon: Truck, title: "Delivery & installation", points: ["Delivery fee depends on your order.", "Installation charges depend on your order.", "Nationwide delivery through trusted cargo partners — the charges are confirmed before dispatch."] },
  { id: "warranty", icon: ShieldCheck, title: "Warranty", points: ["No warranty is offered on our products."] },
  { id: "returns", icon: RotateCcw, title: "Returns & exchanges", points: ["No returns or exchanges."] },
  { id: "payment", icon: Banknote, title: "Ordering & payment", points: ["Confirm your order on our website after entering your delivery details.", "You will then continue to WhatsApp, where our team will confirm the final total and payment options.", "Corporate orders can be invoiced — a 50% advance confirms production.", "All prices are in PKR and include applicable taxes."] },
];

export default function HelpPage() {
  return <>
    <PageHero crumbs={[{ label: "Help & FAQs" }]} eyebrow="Customer care" title="How can we help?" text="Everything you need to know about delivery, installation, warranty, returns and payments.">
      <div className="chip-row chip-row-light">{topics.map((topic) => <Link key={topic.id} className="chip" href={`#${topic.id}`}>{topic.title}</Link>)}<Link className="chip" href="#faqs">FAQs</Link></div>
    </PageHero>

    <section className="section section-tight">
      <div className="container help-grid">{topics.map((topic) => <article className="help-card" id={topic.id} key={topic.id}>
        <topic.icon size={26} />
        <h2>{topic.title}</h2>
        <ul>{topic.points.map((point) => <li key={point}>{point}</li>)}</ul>
      </article>)}</div>
    </section>

    <section className="section faq-section" id="faqs">
      <div className="container narrow">
        <div className="section-heading"><div><p className="eyebrow"><HelpCircle size={13} /> FAQs</p><h2>Frequently asked questions</h2></div></div>
        {faqs.map(([question, answer]) => <details className="accordion" key={question}><summary>{question}</summary><p>{answer}</p></details>)}
      </div>
    </section>
    <CtaBand title="Still have a question?" text="Our team is available on WhatsApp and phone during showroom hours." />
  </>;
}
