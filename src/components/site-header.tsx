"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, Heart, Mail, Menu, Phone, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "@/components/cart";
import { Logo } from "@/components/logo";
import { socialIcons } from "@/components/social-icons";
import { ThemePicker } from "@/components/theme-picker";
import { navigation, site, telLink } from "@/lib/store";

export function SiteHeader() {
  const { count, wishlist, openDrawer, user, signOut, requireLogin } = useCart();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);

  const closeMenu = () => { setMenuOpen(false); setOpenGroup(null); };
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return <>
    <div className="topbar">
      <div className="container topbar-inner">
        <div className="topbar-contact">
          <a href={telLink}><Phone size={13} /> {site.phone}</a>
          <a href={`mailto:${site.email}`}><Mail size={13} /> {site.email}</a>
        </div>
        <div className="topbar-links">
          <nav className="topbar-socials" aria-label="Follow Afzal Enterprises">
            {site.social.map((social) => {
              const Icon = socialIcons[social.name];
              return <a key={social.name} href={social.url} target="_blank" rel="noreferrer" aria-label={`Visit Afzal Enterprises on ${social.name}`} title={social.name}><Icon size={14} aria-hidden="true" /></a>;
            })}
          </nav>
          <Link className="topbar-track" href="/track-order">Track order</Link>
          <ThemePicker />
        </div>
      </div>
    </div>

    <header className="site-header">
      <div className="container header-inner">
        <div className="header-left">
          <button className="icon-button mobile-only" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu size={22} /></button>        </div>

        <Link className="wordmark" href="/" aria-label="Afzal Enterprises home"><Logo height={84} eager /></Link>

        <div className="header-actions">
          <div className="account-menu">
            <button className="icon-button" aria-label="Account" aria-expanded={accountOpen} onClick={() => user ? setAccountOpen(!accountOpen) : requireLogin(() => {})}><User size={21} />{user && <span className="account-dot" />}</button>
            {accountOpen && user && <div className="account-pop">
              <p>{String(user.user_metadata?.name || "My account")}<small>{user.email}</small></p>
              <Link href="/track-order" onClick={() => setAccountOpen(false)}>Track order</Link>
              <button onClick={async () => { await signOut(); setAccountOpen(false); }}>Sign out</button>
            </div>}
          </div>
          <Link className="icon-button" href="/wishlist" aria-label={`Wishlist, ${wishlist.length} items`}><Heart size={21} />{wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}</Link>
          <button className="icon-button" aria-label={`Cart, ${count} items`} onClick={() => openDrawer(true)}><ShoppingBag size={21} />{count > 0 && <span className="badge">{count}</span>}</button>
        </div>
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
        {user ? <button onClick={async () => { await signOut(); closeMenu(); }}>Sign out ({user.email})</button> : <button onClick={() => { closeMenu(); requireLogin(() => {}); }}>Login / Sign up</button>}
        <Link href="/track-order" onClick={closeMenu}>Track order</Link>
        <Link href="/about" onClick={closeMenu}>About us</Link>
        <Link href="/help" onClick={closeMenu}>Help & FAQs</Link>
      </nav>
      <div className="drawer-contact"><a href={telLink}><Phone size={15} /> {site.phone}</a><a href={`mailto:${site.email}`}><Mail size={15} /> {site.email}</a></div>
    </aside>
  </>;
}
