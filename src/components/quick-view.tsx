"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X } from "lucide-react";
import { getCategory, getSubcategory, money, photo, productDetails, productHref, type Product } from "@/lib/store";

export function QuickView({ product, onClose }: { product: Product; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const category = getCategory(product.category);
  const sub = getSubcategory(product.category, product.sub);
  const details = category && sub ? productDetails(product) : null;

  useEffect(() => {
    closeRef.current?.focus();
    const previousBody = document.body.style.overflow;
    const previousHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousBody;
      document.documentElement.style.overflow = previousHtml;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div className="quick-view" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={onClose}>
      <div className="quick-view-card" onClick={(event) => event.stopPropagation()}>
        <button ref={closeRef} className="quick-view-close" type="button" aria-label="Close" onClick={onClose}><X size={22} /></button>
        <div className="quick-view-photo" style={{ backgroundImage: `url("${photo(product.image, 1000)}")` }} role="img" aria-label={product.name} />
        <div className="quick-view-copy">
          <h2 id={titleId}>{product.name}</h2>
          <h3>Price</h3>
          <p className="quick-view-price">{money(product.price)}</p>
          {(details || sub) && <>
            <h3>Features</h3>
            <ul>
              {details && Object.entries(details.specs).map(([key, value]) => <li key={key}><strong>{key}:</strong> {value}</li>)}
              {sub?.features.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
          </>}
          {details && <>
            <h3>Description</h3>
            <p>{details.description}</p>
          </>}
          <Link className="text-link" href={productHref(product)} onClick={onClose}>View full details</Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}
