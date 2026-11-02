// Demo storefront content. Contact details, figures, projects and testimonials are placeholders —
// replace them with the real business information before going live.

import { catalog } from "./catalog-data";

export { catalog };

export const site = {
  name: "Afzal Enterprises",
  tagline: "Office, home & commercial furniture",
  phone: "0317 4892190",
  phone2: "0331 6529490",
  whatsapp: "923174892190",
  email: "Khurramch20@gmail.com",
  hours: "Mon – Sat, 10:00 am – 8:00 pm",
  freeDeliveryFrom: 50000,
  social: [
    { name: "Instagram", url: "https://www.instagram.com/afzal_enterprises_official?stkn=MmNxNjV4aGE5b3dj&utm_source=qr" },
    { name: "Facebook", url: "https://www.facebook.com/share/1Dhk4QUQM4/?mibextid=wwXIfr" },
    { name: "TikTok", url: "https://www.tiktok.com/@afzalenterprises3" },
    { name: "Pinterest", url: "https://pin.it/30NnRyeM9" },
    { name: "YouTube", url: "https://youtube.com/@afzalenterprises-x1c?si=8jFVo5h9W0Sz6fgE" },
    { name: "LinkedIn", url: "https://www.linkedin.com/company/afzal-enterprises/" },
    { name: "Daraz", url: "https://s.daraz.pk/s.XD8YZ" },
  ],
};

