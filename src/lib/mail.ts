import nodemailer from "nodemailer";

type Line = { name: string; price: number; qty: number };
type Order = { id: number; name: string; phone: string; email?: string; address: string; lines: Line[]; total: number };

const rs = (n: number) => `Rs. ${n.toLocaleString("en-PK")}`;
/** Brevo (or any SMTP) when SMTP_HOST is set, otherwise Gmail. SMTP_FROM must be a verified sender for Brevo. */
function transport() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;
  const host = process.env.SMTP_HOST;
  const transporter = host
    ? nodemailer.createTransport({ host, port: Number(process.env.SMTP_PORT) || 587, auth: { user, pass } })
    : nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  return { transporter, sender: process.env.SMTP_FROM || user };
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function table(order: Order) {
  const rows = order.lines.map((l) => `<tr><td style="padding:6px 0">${esc(l.name)} × ${l.qty}</td><td style="padding:6px 0;text-align:right">${rs(l.price * l.qty)}</td></tr>`).join("");
  return `<table style="width:100%;border-collapse:collapse;border-top:1px solid #ddd;border-bottom:1px solid #ddd">${rows}<tr><td style="padding:8px 0"><b>Order total</b></td><td style="padding:8px 0;text-align:right"><b>${rs(order.total)}</b></td></tr></table>`;
}

/** Emails the customer a confirmation and the admin a new-order alert via SMTP. Never throws — a failed email must not fail the order. */
export async function sendOrderEmails(order: Order) {
  const t = transport();
  if (!t) return console.warn("Order emails skipped: SMTP_USER / SMTP_PASS not set");
  const { transporter, sender } = t;
  const adminTo = process.env.ADMIN_NOTIFY_EMAIL || sender;
  const from = `"Hearth & Wood" <${sender}>`;
  const ref = `#HW-${order.id}`;
  const details = `<p><b>Name:</b> ${esc(order.name)}<br><b>Phone:</b> ${esc(order.phone)}<br><b>Email:</b> ${esc(order.email || "—")}<br><b>Address:</b> ${esc(order.address)}</p>`;

  const messages = [];
  if (order.email) messages.push(transporter.sendMail({
    from, to: order.email, replyTo: adminTo, subject: `Your Hearth & Wood order ${ref}`,
    text: `Thank you, ${order.name}!\n\nWe've received your order ${ref}. Our team will contact you on WhatsApp to confirm payment options and delivery.\n\n${order.lines.map((l) => `${l.name} x ${l.qty} - ${rs(l.price * l.qty)}`).join("\n")}\n\nOrder total: ${rs(order.total)}\n\nDelivery address: ${order.address}\nPhone: ${order.phone}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px"><h2>Thank you, ${esc(order.name)}!</h2><p>We've received your order <b>${ref}</b>. Our team will contact you on WhatsApp to confirm payment options and delivery.</p>${table(order)}${details}</div>`,
  }));
  if (adminTo) messages.push(transporter.sendMail({
      from, to: adminTo, replyTo: order.email, subject: `🛒 New order ${ref} — ${rs(order.total)}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px"><h2>New order ${ref}</h2>${details}${table(order)}</div>`,
    }));
  const results = await Promise.allSettled(messages);
  results.forEach((r) => r.status === "rejected" && console.warn("Order email failed:", r.reason));
}

type Enquiry = { name: string; phone: string; email: string; type: string; message: string };

/** Emails the admin a website enquiry. Returns false if it could not be sent. */
export async function sendEnquiryEmail(q: Enquiry) {
  const t = transport();
  if (!t) { console.warn("Enquiry email skipped: SMTP_USER / SMTP_PASS not set"); return false; }
  const to = process.env.ADMIN_NOTIFY_EMAIL || t.sender;
  try {
    await t.transporter.sendMail({
      from: `"Hearth & Wood" <${t.sender}>`, to, ...(q.email && { replyTo: q.email }), subject: `New enquiry from ${q.name} — ${q.type}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px"><h2>New website enquiry</h2><p><b>Name:</b> ${esc(q.name)}<br><b>Phone:</b> ${esc(q.phone)}<br><b>Email:</b> ${esc(q.email) || "—"}<br><b>Interested in:</b> ${esc(q.type)}</p><p style="white-space:pre-wrap">${esc(q.message)}</p></div>`,
    });
    return true;
  } catch (error) {
    console.warn("Enquiry email failed:", error);
    return false;
  }
}
