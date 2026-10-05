# Hearth furniture storefront

- This project uses Next.js App Router, TypeScript, and Tailwind CSS.
- The storefront is a clean e-commerce layout for office, commercial and home furniture (charcoal, white and a walnut accent); keep it accessible and responsive.
- Storefront pages live in the `src/app/(store)/` route group (shared header, footer and cart via its layout): `/`, `/shop`, `/shop/[category]`, `/shop/[category]/[sub]`, `/product/[id]`, `/sale`, `/projects`, `/projects/[slug]`, `/blog`, `/blog/[slug]`, `/contact`, `/about`, `/help`, `/wishlist`. The simple admin preview is at `/admin`, outside the group.
- Storefront content (catalogue, products, projects, posts, contact details) lives in `src/lib/store.ts`; adding a product or subcategory there creates its pages automatically. Interactive pieces are client components in `src/components/`.
- Product examples and admin data are in-memory demo content, not connected to a database or payment provider.
- Follow the current Next.js guides under `node_modules/next/dist/docs/` before introducing framework APIs.