import { NextResponse } from "next/server";
import { sendEnquiryEmail } from "@/lib/mail";
import { notifyAdmin } from "@/lib/notify";

export const runtime = "nodejs";

// POST { name, phone, email?, type, message } → { ok: true }
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const field = (key: string, max: number) => String(body?.[key] ?? "").trim().slice(0, max);
  const enquiry = { name: field("name", 100), phone: field("phone", 30), email: field("email", 120), type: field("type", 60), message: field("message", 2000) };
  if (!enquiry.name || !enquiry.phone || !enquiry.message) return NextResponse.json({ error: "Please fill in your name, phone and message." }, { status: 400 });

  // Either channel is enough — the enquiry is only lost if both fail.
  const sent = await Promise.all([
    notifyAdmin([
      `📩 New enquiry — ${enquiry.type}`,
      `Name: ${enquiry.name}`,
      `Phone: ${enquiry.phone}`,
      ...(enquiry.email ? [`Email: ${enquiry.email}`] : []),
      "",
      enquiry.message,
    ].join("\n")),
    sendEnquiryEmail(enquiry),
  ]);
  if (!sent.some(Boolean)) return NextResponse.json({ error: "We couldn't send your message. Please call or WhatsApp us." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
