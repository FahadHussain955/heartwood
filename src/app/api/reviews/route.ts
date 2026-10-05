import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { notifyAdmin } from "@/lib/notify";

export const runtime = "nodejs";

// POST { orderId, name, rating, comment? } → saves one review per product in the order (see supabase/reviews.sql).
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { orderId?: number; name?: string; rating?: number; comment?: string } | null;
  if (!body) return NextResponse.json({ error: "Invalid review" }, { status: 400 });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false } });
  const { error } = await supabase.rpc("submit_review", {
    p_order_id: Number(body.orderId) || 0, p_name: String(body.name ?? ""), p_rating: Number(body.rating) || 0, p_comment: String(body.comment ?? ""),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await notifyAdmin(`⭐ New ${Number(body.rating)}-star review on order #HW-${Number(body.orderId)} from ${String(body.name ?? "").trim()}.`);
  return NextResponse.json({ ok: true });
}
