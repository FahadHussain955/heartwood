"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { GoogleButton } from "@/components/google-button";
import { createClient } from "@/lib/supabase/client";

export function AccountForm({ next }: { next: string }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [signup, setSignup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

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
    if (!data.session) return setError("Account created. Please confirm your email, then sign in.");
    router.push(next);
    router.refresh();
  };

  if (user) return <div className="track-form" style={{ maxWidth: 440, margin: "0 auto" }}>
    <p>Signed in as <strong>{user.email}</strong></p>
    <Link className="button button-dark" href="/shop">Continue shopping</Link>
    <button className="button button-outline" onClick={async () => { await createClient().auth.signOut(); setUser(null); router.refresh(); }}>Sign out</button>
  </div>;

  return <form className="track-form checkout-form" style={{ maxWidth: 440, margin: "0 auto" }} onSubmit={submit}>
    {signup && <input name="name" required autoComplete="name" placeholder="Full name" aria-label="Full name" />}
    {signup && <input name="phone" type="tel" required autoComplete="tel" placeholder="Phone (03XX XXXXXXX)" aria-label="Phone number" />}
    <input name="email" type="email" required autoComplete="email" placeholder="Email" aria-label="Email address" />
    <input name="password" type="password" required minLength={6} autoComplete={signup ? "new-password" : "current-password"} placeholder="Password (min 6 characters)" aria-label="Password" />
    {error && <p className="checkout-error" role="alert">{error}</p>}
    <button className="button button-accent" type="submit" disabled={busy}>{busy ? "Please wait…" : signup ? "Create account" : "Sign in"}</button>
    <GoogleButton next={next} onError={setError} />
    <button className="button button-outline" type="button" disabled={busy} onClick={() => { setSignup(!signup); setError(""); }}>{signup ? "Already have an account? Sign in" : "New here? Create account"}</button>
  </form>;
}
