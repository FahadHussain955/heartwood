"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, Heart, Mail, Menu, Phone, Search, ShoppingBag, Truck, X } from "lucide-react";
import { useCart } from "@/components/cart";
import { useProducts } from "@/components/products-provider";
import { Logo } from "@/components/logo";
import { socialIcons } from "@/components/social-icons";
import { money, navigation, photo, productHref, site, telLink } from "@/lib/store";

export function SiteHeader() {
  const { count, wishlist, openDrawer } = useCart();
  const products = useProducts();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const term = query.trim().toLowerCase();
  const results = term ? products.filter((product) => `${product.name} ${product.type}`.toLowerCase().includes(term)).slice(0, 5) : [];
  const closeMenu = () => { setMenuOpen(false); setOpenGroup(null); };
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!term) return;
    router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
    setQuery("");
    setSearchOpen(false);
  };

  return <>
    <div className="topbar">
      <div className="container topbar-inner">
        <div className="topbar-contact">
          <a href={telLink}><Phone size={13} /> {site.phone}</a>
          <a href={`mailto:${site.email}`}><Mail size={13} /> {site.email}</a>
        </div>
        <p><Truck size={14} /> Delivery & installation charges depend on order</p>
        <div className="topbar-links">
          <nav className="topbar-socials" aria-label="Follow Afzal Enterprises">
            {site.social.map((social) => {
              const Icon = socialIcons[social.name];
              return <a key={social.name} href={social.url} target="_blank" rel="noreferrer" aria-label={`Visit Afzal Enterprises on ${social.name}`} title={social.name}><Icon size={14} aria-hidden="true" /></a>;
            })}
          </nav>
          <Link className="topbar-track" href="/track-order">Track order</Link>
        </div>
      </div>
    </div>

    <header className="site-header">
      <div className="container header-inner">
        <div className="header-left">
          <button className="icon-button mobile-only" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu size={22} /></button>
          <button className="icon-button search-toggle" aria-label={searchOpen ? "Close search" : "Search"} aria-expanded={searchOpen} onClick={() => setSearchOpen(!searchOpen)}>{searchOpen ? <X size={21} /> : <Search size={21} />}</button>
        </div>

        <Link className="wordmark" href="/" aria-label="Afzal Enterprises home"><Logo height={60} eager /></Link>

        <div className="header-actions">
          <Link className="icon-button" href="/wishlist" aria-label={`Wishlist, ${wishlist.length} items`}><Heart size={21} />{wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}</Link>
          <button className="icon-button" aria-label={`Cart, ${count} items`} onClick={() => openDrawer(true)}><ShoppingBag size={21} />{count > 0 && <span className="badge">{count}</span>}</button>
        </div>

        <form className={searchOpen ? "header-search is-open" : "header-search"} role="search" onSubmit={submitSearch}>
          <Search size={18} />
          <input autoFocus={searchOpen} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search chairs, desks, sofas…" aria-label="Search products" />
          {query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")}><X size={16} /></button>}
          {term && <div className="search-results">
            {results.length ? <>
              {results.map((product) => <Link key={product.id} href={productHref(product)} onClick={() => { setQuery(""); setSearchOpen(false); }}>
                <span className="search-thumb" style={{ backgroundImage: `url("${photo(product.image, 120)}")` }} />
                <span><strong>{product.name}</strong><small>{product.type}</small></span>
                <b>{money(product.price)}</b>
              </Link>)}
              <button type="submit" className="search-all">See all results for “{query.trim()}” <ArrowRight size={15} /></button>
            </> : <p>No products match “{query}”.</p>}
          </div>}
        </form>
      </div>

      <nav className="main-nav" aria-label="Main">
        <div className="container main-nav-inner">
          <div className="nav-item"><Link className={`nav-link${pathname === "/" ? " is-active" : ""}`} href="/">Home</Link></div>
          <div className="nav-item"><Link className={`nav-link${pathname === "/shop" ? " is-active" : ""}`} href="/shop">All</Link></div>
          {navigation.map((group) => <div className="nav-item" key={group.label}>
            <Link className={`nav-link${group.highlight ? " is-sale" : ""}${isActive(group.href) ? " is-active" : ""}`} href={group.href} onClick={(event) => event.currentTarget.blur()}>{group.label}{group.links && <ChevronDown size={14} />}</Link>
            {group.links && <div className="mega-menu">
              <p>{group.label}</p>
              <div>{group.links.map((link) => <Link key={link.href} href={link.href} onClick={(event) => event.currentTarget.blur()}>{link.label}</Link>)}</div>
              <Link className="mega-all" href={group.href} onClick={(event) => event.currentTarget.blur()}>View all {group.label} <ArrowRight size={14} /></Link>
            </div>}
          </div>)}
        </div>
      </nav>
    </header>

    <div className={menuOpen ? "drawer-backdrop is-open" : "drawer-backdrop"} onClick={closeMenu} />
    <aside className={menuOpen ? "mobile-drawer is-open" : "mobile-drawer"} aria-hidden={!menuOpen} inert={!menuOpen}>
      <div className="drawer-head"><span className="wordmark"><Logo height={44} /></span><button className="icon-button" aria-label="Close menu" onClick={closeMenu}><X size={22} /></button></div>
      <nav className="mobile-nav">
        <Link href="/" onClick={closeMenu}>Home</Link>
        <Link href="/shop" onClick={closeMenu}>Shop all</Link>
        {navigation.map((group) => group.links
          ? <div key={group.label}>
            <button className={openGroup === group.label ? "is-open" : ""} onClick={() => setOpenGroup(openGroup === group.label ? null : group.label)}>{group.label}<ChevronDown size={16} /></button>
            {openGroup === group.label && <div className="mobile-sub">
              <Link href={group.href} onClick={closeMenu}><b>View all {group.label}</b></Link>
              {group.links.map((link) => <Link key={link.href} href={link.href} onClick={closeMenu}>{link.label}</Link>)}
            </div>}
          </div>
          : <Link key={group.label} className={group.highlight ? "is-sale" : ""} href={group.href} onClick={closeMenu}>{group.label}</Link>)}
        <Link href="/track-order" onClick={closeMenu}>Track order</Link>
        <Link href="/about" onClick={closeMenu}>About us</Link>
        <Link href="/blog" onClick={closeMenu}>Journal</Link>
        <Link href="/help" onClick={closeMenu}>Help & FAQs</Link>
      </nav>
      <div className="drawer-contact"><a href={telLink}><Phone size={15} /> {site.phone}</a><a href={`mailto:${site.email}`}><Mail size={15} /> {site.email}</a></div>
    </aside>
  </>;
}
