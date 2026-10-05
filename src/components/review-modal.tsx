"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Send, Star, X } from "lucide-react";
import type { Product } from "@/lib/store";

const labels = ["Tap a star", "Poor", "Fair", "Good", "Very good", "Excellent"];

export function ReviewModal({ orderId, name, products, onClose }: { orderId: number | null; name: string; products: Product[]; onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const shown = hover || rating;

  // Saved to the reviews table (one row per product in the order) and shown to the admin.
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!rating || !orderId) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    const res = await fetch("/api/reviews", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, rating, name: String(form.get("reviewer") ?? ""), comment: String(form.get("comment") ?? "") }),
    });
    const result = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(result.error || "We couldn't save your review. Please try again.");
    setSent(true);
  };

  return <div className="review-modal" role="dialog" aria-modal="true" aria-labelledby="review-title" onClick={onClose}>
    <div className="review-card" onClick={(event) => event.stopPropagation()}>
      <div className="review-top">
        <div>
          <h3 id="review-title">{sent ? "Thank you!" : "Rate your purchase"}</h3>
          <p>{sent ? "Your review has been submitted." : `Optional — share your experience with ${products.length > 1 ? "your order" : products[0]?.name}`}</p>
        </div>
        <button className="review-close" aria-label="Close" onClick={onClose}><X size={16} /></button>
      </div>

      {sent
        ? <div className="review-done">
          <CheckCircle2 size={34} strokeWidth={1.6} />
          <p>Your feedback helps other customers choose with confidence.</p>
          <button className="button button-dark" onClick={onClose}>Done</button>
        </div>
        : <form className="review-body" onSubmit={submit}>
          <div className="review-field">
            <span className="review-caption">Your rating</span>
            <div className="review-rating">
              <div className="review-stars" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>{[1, 2, 3, 4, 5].map((value) =>
                <button type="button" key={value} role="radio" aria-checked={rating === value} aria-label={`${value} star${value > 1 ? "s" : ""}`} className={value <= shown ? "is-on" : ""} onMouseEnter={() => setHover(value)} onClick={() => setRating(value)}>
                  <Star size={22} strokeWidth={1.5} fill={value <= shown ? "currentColor" : "none"} />
                </button>)}
              </div>
              <span className="review-label">{labels[shown]}</span>
            </div>
          </div>

          <label className="review-field"><span className="review-caption">Your name</span><input name="reviewer" required defaultValue={name} autoComplete="name" placeholder="e.g. Ali Raza" /></label>
          <label className="review-field"><span className="review-caption">Your review</span><textarea name="comment" rows={2} placeholder="Tell us about your experience..." /></label>

          {error && <p className="checkout-error" role="alert">{error}</p>}
          <div className="review-actions">
            <button className="button button-outline" type="button" onClick={onClose}>Skip</button>
            <button className="button button-accent" type="submit" disabled={!rating || busy}><Send size={14} /> {busy ? "Sending…" : "Submit"}</button>
          </div>
        </form>}
    </div>
  </div>;
}
