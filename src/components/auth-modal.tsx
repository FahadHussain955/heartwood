"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { useCart } from "@/components/cart";
import { GoogleButton } from "@/components/google-button";
import { createClient } from "@/lib/supabase/client";

export function AuthModal() {
  const { authOpen, closeAuth, authDone } = useCart();
  const [signup, setSignup] = useState(false);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!authOpen) return null;

  const switchTo = (value: boolean) => { setSignup(value); setError(""); };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { data, error } = signup
      ? await supabase.auth.signUp({ email, password, options: { data: { name: String(form.get("name") ?? "").trim(), phone: String(form.get("phone") ?? "").trim() } } })
      : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setError(error.message);
    if (!data.session) return setError("Account created. Please confirm your email, then log in.");
    authDone(data.session.user);
  };

  return <div className="auth-modal" role="dialog" aria-modal="true" aria-label="Login or sign up" onClick={closeAuth}>
    <form className="auth-card checkout-form" onSubmit={submit} onClick={(event) => event.stopPropagation()}>
      <button type="button" className="auth-close" aria-label="Close" onClick={closeAuth}><X size={22} /></button>
      <div className="auth-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={!signup} className={!signup ? "is-active" : ""} onClick={() => switchTo(false)}>Login</button>
        <button type="button" role="tab" aria-selected={signup} className={signup ? "is-active" : ""} onClick={() => switchTo(true)}>Sign up</button>
      </div>
      {signup && <input name="name" required autoComplete="name" placeholder="Please enter your name" aria-label="Full name" />}
      {signup && <input name="phone" type="tel" required autoComplete="tel" placeholder="Please enter your phone (03XX XXXXXXX)" aria-label="Phone number" />}
      <input name="email" type="email" required autoFocus autoComplete="email" placeholder="Please enter your email" aria-label="Email address" />
      <div className="auth-password">
        <input name="password" type={show ? "text" : "password"} required minLength={6} autoComplete={signup ? "new-password" : "current-password"} placeholder="Please enter your password" aria-label="Password" />
        <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)}>{show ? <Eye size={18} /> : <EyeOff size={18} />}</button>
      </div>
      {error && <p className="checkout-error" role="alert">{error}</p>}
      <button className="button button-accent" type="submit" disabled={busy}>{busy ? "PLEASE WAIT…" : signup ? "SIGN UP" : "LOGIN"}</button>
      <GoogleButton onError={setError} />
      <p className="auth-switch">{signup ? "Already have an account?" : "Don't have an account?"} <button type="button" onClick={() => switchTo(!signup)}>{signup ? "Login" : "Sign up"}</button></p>
    </form>
  </div>;
}
