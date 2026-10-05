"use client";

import { useState, type FormEvent } from "react";
import { Check, PackageCheck, Pencil, Search, Truck, XCircle, ClipboardList } from "lucide-react";
import { money, site, telLink } from "@/lib/store";

type Order = {
  id: number; owner: boolean; name?: string; address?: string; subtotal: number; status: Status; created_at: string;
  items: { id: string; name: string; price: number; qty: number }[];
};
type Status = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

const steps = [
  { key: "pending", label: "Order placed", icon: ClipboardList },
  { key: "processing", label: "Processing", icon: PackageCheck },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Check },
] as const;

export function TrackOrder() {
  const [order, setOrder] = useState<Order | null>(null);
  const [credentials, setCredentials] = useState({ id: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [draft, setDraft] = useState<{ name: string; address: string; qty: Record<string, number> } | null>(null);

  const request = async (cancel: boolean, who = credentials) => {
    setBusy(true);
    setError("");
    const res = await fetch("/api/orders/track", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...who, cancel }),
    });
    const result = await res.json().catch(() => ({}));
    setBusy(false);
    setConfirming(false);
    setDraft(null);
    if (!res.ok) return setError(result.error || "Something went wrong. Please try again or call us.");
    setOrder(result.order as Order);
  };

  const startEdit = () => {
    if (!order) return;
    setError("");
    setDraft({ name: order.name ?? "", address: order.address ?? "", qty: Object.fromEntries(order.items.map((item) => [item.id, item.qty])) });
  };

  const save = async () => {
    if (!draft) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/orders/track", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...credentials, update: { name: draft.name, address: draft.address, items: Object.entries(draft.qty).map(([id, qty]) => ({ id, qty })) } }),
    });
    const result = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(result.error || "Something went wrong. Please try again or call us.");
    setOrder(result.order as Order);
    setDraft(null);
  };

  const lookup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const who = { id: String(form.get("id") ?? ""), phone: "" };
    setCredentials(who);
    setOrder(null);
    void request(false, who);
  };

  const verify = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const who = { ...credentials, phone: String(new FormData(event.currentTarget).get("phone") ?? "") };
    setCredentials(who);
    void request(false, who);
  };

  const reached = order ? steps.findIndex((step) => step.key === order.status) : -1;

  return <div className="track">
    <form className="track-form" onSubmit={lookup}>
      <div className="field"><label htmlFor="track-id">Order number</label><input id="track-id" name="id" required inputMode="numeric" placeholder="e.g. HW-2501" defaultValue={credentials.id} /></div>
      {error && !order && <p className="checkout-error" role="alert">{error}</p>}
      <button className="button button-dark" type="submit" disabled={busy}><Search size={17} /> {busy && !order ? "Looking up…" : "Track order"}</button>
    </form>

    {order && <div className="track-card">
      <div className="track-head">
        <div><p className="eyebrow">Order #HW-{order.id}</p><h2>{order.name ? `Hello, ${order.name}` : "Your order"}</h2><small>Placed {new Date(order.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}</small></div>
        <span className={`track-status is-${order.status}`}>{order.status}</span>
      </div>

      {order.status === "cancelled"
        ? <p className="track-cancelled"><XCircle size={18} /> This order has been cancelled.</p>
        : <ol className="track-steps">{steps.map((step, index) => <li key={step.key} className={index <= reached ? "is-done" : ""}>
          <span><step.icon size={18} /></span>{step.label}
        </li>)}</ol>}

      {draft
        ? <div className="track-edit">
          <div className="field"><label htmlFor="edit-name">Name</label><input id="edit-name" value={draft.name} maxLength={120} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
          <div className="field"><label htmlFor="edit-address">Delivery address</label><textarea id="edit-address" rows={3} value={draft.address} maxLength={500} onChange={(e) => setDraft({ ...draft, address: e.target.value })} /></div>
          <ul className="track-items">{order.items.map((item) => {
            const qty = draft.qty[item.id] ?? 0;
            const set = (value: number) => setDraft({ ...draft, qty: { ...draft.qty, [item.id]: Math.min(Math.max(value, 0), 99) } });
            return <li key={item.id} className={qty === 0 ? "is-removed" : ""}>
              <span>{item.name}</span>
              <span className="track-qty"><button type="button" aria-label={`Decrease ${item.name}`} onClick={() => set(qty - 1)}>−</button><b>{qty}</b><button type="button" aria-label={`Increase ${item.name}`} onClick={() => set(qty + 1)}>+</button></span>
            </li>;
          })}</ul>
          <small className="track-note">Set a quantity to 0 to remove that item.</small>
          {error && <p className="checkout-error" role="alert">{error}</p>}
          <button className="button button-dark" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save changes"}</button>
          <button className="button button-outline" disabled={busy} onClick={() => { setDraft(null); setError(""); }}>Discard</button>
        </div>
        : <>
          <ul className="track-items">{order.items.map((item) => <li key={item.id}><span>{item.name} × {item.qty}</span><b>{money(item.price * item.qty)}</b></li>)}</ul>
          <div className="track-total"><span>Total (cash on delivery)</span><strong>{money(order.subtotal)}</strong></div>
          {order.address && <p className="track-address"><b>Delivering to:</b> {order.address}</p>}
        </>}

      {order.status === "pending" && !order.owner && <form className="track-edit" onSubmit={verify}>
        <p className="track-note">Want to edit or cancel this order? Enter the phone number you used at checkout.</p>
        <div className="field"><label htmlFor="verify-phone">Phone number</label><input id="verify-phone" name="phone" type="tel" required autoComplete="tel" placeholder="03XX XXXXXXX" /></div>
        {error && <p className="checkout-error" role="alert">{error}</p>}
        <button className="button button-outline" type="submit" disabled={busy}>{busy ? "Checking…" : "Verify"}</button>
      </form>}

      {order.status === "pending" && order.owner && !draft && !confirming && <button className="button button-dark" onClick={startEdit}><Pencil size={17} /> Edit order</button>}
      {order.status === "pending" && order.owner && !draft && (confirming
        ? <div className="track-confirm">
          <p>Cancel this order? This can&apos;t be undone.</p>
          {error && <p className="checkout-error" role="alert">{error}</p>}
          <button className="button button-accent" disabled={busy} onClick={() => request(true)}>{busy ? "Cancelling…" : "Yes, cancel order"}</button>
          <button className="button button-outline" disabled={busy} onClick={() => setConfirming(false)}>Keep order</button>
        </div>
        : <button className="button button-outline" onClick={() => setConfirming(true)}><XCircle size={17} /> Cancel order</button>)}
      {order.status !== "pending" && order.status !== "cancelled" && <p className="track-note">Orders already being processed can&apos;t be changed or cancelled online — please call <a href={telLink}>{site.phone}</a>.</p>}
    </div>}
  </div>;
}
