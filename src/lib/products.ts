import { createClient } from "@supabase/supabase-js";
import { catalog, type Product } from "@/lib/store";

type Row = {
  id: string; name: string; type: string; category: string; sub: string; price: number;
  image_url: string | null; rating: number; reviews: number; tag: string | null; size: string | null;
};

const fallbackImage = catalog[0].image;

/** Public Supabase client, or null when the env vars are missing (e.g. a build without them) so pages render empty instead of crashing. */
function anonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) { console.warn("Supabase env vars missing: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"); return null; }
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Reads the catalogue from Supabase. */
export async function getProducts(): Promise<Product[]> {
  const supabase = anonClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: true });
  if (error || !data) return [];
  return (data as Row[]).map((row) => ({
    id: row.id, name: row.name, type: row.type, category: row.category, sub: row.sub, price: row.price,
    image: row.image_url ?? fallbackImage, rating: Number(row.rating),
    reviews: row.reviews, tag: row.tag ?? undefined, size: row.size ?? undefined,
  }));
}

export type Review = { id: number; reviewer: string; rating: number; comment: string; created_at: string };

/** Latest customer reviews for one product. */
export async function getReviews(productId: string): Promise<Review[]> {
  const supabase = anonClient();
  if (!supabase) return [];
  const { data } = await supabase.from("reviews").select("id, reviewer, rating, comment, created_at").eq("product_id", productId).order("created_at", { ascending: false }).limit(20);
  return (data as Review[] | null) ?? [];
}
