import Link from "next/link";
import { ArrowRight, ArrowUpRight, Award, BadgeCheck, Building2, Hammer, Quote, Star, Wrench } from "lucide-react";
import { HeroSlider } from "@/components/hero-slider";
import { OfficeCarousel } from "@/components/office-carousel";
import { ProductTabs } from "@/components/product-tabs";
import { Testimonials } from "@/components/testimonials";
import { SectionHeading } from "@/components/ui";
import { getProducts } from "@/lib/products";
import { getProduct, homeTiles, photo, posts, productHref, productsIn, projects, promos, sectors, site, slides, stats } from "@/lib/store";

export default async function Home() {
  const products = await getProducts();
  const featured = getProduct(products, "black-leather-high-back-executive-chair") ?? products[0];
  return <>
    <HeroSlider slides={slides} />

    <section className="intro">
      <div className="container intro-inner">
        <h2>{site.name}</h2>
        <p className="intro-lead">Office, home and commercial furniture — designed and made in Pakistan.</p>
        <p>From executive chairs and workstations to sofas, café seating and classroom desks, every piece is designed in-house, built by our own craftsmen and checked before it leaves the factory. We furnish offices, homes, cafés and schools across the country with furniture that is made to last and made to fit the way you work and live.</p>
      </div>
    </section>

    <section className="section" id="categories">
      <div className="container">
        <SectionHeading eyebrow="Shop by category" title="Furniture for every space" text="Office, commercial and home furniture — designed, manufactured and delivered by one team." link={{ label: "Shop all products", href: "/shop" }} />
        <div className="category-grid">{homeTiles.map((tile) => <Link className="category-card" href={tile.href} key={tile.title}>
          <span className="category-img" style={{ backgroundImage: `url("${photo(tile.image, 600)}")` }} />
          <div className="category-label"><h3>{tile.title}</h3><span>{productsIn(products, tile.category, tile.sub).length} products</span></div>
          <span className="category-arrow"><ArrowUpRight size={18} /></span>
        </Link>)}</div>
      </div>
    </section>

    <section className="section section-tight" id="office">
      <div className="container">
        <SectionHeading eyebrow="Office collection" title="Furniture for the workplace" text="Tables, workstations, reception counters and office chairs — built for daily commercial use." />
        <OfficeCarousel />
      </div>
    </section>

    <section className="section promos-section">
      <div className="container promo-grid">{promos.map((promo) => <Link className="promo-card" href={promo.href} key={promo.title}>
        <span className="promo-img" style={{ backgroundImage: `url("${photo(promo.image, 1100)}")` }} />
        <div><p className="eyebrow">{promo.eyebrow}</p><h3>{promo.title}</h3><p>{promo.text}</p><span className="button button-light">{promo.cta} <ArrowRight size={16} /></span></div>
      </Link>)}</div>
    </section>

    <section className="section" id="popular">
      <div className="container">
        <SectionHeading eyebrow="Customer favourites" title="Popular products" text="Our most-ordered pieces this season." />
        <ProductTabs />
      </div>
    </section>

    {featured && <section className="section highlight-section">
      <div className="container highlight">
        <div className="highlight-media"><span style={{ backgroundImage: `url("${photo(featured.image, 1400)}")` }} />{featured.reviews > 0 && <div className="highlight-badge"><Star size={16} fill="currentColor" /> {featured.rating} average from {featured.reviews} reviews</div>}</div>
        <div className="highlight-copy">
          <p className="eyebrow">Featured · {featured.name}</p>
          <h2>Built for the long workday.</h2>
          <p>Supportive, adjustable and quietly premium. The {featured.name} is one of our most popular executive chairs — made for long days at the desk.</p>
          <ul className="feature-list">
            <li><BadgeCheck size={20} /><div><strong>Adjustable lumbar support</strong><span>Keeps your posture right all day</span></div></li>
            <li><BadgeCheck size={20} /><div><strong>Synchro-tilt with lock</strong><span>Recline smoothly, lock in any position</span></div></li>
            <li><BadgeCheck size={20} /><div><strong>Class-4 gas lift & steel base</strong><span>Rated for heavy daily use</span></div></li>
          </ul>
          <div className="highlight-price"><strong>Rs. {featured.price.toLocaleString("en-PK")}</strong><Link className="button button-dark" href={productHref(featured)}>View the chair <ArrowRight size={16} /></Link></div>
        </div>
      </div>
    </section>}

    <section className="section about-section">
      <div className="container about">
        <div className="about-copy">
          <p className="eyebrow">A message from our founder</p>
          <Quote size={36} className="about-quote" />
          <blockquote>We started {site.name} with one workshop and a simple belief — that good furniture changes how people work and live. Every piece we make is designed in-house, built by our own craftsmen and checked before it leaves the factory.</blockquote>
          <p className="about-sign">Founder & CEO, {site.name}</p>
          <div className="about-points"><span><Hammer size={17} /> In-house manufacturing</span><span><Award size={17} /> Quality-checked</span><span><Wrench size={17} /> Installation available</span></div>
          <Link className="text-link light-link" href="/about">Read our story <ArrowRight size={16} /></Link>
        </div>
        <div className="stats">{stats.map((stat) => <div key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div>
      </div>
    </section>

    <section className="section" id="projects">
      <div className="container">
        <SectionHeading eyebrow="Our projects" title="Spaces we've furnished" text="From corporate floors to neighbourhood cafés — complete fit-outs, delivered on schedule." link={{ label: "View all projects", href: "/projects" }} />
        <div className="project-grid">{projects.map((project) => <Link className="project-card" href={`/projects/${project.slug}`} key={project.slug}>
          <span style={{ backgroundImage: `url("${photo(project.image, 900)}")` }} />
          <div><p>{project.place}</p><h3>{project.title}</h3><small>{project.scope}</small></div>
        </Link>)}</div>
        <div className="sectors"><span className="sectors-label"><Building2 size={18} /> Trusted across sectors</span>{sectors.map((sector) => <span key={sector}>{sector}</span>)}</div>
      </div>
    </section>

    <section className="section testimonials-section">
      <Testimonials />
    </section>

    <section className="section" id="journal">
      <div className="container">
        <SectionHeading eyebrow="From the journal" title="Ideas & buying guides" link={{ label: "Read all articles", href: "/blog" }} />
        <div className="post-grid">{posts.map((post) => <Link className="post-card" href={`/blog/${post.slug}`} key={post.slug}>
          <span className="post-img" style={{ backgroundImage: `url("${photo(post.image, 800)}")` }} />
          <p className="post-date">{post.date} · {post.readTime}</p><h3>{post.title}</h3><p>{post.excerpt}</p><span className="text-link">Read more <ArrowRight size={15} /></span>
        </Link>)}</div>
      </div>
    </section>

    <section className="section seo-section">
      <div className="container">
        <details>
          <summary>Buy office & home furniture online in Pakistan</summary>
          <div className="seo-columns">
            <div><h3>Office furniture that works as hard as you do</h3><p>From ergonomic task chairs and executive tables to modular workstations and conference tables, {site.name} furnishes offices of every size. Every range is built for daily commercial use and can be customised in size, fabric and finish.</p></div>
            <div><h3>Café, restaurant & institutional furniture</h3><p>Durable café chairs, tables and booth seating for restaurants, plus study tables, library furniture and waiting-area seating for schools, universities and hospitals.</p></div>
            <div><h3>Home furniture that feels like you</h3><p>Sofas, dining sets, accent chairs and decor that bring warmth to everyday living — delivered and installed across Lahore and nationwide.</p></div>
          </div>
        </details>
      </div>
    </section>
  </>;
}
