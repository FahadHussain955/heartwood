"use client";

import { useState } from "react";
import { Search, Star, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { includes, orderNo, when, type DbProduct, type Review } from "./shared";

type Props = { reviews: Review[]; products: DbProduct[]; loading: boolean; onChanged: () => void; onNotice: (text: string, error?: boolean) => void };

export function Reviews({ reviews, products, loading, onChanged, onNotice }: Props) {
  const [filter, setFilter] = useState("");
  const productName = (id: string) => products.find((product) => product.id === id)?.name ?? id;
  const visible = reviews.filter((review) => includes(filter, review.reviewer, review.comment, productName(review.product_id)));

  const remove = async (review: Review) => {
    if (!window.confirm(`Delete ${review.reviewer}'s review of "${productName(review.product_id)}"? This can't be undone.`)) return;
    const { error } = await createClient().from("reviews").delete().eq("id", review.id);
    if (error) return onNotice(error.message, true);
    onNotice("Review deleted.");
    onChanged();
  };

  return <section className="admin-panel">
    <div className="panel-toolbar">
      <p className="panel-note">{reviews.length} {reviews.length === 1 ? "review" : "reviews"} from customers.</p>
      <label className="admin-filter"><Search size={14} /><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Product, name or comment" /></label>
    </div>
    <div className="table-wrap"><table>
      <thead><tr><th>PRODUCT</th><th>CUSTOMER</th><th>RATING</th><th>REVIEW</th><th>ORDER</th><th>DATE</th><th /></tr></thead>
      <tbody>
        {visible.length === 0 && <tr><td colSpan={7}>{loading ? "Loading…" : reviews.length ? "No reviews match this search." : "No reviews yet."}</td></tr>}
        {visible.map((review) => <tr key={review.id}>
          <td>{productName(review.product_id)}</td>
          <td>{review.reviewer}</td>
          <td><span className="stars" aria-label={`${review.rating} out of 5`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} fill={index < review.rating ? "currentColor" : "none"} />)}</span></td>
          <td className="cell-truncate">{review.comment || "—"}</td>
          <td>{review.order_id ? orderNo(review.order_id) : "—"}</td>
          <td>{when(review.created_at)}</td>
          <td><button className="more-button" aria-label={`Delete review by ${review.reviewer}`} onClick={() => remove(review)}><Trash2 size={16} /></button></td>
        </tr>)}
      </tbody>
    </table></div>
  </section>;
}
