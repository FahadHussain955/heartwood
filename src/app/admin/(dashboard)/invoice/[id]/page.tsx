import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Oswald } from "next/font/google";
import { ArrowLeft } from "lucide-react";
import { PrintButton } from "@/components/admin/print-button";
import { orderNo, type Order } from "@/components/admin/shared";
import { createClient } from "@/lib/supabase/server";
import { money, showrooms, site } from "@/lib/store";

const oswald = Oswald({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-invoice" });

type Props = { params: Promise<{ id: string }> };

const dateFormat = new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short", year: "numeric" });
const invoiceNo = (id: number) => `INV-${id}`;

async function getOrder(id: string) {
  if (!/^\d+$/.test(id)) return null;
  // RLS only lets admins read orders; the dashboard layout has already checked this visitor is one.
  const supabase = await createClient();
  const { data } = await supabase.from("orders").select("*").eq("id", Number(id)).maybeSingle();
  return data as Order | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Invoice ${invoiceNo(Number(id))}`, robots: { index: false } };
}

export default async function InvoicePage({ params }: Props) {
  const order = await getOrder((await params).id);
  if (!order) notFound();

  const state = order.status === "delivered" ? "paid" : order.status === "cancelled" ? "cancelled" : "due";
  const due = state === "due" ? order.subtotal : 0;

  return <div className={`invoice-page ${oswald.variable}`}>
    <div className="invoice-toolbar">
      <Link href="/admin" className="modal-cancel invoice-back"><ArrowLeft size={14} /> Back to dashboard</Link>
      <PrintButton />
    </div>

    <article className="invoice-sheet">
      <svg className="invoice-waves" viewBox="0 0 160 1123" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 0h70c40 120-50 240-10 380s70 260 20 400-60 240-20 343H0z" fill="#efe3d3" />
        <path d="M0 0h40c50 140-30 260 10 400s40 250-10 390-30 230 0 333H0z" fill="#e6d3bc" opacity=".7" />
        <path d="M0 0h18c30 160-20 280 10 420s20 260-10 400 0 220 10 303H0z" fill="#d8bd9c" opacity=".55" />
      </svg>

      <div className="invoice-content">
        <header className="invoice-header">
          <h1>Invoice</h1>
          <p><strong>{site.name}</strong></p>
          <p>{showrooms[0].address}</p>
          <p>{site.phone} · {site.email}</p>
        </header>

        <section className="invoice-info">
          <div>
            <h2>Bill to</h2>
            <p>{order.customer_name}</p>
            <p>{order.phone}</p>
          </div>
          <div>
            <h2>Ship to</h2>
            <p>{order.customer_name}</p>
            <p>{order.address}</p>
          </div>
          <dl>
            <dt>Invoice #</dt><dd>{invoiceNo(order.id)}</dd>
            <dt>Invoice date</dt><dd>{dateFormat.format(new Date(order.created_at))}</dd>
            <dt>Order #</dt><dd>{orderNo(order.id)}</dd>
            <dt>Payment</dt><dd>{state === "paid" ? "Paid" : state === "cancelled" ? "Cancelled" : "Confirm via WhatsApp"}</dd>
          </dl>
        </section>

        <table className="invoice-table">
          <thead><tr><th>Qty</th><th>Description</th><th>Unit price</th><th>Amount</th></tr></thead>
          <tbody>
            {order.items.map((item) => <tr key={item.id}>
              <td>{item.qty}</td>
              <td>{item.name}</td>
              <td>{money(item.price)}</td>
              <td>{money(item.qty * item.price)}</td>
            </tr>)}
          </tbody>
        </table>

        <div className="invoice-totals">
          <div><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
          <div><span>Taxes</span><span>Included</span></div>
          <div className="invoice-grand"><span>Total</span><strong>{money(order.subtotal)}</strong></div>
          {state !== "due" && <div><span>Amount due</span><span>{money(due)}</span></div>}
        </div>

        <div className="invoice-bottom">
          <footer className="invoice-terms">
            <h2>Terms &amp; conditions</h2>
            <p>{state === "due" ? `Payment of ${money(due)} is pending. Contact us on WhatsApp to confirm payment details.` : state === "paid" ? "This invoice has been paid in full. Thank you!" : "This order was cancelled. No payment is due."}</p>
            <p>No returns or exchanges and no warranty. Delivery and installation charges depend on the order. All prices are in PKR.</p>
          </footer>

          <div className="invoice-sign">
            <p className="invoice-signature" aria-hidden="true">&nbsp;</p>
            <p>Authorised signature</p>
          </div>
        </div>
      </div>
    </article>
  </div>;
}
