import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart";
import { CartDrawer } from "@/components/cart-drawer";
import { ProductsProvider } from "@/components/products-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getProducts } from "@/lib/products";

// Catalogue comes from Supabase and the admin edits it live, so never prerender the storefront.
export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: Readonly<{ children: ReactNode }>) {
  const products = await getProducts();
  return <ProductsProvider products={products}>
    <CartProvider>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <CartDrawer />
    </CartProvider>
  </ProductsProvider>;
}
