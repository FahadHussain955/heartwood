"use client";

import { useEffect, useState } from "react";
import { photo, type HeroSlide } from "@/lib/store";

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);

  // Auto-advance. Depending on `active` restarts the timer after a manual click.
  useEffect(() => {
    const timer = window.setTimeout(() => setActive((index) => (index + 1) % slides.length), 6000);
    return () => window.clearTimeout(timer);
  }, [active, slides.length]);

  return <section className="hero" aria-roledescription="carousel" aria-label="Featured furniture collections">
    <h1 className="hero-title">Furniture for office, home and commercial spaces</h1>
    {slides.map((slide, index) => <div className={index === active ? "hero-slide is-active" : "hero-slide"} key={slide.title} aria-hidden={index !== active}>
      <span className="hero-bg" style={{ backgroundImage: `url("${photo(slide.image, 1800)}")` }} />
    </div>)}
    <div className="hero-dots" aria-label="Choose a slide">
      {slides.map((slide, index) => <button key={slide.title} type="button" className={index === active ? "hero-dot is-active" : "hero-dot"} onClick={() => setActive(index)} aria-label={`Show slide ${index + 1}: ${slide.eyebrow}`} aria-current={index === active ? "true" : undefined} />)}
    </div>
  </section>;
}
