"use client";

import { useState } from "react";
import { UiProduct } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { AddToCartButton } from "@/components/add-to-cart-button";

type ProductTabsProps = {
  newProducts: UiProduct[];
  hotProducts: UiProduct[];
  saleProducts: (UiProduct & { originalPrice?: number; badges?: string[] })[];
  isLoggedIn: boolean;
};

export function ProductTabs({ newProducts, hotProducts, saleProducts, isLoggedIn }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<"new" | "hot" | "sale">("new");

  let currentProducts: (UiProduct & { originalPrice?: number; badges?: string[] })[] = [];
  if (activeTab === "new") {
    currentProducts = newProducts.map((p) => ({ ...p, badges: ["MỚI"] }));
  } else if (activeTab === "hot") {
    currentProducts = hotProducts.map((p) => ({ ...p, badges: ["HOT"] }));
  } else if (activeTab === "sale") {
    currentProducts = saleProducts;
  }

  return (
    <div className="w-full">
      {/* Tabs Header */}
      <div className="mb-10 flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => setActiveTab("new")}
          className={`rounded-full px-6 py-3 font-bold transition-all ${
            activeTab === "new"
              ? "bg-primary text-white shadow-lg"
              : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          Sản phẩm Mới
        </button>
        <button
          onClick={() => setActiveTab("hot")}
          className={`rounded-full px-6 py-3 font-bold transition-all ${
            activeTab === "hot"
              ? "bg-secondary-container text-on-secondary-fixed shadow-lg"
              : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          Bán Chạy
        </button>
        {saleProducts.length > 0 && (
          <button
            onClick={() => setActiveTab("sale")}
            className={`rounded-full px-6 py-3 font-bold transition-all ${
              activeTab === "sale"
                ? "bg-error text-white shadow-lg"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            Khuyến Mãi
          </button>
        )}
      </div>

      {/* Tabs Content */}
      {currentProducts.length === 0 ? (
        <div className="py-20 text-center text-on-surface-variant">
          <p className="text-lg">Hiện chưa có sản phẩm nào trong mục này.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {currentProducts.map((item) => (
            <ProductCard
              key={item.id}
              href={`/product/${item.id}`}
              image={item.heroImage}
              title={item.name}
              subtitle={item.subtitle}
              price={item.price} // This will be the sale price if it's a sale product
              originalPrice={item.originalPrice} // Render crossed out price
              badges={item.badges}
              hasVariantPriceRange={item.hasVariantPriceRange}
              minPrice={item.minPrice}
              maxPrice={item.maxPrice}
              footer={
                <AddToCartButton
                  productId={String(item.id)}
                  hasVariants={Boolean(item.hasVariantPriceRange)}
                  isLoggedIn={isLoggedIn}
                />
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
