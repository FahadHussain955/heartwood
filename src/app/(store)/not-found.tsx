import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { catalog } from "@/lib/store";

export default function NotFound() {
  return <section className="section not-found">
    <div className="container narrow">
      <p className="eyebrow">Error 404</p>
      <h1>We couldn&apos;t find that page.</h1>
      <p>The link may be old or the product may have moved. Try one of our collections instead.</p>
      <div className="chip-row">{catalog.map((category) => <Link key={category.slug} className="chip" href={`/shop/${category.slug}`}>{category.name}</Link>)}</div>
      <Link className="button button-dark" href="/">Back to home <ArrowRight size={16} /></Link>
    </div>
  </section>;
}
