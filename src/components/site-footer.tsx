import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { catalog, showrooms, site, telLink } from "@/lib/store";

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="container footer-main">
      <div className="footer-brand">
        <Link className="wordmark" href="/">{site.name.toLowerCase()}<span>.</span><small>furniture</small></Link>
        <p>Office, commercial and home furniture — designed and built in Pakistan, made to last.</p>
      </div>
      <div><h4>Shop</h4><Link href="/shop">All products</Link>{catalog.map((category) => <Link key={category.slug} href={`/shop/${category.slug}`}>{category.name}</Link>)}</div>
      <div><h4>Company</h4><Link href="/about">About us</Link><Link href="/projects">Projects</Link><Link href="/blog">Journal</Link><Link href="/contact">Contact us</Link><Link href="/contact">Bulk & corporate orders</Link></div>
      <div><h4>Help</h4><Link href="/track-order">Track your order</Link><Link href="/help#delivery">Delivery & installation</Link><Link href="/help#warranty">Warranty</Link><Link href="/help#returns">Returns</Link><Link href="/help#payment">Payment options</Link><Link href="/help#faqs">FAQs</Link></div>
      <div><h4>Showroom</h4>{showrooms.map((room) => <p key={room.city}><strong>{room.name}</strong>{room.address}</p>)}<p><strong>Phone</strong><a href={telLink}>{site.phone}</a></p></div>
    </div>
    <div className="container footer-bottom"><span>© {new Date().getFullYear()} {site.name} Furniture. All rights reserved.</span><span>Cash on delivery · Bank transfer · Cards</span><Link href="/admin">Admin <ArrowUpRight size={12} /></Link></div>
  </footer>;
}
