import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert h-5 w-[100px]"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the{" "}
            <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-white/[.08]">
              page.tsx
            </code>{" "}
            file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
              <main>
                <div className="announcement"><span>Made for the way you live.</span><span>Complimentary delivery on orders over Rs. 100,000 <ArrowRight size={13} /></span></div>
                <header className="site-header">
                  <button className="icon-button mobile-menu" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
                  <a className="wordmark" href="#top" aria-label="Hearth home">hearth<span>.</span></a>
                  <nav className={menuOpen ? "main-nav open" : "main-nav"}>
                    <a href="#collection" onClick={() => setMenuOpen(false)}>Shop all</a>
                    <a href="#categories" onClick={() => setMenuOpen(false)}>Collections <ChevronDown size={13} /></a>
                    <a href="#story" onClick={() => setMenuOpen(false)}>Our story</a>
                    <a href="#footer" onClick={() => setMenuOpen(false)}>Visit us</a>
                  </nav>
                  <div className="header-actions">
                    <button className="icon-button search-trigger" aria-label="Search products" onClick={() => setSearchOpen(!searchOpen)}><Search size={19} /></button>
                    <a className="bag-button" href="#collection" aria-label={`Shopping bag with ${cartCount} items`}><ShoppingBag size={19} /><span>Bag ({cartCount})</span></a>
                  </div>
                </header>
                {searchOpen && <div className="search-panel"><Search size={18} /><input autoFocus placeholder="What are you looking for?" aria-label="Search furniture" /><button onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={18} /></button></div>}

                <section className="hero" id="top">
                  <div className="hero-copy">
                    <p className="eyebrow"><span className="eyebrow-line" /> Thoughtful furniture, made for living</p>
                    <h1>A little more<br />room to <em>feel at home.</em></h1>
                    <p className="hero-description">Pieces with purpose. Made for slow mornings, long conversations, and everything in between.</p>
                    <a className="button button-dark" href="#collection">Explore the collection <ArrowUpRight size={16} /></a>
                    <div className="hero-note"><span className="note-mark">✳</span><span>Designed with intention<br /><small>Crafted to stay with you</small></span></div>
                  </div>
                  <div className="hero-image" role="img" aria-label="Warm contemporary living room with sculptural furniture">
                    <div className="hero-image-shade" />
                    <div className="hero-image-caption"><span>01 / 03</span><span>THE SUNDAY LIVING EDIT</span><span className="caption-arrows"><ArrowLeft size={15} /><ArrowRight size={15} /></span></div>
                    <div className="hero-roundel">A softer<br />kind of<br /><em>everyday</em><span>✳</span></div>
                  </div>
                  <div className="hero-scroll"><span>SCROLL TO DISCOVER</span><ArrowDown size={14} /></div>
                </section>

                <section className="trust-strip"><span>Designed for real life</span><i /> <span>Thoughtfully sourced materials</span><i /> <span>Delivered across Pakistan</span><i /> <span>Made to last, not just to look</span></section>

                <section className="section categories-section" id="categories">
                  <div className="section-heading"><div><p className="eyebrow">Find your feeling</p><h2>Rooms to come home to.</h2></div><a className="text-link" href="#collection">View all categories <ArrowUpRight size={15} /></a></div>
                  <div className="category-grid">
                    {categories.map((category, index) => <a className={`category-card ${category.className}`} href="#collection" key={category.title}>
                      <div className="category-photo" style={{ backgroundImage: `url("${photo(category.image, 750)}")` }} />
                      <div className="category-overlay" />
                      <div className="category-meta"><span>0{index + 1} — {category.count}</span><ArrowUpRight size={17} /></div>
                      <h3>{category.title}</h3>
                    </a>)}
                  </div>
                </section>

                <section className="collection-section" id="collection">
                  <div className="section collection-heading"><div><p className="eyebrow">Good things, gathered</p><h2>Made to make you stay.</h2><p className="section-subtitle">Everyday pieces, considered down to the last detail.</p></div><div className="collection-controls"><button className="filter-button"><SlidersHorizontal size={15} /> Filter & sort</button><span>01 — 04</span></div></div>
                  <div className="product-grid">
                    {featured.map((product) => <article className="product-card" key={product.name}>
                      <div className={`product-photo tone-${product.tone}`} style={{ backgroundImage: `url("${photo(product.image)}")` }}>
                        <span className="product-badge">{product.badge}</span>
                        <button className={`wishlist-button ${liked.includes(product.name) ? "is-liked" : ""}`} aria-label={`Save ${product.name}`} onClick={() => toggleLike(product.name)}><Heart size={17} fill={liked.includes(product.name) ? "currentColor" : "none"} /></button>
                        <button className="quick-add" onClick={() => addToCart(product.name)}>{added === product.name ? <><Check size={15} /> Added to bag</> : <>Quick add <ArrowRight size={15} /></>}</button>
                      </div>
                      <div className="product-info"><div><h3>{product.name}</h3><p>{product.category}</p></div><div className="product-price"><strong>{money(product.price)}</strong>{product.oldPrice && <del>{money(product.oldPrice)}</del>}</div></div>
                    </article>)}
                  </div>
                  <div className="collection-footer"><span>Good furniture. Good feeling.</span><a className="button button-outline" href="#categories">Shop all furniture <ArrowUpRight size={15} /></a><span>Scroll to explore <ArrowRight size={14} /></span></div>
                </section>

                <section className="story-section" id="story">
                  <div className="story-photo" role="img" aria-label="Natural wood and linen furniture in a sunlit home" />
                  <div className="story-copy"><p className="eyebrow">A little less, but better</p><h2>Good design should feel like <em>you.</em></h2><p>We believe the best rooms aren&apos;t finished in a day. They come together slowly, with pieces that mean something and make the everyday feel a little more special.</p><a className="text-link" href="#footer">Get to know Hearth <ArrowUpRight size={15} /></a><span className="story-index">HEARTH / EST. 2024</span></div>
                </section>

                <section className="newsletter-section"><span className="newsletter-star">✳</span><div><p className="eyebrow">Notes from home</p><h2>A little something<br />good in your inbox.</h2></div><form className="newsletter-form" onSubmit={(event) => { event.preventDefault(); alert("You're on the list — see you in your inbox!"); }}><label htmlFor="email">Sign up for new pieces, good ideas & 10% off your first order.</label><div><input id="email" type="email" required placeholder="Your email address" /><button aria-label="Subscribe"><ArrowRight size={17} /></button></div><small>By subscribing, you agree to our privacy policy.</small></form></section>

                <footer className="site-footer" id="footer"><div className="footer-main"><div><a className="wordmark footer-wordmark" href="#top">hearth<span>.</span></a><p>Furniture that makes room<br />for the life you live.</p><a className="footer-contact" href="mailto:hello@hearth.pk">hello@hearth.pk <ArrowUpRight size={13} /></a></div><div><h4>Explore</h4><a href="#collection">Shop all</a><a href="#categories">Living room</a><a href="#categories">Dining</a><a href="#categories">Bedroom</a></div><div><h4>Help & info</h4><a href="#footer">Delivery & returns</a><a href="#footer">Care guide</a><a href="#footer">FAQs</a><a href="#footer">Contact us</a></div><div><h4>Come say hello</h4><p>Lahore, Pakistan<br />Monday – Saturday, 10am – 7pm</p><a href="#footer">Instagram <ArrowUpRight size={13} /></a></div></div><div className="footer-bottom"><span>© 2025 Hearth Living. Made with care.</span><span>Pakistan · PKR ₨</span><a href="/admin">Admin preview <ArrowUpRight size={12} /></a></div></footer>
              </main>
