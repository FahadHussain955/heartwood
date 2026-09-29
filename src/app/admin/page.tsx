"use client";

import { useState } from "react";
import {
  ArrowDownRight, ArrowUpRight, Bell, Box, ChevronDown, CircleHelp,
  CreditCard, LayoutDashboard, LogOut, MoreHorizontal, PackagePlus,
  Search, Settings, ShoppingCart, Users,
} from "lucide-react";

const startingProducts = [
  { name: "Forma Lounge Chair", sku: "CHR-1042", price: "Rs. 89,500", stock: 18, status: "In stock", image: "photo-1567538096630-e0c55bd6374c" },
  { name: "Solace Modular Sofa", sku: "SFA-2081", price: "Rs. 248,000", stock: 6, status: "Low stock", image: "photo-1555041469-a586c61ea9bc" },
  { name: "Arden Oak Dining Set", sku: "DIN-3024", price: "Rs. 189,000", stock: 0, status: "Out of stock", image: "photo-1604578762246-41134e37f9cc" },
  { name: "Milo Accent Chair", sku: "CHR-1056", price: "Rs. 74,500", stock: 23, status: "In stock", image: "photo-1505693416388-ac5ce068fe85" },
];

const orders = [
  { id: "#HW-2481", customer: "Ayesha Khan", date: "Today, 10:42 am", amount: "Rs. 89,500", status: "Processing", initials: "AK" },
  { id: "#HW-2480", customer: "Omar Farooq", date: "Today, 09:18 am", amount: "Rs. 248,000", status: "Shipped", initials: "OF" },
  { id: "#HW-2479", customer: "Sara Ahmed", date: "Yesterday", amount: "Rs. 189,000", status: "Delivered", initials: "SA" },
];

