import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface CartItem {
  id: string;
  title: string;
  priceKopecks: number;
  priceFrom: boolean;
  image: string;
  qty: number;
  available: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotalKopecks: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const STORAGE_KEY = "mugan_cart";

const CartContext = createContext<CartContextValue | null>(null);

function loadInitial(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(loadInitial);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem: CartContextValue["addItem"] = (item, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        const nextQty = Math.min(existing.qty + qty, Math.max(item.available, existing.qty));
        return prev.map((i) => (i.id === item.id ? { ...i, qty: nextQty } : i));
      }
      return [...prev, { ...item, qty: Math.max(1, Math.min(qty, item.available || qty)) }];
    });
    setIsOpen(true);
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const updateQty = (id: string, qty: number) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(qty, i.available)) } : i)),
    );

  const clear = () => setItems([]);

  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);
  const subtotalKopecks = useMemo(
    () => items.reduce((sum, i) => sum + i.priceKopecks * i.qty, 0),
    [items],
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        clear,
        count,
        subtotalKopecks,
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
