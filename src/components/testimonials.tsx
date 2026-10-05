"use client";

import { useState } from "react";
import { ArrowRight, MessageSquare, Star, User, X } from "lucide-react";
import { testimonials } from "@/lib/store";

const LIMIT = 90;
const Stars = ({ size = 15 }: { size?: number }) => <div className="stars" aria-label="5 out of 5 stars">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={size} fill="currentColor" />)}</div>;

function Quote({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > LIMIT;
  return <p className="review-text">“{long && !open ? `${text.slice(0, LIMIT).trimEnd()}…` : text}”{long && <button className="review-more" onClick={() => setOpen(!open)}> {open ? "Show less" : "Read more"}</button>}</p>;
}

export function Testimonials() {
  const [all, setAll] = useState(false);

  return <div className="container">
    <div className="section-heading section-heading-center">
      <div><p className="eyebrow">Testimonials</p><h2>What our customers say</h2><p className="section-text">Trusted by shoppers like you</p></div>
    </div>
    <div className="testimonials-more"><button className="text-link" onClick={() => setAll(true)}>Load more <ArrowRight size={16} /></button></div>
    <div className="testimonial-grid">{testimonials.slice(0, 3).map((item) => <figure className="testimonial" key={item.name}>
      <figcaption>
        <span className="avatar">{item.name[0]}</span>
        <div><strong>{item.name}</strong><Stars /></div>
      </figcaption>
      <blockquote><Quote text={item.quote} /></blockquote>
    </figure>)}</div>

    {all && <div className="reviews-modal" role="dialog" aria-modal="true" aria-labelledby="all-reviews-title" onClick={() => setAll(false)}>
      <div className="reviews-card" onClick={(event) => event.stopPropagation()}>
        <div className="reviews-head">
          <div><h3 id="all-reviews-title"><MessageSquare size={22} /> All Customer Reviews</h3><p>{testimonials.length} reviews</p></div>
          <button className="review-close-lg" aria-label="Close" onClick={() => setAll(false)}><X size={18} /></button>
        </div>
        <ul className="reviews-list">{testimonials.map((item) => <li key={item.name}>
          <span className="reviews-avatar"><User size={20} /></span>
          <div>
            <div className="reviews-row"><strong>{item.name}</strong><Stars size={14} /></div>
            <p>{item.quote}</p>
            <small>{item.date}</small>
          </div>
        </li>)}</ul>
      </div>
    </div>}
  </div>;
}
