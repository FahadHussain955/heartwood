// Demo storefront content. Contact details, figures, projects and testimonials are placeholders —
// replace them with the real business information before going live.

import { catalog } from "./catalog-data";

export { catalog };

export const site = {
  name: "Hearth",
  tagline: "Office, home & commercial furniture",
  phone: "0317 4892190",
  whatsapp: "923174892190",
  email: "hello@hearth.pk",
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

export const photo = (id: string, width = 900) => id.startsWith("http") || id.startsWith("/") ? id : `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;
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
  { eyebrow: "Office collection 2026", title: "Workspaces that work as hard as you do.", text: "Executive chairs, desks and meeting tables — built in Pakistan, delivered and installed nationwide.", cta: "Shop office furniture", href: "/shop/office", category: "office", image: "/hero/office.png" },
  { eyebrow: "Furniture for your home", title: "Make room for living.", text: "Thoughtful sofas and living-room pieces made to bring comfort and warmth home.", cta: "Explore home furniture", href: "/shop/living-room", category: "living-room", image: "/hero/living-room.png" },
  { eyebrow: "Café & restaurant", title: "Seating made for a full house.", text: "Durable café chairs, tables and booths designed for busy floors and long evenings.", cta: "Explore café furniture", href: "/shop/cafe", category: "cafe", image: "/hero/cafe.png" },
  { eyebrow: "Learning spaces", title: "A better place to learn.", text: "Practical, durable furniture for classrooms, libraries and growing minds.", cta: "Shop school furniture", href: "/shop/school", category: "school", image: "/hero/school.png" },
];

export type HeroSlide = (typeof slides)[number];

export const perks = [
  { title: "Delivery & installation", text: "Charges depend on your order" },
  { title: "Quality-checked", text: "Every piece inspected before dispatch" },
  { title: "Custom manufacturing", text: "Your size, fabric and finish" },
  { title: "Order on WhatsApp", text: "Confirm your order & payment in chat" },
];

export const homeTiles = [
  { title: "Executive Chairs", href: "/shop/office/executive-chairs", category: "office", sub: "executive-chairs", image: "1612372606404-0ab33e7187ee" },
  { title: "Workstations", href: "/shop/office/workstations", category: "office", sub: "workstations", image: "1497366811353-6870744d04b2" },
  { title: "Meeting Tables", href: "/shop/office/meeting-tables", category: "office", sub: "meeting-tables", image: "1571624436279-b272aff752b5" },
  { title: "Study Furniture", href: "/shop/study", category: "study", image: "1600494603989-9650cf6ddd3d" },
  { title: "Living Room & Bedroom", href: "/shop/living-room", category: "living-room", image: "1618221195710-dd6b41faaea6" },
  { title: "Bean Bags", href: "/shop/beanbags", category: "beanbags", image: "1493663284031-b7e3aefcae8e" },
  { title: "Café & Restaurant", href: "/shop/cafe", category: "cafe", image: "1554118811-1e0d58224f24" },
  { title: "School Furniture", href: "/shop/school", category: "school", image: "1507842217343-583bb7270b66" },
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
  { quote: "We furnished our whole floor through Hearth — desks, chairs and the boardroom. Delivery and installation happened over a weekend, with zero disruption on Monday.", name: "Hamza R.", role: "Operations lead, Lahore", date: "Aug 27, 2026" },
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

/* ---------- Journal ---------- */

export const posts = [
  {
    slug: "how-to-choose-an-ergonomic-office-chair", title: "How to choose an ergonomic office chair", excerpt: "Seat depth, lumbar support and armrests — what to check before you buy.", date: "Sep 18, 2026", readTime: "5 min read", image: "1580480055273-228ff5388ef8",
    body: [
      ["Start with seat height", "Sit with your feet flat on the floor and your knees at roughly 90°. A good chair should adjust to that height with a smooth gas lift — for most people between 44 and 54 cm."],
      ["Check the seat depth", "You should be able to fit two to three fingers between the front edge of the seat and the back of your knees. Chairs with a seat slider let you fine-tune this, which matters if several people share a chair."],
      ["Lumbar support is not optional", "The lower back has a natural inward curve. A chair with adjustable lumbar support fills that curve so your muscles don't have to. Mesh backs flex to your shape; upholstered backs usually add a separate lumbar pad."],
      ["Armrests and tilt", "Armrests should let your shoulders relax with elbows close to 90°. A synchro-tilt mechanism — where the back reclines faster than the seat — keeps your feet on the floor as you lean back."],
      ["Try before you buy", "Visit a showroom and sit in the chair for at least ten minutes. Check the gas lift and mechanism — the parts that wear out first."],
    ],
  },
  {
    slug: "planning-a-workstation-layout", title: "Planning a workstation layout for a small office", excerpt: "Fit more people comfortably with smarter desk clusters and storage.", date: "Sep 04, 2026", readTime: "6 min read", image: "1497366811353-6870744d04b2",
    body: [
      ["Measure twice", "Start with an accurate floor plan including columns, windows, sockets and doors. Allow at least 90 cm behind each chair for people to move freely."],
      ["Choose the right desk size", "For laptop-and-monitor work, 120 × 60 cm per person is comfortable. Teams that work with drawings or multiple screens may need 140 cm or more."],
      ["Clusters vs. linear benches", "Face-to-face clusters save space and encourage collaboration; linear benches along windows give everyone daylight. Many offices mix both."],
      ["Plan power and cables early", "Decide where floor boxes and wall sockets are before ordering desks. Workstations with wire trays and power modules keep cables off the floor."],
      ["Leave room to grow", "Modular workstations let you add seats later with matching finishes. Ask for a free layout plan — it is quicker to change a drawing than a floor."],
    ],
  },
  {
    slug: "cafe-seating-that-survives-the-rush", title: "Café seating that survives the rush", excerpt: "Materials, spacing and finishes that last on a busy restaurant floor.", date: "Aug 21, 2026", readTime: "4 min read", image: "1554118811-1e0d58224f24",
    body: [
      ["Pick commercial-grade materials", "Home furniture isn't built for 12-hour service. Look for commercial-rated frames, compact laminate or sealed hardwood tops, and wipe-clean upholstery."],
      ["Mix seating types", "Booths are great for families and longer stays, 2-tops suit couples and laptop users, and bar stools turn window ledges into extra covers."],
      ["Get the spacing right", "Allow around 45–60 cm between tables for guests and at least 90 cm for service aisles. Tables that join together give you flexibility for groups."],
      ["Think about stacking and cleaning", "Stackable chairs make floor cleaning faster at close. Choose finishes that hide scuffs and colours that match your brand."],
    ],
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
