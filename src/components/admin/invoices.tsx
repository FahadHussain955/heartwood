"use client";

import { useState } from "react";
import { Eye, FileText, Search } from "lucide-react";
import { money } from "@/lib/store";
import { initials, orderMatches, orderNo, when, type Order } from "./shared";

type Filter = "all" | "paid" | "due" | "cancelled";
const filters: { value: Filter; label: string }[] = [{ value: "all", label: "All" }, { value: "due", label: "Due" }, { value: "paid", label: "Paid" }, { value: "cancelled", label: "Cancelled" }];

/** Invoices remain outstanding until delivery; cancelled orders are void. */
export const invoiceState = (order: Order): Exclude<Filter, "all"> => order.status === "delivered" ? "paid" : order.status === "cancelled" ? "cancelled" : "due";

type Props = { orders: Order[]; loading: boolean; filter: string; setFilter: (value: string) => void; onOpenOrder: (order: Order) => void };

export function Invoices({ orders, loading, filter, setFilter, onOpenOrder }: Props) {
  const [state, setState] = useState<Filter>("all");
  const visible = orders.filter((order) => (state === "all" || invoiceState(order) === state) && orderMatches(order, filter));
  const sum = (value: Exclude<Filter, "all">) => orders.filter((order) => invoiceState(order) === value).reduce((total, order) => total + order.subtotal, 0);
  const count = (value: Filter) => value === "all" ? orders.length : orders.filter((order) => invoiceState(order) === value).length;

  return <>
    <div className="stat-grid invoice-stats">
      <div className="stat-card"><div className="stat-card-heading">Total invoiced</div><strong>{money(sum("paid") + sum("due"))}</strong></div>
      <div className="stat-card"><div className="stat-card-heading">Paid</div><strong>{money(sum("paid"))}</strong></div>
      <div className="stat-card"><div className="stat-card-heading">Payment pending</div><strong>{money(sum("due"))}</strong></div>
      <div className="stat-card"><div className="stat-card-heading">Invoices</div><strong>{orders.length}</strong></div>
    </div>
    <section className="admin-panel invoice-list-panel">
      <div className="panel-toolbar">
        <div className="filter-chips">
          {filters.map(({ value, label }) => <button key={value} className={state === value ? "chip-button active" : "chip-button"} onClick={() => setState(value)}>{label} <span>{count(value)}</span></button>)}
        </div>
        <label className="admin-filter"><Search size={14} /><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Invoice #, name or phone" /></label>
      </div>
      <div className="table-wrap"><table>
        <thead><tr><th>INVOICE</th><th>CUSTOMER</th><th>DATE</th><th>AMOUNT</th><th>PAYMENT</th><th className="row-actions">ACTIONS</th></tr></thead>
        <tbody>
          {visible.length === 0 && <tr><td colSpan={6}>{loading ? "Loading…" : orders.length ? "No invoices match these filters." : "No invoices yet — one is created for every order."}</td></tr>}
          {visible.map((order) => {
            const href = `/admin/invoice/${order.id}`;
            return <tr key={order.id} className="clickable-row" onClick={() => window.open(href, "_blank")}>
              <td className="order-id"><FileText size={13} className="invoice-row-icon" />INV-{order.id}</td>
              <td><div className="customer-cell"><span className="customer-avatar">{initials(order.customer_name)}</span>{order.customer_name}</div></td>
              <td>{when(order.created_at)}</td>
              <td className="order-amount">{money(order.subtotal)}</td>
              <td><span className={`invoice-pill inv-pill-${invoiceState(order)}`}>{invoiceState(order) === "paid" ? "Paid" : invoiceState(order) === "due" ? "Pending" : "Cancelled"}</span></td>
              <td className="row-actions" onClick={(event) => event.stopPropagation()}>
                <a className="more-button" href={href} target="_blank" rel="noreferrer" title="Open invoice / print" aria-label={`Open invoice for ${orderNo(order.id)}`}><FileText size={16} /></a>
                <button className="more-button" title="View order" aria-label={`View ${orderNo(order.id)}`} onClick={() => onOpenOrder(order)}><Eye size={16} /></button>
              </td>
            </tr>;
          })}
        </tbody>
      </table></div>
    </section>
  </>;
}
