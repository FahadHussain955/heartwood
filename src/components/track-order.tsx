"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, ClipboardList, LogIn, PackageCheck, Pencil, Truck, XCircle } from "lucide-react";
import { useCart } from "@/components/cart";
import { money, site, telLink } from "@/lib/store";

type Order = {
  id: number; name: string; phone: string; address: string; subtotal: number; status: Status; created_at: string;
  items: { id: string; name: string; price: number; qty: number }[];
};
type Status = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

const steps = [
  { key: "pending", label: "Order placed", icon: ClipboardList },
  { key: "processing", label: "Processing", icon: PackageCheck },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Check },
] as const;

const placedOn = (date: string) => new Date(date).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });

// Lists the orders placed from the signed-in account. Only that account can see them, and edit or cancel one while it is pending.
export function TrackOrder() {
  const { user, requireLogin } = useCart();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [signedOut, setSignedOut] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [draft, setDraft] = useState<{ name: string; address: string; qty: Record<string, number> } | null>(null);

  // The server reads the session cookie, so this works before the browser has loaded the user, and reloads on sign-in or sign-out.
  const userId = user?.id;
  useEffect(() => {
    let live = true;
    fetch("/api/orders/track").then(async (res) => {
      const result = await res.json().catch(() => ({}));
      if (!live) return;
      setSignedOut(res.status === 401);
      if (res.ok) {
        setOrders(result.orders as Order[]);
        setOpenId((result.orders as Order[])[0]?.id ?? null);
        setError("");
      } else {
        setOrders(null);
        if (res.status !== 401) setError(result.error || "Your orders couldn't be loaded. Please try again or call us.");
      }
    });
    return () => { live = false; };
  }, [userId]);

  const send = async (body: { id: number; cancel?: boolean; update?: { name: string; address: string; items: { id: string; qty: number }[] } }) => {
    setBusy(true);
    setError("");
    const res = await fetch("/api/orders/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.status === 401) return setSignedOut(true);
    if (!res.ok) return setError(result.error || "Something went wrong. Please try again or call us.");
    setOrders(result.orders as Order[]);
    setConfirming(false);
    setDraft(null);
  };

  const toggle = (id: number) => {
    setOpenId(openId === id ? null : id);
    setConfirming(false);
    setDraft(null);
    setError("");
  };

  const startEdit = (order: Order) => {
    setError("");
    setDraft({ name: order.name, address: order.address, qty: Object.fromEntries(order.items.map((item) => [item.id, item.qty])) });
  };

  if (signedOut) return <div className="track">
    <div className="track-form">
      <p className="track-note">Please log in to track your orders. Only the account an order was placed from can see, edit or cancel it.</p>
      <button className="button button-dark" onClick={() => requireLogin(() => {})}><LogIn size={17} /> Login / Sign up</button>
    </div>
  </div>;

  if (!orders) return <div className="track"><p className={error ? "checkout-error" : "track-note"} role={error ? "alert" : undefined}>{error || "Loading your orders…"}</p></div>;

  if (!orders.length) return <div className="track">
    <div className="track-form">
      <p className="track-note">You haven&apos;t placed any orders from this account yet.</p>
      <Link className="button button-dark" href="/shop">Start shopping</Link>
    </div>
  </div>;

  return <div className="track">
    {orders.map((order) => {
      const open = order.id === openId;
      const reached = steps.findIndex((step) => step.key === order.status);
      const items = order.items.reduce((sum, item) => sum + item.qty, 0);
      return <div className="track-card" key={order.id}>
        <button className="track-head track-toggle" aria-expanded={open} onClick={() => toggle(order.id)}>
          <div><p className="eyebrow">Order #HW-{order.id}</p><h2>{money(order.subtotal)}</h2><small>Placed {placedOn(order.created_at)} · {items} {items === 1 ? "item" : "items"}</small></div>
          <span className="track-toggle-end"><span className={`track-status is-${order.status}`}>{order.status}</span><ChevronDown size={18} /></span>
        </button>

        {open && <>
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
              <button className="button button-dark" disabled={busy} onClick={() => send({ id: order.id, update: { name: draft.name, address: draft.address, items: Object.entries(draft.qty).map(([id, qty]) => ({ id, qty })) } })}>{busy ? "Saving…" : "Save changes"}</button>
              <button className="button button-outline" disabled={busy} onClick={() => { setDraft(null); setError(""); }}>Discard</button>
            </div>
            : <>
              <ul className="track-items">{order.items.map((item) => <li key={item.id}><span>{item.name} × {item.qty}</span><b>{money(item.price * item.qty)}</b></li>)}</ul>
              <div className="track-total"><span>Order total</span><strong>{money(order.subtotal)}</strong></div>
              <p className="track-address"><b>Delivering to:</b> {order.name}, {order.address} · {order.phone}</p>
            </>}

          {order.status === "pending" && !draft && !confirming && <button className="button button-dark" onClick={() => startEdit(order)}><Pencil size={17} /> Edit order</button>}
          {order.status === "pending" && !draft && (confirming
            ? <div className="track-confirm">
              <p>Cancel this order? This can&apos;t be undone.</p>
              {error && <p className="checkout-error" role="alert">{error}</p>}
              <button className="button button-accent" disabled={busy} onClick={() => send({ id: order.id, cancel: true })}>{busy ? "Cancelling…" : "Yes, cancel order"}</button>
              <button className="button button-outline" disabled={busy} onClick={() => setConfirming(false)}>Keep order</button>
            </div>
            : <button className="button button-outline" onClick={() => setConfirming(true)}><XCircle size={17} /> Cancel order</button>)}
          {order.status !== "pending" && order.status !== "cancelled" && <p className="track-note">Orders already being processed can&apos;t be changed or cancelled online — please call <a href={telLink}>{site.phone}</a>.</p>}
        </>}
      </div>;
    })}
  </div>;
}
