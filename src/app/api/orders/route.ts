import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendOrderEmails } from "@/lib/mail";
import { notifyAdmin } from "@/lib/notify";

export const runtime = "nodejs";

type Item = { id: string; qty: number };

// POST { name, phone, address, items: [{ id, qty }] } → { id }
// Places the order through the same place_order function the storefront used, then pings the admin on WhatsApp.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { name?: string; phone?: string; email?: string; address?: string; items?: Item[] } | null;
  if (!body || !Array.isArray(body.items)) return NextResponse.json({ error: "Invalid order" }, { status: 400 });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false } });
  const items = body.items.map(({ id, qty }) => ({ id: String(id), qty: Number(qty) || 1 }));
  const name = String(body.name ?? "");
  const phone = String(body.phone ?? "");
  const address = String(body.address ?? "");
  const email = String(body.email ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });

  const { data, error } = await supabase.rpc("place_order", { p_name: name, p_phone: phone, p_address: address, p_items: items });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Prices come from the database, not from the request.
  const { data: products } = await supabase.from("products").select("id, name, price").in("id", items.map((item) => item.id));
  const lines = items.flatMap((item) => {
    const product = products?.find((row) => row.id === item.id);
    return product ? [{ ...product, qty: item.qty }] : [];
  });
  const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  await notifyAdmin([
    `🛒 New order #HW-${data}`,
    `Customer: ${name.trim()}`,
    `Phone: ${phone.trim()}`,
    `Address: ${address.trim()}`,
    "",
    ...lines.map((line) => `• ${line.name} × ${line.qty} — Rs. ${(line.price * line.qty).toLocaleString("en-PK")}`),
    "",
    `Total: Rs. ${total.toLocaleString("en-PK")} (Cash on delivery)`,
  ].join("\n"));
  await sendOrderEmails({ id: data as number, name: name.trim(), phone: phone.trim(), email, address: address.trim(), lines, total });

  return NextResponse.json({ id: data as number });
}
