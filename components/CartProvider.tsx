"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import type { CartItem, CustomDesign } from "@/lib/types";

type CartContextType = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  hydrated: boolean;
};

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "thewearco.cart.v2";

/** Strip heavy data URLs before writing to localStorage. */
function sanitizeForStorage(items: CartItem[]): CartItem[] {
  return items.map((item) => {
    const custom: CustomDesign | undefined = item.custom
      ? {
          text: item.custom.text,
          textColor: item.custom.textColor,
          font: item.custom.font,
          imageUrl: item.custom.imageUrl,
          posX: item.custom.posX,
          posY: item.custom.posY,
          scale: item.custom.scale,
          rotation: item.custom.rotation
        }
      : undefined;
    return {
      id: item.id,
      slug: item.slug,
      name: item.name,
      price: item.price,
      qty: item.qty,
      size: item.size,
      color: item.color,
      colorHex: item.colorHex,
      fabricHex: item.fabricHex,
      category: item.category,
      custom
    };
  });
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("thewearco.cart.v1");
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        setItems(sanitizeForStorage(parsed));
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeForStorage(items)));
    } catch (e) {
      console.warn("Cart could not be saved (storage full?)", e);
    }
  }, [items, hydrated]);

  const add = useCallback((item: CartItem) => {
    const clean: CartItem = {
      ...item,
      thumbnailDataUrl: undefined,
      custom: item.custom
        ? {
            text: item.custom.text,
            textColor: item.custom.textColor,
            font: item.custom.font,
            imageUrl: item.custom.imageUrl,
            posX: item.custom.posX,
            posY: item.custom.posY,
            scale: item.custom.scale,
            rotation: item.custom.rotation
          }
        : undefined
    };
    setItems((prev) => {
      const dedupKey = clean.custom ? null : `${clean.slug}-${clean.size}-${clean.color}`;
      if (dedupKey) {
        const existing = prev.find(
          (i) => !i.custom && `${i.slug}-${i.size}-${i.color}` === dedupKey
        );
        if (existing) {
          return prev.map((i) =>
            i.id === existing.id ? { ...i, qty: i.qty + clean.qty } : i
          );
        }
      }
      return [...prev, clean];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i))
        .filter((i) => i.qty > 0)
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.price * i.qty, 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, add, remove, updateQty, clear, count, subtotal, hydrated }),
    [items, add, remove, updateQty, clear, count, subtotal, hydrated]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
