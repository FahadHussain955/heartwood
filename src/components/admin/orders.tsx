"use client";

import { Eye, FileText, Search } from "lucide-react";
import { money } from "@/lib/store";
import { initials, label, orderMatches, orderNo, statuses, when, type Order, type OrderStatus } from "./shared";

type Props = {
  orders: Order[]; loading: boolean; filter: string; setFilter: (value: string) => void;
  status: OrderStatus | "all"; setStatus: (value: OrderStatus | "all") => void;
  onOpenOrder: (order: Order) => void; onStatus: (order: Order, status: OrderStatus) => void;
};

export function Orders({ orders, loading, filter, setFilter, status, setStatus, onOpenOrder, onStatus }: Props) {
  const visible = orders.filter((order) => (status === "all" || order.status === status) && orderMatches(order, filter));
  const count = (value: OrderStatus) => orders.filter((order) => order.status === value).length;

  return <section className="admin-panel">
    <div className="panel-toolbar">
      <div className="filter-chips">
        <button className={status === "all" ? "chip-button active" : "chip-button"} onClick={() => setStatus("all")}>All <span>{orders.length}</span></button>
        {statuses.map((value) => <button key={value} className={status === value ? "chip-button active" : "chip-button"} onClick={() => setStatus(value)}>{label(value)} <span>{count(value)}</span></button>)}
      </div>
      <label className="admin-filter"><Search size={14} /><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Order #, name or phone" /></label>
    </div>
    <div className="table-wrap"><table>
      <thead><tr><th>ORDER</th><th>CUSTOMER</th><th>PHONE</th><th>DATE</th><th>ITEMS</th><th>AMOUNT</th><th>STATUS</th><th className="row-actions">ACTIONS</th></tr></thead>
      <tbody>
        {visible.length === 0 && <tr><td colSpan={8}>{loading ? "Loading…" : orders.length ? "No orders match these filters." : "No orders yet — they appear here as soon as a customer checks out."}</td></tr>}
        {visible.map((order) => <tr key={order.id} className="clickable-row" onClick={() => onOpenOrder(order)}>
          <td className="order-id">{!order.seen && <i className="unseen-dot" title="New" />}{orderNo(order.id)}</td>
          <td><div className="customer-cell"><span className="customer-avatar">{initials(order.customer_name)}</span>{order.customer_name}</div></td>
          <td>{order.phone}</td>
          <td>{when(order.created_at)}</td>
          <td>{order.items.reduce((total, item) => total + item.qty, 0)}</td>
          <td className="order-amount">{money(order.subtotal)}</td>
          <td onClick={(event) => event.stopPropagation()}>
            <select className={`order-select status-${order.status}`} value={order.status} onChange={(event) => onStatus(order, event.target.value as OrderStatus)} aria-label={`Status of ${orderNo(order.id)}`}>
              {statuses.map((value) => <option key={value} value={value}>{label(value)}</option>)}
            </select>
          </td>
          <td className="row-actions">
            <a className="more-button" href={`/admin/invoice/${order.id}`} target="_blank" rel="noreferrer" title="Invoice" aria-label={`Invoice for ${orderNo(order.id)}`} onClick={(event) => event.stopPropagation()}><FileText size={16} /></a>
            <button className="more-button" title="View order" aria-label={`View ${orderNo(order.id)}`}><Eye size={16} /></button>
          </td>
        </tr>)}
      </tbody>
    </table></div>
  </section>;
}
