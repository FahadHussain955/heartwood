import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Banknote, RotateCcw, ShieldCheck, Star, Truck, Wrench } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { BuyBox, ProductGallery } from "@/components/product-detail";
import { Breadcrumbs, SectionHeading } from "@/components/ui";
import { getProducts, getReviews } from "@/lib/products";
import { getProduct, money, productDetails, site, whatsappLink } from "@/lib/store";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct(await getProducts(), (await params).id);
  return product ? { title: product.name, description: `${product.name} — ${product.type}. ${money(product.price)} with free delivery in Lahore.` } : {};
}

export default async function ProductPage({ params }: Props) {
  const products = await getProducts();
  const product = getProduct(products, (await params).id);
  if (!product) notFound();
  const customerReviews = await getReviews(product.id);
  const { category, sub, specs, gallery, description } = productDetails(product);
  const related = products.filter((item) => item.id !== product.id && item.sub === product.sub)
    .concat(products.filter((item) => item.id !== product.id && item.category === product.category && item.sub !== product.sub))
    .slice(0, 4);

  return <>
    <section className="section product-page">
      <div className="container">
        <Breadcrumbs items={[{ label: category.name, href: `/shop/${category.slug}` }, { label: sub.name, href: `/shop/${category.slug}/${sub.slug}` }, { label: product.name }]} />
        <div className="product-layout">
          <ProductGallery images={gallery} name={product.name} />
          <div className="product-summary">
            <Link className="eyebrow" href={`/shop/${category.slug}/${sub.slug}`}>{sub.name}</Link>
            <h1>{product.name}</h1>
            <p className="product-subtitle">{product.type}</p>
            {product.reviews > 0 && <a className="rating rating-lg" href="#reviews"><Star size={16} fill="currentColor" /> {product.rating} <span>· {product.reviews} reviews</span></a>}
            <div className="price price-lg">
              <strong>{money(product.price)}</strong>
            </div>
            <p className="product-description">{description}</p>
            <BuyBox product={product} madeToOrder={sub.madeToOrder} />
            <ul className="assurance">
              <li><Truck size={18} /> Delivery fee depends on your order</li>
              <li><Wrench size={18} /> Installation charges depend on your order</li>
              <li><ShieldCheck size={18} /> No returns, exchanges or warranty</li>
              <li><Banknote size={18} /> Cash on delivery, bank transfer or card</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section className="section section-tight product-more">
      <div className="container product-more-grid">
        <div>
          <h2>Product details</h2>
          <p>{description}</p>
          <h3>Key features</h3>
          <ul className="feature-list">{sub.features.map((feature) => <li key={feature}><BadgeCheck size={20} /><div><strong>{feature}</strong></div></li>)}</ul>
        </div>
        <div>
          <h2>Specifications</h2>
          <table className="spec-table"><tbody>
            <tr><th>Product code</th><td>{product.id.toUpperCase().slice(0, 12)}</td></tr>
            {Object.entries(specs).map(([key, value]) => <tr key={key}><th>{key}</th><td>{value}</td></tr>)}
            <tr><th>Availability</th><td>{sub.madeToOrder ? "Made to order (2–3 weeks)" : "In stock (3–5 working days)"}</td></tr>
          </tbody></table>
          <details className="accordion" open>
            <summary><Truck size={17} /> Delivery & installation</summary>
            <p>Delivery fee and installation charges depend on your order. Nationwide delivery is available through our cargo partners. <Link href="/help#delivery">Learn more</Link></p>
          </details>
          <details className="accordion">
            <summary><RotateCcw size={17} /> Returns & warranty</summary>
            <p>No returns, exchanges or warranty. <Link href="/help#returns">Details</Link></p>
          </details>
        </div>
      </div>
    </section>

    <section className="section section-tight" id="reviews">
      <div className="container reviews">
        {product.reviews > 0 ? <>
        <div className="review-score"><strong>{product.rating}</strong><div className="stars">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={18} fill={index < Math.round(product.rating) ? "currentColor" : "none"} />)}</div><span>Based on {product.reviews} reviews</span></div>
        <div className="review-bars">{[5, 4, 3, 2, 1].map((stars) => {
          const share = stars === 5 ? Math.round((product.rating - 4) * 100) : stars === 4 ? Math.round((5 - product.rating) * 80) : stars === 3 ? 4 : 1;
          return <div key={stars}><span>{stars} ★</span><i><b style={{ width: `${Math.max(0, Math.min(100, share))}%` }} /></i><span>{Math.max(0, Math.min(100, share))}%</span></div>;
        })}</div>
        </> : <div className="review-score"><strong>New</strong><span>No reviews yet</span></div>}
        {customerReviews.length > 0 && <ul className="review-list">{customerReviews.map((review) => <li key={review.id}>
          <div><strong>{review.reviewer}</strong><span className="stars" aria-label={`${review.rating} out of 5`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} fill={index < review.rating ? "currentColor" : "none"} />)}</span></div>
          {review.comment && <p>{review.comment}</p>}
          <small>{new Date(review.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}</small>
        </li>)}</ul>}
        <div className="review-cta"><h3>Own this product?</h3><p>Share your experience with other customers.</p><a className="button button-outline" href={whatsappLink(`Hi ${site.name}, I'd like to share my review of ${product.name}.`)} target="_blank" rel="noreferrer">Write a review</a></div>
      </div>
    </section>

    {related.length > 0 && <section className="section section-tight">
      <div className="container">
        <SectionHeading eyebrow="You may also like" title="Related products" link={{ label: `View all ${sub.name.toLowerCase()}`, href: `/shop/${category.slug}/${sub.slug}` }} />
        <div className="product-grid">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div>
      </div>
    </section>}
  </>;
}
