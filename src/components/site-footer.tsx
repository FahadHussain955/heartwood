import Link from "next/link";
import { ArrowUpRight, MapPin, ShoppingBag } from "lucide-react";
import { FaLinkedinIn } from "react-icons/fa";
import { SiFacebook, SiInstagram, SiPinterest, SiTiktok, SiYoutube } from "react-icons/si";
import type { IconType } from "react-icons";
import { catalog, showrooms, site, telLink } from "@/lib/store";

const socialIcons: Record<string, IconType> = {
  Instagram: SiInstagram,
  Facebook: SiFacebook,
  TikTok: SiTiktok,
  Pinterest: SiPinterest,
  YouTube: SiYoutube,
  LinkedIn: FaLinkedinIn,
  Daraz: ShoppingBag,
};

const socialColors: Record<string, string> = {
  Instagram: "#E4405F",
  Facebook: "#1877F2",
  TikTok: "#25F4EE",
  Pinterest: "#E60023",
  YouTube: "#FF0000",
  LinkedIn: "#0A66C2",
  Daraz: "#F85606",
};

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="container footer-main">
      <div className="footer-brand">
        <Link className="wordmark" href="/">{site.name.toLowerCase()}<span>.</span><small>furniture</small></Link>
        <p>Office, commercial and home furniture — designed and built in Pakistan, made to last.</p>
        <nav className="footer-socials" aria-label="Follow Afzal Enterprises">
          {site.social.map((social) => {
            const Icon = socialIcons[social.name];
            return <a key={social.name} href={social.url} target="_blank" rel="noreferrer" aria-label={`Visit Afzal Enterprises on ${social.name}`} title={social.name} style={{ color: socialColors[social.name] }}><Icon size={19} aria-hidden="true" /></a>;
          })}
        </nav>
      </div>
      <div><h4>Shop</h4><Link href="/shop">All products</Link>{catalog.map((category) => <Link key={category.slug} href={`/shop/${category.slug}`}>{category.name}</Link>)}</div>
      <div><h4>Company</h4><Link href="/about">About us</Link><Link href="/projects">Projects</Link><Link href="/blog">Journal</Link><Link href="/contact">Contact us</Link><Link href="/contact">Bulk & corporate orders</Link></div>
      <div><h4>Help</h4><Link href="/track-order">Track your order</Link><Link href="/help#delivery">Delivery & installation</Link><Link href="/help#warranty">Warranty</Link><Link href="/help#returns">Returns</Link><Link href="/help#payment">Payment options</Link><Link href="/help#faqs">FAQs</Link></div>
      <div><h4>Showroom</h4>{showrooms.map((room) => <p key={room.city}><strong>{room.name}</strong>{room.address}</p>)}<p><strong>Phone</strong><a href={telLink}>{site.phone}</a></p></div>
    </div>
    <section className="container footer-location" aria-label="Showroom locations">
      {showrooms.map((room) => <div className="footer-location-card" key={room.city}>
        <div className="footer-location-copy">
          <span className="footer-location-label"><MapPin size={15} /> {room.city} showroom</span>
          <h3>Come visit us</h3>
          <p><strong>{room.name}</strong>{room.address}</p>
          <a className="button button-light footer-location-link" href={room.map} target="_blank" rel="noreferrer">Get directions <ArrowUpRight size={15} /></a>
        </div>
        <iframe title={`${room.name} location on Google Maps`} src={room.embed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      </div>)}
    </section>
    <div className="container footer-bottom"><span>© {new Date().getFullYear()} {site.name} Furniture. All rights reserved.</span></div>
  </footer>;
}
