"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useProducts } from "@/components/products-provider";
import type { Product } from "@/lib/store";

type CartLine = { product: Product; qty: number };
type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  wishlist: string[];
  drawerOpen: boolean;
  toast: string | null;
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  toggleWish: (id: string) => void;
  clear: () => void;
  openDrawer: (open: boolean) => void;
  user: User | null;
  authOpen: boolean;
  closeAuth: () => void;
  authDone: (user: User) => void;
  requireLogin: (then: () => void) => void;
  signOut: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const products = useProducts();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const pending = useRef<(() => void) | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  // Shows the login popup when signed out; runs `then` right away (or after login) when signed in.
  const requireLogin = (then: () => void) => {
    if (user) return then();
    pending.current = then;
    setAuthOpen(true);
  };
  const closeAuth = () => { pending.current = null; setAuthOpen(false); };
  const authDone = (signedIn: User) => {
    setUser(signedIn);
    setAuthOpen(false);
    const next = pending.current;
    pending.current = null;
    next?.();
  };
  const signOut = async () => { await createClient().auth.signOut(); setUser(null); };

  const lines = products.filter((product) => quantities[product.id]).map((product) => ({ product, qty: quantities[product.id] }));
  const count = lines.reduce((sum, line) => sum + line.qty, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.qty * line.product.price, 0);

  const add = (id: string, qty = 1) => requireLogin(() => {
    setQuantities((current) => ({ ...current, [id]: (current[id] ?? 0) + qty }));
    setToast(products.find((product) => product.id === id)?.name ?? null);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  });
  const setQty = (id: string, qty: number) => setQuantities((current) => {
    const next = { ...current };
    if (qty <= 0) delete next[id];
    else next[id] = qty;
    return next;
  });
  const toggleWish = (id: string) => setWishlist((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);

  const clear = () => setQuantities({});

  return <CartContext value={{ lines, count, subtotal, wishlist, drawerOpen, toast, add, setQty, toggleWish, clear, openDrawer: setDrawerOpen, user, authOpen, closeAuth, authDone, requireLogin, signOut }}>{children}</CartContext>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}
