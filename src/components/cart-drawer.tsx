"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Banknote, Check, CheckCircle2, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/components/cart";
import { ReviewModal } from "@/components/review-modal";
import { money, photo, productHref, whatsappLink, type Product } from "@/lib/store";

export function CartDrawer() {
  const { lines, count, subtotal, drawerOpen, toast, setQty, clear, openDrawer } = useCart();
  const [checkout, setCheckout] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [review, setReview] = useState<{ name: string; products: Product[] } | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const close = () => { openDrawer(false); setCheckout(false); setPlaced(false); setError(""); };

  // Prices and totals are recalculated in the database by place_order — the cart only sends ids and quantities. The server also WhatsApps the admin.
  const placeOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "");
    setBusy(true);
    setError("");
    const res = await fetch("/api/orders", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, phone: String(form.get("phone") ?? ""), email: String(form.get("email") ?? ""), address: String(form.get("address") ?? ""),
        items: lines.map(({ product, qty }) => ({ id: product.id, qty })),
      }),
    });
    const result = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(result.error || "We couldn't place your order. Please try again or call us.");
      return;
    }
    setOrderId(result.id as number);
    setReview({ name, products: lines.map((line) => line.product) });
    clear();
    setCheckout(false);
    setPlaced(true);
  };

  return <>
    <div className={drawerOpen ? "drawer-backdrop is-open" : "drawer-backdrop"} onClick={close} />
    <aside className={drawerOpen ? "cart-drawer is-open" : "cart-drawer"} aria-hidden={!drawerOpen} inert={!drawerOpen} aria-label="Shopping cart">
      <div className="drawer-head"><h2>Your cart <span>({count})</span></h2><button className="icon-button" aria-label="Close cart" onClick={close}><X size={22} /></button></div>
      {placed
        ? <div className="cart-empty cart-placed"><span className="placed-icon"><CheckCircle2 size={34} strokeWidth={1.6} /></span><h3>Order placed — thank you!</h3>{orderId && <p>Your order number is <b>#HW-{orderId}</b>.</p>}<p>We&apos;ve emailed you a confirmation — if you don&apos;t see it, please check your <b>Spam</b> folder.</p><p>Pay cash when your order arrives. We&apos;ll call you to confirm delivery.</p><p>You can track or cancel your order anytime from <Link href="/track-order" onClick={close}><b>Track order</b></Link> using your order number and phone.</p><button className="button button-dark" onClick={close}>Continue shopping</button></div>
        : lines.length === 0
        ? <div className="cart-empty"><ShoppingBag size={38} strokeWidth={1.4} /><p>Your cart is empty.</p><Link className="button button-dark" href="/shop" onClick={close}>Start shopping</Link></div>
        : <>
          <ul className="cart-lines">{lines.map(({ product, qty }) => <li key={product.id}>
            <Link className="cart-thumb" href={productHref(product)} onClick={close} aria-label={product.name} style={{ backgroundImage: `url("${photo(product.image, 200)}")` }} />
            <div>
              <Link href={productHref(product)} onClick={close}><strong>{product.name}</strong></Link>
              <small>{product.type}</small>
              <div className="qty">
                <button aria-label={`Decrease ${product.name}`} onClick={() => setQty(product.id, qty - 1)}><Minus size={13} /></button>
                <span>{qty}</span>
                <button aria-label={`Increase ${product.name}`} onClick={() => setQty(product.id, qty + 1)}><Plus size={13} /></button>
              </div>
            </div>
            <div className="cart-line-end"><b>{money(product.price * qty)}</b><button aria-label={`Remove ${product.name}`} onClick={() => setQty(product.id, 0)}><Trash2 size={15} /></button></div>
          </li>)}</ul>
          {checkout
            ? <form className="cart-summary checkout-form" onSubmit={placeOrder}>
              <div><span>Total (pay on delivery)</span><strong>{money(subtotal)}</strong></div>
              <input name="name" required autoComplete="name" placeholder="Full name" aria-label="Full name" />
              <input name="phone" type="tel" required autoComplete="tel" placeholder="Phone (03XX XXXXXXX)" aria-label="Phone number" />
              <input name="email" type="email" required autoComplete="email" placeholder="Email (for order confirmation)" aria-label="Email address" />
              <textarea name="address" required rows={2} autoComplete="street-address" placeholder="Delivery address & city" aria-label="Delivery address" />
              {error && <p className="checkout-error" role="alert">{error}</p>}
              <button className="button button-accent" type="submit" disabled={busy}><Banknote size={17} /> {busy ? "Placing order…" : "Place order — Cash on Delivery"}</button>
              <button className="button button-outline" type="button" onClick={() => setCheckout(false)}>Back to cart</button>
            </form>
            : <div className="cart-summary">
              <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
              <p>Delivery fee and installation charges depend on your order.</p>
              <button className="button button-accent" onClick={() => setCheckout(true)}><Banknote size={17} /> Checkout — Cash on Delivery</button>
              <button className="button button-outline" onClick={close}>Continue shopping</button>
            </div>}
        </>}
    </aside>

    {review && <ReviewModal orderId={orderId} name={review.name} products={review.products} onClose={() => setReview(null)} />}

    <div className={toast ? "toast is-visible" : "toast"} role="status"><Check size={16} /> <span><b>{toast}</b> added to cart</span><button onClick={() => openDrawer(true)}>View cart</button></div>

    <a className="whatsapp-float" href={whatsappLink()} target="_blank" rel="noreferrer" aria-label="Chat with us on WhatsApp"><svg viewBox="0 0 32 32" width="26" height="26" fill="currentColor" aria-hidden="true"><path d="M16.04 3C9.4 3 4 8.4 4 15.02c0 2.12.55 4.18 1.6 6L4 29l8.2-1.56a12.03 12.03 0 0 0 3.84.62C22.68 28.06 28 22.66 28 16.04 28 9.4 22.68 3 16.04 3Zm0 22c-1.2 0-2.37-.2-3.5-.6l-.5-.18-4.86.92.96-4.7-.2-.5a9.9 9.9 0 0 1-1.5-5.3c0-5.5 4.5-10 10.1-10 5.5 0 10 4.5 10 10.1 0 5.4-4.5 10.26-10.5 10.26Zm5.5-7.5c-.3-.15-1.8-.9-2.1-1-.28-.1-.48-.15-.68.15-.2.3-.78 1-.96 1.2-.18.2-.35.22-.65.08-.3-.15-1.28-.47-2.44-1.5-.9-.8-1.5-1.8-1.7-2.1-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.07-.15-.68-1.64-.93-2.25-.25-.6-.5-.5-.68-.5h-.58c-.2 0-.53.08-.8.38-.28.3-1.05 1.03-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.1 3.2 5.1 4.5.7.3 1.27.5 1.7.62.72.23 1.37.2 1.88.12.58-.08 1.8-.74 2.05-1.45.25-.7.25-1.3.18-1.43-.08-.12-.28-.2-.58-.35Z"/></svg></a>
  </>;
}
