"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useCart } from "@/components/cart";
import { money, photo, productHref, type Product } from "@/lib/store";

export function ProductCard({ product }: { product: Product }) {
  const { add, wishlist, toggleWish } = useCart();
  const liked = wishlist.includes(product.id);
  const href = productHref(product);

  return <article className="product-card">
    <div className="product-photo">
      <Link className="product-photo-link" href={href} aria-label={product.name}><span className="product-photo-img" style={{ backgroundImage: `url("${photo(product.image, 700)}")` }} /></Link>
      <div className="product-tags">
        {product.tag && <span className="tag">{product.tag}</span>}
      </div>
      <button className={liked ? "wish-button is-liked" : "wish-button"} aria-label={liked ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`} aria-pressed={liked} onClick={() => toggleWish(product.id)}><Heart size={17} fill={liked ? "currentColor" : "none"} /></button>
      <button className="add-button" onClick={() => add(product.id)}><ShoppingBag size={16} /> Add to cart</button>
    </div>
    <div className="product-info">
      <p className="product-type">{product.type}</p>
      <h3><Link href={href}>{product.name}</Link></h3>
      {product.reviews > 0 && <p className="rating" aria-label={`Rated ${product.rating} out of 5`}><Star size={13} fill="currentColor" /> {product.rating} <span>({product.reviews})</span></p>}
      <div className="price">
        <strong>{money(product.price)}</strong>
      </div>
    </div>
  </article>;
}
