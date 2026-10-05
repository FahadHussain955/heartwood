"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useCart } from "@/components/cart";
import { ProductCard } from "@/components/product-card";
import { PageHero } from "@/components/ui";
import { useProducts } from "@/components/products-provider";

export default function WishlistPage() {
  const { wishlist } = useCart();
  const products = useProducts();
  const saved = products.filter((product) => wishlist.includes(product.id));

  return <>
    <PageHero crumbs={[{ label: "Wishlist" }]} eyebrow={`${saved.length} saved`} title="Your wishlist" text="Products you've saved while browsing. Your wishlist is kept for this visit." />
    <section className="section section-tight">
      <div className="container">
        {saved.length
          ? <div className="product-grid">{saved.map((product) => <ProductCard key={product.id} product={product} />)}</div>
          : <div className="empty-state"><Heart size={34} strokeWidth={1.5} /><h3>No saved products yet</h3><p>Tap the heart on any product to save it here.</p><Link className="button button-dark" href="/shop">Browse products</Link></div>}
      </div>
    </section>
  </>;
}
