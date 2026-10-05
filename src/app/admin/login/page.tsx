"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    const admin = data.user && (await supabase.from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle()).data;
    if (error || !admin) {
      if (!error) await supabase.auth.signOut();
      setError(error ? error.message : "This account does not have admin access.");
      setBusy(false);
      return;
    }
    router.replace("/admin");
    router.refresh();
  };

  return (
    <main className="admin-login">
      <form className="product-modal" onSubmit={submit}>
        <div className="modal-heading"><div><p className="eyebrow">STORE MANAGEMENT</p><h2>Admin sign in</h2></div></div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" autoFocus required value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="password" style={{ marginTop: 14 }}>Password</label>
        <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="admin-error">{error}</p>}
        <div className="modal-actions" style={{ marginTop: 24 }}>
          <button type="submit" className="admin-primary-button" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        </div>
      </form>
    </main>
  );
}
