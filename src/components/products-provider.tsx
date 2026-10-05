"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Product } from "@/lib/store";

const ProductsContext = createContext<Product[]>([]);

export const ProductsProvider = ({ products, children }: { products: Product[]; children: ReactNode }) => <ProductsContext value={products}>{children}</ProductsContext>;
export const useProducts = () => useContext(ProductsContext);
