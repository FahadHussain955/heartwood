"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Send } from "lucide-react";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError("");
    const res = await fetch("/api/enquiries", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok) return setError((await res?.json().catch(() => null))?.error || "We couldn't send your message. Please call or WhatsApp us.");
    form.reset();
    setSent(true);
  };

  if (sent) return <div className="form-success"><CheckCircle2 size={34} /><h3>Thank you — we&apos;ve got your message.</h3><p>Our team will call you back within one working day.</p><button className="button button-outline" onClick={() => setSent(false)}>Send another enquiry</button></div>;

  return <form className="contact-form" onSubmit={submit}>
    <div className="field"><label htmlFor="name">Full name</label><input id="name" name="name" required autoComplete="name" placeholder="Your name" /></div>
    <div className="field"><label htmlFor="phone">Phone / WhatsApp</label><input id="phone" name="phone" type="tel" required autoComplete="tel" placeholder="03XX XXXXXXX" /></div>
    <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" /></div>
    <div className="field"><label htmlFor="type">I&apos;m interested in</label><select id="type" name="type" defaultValue="Office furniture"><option>Office furniture</option><option>Custom workstations</option><option>Café & restaurant</option><option>Home furniture</option><option>Bulk / corporate order</option></select></div>
    <div className="field field-wide"><label htmlFor="message">Message</label><textarea id="message" name="message" rows={4} required placeholder="Tell us about your space, quantities or the product you like." /></div>
    {error && <p className="checkout-error field-wide" role="alert">{error}</p>}
    <button className="button button-dark field-wide" type="submit" disabled={busy}>{busy ? "Sending…" : "Send enquiry"} <Send size={16} /></button>
  </form>;
}
