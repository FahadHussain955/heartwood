"use client";

import { useState } from "react";
import { Check, Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart";
import { photo, type Product } from "@/lib/store";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  return <div className="gallery">
    <div className="gallery-main" role="img" aria-label={`${name} — image ${active + 1} of ${images.length}`} style={{ backgroundImage: `url("${photo(images[active], 1300)}")` }} />
    {images.length > 1 && <div className="gallery-thumbs">{images.map((image, index) => <button key={image} className={index === active ? "is-active" : ""} aria-label={`Show image ${index + 1}`} onClick={() => setActive(index)} style={{ backgroundImage: `url("${photo(image, 240)}")` }} />)}</div>}
  </div>;
}

export function BuyBox({ product, madeToOrder }: { product: Product; madeToOrder?: boolean }) {
  const { add, wishlist, toggleWish, openDrawer } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const liked = wishlist.includes(product.id);
  const addToCart = () => {
    add(product.id, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return <div className="buy-box">
    <p className={madeToOrder ? "stock stock-order" : "stock"}><Check size={16} /> {madeToOrder ? "Made to order" : "In stock"}</p>
    <div className="buy-row">
      <div className="qty qty-lg">
        <button aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={15} /></button>
        <span>{qty}</span>
        <button aria-label="Increase quantity" onClick={() => setQty(qty + 1)}><Plus size={15} /></button>
      </div>
      <button className="button button-dark buy-add" onClick={addToCart}>{added ? <><Check size={17} /> Added</> : <><ShoppingBag size={17} /> Add to cart</>}</button>
      <button className={liked ? "icon-button wish-lg is-liked" : "icon-button wish-lg"} aria-label={liked ? "Remove from wishlist" : "Save to wishlist"} aria-pressed={liked} onClick={() => toggleWish(product.id)}><Heart size={20} fill={liked ? "currentColor" : "none"} /></button>
    </div>
    <div className="buy-row">
      <button className="button button-outline" onClick={() => { add(product.id, qty); openDrawer(true); }}>Order via WhatsApp</button>
    </div>
  </div>;
}
