"use client";

import { ArrowDownRight, ArrowUpRight, CreditCard, Minus, ShoppingCart, TriangleAlert, Users } from "lucide-react";
import { money, photo } from "@/lib/store";
import { LOW_STOCK, initials, isLive, label, orderNo, phoneKey, shortDate, when, type DbProduct, type Order, type StockView, type Tab } from "./shared";

const DAY = 86_400_000;
export const periods = [7, 30, 90];

const compact = (value: number) => value >= 1_000_000 ? `${+(value / 1_000_000).toFixed(1)}m` : value >= 1000 ? `${Math.round(value / 1000)}k` : String(value);
/** Chart ceiling split into three round steps (e.g. 15k → 0 / 5k / 10k / 15k). */
const niceMax = (value: number) => {
  if (value <= 0) return 3000;
  const raw = value / 3;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].map((factor) => factor * magnitude).find((candidate) => candidate >= raw)!;
  return step * 3;
};
const sum = (orders: Order[]) => orders.reduce((total, order) => total + order.subtotal, 0);
const uniqueCustomers = (orders: Order[]) => new Set(orders.map((order) => phoneKey(order.phone))).size;

/** Splits the period ending today into `count` equal time buckets of live (non-cancelled) orders. */
function bucket(orders: Order[], days: number, count: number) {
  const end = new Date();
  end.setHours(24, 0, 0, 0);
  const span = (days * DAY) / count;
  const start = end.getTime() - days * DAY;
  const buckets = Array.from({ length: count }, (_, index) => ({ start: new Date(start + index * span), orders: [] as Order[] }));
  for (const order of orders) {
    const index = Math.floor((new Date(order.created_at).getTime() - start) / span);
    if (index >= 0 && index < count && isLive(order)) buckets[index].orders.push(order);
  }
  return buckets;
}

/** Live orders in the last `days` days, and in the equally long period before that (for the % change). */
function splitPeriods(orders: Order[], days: number) {
  const now = Date.now();
  const age = (order: Order) => now - new Date(order.created_at).getTime();
  return {
    current: orders.filter((order) => isLive(order) && age(order) < days * DAY),
    previous: orders.filter((order) => isLive(order) && age(order) >= days * DAY && age(order) < 2 * days * DAY),
  };
}

