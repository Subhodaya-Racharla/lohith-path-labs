"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { type Test } from "@/lib/supabase";

export type CartItem = { test: Test };

type CartContextType = {
  items: CartItem[];
  add: (test: Test) => void;
  remove: (testId: string) => void;
  clear: () => void;
  has: (testId: string) => boolean;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const add = (test: Test) =>
    setItems(prev => prev.find(i => i.test.id === test.id) ? prev : [...prev, { test }]);

  const remove = (testId: string) =>
    setItems(prev => prev.filter(i => i.test.id !== testId));

  const clear = () => setItems([]);
  const has = (testId: string) => items.some(i => i.test.id === testId);
  const total = items.reduce((s, i) => s + (i.test.price ?? 0), 0);
  const count = items.length;

  return (
    <CartContext.Provider value={{ items, add, remove, clear, has, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}
