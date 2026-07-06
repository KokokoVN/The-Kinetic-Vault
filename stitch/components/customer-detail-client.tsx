"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

export function ActionSubmitButton({ children, pendingText, className, ...props }: any) {
  const { pending } = useFormStatus();
  return (
    <button
      {...props}
      disabled={pending || props.disabled}
      className={className || "h-10 w-full rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-700 hover:shadow-blue-600/40 active:scale-95 disabled:pointer-events-none disabled:opacity-50"}
    >
      {pending && pendingText ? pendingText : children}
    </button>
  );
}

interface CustomerDetailTabsProps {
  overviewContent: React.ReactNode;
  ordersContent: React.ReactNode;
  addressesContent: React.ReactNode;
  devicesContent: React.ReactNode;
}

export function CustomerDetailTabs({ overviewContent, ordersContent, addressesContent, devicesContent }: CustomerDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "addresses" | "devices">("overview");

  const tabs = [
    { id: "overview", label: "Tổng quan", icon: "person" },
    { id: "orders", label: "Lịch sử mua hàng", icon: "shopping_bag" },
    { id: "addresses", label: "Địa chỉ đã lưu", icon: "home_pin" },
    { id: "devices", label: "Thiết bị", icon: "devices" },
  ] as const;

  return (
    <div>
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 dark:bg-slate-800/50 hover:text-slate-900 dark:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === "overview" && overviewContent}
        {activeTab === "orders" && ordersContent}
        {activeTab === "addresses" && addressesContent}
        {activeTab === "devices" && devicesContent}
      </div>
    </div>
  );
}
