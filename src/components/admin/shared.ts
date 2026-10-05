export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type OrderItem = { id: string; name: string; price: number; qty: number; image: string | null };
export type Order = {
  id: number; customer_name: string; phone: string; address: string; items: OrderItem[];
  subtotal: number; status: OrderStatus; seen: boolean; created_at: string;
};
export type DbProduct = {
  id: string; name: string; type: string; category: string; sub: string; price: number;
  image_url: string | null; image_public_id: string | null; stock: number; sku: string | null; tag: string | null;
};
export type Customer = { key: string; name: string; phone: string; address: string; orders: Order[]; spent: number; last: string };
export type AdminProfile = { user_id: string; email: string; name: string; role: "owner" | "staff" };
export type Review = { id: number; product_id: string; order_id: number | null; reviewer: string; rating: number; comment: string; created_at: string };
export type Tab = "Overview" | "Orders" | "Products" | "Customers" | "Invoices" | "Reports" | "Reviews" | "Settings";

export const statuses: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];
export type StockView = "all" | "low" | "out";
export const LOW_STOCK = 5;

export const orderNo = (id: number) => `#HW-${id}`;
export const label = (status: string) => status[0].toUpperCase() + status.slice(1);
export const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "?";
export const phoneKey = (phone: string) => phone.replace(/\D/g, "").replace(/^92/, "0");
export const isLive = (order: Order) => order.status !== "cancelled";

const dayFormat = new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short" });
const timeFormat = new Intl.DateTimeFormat("en-PK", { hour: "numeric", minute: "2-digit" });
export const shortDate = (date: Date) => dayFormat.format(date);
export function when(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const time = timeFormat.format(date).toLowerCase();
  if (date.toDateString() === today.toDateString()) return `Today, ${time}`;
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
  return `${dayFormat.format(date)}, ${time}`;
}

export const includes = (query: string, ...fields: (string | number | null | undefined)[]) => {
  const term = query.trim().toLowerCase();
  return !term || fields.some((field) => field != null && String(field).toLowerCase().includes(term));
};
export const orderMatches = (order: Order, query: string) =>
  includes(query, orderNo(order.id), order.id, order.customer_name, order.phone, order.address) ||
  (!!query.trim() && phoneKey(query).length > 3 && phoneKey(order.phone).includes(phoneKey(query)));

/** Groups orders into customers by phone number (orders are guest checkouts, so phone is the identity). */
export function customersFrom(orders: Order[]): Customer[] {
  const byPhone = new Map<string, Customer>();
  for (const order of orders) {
    const key = phoneKey(order.phone);
    const customer = byPhone.get(key);
    if (!customer) {
      byPhone.set(key, { key, name: order.customer_name, phone: order.phone, address: order.address, orders: [order], spent: isLive(order) ? order.subtotal : 0, last: order.created_at });
      continue;
    }
    customer.orders.push(order);
    if (isLive(order)) customer.spent += order.subtotal;
    if (order.created_at > customer.last) Object.assign(customer, { last: order.created_at, name: order.customer_name, address: order.address });
  }
  return [...byPhone.values()].sort((a, b) => b.last.localeCompare(a.last));
}
