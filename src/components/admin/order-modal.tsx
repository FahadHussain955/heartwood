"use client";

import { FileText, MessageCircle, Phone, X } from "lucide-react";
import { money, photo } from "@/lib/store";
import { label, orderNo, statuses, when, type Order, type OrderStatus } from "./shared";

const whatsapp = (phone: string) => `https://wa.me/${phone.replace(/\D/g, "").replace(/^0/, "92")}`;

export function OrderModal({ order, onClose, onStatus }: { order: Order; onClose: () => void; onStatus: (order: Order, status: OrderStatus) => void }) {
  return <div className="modal-backdrop" onClick={onClose}>
    <div className="product-modal product-modal-wide" role="dialog" aria-modal="true" aria-label={`Order ${orderNo(order.id)}`} onClick={(event) => event.stopPropagation()}>
      <div className="modal-heading">
        <div><p className="eyebrow">ORDER · {when(order.created_at).toUpperCase()}</p><h2>{orderNo(order.id)}</h2></div>
        <div className="modal-heading-actions">
          <a className="admin-primary-button" href={`/admin/invoice/${order.id}`} target="_blank" rel="noreferrer"><FileText size={14} /> Invoice</a>
          <button type="button" className="admin-icon" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
      </div>

      <div className="order-detail-grid">
        <div>
          <h3>Customer</h3>
          <p><strong>{order.customer_name}</strong></p>
          <p>{order.phone}</p>
          <p>{order.address}</p>
          <div className="order-contact">
            <a href={`tel:${order.phone.replace(/\s/g, "")}`}><Phone size={13} /> Call</a>
            <a href={whatsapp(order.phone)} target="_blank" rel="noreferrer"><MessageCircle size={13} /> WhatsApp</a>
          </div>
        </div>
        <div>
          <h3>Status</h3>
          <select className={`order-select status-${order.status}`} value={order.status} onChange={(event) => onStatus(order, event.target.value as OrderStatus)}>
            {statuses.map((value) => <option key={value} value={value}>{label(value)}</option>)}
          </select>
          <p className="modal-hint">Payment: confirm with customer on WhatsApp</p>
        </div>
      </div>

      <h3 className="order-items-title">Items</h3>
      <ul className="order-items">
        {order.items.map((item) => <li key={item.id}>
          <div className="mini-product-image" style={item.image ? { backgroundImage: `url(${photo(item.image, 120)})` } : undefined} />
          <div><strong>{item.name}</strong><small>{item.qty} × {money(item.price)}</small></div>
          <b>{money(item.qty * item.price)}</b>
        </li>)}
      </ul>
      <div className="order-total"><span>Total</span><strong>{money(order.subtotal)}</strong></div>
    </div>
  </div>;
}
