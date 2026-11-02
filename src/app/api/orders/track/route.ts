import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyAdmin } from "@/lib/notify";

export const runtime = "nodejs";

type Supabase = Awaited<ReturnType<typeof createClient>>;

// Orders belong to the account that placed them: the database functions only ever see the signed-in customer's orders.
const signIn = () => NextResponse.json({ error: "Please log in to see and track your orders." }, { status: 401 });

async function myOrders(supabase: Supabase) {
  const { data, error } = await supabase.rpc("my_orders");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ orders: data });
}

// GET → { orders } placed from the signed-in account, newest first.
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return signIn();
  return myOrders(supabase);
}

// POST { id, cancel? , update? } → { orders } after cancelling or editing one of the customer's own pending orders.
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return signIn();

  const body = (await req.json().catch(() => null)) as {
    id?: string | number; cancel?: boolean;
    update?: { name?: string; address?: string; items?: { id: string; qty: number }[] };
  } | null;
  const id = Number(String(body?.id ?? "").replace(/\D/g, ""));
  if (!id) return NextResponse.json({ error: "Order not found." }, { status: 400 });

  if (body?.cancel) {
    const { error } = await supabase.rpc("cancel_my_order", { p_id: id });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await notifyAdmin(`❌ Order #HW-${id} was cancelled by the customer.`);
  } else if (body?.update) {
    const { name, address, items } = body.update;
    const { error } = await supabase.rpc("update_my_order", {
      p_id: id, p_name: String(name ?? ""), p_address: String(address ?? ""),
      p_items: (items ?? []).map((item) => ({ id: String(item.id), qty: Number(item.qty) || 0 })),
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await notifyAdmin(`✏️ Order #HW-${id} was edited by the customer — please review it.`);
  }

  return myOrders(supabase);
}
