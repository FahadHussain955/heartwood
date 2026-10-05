import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { notifyAdmin } from "@/lib/notify";

export const runtime = "nodejs";

// POST { id, phone?, cancel?, update? } → the order (after cancelling it, or after applying `update` while still pending).
// The order number alone gives a read-only status view; the checkout phone number is the proof of ownership
// needed to see the address or to cancel/edit.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    id?: string | number; phone?: string; cancel?: boolean;
    update?: { name?: string; address?: string; items?: { id: string; qty: number }[] };
  } | null;
  const id = Number(String(body?.id ?? "").replace(/\D/g, ""));
  const phone = String(body?.phone ?? "");
  if (!id) return NextResponse.json({ error: "Enter your order number." }, { status: 400 });
  if ((body?.cancel || body?.update) && !phone.trim()) return NextResponse.json({ error: "Enter the phone number used for this order." }, { status: 400 });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false } });

  if (body?.cancel) {
    const { error } = await supabase.rpc("cancel_order", { p_id: id, p_phone: phone });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await notifyAdmin(`❌ Order #HW-${id} was cancelled by the customer.`);
  }

  if (body?.update && !body.cancel) {
    const { name, address, items } = body.update;
    const { error } = await supabase.rpc("update_order", {
      p_id: id, p_phone: phone, p_name: String(name ?? ""), p_address: String(address ?? ""),
      p_items: (items ?? []).map((item) => ({ id: String(item.id), qty: Number(item.qty) || 0 })),
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await notifyAdmin(`✏️ Order #HW-${id} was edited by the customer — please review it.`);
  }

  const { data, error } = await supabase.rpc("track_order", { p_id: id, p_phone: phone.trim() || null });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ order: data });
}
