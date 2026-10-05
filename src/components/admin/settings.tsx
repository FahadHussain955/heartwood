"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AdminProfile } from "./shared";

export function Settings({ admin, onRenamed, onNotice }: { admin: AdminProfile; onRenamed: (name: string) => void; onNotice: (message: string) => void }) {
  const [name, setName] = useState(admin.name);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState<"" | "profile" | "password">("");
  const [error, setError] = useState<{ form: string; message: string } | null>(null);

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setBusy("profile");
    setError(null);
    const { error } = await createClient().from("admins").update({ name: name.trim() }).eq("user_id", admin.user_id);
    setBusy("");
    if (error) return setError({ form: "profile", message: error.message });
    onRenamed(name.trim());
    onNotice("Profile updated.");
  };

  const savePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirm) return setError({ form: "password", message: "Passwords don't match." });
    setBusy("password");
    setError(null);
    const { error } = await createClient().auth.updateUser({ password });
    setBusy("");
    if (error) return setError({ form: "password", message: error.message });
    setPassword("");
    setConfirm("");
    onNotice("Password changed. Use the new password next time you sign in.");
  };

  return <div className="settings-grid">
    <form className="admin-panel settings-card" onSubmit={saveProfile}>
      <div className="panel-heading"><div><h2>Profile</h2><p>Shown in the admin header</p></div></div>
      <label>Name<input required maxLength={60} value={name} onChange={(event) => setName(event.target.value)} /></label>
      <label>Email<input value={admin.email} disabled /></label>
      <label>Role<input value={admin.role === "owner" ? "Store owner" : "Staff"} disabled /></label>
      {error?.form === "profile" && <p className="admin-error">{error.message}</p>}
      <button className="admin-primary-button" disabled={busy !== "" || name.trim() === admin.name}>{busy === "profile" ? "Saving…" : "Save profile"}</button>
    </form>
    <form className="admin-panel settings-card" onSubmit={savePassword}>
      <div className="panel-heading"><div><h2>Password</h2><p>At least 8 characters</p></div></div>
      <label>New password<input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      <label>Confirm new password<input type="password" required minLength={8} autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} /></label>
      {error?.form === "password" && <p className="admin-error">{error.message}</p>}
      <button className="admin-primary-button" disabled={busy !== ""}>{busy === "password" ? "Saving…" : "Change password"}</button>
    </form>
  </div>;
}
