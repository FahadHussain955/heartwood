"use client";

import { useState } from "react";
import { CalendarDays, Printer } from "lucide-react";
import { money } from "@/lib/store";
import { initials, label, orderNo, type Order } from "./shared";

/** Local calendar day of a date as YYYY-MM-DD (matches <input type="date">). */
const dayKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const dayLabel = (key: string) => new Intl.DateTimeFormat("en-PK", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(new Date(`${key}T00:00`));
const timeFormat = new Intl.DateTimeFormat("en-PK", { hour: "numeric", minute: "2-digit" });
const HISTORY_DAYS = 30;

/** Totals for one day: every order placed, the cancelled ones, and what is left after removing them. */
function summarise(orders: Order[]) {
  const cancelled = orders.filter((order) => order.status === "cancelled");
  const total = orders.reduce((sum, order) => sum + order.subtotal, 0);
  const lost = cancelled.reduce((sum, order) => sum + order.subtotal, 0);
  return { count: orders.length, total, cancelledCount: cancelled.length, cancelled: lost, netCount: orders.length - cancelled.length, net: total - lost };
}

export function Reports({ orders, loading, onOpenOrder }: { orders: Order[]; loading: boolean; onOpenOrder: (order: Order) => void }) {
  const todayKey = dayKey(new Date());
  const [day, setDay] = useState(todayKey);

  const byDay = new Map<string, Order[]>();
  for (const order of orders) {
    const key = dayKey(new Date(order.created_at));
    byDay.set(key, [...(byDay.get(key) ?? []), order]);
  }
  const selected = byDay.get(day) ?? [];
  const report = summarise(selected);

  const history = Array.from({ length: HISTORY_DAYS }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const key = dayKey(date);
    return { key, ...summarise(byDay.get(key) ?? []) };
  });
  const totals = summarise(history.flatMap((row) => byDay.get(row.key) ?? []));

  return <>
    <div className="panel-toolbar report-toolbar">
      <label className="admin-filter report-date"><CalendarDays size={14} /><input type="date" value={day} max={todayKey} onChange={(event) => event.target.value && setDay(event.target.value)} aria-label="Report date" /></label>
      {day !== todayKey && <button className="chip-button" onClick={() => setDay(todayKey)}>Today</button>}
      <button className="admin-primary-button report-print" onClick={() => window.print()}><Printer size={14} /> Print report</button>
    </div>

    <h2 className="report-heading">Daily report — {dayLabel(day)}</h2>
    <div className="stat-grid invoice-stats">
      <div className="stat-card"><div className="stat-card-heading">Total orders</div><strong>{report.count}</strong><p className="report-sub">{money(report.total)}</p></div>
      <div className="stat-card"><div className="stat-card-heading">Cancelled</div><strong className="negative">{report.cancelledCount}</strong><p className="report-sub">− {money(report.cancelled)}</p></div>
      <div className="stat-card"><div className="stat-card-heading">Net orders</div><strong>{report.netCount}</strong><p className="report-sub">Total minus cancelled</p></div>
      <div className="stat-card report-net"><div className="stat-card-heading">Net amount</div><strong className="positive">{money(report.net)}</strong><p className="report-sub">{money(report.total)} − {money(report.cancelled)}</p></div>
    </div>

    <section className="admin-panel">
      <div className="panel-heading"><div><h2>Orders on this day</h2><p>{report.count ? `${report.count} ${report.count === 1 ? "order" : "orders"}, ${report.cancelledCount} cancelled` : "No orders were placed on this day."}</p></div></div>
      <div className="table-wrap"><table>
        <thead><tr><th>ORDER</th><th>CUSTOMER</th><th>TIME</th><th>AMOUNT</th><th>STATUS</th></tr></thead>
        <tbody>
          {selected.length === 0 && <tr><td colSpan={5}>{loading ? "Loading…" : "No orders."}</td></tr>}
          {selected.map((order) => <tr key={order.id} className="clickable-row" onClick={() => onOpenOrder(order)}>
            <td className="order-id">{orderNo(order.id)}</td>
            <td><div className="customer-cell"><span className="customer-avatar">{initials(order.customer_name)}</span>{order.customer_name}</div></td>
            <td>{timeFormat.format(new Date(order.created_at)).toLowerCase()}</td>
            <td className={order.status === "cancelled" ? "order-amount report-struck" : "order-amount"}>{money(order.subtotal)}</td>
            <td><span className={`order-status status-${order.status}`}>{label(order.status)}</span></td>
          </tr>)}
        </tbody>
      </table></div>
    </section>

    <section className="admin-panel report-history">
      <div className="panel-heading"><div><h2>Last {HISTORY_DAYS} days</h2><p>Click a day to open its report</p></div></div>
      <div className="table-wrap"><table>
        <thead><tr><th>DATE</th><th>ORDERS</th><th>TOTAL</th><th>CANCELLED</th><th>CANCELLED AMOUNT</th><th>NET</th></tr></thead>
        <tbody>
          {history.map((row) => <tr key={row.key} className={row.key === day ? "clickable-row report-selected" : "clickable-row"} onClick={() => setDay(row.key)}>
            <td className="order-id">{row.key === todayKey ? "Today" : dayLabel(row.key)}</td>
            <td>{row.count}</td>
            <td>{money(row.total)}</td>
            <td>{row.cancelledCount}</td>
            <td className={row.cancelled ? "negative" : undefined}>{row.cancelled ? `− ${money(row.cancelled)}` : money(0)}</td>
            <td className="order-amount">{money(row.net)}</td>
          </tr>)}
          <tr className="report-total">
            <td>Total</td><td>{totals.count}</td><td>{money(totals.total)}</td><td>{totals.cancelledCount}</td>
            <td className={totals.cancelled ? "negative" : undefined}>{totals.cancelled ? `− ${money(totals.cancelled)}` : money(0)}</td>
            <td className="order-amount">{money(totals.net)}</td>
          </tr>
        </tbody>
      </table></div>
    </section>
  </>;
}
