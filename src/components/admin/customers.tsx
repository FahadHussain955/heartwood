"use client";

import { Search } from "lucide-react";
import { money } from "@/lib/store";
import { customersFrom, includes, initials, phoneKey, when, type Order } from "./shared";

type Props = { orders: Order[]; loading: boolean; filter: string; setFilter: (value: string) => void; onViewOrders: (phone: string) => void };

export function Customers({ orders, loading, filter, setFilter, onViewOrders }: Props) {
  const customers = customersFrom(orders);
  const visible = customers.filter((customer) => includes(filter, customer.name, customer.phone, customer.address) || (phoneKey(filter).length > 3 && customer.key.includes(phoneKey(filter))));

  return <section className="admin-panel">
    <div className="panel-toolbar">
      <p className="panel-note">{customers.length} customers, grouped by phone number from checkout orders.</p>
      <label className="admin-filter"><Search size={14} /><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Name, phone or city" /></label>
    </div>
    <div className="table-wrap"><table>
      <thead><tr><th>CUSTOMER</th><th>PHONE</th><th>ADDRESS</th><th>ORDERS</th><th>TOTAL SPENT</th><th>LAST ORDER</th></tr></thead>
      <tbody>
        {visible.length === 0 && <tr><td colSpan={6}>{loading ? "Loading…" : customers.length ? "No customers match this search." : "No customers yet."}</td></tr>}
        {visible.map((customer) => <tr key={customer.key} className="clickable-row" onClick={() => onViewOrders(customer.phone)} title="View this customer's orders">
          <td><div className="customer-cell"><span className="customer-avatar">{initials(customer.name)}</span>{customer.name}</div></td>
          <td>{customer.phone}</td>
          <td className="cell-truncate">{customer.address}</td>
          <td>{customer.orders.length}</td>
          <td className="order-amount">{money(customer.spent)}</td>
          <td>{when(customer.last)}</td>
        </tr>)}
      </tbody>
    </table></div>
  </section>;
}