const chartBars = [34, 49, 42, 62, 55, 74, 58, 83, 70, 92, 68, 100, 77, 87, 64, 94, 80, 72, 98, 85, 69, 88, 73, 95, 82, 64, 90, 75];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [products, setProducts] = useState(startingProducts);
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [productName, setProductName] = useState("");

  const addProduct = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!productName.trim()) return;
    setProducts((current) => [{ name: productName.trim(), sku: "NEW-0001", price: "Rs. 0", stock: 1, status: "In stock", image: "photo-1616486338812-3dadae4b4ace" }, ...current]);
    setProductName("");
    setShowForm(false);
    setNotice("Product added to your catalogue.");
    window.setTimeout(() => setNotice(""), 2600);
  };

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a className="wordmark admin-wordmark" href="/">hearth<span>.</span></a>
        <p className="admin-shop-label">STORE MANAGEMENT</p>
        <nav className="admin-nav">
          {[{ label: "Overview", icon: LayoutDashboard }, { label: "Orders", icon: ShoppingCart }, { label: "Products", icon: Box }, { label: "Customers", icon: Users }].map(({ label, icon: Icon }) => <button key={label} className={activeTab === label ? "admin-nav-link selected" : "admin-nav-link"} onClick={() => setActiveTab(label)}><Icon size={18} />{label}{label === "Orders" && <span className="nav-count">8</span>}</button>)}
        </nav>
        <p className="admin-shop-label lower-label">PREFERENCES</p>
        <nav className="admin-nav"><button className="admin-nav-link" onClick={() => setNotice("Store settings are ready to connect.")}><Settings size={18} />Settings</button><button className="admin-nav-link" onClick={() => setNotice("Help centre coming soon.")}><CircleHelp size={18} />Help centre</button></nav>
        <div className="admin-sidebar-bottom"><div className="admin-user"><div className="user-avatar">HM</div><div><strong>Hearth Manager</strong><small>Store owner</small></div><MoreHorizontal size={18} /></div><a className="back-to-store" href="/"><LogOut size={16} /> Back to storefront</a></div>
      </aside>

      <section className="admin-content">
        <header className="admin-topbar"><div className="breadcrumbs">Hearth Store <span>/</span> {activeTab}</div><div className="admin-top-actions"><button aria-label="Search" className="admin-icon"><Search size={18} /></button><button aria-label="Notifications" className="admin-icon notification-button"><Bell size={18} /><i /></button><div className="admin-top-user"><div className="user-avatar">HM</div><span>Hearth Manager</span><ChevronDown size={15} /></div></div></header>
        <div className="admin-page-content">
          <div className="admin-title-row"><div><p className="admin-date">TUESDAY, SEPTEMBER 29, 2026</p><h1>{activeTab === "Overview" ? "Good morning, Hearth." : activeTab}</h1><p>Here&apos;s what&apos;s happening with your store today.</p></div><button className="admin-primary-button" onClick={() => setShowForm(true)}><PackagePlus size={17} /> Add product</button></div>
          {notice && <div className="admin-notice">{notice}</div>}

          <div className="stat-grid">
            <article className="stat-card"><div className="stat-card-heading"><span>Total sales</span><span className="stat-icon"><CreditCard size={17} /></span></div><strong>Rs. 842,500</strong><div className="stat-change positive"><ArrowUpRight size={14} /> 12.8% <span>vs last month</span></div><div className="stat-sparkline"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></article>
            <article className="stat-card"><div className="stat-card-heading"><span>Orders</span><span className="stat-icon"><ShoppingCart size={17} /></span></div><strong>36</strong><div className="stat-change positive"><ArrowUpRight size={14} /> 8.2% <span>vs last month</span></div><div className="stat-sparkline sparkline-two"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></article>
            <article className="stat-card"><div className="stat-card-heading"><span>Customers</span><span className="stat-icon"><Users size={17} /></span></div><strong>214</strong><div className="stat-change positive"><ArrowUpRight size={14} /> 4.6% <span>vs last month</span></div><div className="stat-sparkline sparkline-three"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></article>
            <article className="stat-card"><div className="stat-card-heading"><span>Average order value</span><span className="stat-icon"><CreditCard size={17} /></span></div><strong>Rs. 23,402</strong><div className="stat-change negative"><ArrowDownRight size={14} /> 2.1% <span>vs last month</span></div><div className="stat-sparkline sparkline-four"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></article>
          </div>

          <div className="admin-middle-grid">
            <section className="admin-panel sales-panel"><div className="panel-heading"><div><h2>Sales overview</h2><p>Your store performance at a glance</p></div><button className="period-select">Last 30 days <ChevronDown size={14} /></button></div><div className="sales-total"><strong>Rs. 842,500</strong><span className="stat-change positive"><ArrowUpRight size={14} /> 12.8%</span></div><div className="chart-area"><div className="chart-y-axis"><span>Rs. 300k</span><span>Rs. 200k</span><span>Rs. 100k</span><span>Rs. 0</span></div><div className="chart-content"><div className="chart-grid-lines"><i /><i /><i /><i /></div><div className="bar-chart">{chartBars.map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div><div className="chart-x-axis"><span>Sep 1</span><span>Sep 8</span><span>Sep 15</span><span>Sep 22</span><span>Sep 29</span></div></div></div></section>
            <section className="admin-panel top-products-panel"><div className="panel-heading"><div><h2>Top products</h2><p>Your best performers this month</p></div><button className="more-button" aria-label="More product options"><MoreHorizontal size={19} /></button></div><div className="top-product-list">{startingProducts.slice(0, 3).map((product, index) => <div className="top-product" key={product.sku}><span className="top-product-rank">0{index + 1}</span><div className="mini-product-image" style={{ backgroundImage: `url(https://images.unsplash.com/${product.image}?auto=format&fit=crop&w=120&q=80)` }} /><div className="top-product-name"><strong>{product.name}</strong><small>{[18, 12, 9][index]} sold</small></div><strong className="top-product-sales">{["Rs. 1.61m", "Rs. 1.24m", "Rs. 756k"][index]}</strong></div>)}</div><button className="panel-link" onClick={() => setActiveTab("Products")}>View all products <ArrowUpRight size={14} /></button></section>
          </div>

          <section className="admin-panel orders-panel"><div className="panel-heading"><div><h2>Recent orders</h2><p>You&apos;ve received 8 orders today</p></div><button className="panel-link" onClick={() => setActiveTab("Orders")}>View all orders <ArrowUpRight size={14} /></button></div><div className="table-wrap"><table><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>DATE</th><th>AMOUNT</th><th>STATUS</th><th /></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td className="order-id">{order.id}</td><td><div className="customer-cell"><span className="customer-avatar">{order.initials}</span>{order.customer}</div></td><td>{order.date}</td><td className="order-amount">{order.amount}</td><td><span className={`order-status status-${order.status.toLowerCase()}`}>{order.status}</span></td><td><button className="more-button" aria-label={`More options for ${order.id}`}><MoreHorizontal size={18} /></button></td></tr>)}</tbody></table></div></section>

          <section className="admin-panel inventory-panel"><div className="panel-heading"><div><h2>Product inventory</h2><p>Keep track of what&apos;s ready to ship</p></div><button className="panel-link" onClick={() => setActiveTab("Products")}>Manage inventory <ArrowUpRight size={14} /></button></div><div className="table-wrap"><table><thead><tr><th>PRODUCT</th><th>SKU</th><th>PRICE</th><th>STOCK</th><th>STATUS</th><th /></tr></thead><tbody>{products.slice(0, 4).map((product) => <tr key={product.sku}><td><div className="inventory-product"><div className="mini-product-image" style={{ backgroundImage: `url(https://images.unsplash.com/${product.image}?auto=format&fit=crop&w=120&q=80)` }} /><strong>{product.name}</strong></div></td><td>{product.sku}</td><td className="order-amount">{product.price}</td><td>{product.stock} units</td><td><span className={`inventory-status ${product.status.toLowerCase().replaceAll(" ", "-")}`}><i />{product.status}</span></td><td><button className="more-button" aria-label={`More options for ${product.name}`}><MoreHorizontal size={18} /></button></td></tr>)}</tbody></table></div></section>
          <footer className="admin-footer">© 2026 Hearth Living <span>Need a hand? <a href="mailto:hello@hearth.pk">Contact support</a></span></footer>
        </div>
      </section>

      {showForm && <div className="modal-backdrop" onClick={() => setShowForm(false)}><form className="product-modal" onSubmit={addProduct} onClick={(event) => event.stopPropagation()}><div className="modal-heading"><div><p className="eyebrow">CATALOGUE</p><h2>Add a product</h2></div><button type="button" className="admin-icon" onClick={() => setShowForm(false)} aria-label="Close"><span>×</span></button></div><label htmlFor="product-name">Product name</label><input id="product-name" autoFocus value={productName} onChange={(event) => setProductName(event.target.value)} placeholder="e.g. Rowan occasional table" required /><p className="modal-hint">Price, photos and inventory can be updated later.</p><div className="modal-actions"><button type="button" className="modal-cancel" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="admin-primary-button">Add product</button></div></form></div>}
    </main>
  );
}
