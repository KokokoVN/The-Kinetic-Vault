"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export type CompareItem = {
  id: number;
  title: string;
  image: string;
  price: number | string;
  originalPrice?: number | string | null;
  category?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
};

type ProductCompareContextType = {
  items: CompareItem[];
  addToCompare: (item: CompareItem) => boolean;
  removeFromCompare: (id: number) => void;
  clearCompare: () => void;
  isInCompare: (id: number) => boolean;
  toggleCompare: (item: CompareItem) => void;
  isOpenBar: boolean;
  setIsOpenBar: (open: boolean) => void;
};

const ProductCompareContext = createContext<ProductCompareContextType | undefined>(undefined);

const STORAGE_KEY = "the_kinetic_vault_compare_v1";
const MAX_COMPARE_ITEMS = 4;

export function ProductCompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([]);
  const [isOpenBar, setIsOpenBar] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed.slice(0, MAX_COMPARE_ITEMS));
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, isLoaded]);

  const isInCompare = (id: number) => {
    return items.some((item) => Number(item.id) === Number(id));
  };

  const addToCompare = (item: CompareItem): boolean => {
    const numId = Number(item.id);
    if (isInCompare(numId)) {
      toast.info("Sản phẩm đã có trong danh sách so sánh", {
        description: item.title,
      });
      return false;
    }

    if (items.length >= MAX_COMPARE_ITEMS) {
      toast.warning(`Chỉ có thể so sánh tối đa ${MAX_COMPARE_ITEMS} sản phẩm cùng lúc`, {
        description: "Vui lòng gỡ bớt 1 sản phẩm để thêm sản phẩm mới.",
      });
      return false;
    }

    setItems((prev) => [...prev, item]);
    setIsOpenBar(true);
    toast.success("Đã thêm vào danh sách so sánh", {
      description: item.title,
    });
    return true;
  };

  const removeFromCompare = (id: number) => {
    const numId = Number(id);
    setItems((prev) => {
      const filtered = prev.filter((item) => Number(item.id) !== numId);
      return filtered;
    });
    toast.info("Đã xóa khỏi danh sách so sánh");
  };

  const clearCompare = () => {
    setItems([]);
    toast.info("Đã xóa toàn bộ danh sách so sánh");
  };

  const toggleCompare = (item: CompareItem) => {
    const numId = Number(item.id);
    if (isInCompare(numId)) {
      removeFromCompare(numId);
    } else {
      addToCompare(item);
    }
  };

  return (
    <ProductCompareContext.Provider
      value={{
        items,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        toggleCompare,
        isOpenBar,
        setIsOpenBar,
      }}
    >
      {children}
    </ProductCompareContext.Provider>
  );
}

export function useProductCompare() {
  const context = useContext(ProductCompareContext);
  if (!context) {
    throw new Error("useProductCompare must be used within a ProductCompareProvider");
  }
  return context;
}