function Change({ current, previous }: { current: number; previous: number }) {
  if (!previous) return <div className="stat-change neutral"><Minus size={14} /> {current ? "New" : "No change"} <span>vs previous period</span></div>;
  const percent = ((current - previous) / previous) * 100;
  const up = percent >= 0;
  return <div className={`stat-change ${up ? "positive" : "negative"}`}>{up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {Math.abs(percent).toFixed(1)}% <span>vs previous period</span></div>;
}

const Spark = ({ values, tone = "" }: { values: number[]; tone?: string }) => {
  const max = Math.max(...values);
  return <div className={`stat-sparkline ${tone}`}>{values.map((value, index) => <i key={index} style={{ height: `${max ? Math.max(10, (value / max) * 100) : 10}%` }} />)}</div>;
};

type Props = {
  orders: Order[]; products: DbProduct[]; loading: boolean; days: number; setDays: (days: number) => void;
  onOpenOrder: (order: Order) => void; goTo: (tab: Tab, filter?: string) => void; onStockAlert: (view: StockView) => void;
};

export function Overview({ orders, products, loading, days, setDays, onOpenOrder, goTo, onStockAlert }: Props) {
  const { current, previous } = splitPeriods(orders, days);
  const sales = sum(current);
  const aov = current.length ? Math.round(sales / current.length) : 0;
  const previousAov = previous.length ? Math.round(sum(previous) / previous.length) : 0;

  const spark = bucket(orders, days, 11);
  const chart = bucket(orders, days, days <= 31 ? days : Math.ceil(days / 7));
  const chartValues = chart.map((item) => sum(item.orders));
  const top = niceMax(Math.max(...chartValues));
  const ticks = [0, 1, 2, 3, 4].map((step) => chart[Math.min(chart.length - 1, Math.round((step / 4) * (chart.length - 1)))].start);

  const sold = new Map<string, { id: string; name: string; image: string | null; qty: number; revenue: number }>();
  for (const order of current) for (const item of order.items) {
    const entry = sold.get(item.id) ?? { id: item.id, name: item.name, image: item.image, qty: 0, revenue: 0 };
    entry.qty += item.qty;
    entry.revenue += item.qty * item.price;
    sold.set(item.id, entry);
  }
  const topProducts = [...sold.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 4);
  const lowStock = [...products].sort((a, b) => a.stock - b.stock).slice(0, 5);
  const outCount = products.filter((product) => product.stock === 0).length;
  const lowCount = products.filter((product) => product.stock > 0 && product.stock <= LOW_STOCK).length;
  const thumb = (image: string | null | undefined) => image ? { backgroundImage: `url(${photo(image, 120)})` } : undefined;

  return <>
    {(outCount > 0 || lowCount > 0) && <div className="admin-notice admin-notice-error stock-alert" role="alert">
      <TriangleAlert size={16} />
      <span>{[outCount > 0 && `${outCount} ${outCount === 1 ? "product is" : "products are"} out of stock`, lowCount > 0 && `${lowCount} running low (${LOW_STOCK} or fewer)`].filter(Boolean).join(" · ")}</span>
      {outCount > 0 && <button className="panel-link" onClick={() => onStockAlert("out")}>View out of stock</button>}
      {lowCount > 0 && <button className="panel-link" onClick={() => onStockAlert("low")}>View low stock</button>}
    </div>}
    <div className="stat-grid">
      <article className="stat-card"><div className="stat-card-heading"><span>Total sales</span><span className="stat-icon"><CreditCard size={17} /></span></div><strong>{money(sales)}</strong><Change current={sales} previous={sum(previous)} /><Spark values={spark.map((item) => sum(item.orders))} /></article>
      <article className="stat-card"><div className="stat-card-heading"><span>Orders</span><span className="stat-icon"><ShoppingCart size={17} /></span></div><strong>{current.length}</strong><Change current={current.length} previous={previous.length} /><Spark values={spark.map((item) => item.orders.length)} tone="sparkline-two" /></article>
      <article className="stat-card"><div className="stat-card-heading"><span>Customers</span><span className="stat-icon"><Users size={17} /></span></div><strong>{uniqueCustomers(current)}</strong><Change current={uniqueCustomers(current)} previous={uniqueCustomers(previous)} /><Spark values={spark.map((item) => uniqueCustomers(item.orders))} tone="sparkline-three" /></article>
      <article className="stat-card"><div className="stat-card-heading"><span>Average order value</span><span className="stat-icon"><CreditCard size={17} /></span></div><strong>{money(aov)}</strong><Change current={aov} previous={previousAov} /><Spark values={spark.map((item) => item.orders.length ? sum(item.orders) / item.orders.length : 0)} tone="sparkline-four" /></article>
    </div>

    <div className="admin-middle-grid">
      <section className="admin-panel sales-panel">
        <div className="panel-heading">
          <div><h2>Sales overview</h2><p>{days <= 31 ? "Daily" : "Weekly"} sales, excluding cancelled orders</p></div>
          <select className="period-select" value={days} onChange={(event) => setDays(Number(event.target.value))} aria-label="Period">{periods.map((value) => <option key={value} value={value}>Last {value} days</option>)}</select>
        </div>
        <div className="sales-total"><strong>{money(sales)}</strong><Change current={sales} previous={sum(previous)} /></div>
        <div className="chart-area">
          <div className="chart-y-axis">{[3, 2, 1, 0].map((step) => <span key={step}>Rs. {compact((top * step) / 3)}</span>)}</div>
          <div className="chart-content">
            <div className="chart-grid-lines"><i /><i /><i /><i /></div>
            <div className="bar-chart">{chart.map((item, index) => <i key={index} title={`${shortDate(item.start)}: ${money(chartValues[index])} · ${item.orders.length} orders`} style={{ height: `${chartValues[index] ? Math.max(2, (chartValues[index] / top) * 100) : 0}%` }} />)}</div>
            <div className="chart-x-axis">{ticks.map((date, index) => <span key={index}>{shortDate(date)}</span>)}</div>
          </div>
        </div>
      </section>
      <section className="admin-panel top-products-panel">
        <div className="panel-heading"><div><h2>Top products</h2><p>Best sellers in the last {days} days</p></div></div>
        <div className="top-product-list">
          {topProducts.length === 0 && <p className="admin-empty">{loading ? "Loading…" : "No sales in this period yet."}</p>}
          {topProducts.map((product, index) => <div className="top-product" key={product.id}>
            <span className="top-product-rank">0{index + 1}</span>
            <div className="mini-product-image" style={thumb(product.image ?? products.find((item) => item.id === product.id)?.image_url)} />
            <div className="top-product-name"><strong>{product.name}</strong><small>{product.qty} sold</small></div>
            <strong className="top-product-sales">{money(product.revenue)}</strong>
          </div>)}
        </div>
        <button className="panel-link" onClick={() => goTo("Products")}>View all products <ArrowUpRight size={14} /></button>
      </section>
    </div>

    <section className="admin-panel orders-panel">
      <div className="panel-heading"><div><h2>Recent orders</h2><p>{orders.length ? `${orders.filter((order) => order.status === "pending").length} waiting to be confirmed` : "Orders from the storefront checkout appear here"}</p></div><button className="panel-link" onClick={() => goTo("Orders")}>View all orders <ArrowUpRight size={14} /></button></div>
      <div className="table-wrap"><table>
        <thead><tr><th>ORDER</th><th>CUSTOMER</th><th>DATE</th><th>AMOUNT</th><th>STATUS</th></tr></thead>
        <tbody>
          {orders.length === 0 && <tr><td colSpan={5}>{loading ? "Loading…" : "No orders yet."}</td></tr>}
          {orders.slice(0, 5).map((order) => <tr key={order.id} className="clickable-row" onClick={() => onOpenOrder(order)}>
            <td className="order-id">{!order.seen && <i className="unseen-dot" />}{orderNo(order.id)}</td>
            <td><div className="customer-cell"><span className="customer-avatar">{initials(order.customer_name)}</span>{order.customer_name}</div></td>
            <td>{when(order.created_at)}</td>
            <td className="order-amount">{money(order.subtotal)}</td>
            <td><span className={`order-status status-${order.status}`}>{label(order.status)}</span></td>
          </tr>)}
        </tbody>
      </table></div>
    </section>

    <section className="admin-panel inventory-panel">
      <div className="panel-heading"><div><h2>Stock watch</h2><p>Products with the least stock left</p></div><button className="panel-link" onClick={() => goTo("Products")}>Manage inventory <ArrowUpRight size={14} /></button></div>
      <div className="table-wrap"><table>
        <thead><tr><th>PRODUCT</th><th>SKU</th><th>PRICE</th><th>STOCK</th><th>STATUS</th></tr></thead>
        <tbody>
          {lowStock.length === 0 && <tr><td colSpan={5}>{loading ? "Loading…" : "No products yet."}</td></tr>}
          {lowStock.map((product) => {
            const status = product.stock === 0 ? "Out of stock" : product.stock <= LOW_STOCK ? "Low stock" : "In stock";
            return <tr key={product.id} className="clickable-row" onClick={() => goTo("Products", product.name)}>
              <td><div className="inventory-product"><div className="mini-product-image" style={thumb(product.image_url)} /><strong>{product.name}</strong></div></td>
              <td>{product.sku ?? "—"}</td>
              <td className="order-amount">{money(product.price)}</td>
              <td>{product.stock} units</td>
              <td><span className={`inventory-status ${status.toLowerCase().replaceAll(" ", "-")}`}><i />{status}</span></td>
            </tr>;
          })}
        </tbody>
      </table></div>
    </section>
  </>;
}

