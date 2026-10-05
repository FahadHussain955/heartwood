import type { Metadata } from "next";
import { ArrowUpRight, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { PageHero } from "@/components/ui";
import { faqs, showrooms, site, telLink, whatsappLink } from "@/lib/store";

export const metadata: Metadata = { title: "Contact us", description: "Visit our Lahore showroom or send us your requirements for a free quotation." };

export default function ContactPage() {
  return <>
    <PageHero crumbs={[{ label: "Contact" }]} eyebrow="Get in touch" title="Let's furnish your space" text="Visit a showroom, call us, or send your requirements — we reply within one working day with a quotation, layout plan and fabric samples." />

    <section className="section section-tight">
      <div className="container contact-cards">
        <a className="contact-card" href={telLink}><Phone size={22} /><small>Call us</small><strong>{site.phone}</strong><span>{site.hours}</span></a>
        <a className="contact-card" href={whatsappLink(`Hi ${site.name}, I have a question.`)} target="_blank" rel="noreferrer"><MessageCircle size={22} /><small>WhatsApp</small><strong>Chat with us</strong><span>Quick replies during showroom hours</span></a>
        <a className="contact-card" href={`mailto:${site.email}`}><Mail size={22} /><small>Email</small><strong>{site.email}</strong><span>Quotations & corporate orders</span></a>
      </div>
    </section>

    <section className="section contact-section">
      <div className="container contact">
        <div className="contact-intro">
          <p className="eyebrow">Send an enquiry</p>
          <h2>Tell us about your project</h2>
          <p className="section-text">Share quantities, room sizes or the products you like. For offices and restaurants we offer a free site visit in Lahore.</p>
          <ul className="contact-list">
            <li>Free quotation within 24 hours</li>
            <li>Free space planning for offices</li>
            <li>Fabric & finish samples on request</li>
            <li>Corporate invoicing available</li>
          </ul>
        </div>
        <ContactForm />
      </div>
    </section>

    <section className="section" id="showrooms">
      <div className="container">
        <div className="section-heading"><div><p className="eyebrow">Store locator</p><h2>Visit our showroom</h2><p className="section-text">See, sit and compare before you buy. Parking available.</p></div></div>
        <div className="showroom-maps">{showrooms.map((room) => <article key={room.city}>
          <iframe title={`${room.name} map`} src={room.embed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          <div>
            <h3>{room.name}</h3>
            <p><MapPin size={17} /> {room.address}</p>
            <p><Clock size={17} /> {site.hours}</p>
            <p><Phone size={17} /> <a href={telLink}>{site.phone}</a></p>
            <a className="text-link" href={room.map} target="_blank" rel="noreferrer">Get directions <ArrowUpRight size={15} /></a>
          </div>
        </article>)}</div>
      </div>
    </section>

    <section className="section section-tight faq-section">
      <div className="container narrow">
        <div className="section-heading"><div><p className="eyebrow">FAQs</p><h2>Common questions</h2></div></div>
        {faqs.slice(0, 5).map(([question, answer]) => <details className="accordion" key={question}><summary>{question}</summary><p>{answer}</p></details>)}
      </div>
    </section>
  </>;
}
