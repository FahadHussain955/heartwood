"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { photo, slides } from "@/lib/store";

export function HeroSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((index) => (index + 1) % slides.length), 6000);
    return () => window.clearInterval(timer);
  }, []);

  return <section className="hero" aria-roledescription="carousel">
    {slides.map((slide, index) => <div className={index === active ? "hero-slide is-active" : "hero-slide"} key={slide.title} aria-hidden={index !== active}>
      <span className="hero-bg" style={{ backgroundImage: `url("${photo(slide.image, 1800)}")` }} />
      <div className="container hero-content">
        <p className="eyebrow">{slide.eyebrow}</p>
        <h1>{slide.title}</h1>
        <p>{slide.text}</p>
        <div className="hero-actions">
          <Link className="button button-accent" href={slide.href} tabIndex={index === active ? 0 : -1}>{slide.cta} <ArrowRight size={17} /></Link>
          <Link className="button button-ghost" href="/shop" tabIndex={index === active ? 0 : -1}>Shop all</Link>
        </div>
      </div>
    </div>)}
  </section>;
}
