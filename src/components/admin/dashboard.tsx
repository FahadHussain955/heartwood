"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Bot, Box, ClipboardList, ChevronDown, FileText, LayoutDashboard, LogOut, MessageSquare, PackagePlus, Search, Settings as SettingsIcon, ShoppingCart, Store, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { money, photo } from "@/lib/store";
import { Customers } from "./customers";
import { Invoices } from "./invoices";
import { OrderModal } from "./order-modal";
import { Orders } from "./orders";
import { Overview } from "./overview";
import { ProductAssistant } from "./product-assistant";
import { ProductEditor, Products } from "./products";
import { Reports } from "./reports";
import { Reviews } from "./reviews";
import { Settings } from "./settings";
import { useClickOutside } from "./use-click-outside";
import {
  customersFrom, includes, initials, orderMatches, orderNo, phoneKey, when,
  type AdminProfile, type DbProduct, type Order, type OrderStatus, type Review, type StockView, type Tab,
} from "./shared";

const nav: { label: Tab; icon: typeof Box }[] = [
  { label: "Overview", icon: LayoutDashboard }, { label: "Orders", icon: ShoppingCart },
  { label: "Invoices", icon: FileText }, { label: "Reports", icon: ClipboardList }, { label: "Products", icon: Box }, { label: "Customers", icon: Users }, { label: "Reviews", icon: MessageSquare },
];
const subtitles: Record<Tab, string> = {
  Overview: "", Orders: "Confirm, ship and track every order from checkout.", Products: "Add, edit and restock your catalogue.",
  Invoices: "Open, print or save an invoice for any order.", Reports: "Daily orders, cancellations and net sales.", Customers: "Everyone who has ordered from your store.", Reviews: "What customers say about your products. Remove any you don't want shown.", Settings: "Your admin profile and password.",
};
const greeting = () => { const hour = new Date().getHours(); return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"; };
const today = () => new Intl.DateTimeFormat("en-PK", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date()).toUpperCase();

export function AdminDashboard({ admin: initialAdmin }: { admin: AdminProfile }) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [admin, setAdmin] = useState(initialAdmin);
  const [tab, setTab] = useState<Tab>("Overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState({ orders: true, products: true, reviews: true });
  const [reviewsVersion, setReviewsVersion] = useState(0);
  const [ordersVersion, setOrdersVersion] = useState(0);
  const [productsVersion, setProductsVersion] = useState(0);
  const [days, setDays] = useState(30);
  const [filters, setFilters] = useState<Record<"Orders" | "Invoices" | "Products" | "Customers", string>>({ Orders: "", Invoices: "", Products: "", Customers: "" });
  const [orderStatus, setOrderStatus] = useState<OrderStatus | "all">("all");
  const [stockView, setStockView] = useState<StockView>("all");
  const [openOrderId, setOpenOrderId] = useState<number | null>(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [editor, setEditor] = useState<DbProduct | "new" | null>(null);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const [menu, setMenu] = useState<"" | "search" | "notifications" | "profile">("");
  const [search, setSearch] = useState("");
  const noticeTimer = useRef<number | undefined>(undefined);
  const searchRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const flash = useCallback((text: string, error = false) => {
    setNotice({ text, error });
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 3500);
  }, []);
  const reloadOrders = useCallback(() => setOrdersVersion((value) => value + 1), []);
  const reloadProducts = useCallback(() => setProductsVersion((value) => value + 1), []);

  useEffect(() => {
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(2000).then(({ data, error }) => {
      if (error) flash(`Couldn't load orders: ${error.message}`, true);
      else setOrders(data as Order[]);
      setLoading((current) => ({ ...current, orders: false }));
    });
  }, [supabase, ordersVersion, flash]);

  useEffect(() => {
    supabase.from("products").select("*").order("created_at", { ascending: false }).then(({ data, error }) => {
      if (error) flash(`Couldn't load products: ${error.message}`, true);
      else setProducts(data as DbProduct[]);
      setLoading((current) => ({ ...current, products: false }));
    });
  }, [supabase, productsVersion, flash]);

  useEffect(() => {
    supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(1000).then(({ data, error }) => {
      if (error) flash(`Couldn't load reviews: ${error.message}`, true);
      else setReviews(data as Review[]);
      setLoading((current) => ({ ...current, reviews: false }));
    });
  }, [supabase, reviewsVersion, flash]);

  // Live updates: new checkouts (and changes made in another admin tab) arrive without a refresh.
  // The socket must carry the admin's token, otherwise RLS hides every order event from it.
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | undefined;
    let cancelled = false;
    supabase.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;
      if (data.session) await supabase.realtime.setAuth(data.session.access_token);
      channel = supabase.channel("admin-orders")
        .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
          if (payload.eventType === "INSERT") {
            const order = payload.new as Order;
            flash(`New order ${orderNo(order.id)} from ${order.customer_name} — ${money(order.subtotal)}`);
            reloadProducts();
          }
          reloadOrders();
        })
        .subscribe();
    });
    return () => { cancelled = true; if (channel) supabase.removeChannel(channel); };
  }, [supabase, flash, reloadOrders, reloadProducts]);

  const closeMenu = useCallback(() => setMenu(""), []);
  useClickOutside(searchRef, closeMenu, menu === "search");
  useClickOutside(bellRef, closeMenu, menu === "notifications");
  useClickOutside(profileRef, closeMenu, menu === "profile");

  const patchOrders = async (ids: number[], patch: Partial<Order>) => {
    setOrders((current) => current.map((order) => ids.includes(order.id) ? { ...order, ...patch } : order));
    const { error } = await supabase.from("orders").update(patch).in("id", ids);
    if (error) { flash(error.message, true); reloadOrders(); }
    return !error;
  };
  const openOrder = (order: Order) => {
    setOpenOrderId(order.id);
    setMenu("");
    if (!order.seen) patchOrders([order.id], { seen: true });
  };
  const changeStatus = async (order: Order, status: OrderStatus) => {
    if (await patchOrders([order.id], { status, seen: true })) flash(`${orderNo(order.id)} marked as ${status}.`);
  };
  const goTo = (next: Tab, filter?: string) => {
    setTab(next);
    setMenu("");
    if (next === "Orders" && filter !== undefined) setOrderStatus("all");
    if (filter !== undefined && next !== "Overview" && next !== "Reports" && next !== "Reviews" && next !== "Settings") setFilters((current) => ({ ...current, [next]: filter }));
  };
  const signOut = async () => { await supabase.auth.signOut(); router.replace("/admin/login"); router.refresh(); };

  const unseen = orders.filter((order) => !order.seen);
  const pending = orders.filter((order) => order.status === "pending").length;
  const openOrderData = orders.find((order) => order.id === openOrderId);
  const firstName = admin.name.split(" ")[0];

  const term = search.trim();
  const results = term ? {
    orders: orders.filter((order) => orderMatches(order, term)).slice(0, 4),
    products: products.filter((product) => includes(term, product.name, product.sku)).slice(0, 4),
    customers: customersFrom(orders).filter((customer) => includes(term, customer.name, customer.phone) || (phoneKey(term).length > 3 && customer.key.includes(phoneKey(term)))).slice(0, 3),
  } : null;
  const hasResults = results && (results.orders.length + results.products.length + results.customers.length > 0);

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <span className="wordmark admin-wordmark">hearth<span>.</span></span>
        <p className="admin-shop-label">STORE MANAGEMENT</p>
        <nav className="admin-nav">
          {nav.map(({ label, icon: Icon }) => <button key={label} className={tab === label ? "admin-nav-link selected" : "admin-nav-link"} onClick={() => goTo(label)}>
            <Icon size={18} />{label}{label === "Orders" && pending > 0 && <span className="nav-count" title="Pending orders">{pending}</span>}
          </button>)}
        </nav>
      </aside>

      <section className="admin-content">
        <header className="admin-topbar">
          <div className="breadcrumbs">Hearth Store <span>/</span> {tab}</div>
          <div className="admin-top-actions">
            <div className="admin-search" ref={searchRef}>
              <Search size={16} />
              <input value={search} onChange={(event) => { setSearch(event.target.value); setMenu("search"); }} onFocus={() => setMenu("search")} placeholder="Search orders, products, customers" aria-label="Search the admin" />
              {menu === "search" && term && <div className="admin-dropdown search-dropdown">
                {!hasResults && <p className="dropdown-empty">Nothing matches “{term}”.</p>}
                {!!results?.orders.length && <><p className="dropdown-label">Orders</p>{results.orders.map((order) => <button key={order.id} className="dropdown-item" onClick={() => { openOrder(order); setSearch(""); }}>
                  <span className="customer-avatar">{initials(order.customer_name)}</span><span><strong>{orderNo(order.id)} · {order.customer_name}</strong><small>{when(order.created_at)} · {money(order.subtotal)}</small></span></button>)}</>}
                {!!results?.products.length && <><p className="dropdown-label">Products</p>{results.products.map((product) => <button key={product.id} className="dropdown-item" onClick={() => { goTo("Products", product.name); setSearch(""); }}>
                  <span className="mini-product-image" style={product.image_url ? { backgroundImage: `url(${photo(product.image_url, 120)})` } : undefined} /><span><strong>{product.name}</strong><small>{money(product.price)} · {product.stock} in stock</small></span></button>)}</>}
                {!!results?.customers.length && <><p className="dropdown-label">Customers</p>{results.customers.map((customer) => <button key={customer.key} className="dropdown-item" onClick={() => { goTo("Customers", customer.phone); setSearch(""); }}>
                  <span className="customer-avatar">{initials(customer.name)}</span><span><strong>{customer.name}</strong><small>{customer.phone} · {customer.orders.length} orders</small></span></button>)}</>}
              </div>}
            </div>

            <div className="admin-menu" ref={bellRef}>
              <button aria-label={`Notifications${unseen.length ? ` (${unseen.length} new)` : ""}`} className="admin-icon notification-button" onClick={() => setMenu(menu === "notifications" ? "" : "notifications")}>
                <Bell size={18} />{unseen.length > 0 && <b className="notification-count">{unseen.length > 9 ? "9+" : unseen.length}</b>}
              </button>
              {menu === "notifications" && <div className="admin-dropdown notification-dropdown">
                <div className="dropdown-head"><strong>Notifications</strong>{unseen.length > 0 && <button onClick={() => patchOrders(unseen.map((order) => order.id), { seen: true })}>Mark all as read</button>}</div>
                {unseen.length === 0 && <p className="dropdown-empty">You&apos;re all caught up. New orders show up here instantly.</p>}
                {unseen.slice(0, 8).map((order) => <button key={order.id} className="dropdown-item" onClick={() => openOrder(order)}>
                  <span className="customer-avatar">{initials(order.customer_name)}</span>
                  <span><strong>New order {orderNo(order.id)}</strong><small>{order.customer_name} · {money(order.subtotal)} · {when(order.created_at)}</small></span>
                </button>)}
                <button className="dropdown-footer" onClick={() => goTo("Orders")}>View all orders</button>
              </div>}
            </div>

            <div className="admin-menu" ref={profileRef}>
              <button className="admin-top-user" onClick={() => setMenu(menu === "profile" ? "" : "profile")} aria-expanded={menu === "profile"}>
                <div className="user-avatar">{initials(admin.name)}</div><span>{admin.name}</span><ChevronDown size={15} />
              </button>
              {menu === "profile" && <div className="admin-dropdown profile-dropdown">
                <div className="profile-card"><div className="user-avatar">{initials(admin.name)}</div><div><strong>{admin.name}</strong><small>{admin.email}</small></div></div>
                <button className="dropdown-item" onClick={() => goTo("Settings")}><SettingsIcon size={15} /> Settings</button>
                <Link className="dropdown-item" href="/"><Store size={15} /> View storefront</Link>
                <button className="dropdown-item danger" onClick={signOut}><LogOut size={15} /> Sign out</button>
              </div>}
            </div>
          </div>
        </header>

        <div className="admin-page-content">
          <div className="admin-title-row">
            <div>
              <p className="admin-date">{today()}</p>
              <h1>{tab === "Overview" ? `${greeting()}, ${firstName}.` : tab}</h1>
              <p>{tab === "Overview" ? (unseen.length ? `You have ${unseen.length} new ${unseen.length === 1 ? "order" : "orders"} to review.` : "Here's what's happening with your store.") : subtitles[tab]}</p>
            </div>
            {tab === "Products" && <button className="admin-primary-button" onClick={() => setEditor("new")}><PackagePlus size={17} /> Add product</button>}
          </div>
          {notice && <div className={notice.error ? "admin-notice admin-notice-error" : "admin-notice"} role="status">{notice.text}</div>}

          {tab === "Overview" && <Overview orders={orders} products={products} loading={loading.orders || loading.products} days={days} setDays={setDays} onOpenOrder={openOrder} goTo={goTo} onStockAlert={(view) => { setStockView(view); goTo("Products", ""); }} />}
          {tab === "Orders" && <Orders orders={orders} loading={loading.orders} filter={filters.Orders} setFilter={(value) => setFilters((current) => ({ ...current, Orders: value }))} status={orderStatus} setStatus={setOrderStatus} onOpenOrder={openOrder} onStatus={changeStatus} />}
          {tab === "Invoices" && <Invoices orders={orders} loading={loading.orders} filter={filters.Invoices} setFilter={(value) => setFilters((current) => ({ ...current, Invoices: value }))} onOpenOrder={openOrder} />}
          {tab === "Reports" && <Reports orders={orders} loading={loading.orders} onOpenOrder={openOrder} />}
          {tab === "Products" && <Products items={products} loading={loading.products} stock={stockView} setStock={setStockView} filter={filters.Products} setFilter={(value) => setFilters((current) => ({ ...current, Products: value }))} onEdit={setEditor} onChanged={reloadProducts} onNotice={flash} />}
          {tab === "Customers" && <Customers orders={orders} loading={loading.orders} filter={filters.Customers} setFilter={(value) => setFilters((current) => ({ ...current, Customers: value }))} onViewOrders={(phone) => goTo("Orders", phone)} />}
          {tab === "Reviews" && <Reviews reviews={reviews} products={products} loading={loading.reviews} onChanged={() => { setReviewsVersion((value) => value + 1); reloadProducts(); }} onNotice={flash} />}
          {tab === "Settings" && <Settings admin={admin} onRenamed={(name) => { setAdmin((current) => ({ ...current, name })); router.refresh(); }} onNotice={flash} />}

          <footer className="admin-footer">© {new Date().getFullYear()} Hearth Living <span>Signed in as {admin.email}</span></footer>
        </div>
      </section>

      {openOrderData && <OrderModal order={openOrderData} onClose={() => setOpenOrderId(null)} onStatus={changeStatus} />}
      {assistantOpen
        ? <ProductAssistant onClose={() => setAssistantOpen(false)} onProductAdded={() => { reloadProducts(); flash("Product added by the assistant."); }} />
        : <button className="admin-primary-button assistant-launcher" onClick={() => setAssistantOpen(true)}><Bot size={16} /> Add with assistant</button>}
      {editor && <ProductEditor key={editor === "new" ? "new" : editor.id} product={editor} onClose={() => setEditor(null)} onSaved={(message) => { setEditor(null); flash(message); reloadProducts(); }} />}
    </main>
  );
}