export const photo = (id: string, width = 900) => {
  // Banners have 320px copies in public/banners/thumbs for small thumbnails.
  if (id.startsWith("/banners/") && width <= 500) return id.replace("/banners/", "/banners/thumbs/");
  return id.startsWith("http") || id.startsWith("/") ? id : `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;
};
// Non-square room photos (found by sampling each product photo's edges). Padding these with one flat colour leaves
// visible bands, so their gaps are filled with a blurred copy of the same photo instead.
const scenePhotos = new Set([
  "cdt2nnfhgp8uzqyinsh4", "baeaicuq5fpdt6dwyfgb", "wnc9vxhtl7rnyq9hmugn", "grjlfmycpfchfvrgvn1p", "gks8d5cw8wvn6vg0t9ii",
  "ciiwgsxyxndlr20gzqsn", "cgklynwxdht0kogrzq9v", "pyjiokcqivcoshnk8hcz", "jcip0uwsoi2hjbo7sabc", "yg12dyqzlb0todlfzelw",
  "b0dg1yjr68etla0jugat", "nu5luoaohrj5wm71rzuy", "munswyw7fnrgcx35ho0u", "pcazlropgyct1dfktm8i", "q3ip8vtabaql9ozriftj",
  "ikawgnkeiofdbsxwmvpu", "gekxtil5ju1wrjiebcce", "hbfuk5rra5wekjzn0g4w", "vwnjygo5kii1vzmbesza", "vdaa6lj77ackysucxwar",
  "msty2abqlbh4ulspe6pr", "wvd71rgaytispeodevaf", "ikkxpt9y7sk2iksvmutd", "rstfmarbgeavshi9fb0i", "vbfqrbc8h8zqtuv2ulun",
  "rjfrdtmrcxasnyd9xzzb", "nksbau548hbfkbd7vlat", "pcz4ulwaninl45ubmiia", "oawk9z0bujwx4hy4x9xc", "r2wgy1lwdqerbvbphb6j",
  "xsjucdgnrjgzpyodscxh", "p8kf13egsfeobuttfpz2", "evlj6hemf9ywkcuc2rwz",
  "zqo2gzthjtnhgtaqpvqk",
]);

// Photos with flat bars baked into the file (e.g. a tall photo pasted onto a white square). Cloudinary trims the
// bars off (e_trim) before squaring, otherwise they show up as white strips inside the card.
const barredPhotos = new Set(["xsjucdgnrjgzpyodscxh", "p8kf13egsfeobuttfpz2", "ulxjpoftruimeznv9ras"]);

// Product photos come in mixed shapes. Cloudinary turns each into a square that fills the product card edge to edge
// without cropping: plain photos are padded with their own edge colour (c_pad,b_auto), room photos with a blur of themselves.
// Every photo first loses 1.5% off each edge, which drops the thin lines left along the borders of some photos.
export const squarePhoto = (url: string, width = 700) => {
  const match = url.match(/\/image\/upload\/(?:v\d+\/)?((?:[^/]+\/)*([^/.]+))\.\w+$/);
  if (!url.includes("res.cloudinary.com") || !match) return photo(url, width);
  const [, publicId, id] = match;
  const clean = `${barredPhotos.has(id) ? "e_trim/" : ""}c_crop,w_0.97,h_0.97,g_center/`;
  const square = scenePhotos.has(id)
    ? `c_fill,ar_1:1,w_${width}/e_blur:2000/l_${publicId.replaceAll("/", ":")}/${clean}c_fit,w_${width},h_${width}/fl_layer_apply`
    : `c_pad,ar_1:1,b_auto,w_${width}`;
  return url.replace("/image/upload/", `/image/upload/${clean}${square}/`);
};
export const money = (amount: number) => `Rs. ${amount.toLocaleString("en-PK")}`;
export const telLink = `tel:${site.phone.replaceAll(" ", "")}`;
export const whatsappLink = (text = `Hi ${site.name}, I'd like to know more about your furniture.`) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

/* ---------- Catalogue ---------- */

export type Subcategory = {
  slug: string;
  name: string;
  image: string;
  blurb: string;
  features: string[];
  specs: Record<string, string>;
  colors: string[];
  gallery: string[];
  madeToOrder?: boolean;
};
export type Category = { slug: string; name: string; short: string; image: string; description: string; subcategories: Subcategory[] };

export type Product = {
  id: string;
  name: string;
  type: string;
  category: string;
  sub: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  tag?: string;
  size?: string;
  featured?: boolean;
};


export const getCategory = (slug: string) => catalog.find((category) => category.slug === slug);
export const getSubcategory = (category: string, sub: string) => getCategory(category)?.subcategories.find((item) => item.slug === sub);
export const getProduct = (list: Product[], id: string) => list.find((product) => product.id === id);
export const productsIn = (list: Product[], category: string, sub?: string) => list.filter((product) => product.category === category && (!sub || product.sub === sub));
export const productHref = (product: Product) => `/product/${product.id}`;

export const productDetails = (product: Product) => {
  const category = getCategory(product.category)!;
  const sub = getSubcategory(product.category, product.sub)!;
  const specs: Record<string, string> = { ...sub.specs, ...(product.size ? { Size: product.size } : {}) };
  const gallery = [product.image];
  return { category, sub, specs, gallery, description: `The ${product.name} is ${/^[aeiou]/i.test(product.type) ? "an" : "a"} ${product.type.toLowerCase()} from our ${sub.name.toLowerCase()} range. ${sub.blurb}` };
};

export type NavGroup = { label: string; href: string; links?: { label: string; href: string }[]; highlight?: boolean };

export const navigation: NavGroup[] = [
  ...catalog.map((category) => ({ label: category.short, href: `/shop/${category.slug}`, links: category.subcategories.map((sub) => ({ label: sub.name, href: `/shop/${category.slug}/${sub.slug}` })) })),
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/contact" },
];

/* ---------- Homepage ---------- */

export const slides = [
  { eyebrow: "Furniture for your home", title: "Make room for living.", text: "Thoughtful sofas and living-room pieces made to bring comfort and warmth home.", cta: "Explore home furniture", href: "/shop/living-room", category: "living-room", image: "/hero/living-room.jpg", ratio: "16 / 9" },
  { eyebrow: "Office collection 2026", title: "Workspaces that work as hard as you do.", text: "Executive chairs, desks and meeting tables — built in Pakistan, delivered and installed nationwide.", cta: "Shop office furniture", href: "/shop/office", category: "office", image: "/hero/office.jpg", ratio: "16 / 9" },
  { eyebrow: "Open-plan workstations", title: "A floor built for the whole team.", text: "Shared desks, task chairs and storage, laid out for busy offices.", cta: "Shop workstations", href: "/shop/office/workstations", category: "office", image: "/hero/workstations.png", ratio: "16 / 9" },
  { eyebrow: "Café & restaurant", title: "Seating made for a full house.", text: "Durable café chairs, tables and booths designed for busy floors and long evenings.", cta: "Explore café furniture", href: "/shop/cafe", category: "cafe", image: "/hero/cafe.jpg", ratio: "16 / 9" },
  { eyebrow: "Learning spaces", title: "A better place to learn.", text: "Practical, durable furniture for classrooms, libraries and growing minds.", cta: "Shop school furniture", href: "/shop/school", category: "school", image: "/hero/school.jpg", ratio: "16 / 9" },
];

export type HeroSlide = (typeof slides)[number];

// Plain-background photos of real products from each range. Cloudinary pads each one to 4:3 with its own
// edge colour (c_pad,b_auto), so it fills the tile exactly without cropping or visible bars.
const tilePhoto = (id: string) => `https://res.cloudinary.com/aepcimps/image/upload/c_pad,ar_4:3,b_auto,w_700/products/${id}.jpg`;

export const homeTiles = [
  { title: "Executive Chairs", href: "/shop/office/executive-chairs", category: "office", sub: "executive-chairs", image: tilePhoto("p89kkcsvusvfjok4scbm") },
  { title: "Workstations", href: "/shop/office/workstations", category: "office", sub: "workstations", image: tilePhoto("nbr8l4yikrdrecdsv9sn") },
  { title: "Meeting Tables", href: "/shop/office/meeting-tables", category: "office", sub: "meeting-tables", image: tilePhoto("akgctawpr4okrgannwhh") },
  { title: "Study Furniture", href: "/shop/study", category: "study", image: tilePhoto("hl7rifnoe9dqyefd8nrg") },
  { title: "Living Room", href: "/shop/living-room", category: "living-room", image: tilePhoto("unvg6kfjam0kneeoxlfl") },
  { title: "Bean Bags", href: "/shop/beanbags", category: "beanbags", image: tilePhoto("lc5xohfap3fix9cyt4si") },
  { title: "Café & Restaurant", href: "/shop/cafe", category: "cafe", image: tilePhoto("wm8i6rkpr4z8fpjkb20m") },
  { title: "School Furniture", href: "/shop/school", category: "school", image: tilePhoto("w42ifwumq8kjclypsubn") },
];

export const promos = [
  { eyebrow: "For growing teams", title: "Workstations, made to measure", text: "Custom layouts from 2 to 200 seats with free space planning.", cta: "Shop workstations", href: "/shop/office/workstations", image: "1556761175-4b46a572b786" },
  { eyebrow: "Commercial fit-outs", title: "Café & restaurant furniture", text: "Chairs, tables and booths built for busy floors.", cta: "Shop café range", href: "/shop/cafe", image: "1555396273-367ea4eb4db5" },
];

// Demo figures — replace with the real numbers.
export const stats = [
  { value: "15+", label: "Years of making furniture" },
  { value: "1,200+", label: "Offices & cafés furnished" },
  { value: "40k+", label: "Chairs delivered" },
  { value: "1", label: "Showroom in Lahore" },
];

export const sectors = ["Corporate offices", "Banks & finance", "Schools & universities", "Hospitals & clinics", "Cafés & restaurants", "Co-working spaces"];

export const testimonials = [
  { quote: "We furnished our whole floor through Afzal Enterprises — desks, chairs and the boardroom. Delivery and installation happened over a weekend, with zero disruption on Monday.", name: "Hamza R.", role: "Operations lead, Lahore", date: "Aug 27, 2026" },
  { quote: "The executive chair is genuinely comfortable for ten-hour days. The team helped me pick the right height and the price beat the market.", name: "Mariam S.", role: "Software engineer, Lahore", date: "Aug 24, 2026" },
  { quote: "Our café chairs have survived two years of full houses and still look new. Custom colours matched our branding perfectly.", name: "Usman A.", role: "Café owner, Lahore", date: "Aug 17, 2026" },
  { quote: "Great finish on the dining set and the delivery team was careful and on time.", name: "Sana K.", role: "Homeowner, Lahore", date: "Aug 9, 2026" },
  { quote: "Ordered 20 workstations for our new office. Quality was consistent and the installation was quick.", name: "Bilal M.", role: "Office manager, Lahore", date: "Jul 30, 2026" },
  { quote: "Amazing service.", name: "Ayesha T.", role: "Interior designer, Lahore", date: "Jul 21, 2026" },
];

/* ---------- Projects ---------- */

export const projects = [
  {
    slug: "corporate-headquarters-gulberg", title: "Corporate headquarters", place: "Gulberg, Lahore", sector: "Corporate office", year: "2026", timeline: "6 weeks",
    scope: "140 workstations · 6 meeting rooms", image: "1497366754035-f200968a6e72", gallery: ["1556761175-4b46a572b786", "1517502884422-41eaead166d4", "1571624436279-b272aff752b5"],
    summary: "A complete fit-out for a 3-floor headquarters — open-plan desking, glass-walled meeting rooms, executive cabins and a boardroom.",
    challenge: "The client was moving 140 staff into a new building and needed the entire floor furnished within six weeks, with no downtime on move-in day.",
    solution: "We planned the layout floor by floor, manufactured linear bench desks to fit between columns, and installed everything over two weekends. Every seat got an ergonomic task chair and a personal storage pedestal.",
    products: ["linear-6-bench", "flexmesh-pro-chair", "summit-meeting-table", "aurum-executive-chair", "walnut-executive-desk"],
    facts: [["Seats", "140"], ["Meeting rooms", "6"], ["Timeline", "6 weeks"]],
  },
  {
    slug: "specialty-coffee-bar", title: "Specialty coffee bar", place: "Johar Town, Lahore", sector: "Café", year: "2025", timeline: "3 weeks",
    scope: "Café chairs, bar stools & booths", image: "1501339847302-ac426a4a7cbb", gallery: ["1554118811-1e0d58224f24", "1592078615290-033ee584e267", "1581539250439-c96689b516dd"],
    summary: "Warm, industrial seating for a busy neighbourhood coffee bar — window counters, café tables and a row of booths.",
    challenge: "A narrow, deep floor plan that needed to seat 60 guests without feeling cramped, and furniture tough enough for 14-hour days.",
    solution: "We combined a long bar counter with stools, 2-seater bistro tables along the window, and made-to-measure booths down the back wall to maximise covers.",
    products: ["oslo-cafe-chair", "barista-bar-stool", "round-bistro-table", "brasserie-booth"],
    facts: [["Covers", "60"], ["Booths", "5"], ["Timeline", "3 weeks"]],
  },
  {
    slug: "tech-campus-floor", title: "Tech campus floor", place: "DHA, Lahore", sector: "Technology", year: "2025", timeline: "4 weeks",
    scope: "Open-plan desks & lounge seating", image: "1572521165329-b197f9ea3da6", gallery: ["1524758631624-e2822e304c36", "1497366811353-6870744d04b2", "1541558869434-2840d308329a"],
    summary: "Flexible desking and breakout lounges for a fast-growing software company.",
    challenge: "The team was growing every quarter and needed desks that could be reconfigured without buying new furniture.",
    solution: "Modular cluster workstations that expand seat by seat, ergonomic mesh chairs for developers and a lounge zone with swivel chairs for informal meetings.",
    products: ["pod-4-workstation", "flexmesh-pro-chair", "cobalt-lounge-swivel", "tower-shelf-unit"],
    facts: [["Seats", "85"], ["Lounge zones", "3"], ["Timeline", "4 weeks"]],
  },
  {
    slug: "family-restaurant", title: "Family restaurant", place: "Model Town, Lahore", sector: "Restaurant", year: "2024", timeline: "5 weeks",
    scope: "180-cover dining fit-out", image: "1559329007-40df8a9345d8", gallery: ["1555396273-367ea4eb4db5", "1577140917170-285929fb55b7", "1505843490538-5133c6c7d0e1"],
    summary: "A 180-cover restaurant with family booths, flexible 4-tops and a private dining area.",
    challenge: "The owners wanted large families and small groups to be seated equally well, with furniture that is easy to clean after every service.",
    solution: "Custom booth seating in wipe-clean commercial vinyl, stackable café chairs and tables that join together for bigger groups.",
    products: ["diner-booth-set", "loop-cafe-chair", "oak-cafe-set"],
    facts: [["Covers", "180"], ["Booths", "14"], ["Timeline", "5 weeks"]],
  },
];

export const showrooms = [
  { name: "Afzal Enterprises", city: "Lahore", address: "Plot 405 Road, near Sharif Medical Complex Road, Jati Umrah, Makhdoom Colony, Lahore, 54000", map: "https://share.google/tooW5IB1mQobuSWr3", embed: "https://maps.google.com/maps?q=Afzal%20Enterprises%20Jati%20Umrah%20Lahore&z=15&output=embed", image: "1497366216548-37526070297c" },
];

export const faqs = [
  ["Do you deliver outside Lahore?", "Yes. We deliver nationwide through trusted cargo partners. The delivery fee depends on your order and is shared before dispatch."],
  ["Is installation included?", "Installation charges depend on your order. Contact us and we'll confirm the cost before dispatch."],
  ["Can I customise size, fabric or colour?", "Most of our range can be customised. Share your requirements on WhatsApp or through the contact form and we'll send a quotation with fabric samples."],
  ["How do I place an order and pay?", "Confirm your order on the website after entering your delivery details, then continue to WhatsApp to confirm your final total and payment options."],
  ["Is there a warranty?", "No, our products do not come with a warranty."],
  ["Can I return or exchange a product?", "No, we do not accept returns or exchanges."],
] as const;
