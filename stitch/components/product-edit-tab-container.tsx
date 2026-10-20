"use client";

import React, { useState, useEffect } from "react";

export type ProductEditTab = "basic" | "media" | "specs" | "variants" | "matrix" | "all";

interface ProductEditTabContainerProps {
  mediaCount: number;
  specsCount: number;
  variantsCount: number;
  children: {
    basic: React.ReactNode;
    media: React.ReactNode;
    specs: React.ReactNode;
    variants: React.ReactNode;
    matrix: React.ReactNode;
  };
}

export function ProductEditTabContainer({
  mediaCount,
  specsCount,
  variantsCount,
  children,
}: ProductEditTabContainerProps) {
  const [activeTab, setActiveTab] = useState<ProductEditTab>("basic");

  // Sync tab with URL hash if present
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === "#section-basic") setActiveTab("basic");
      else if (hash === "#section-media") setActiveTab("media");
      else if (hash === "#section-specs") setActiveTab("specs");
      else if (hash === "#section-variants") setActiveTab("variants");
      else if (hash === "#section-matrix") setActiveTab("matrix");
      else if (hash === "#section-all") setActiveTab("all");
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const switchTab = (tab: ProductEditTab) => {
    setActiveTab(tab);
    if (tab === "all") {
      window.history.replaceState(null, "", "#section-all");
    } else {
      window.history.replaceState(null, "", `#section-${tab}`);
    }
  };

  // Keyboard Shortcuts (Alt+1..5 to switch tabs, Ctrl+S to save)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S / Cmd+S: Trigger save on current active form
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        const activeContainer = document.getElementById(`section-${activeTab}`);
        const submitBtn = activeContainer?.querySelector('button[type="submit"]') as HTMLButtonElement | null;
        if (submitBtn && !submitBtn.disabled) {
          submitBtn.click();
        }
      }

      // Alt+1..5 to switch tabs
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.key === "1") { e.preventDefault(); switchTab("basic"); }
        else if (e.key === "2") { e.preventDefault(); switchTab("media"); }
        else if (e.key === "3") { e.preventDefault(); switchTab("specs"); }
        else if (e.key === "4") { e.preventDefault(); switchTab("variants"); }
        else if (e.key === "5") { e.preventDefault(); switchTab("matrix"); }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab]);

  const tabs: { id: ProductEditTab; label: string; icon: string; count?: number; shortcut: string }[] = [
    { id: "basic", label: "Thông tin cơ bản", icon: "edit_square", shortcut: "Alt+1" },
    { id: "media", label: "Ảnh & Video", icon: "perm_media", count: mediaCount, shortcut: "Alt+2" },
    { id: "specs", label: "Thông số kỹ thuật", icon: "settings", count: specsCount, shortcut: "Alt+3" },
    { id: "variants", label: "Danh sách biến thể", icon: "style", count: variantsCount, shortcut: "Alt+4" },
    { id: "matrix", label: "Tạo ma trận biến thể", icon: "grid_on", shortcut: "Alt+5" },
  ];

  return (
    <div className="space-y-6">
      {/* ── Sticky Tab Navigation Bar ── */}
      <div className="sticky top-4 z-30 -mx-1 px-2 py-2 backdrop-blur-xl bg-white/95 dark:bg-zinc-900/95 border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xl shadow-slate-900/5 transition-all">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Main Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs font-bold">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => switchTab(tab.id)}
                  title={`${tab.label} (Phím tắt: ${tab.shortcut})`}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]"
                      : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/80 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[16px] ${
                      isActive ? "text-white" : "text-slate-500 dark:text-zinc-400"
                    }`}
                  >
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                        isActive
                          ? "bg-white/25 text-white"
                          : "bg-slate-200/80 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* View mode toggle (Tabs vs Show All) */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-zinc-800/80 p-1 text-[11px] font-bold text-slate-600 dark:text-zinc-400 border border-slate-200/60 dark:border-white/5 ml-auto">
            <button
              type="button"
              onClick={() => {
                if (activeTab === "all") switchTab("basic");
              }}
              className={`rounded-lg px-2.5 py-1 transition-all flex items-center gap-1 ${
                activeTab !== "all"
                  ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-xs font-black"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Chế độ thẻ gọn gàng: Chỉ hiển thị phần đang chọn"
            >
              <span className="material-symbols-outlined text-[14px]">tab</span>
              <span>Gọn theo thẻ</span>
            </button>
            <button
              type="button"
              onClick={() => switchTab("all")}
              className={`rounded-lg px-2.5 py-1 transition-all flex items-center gap-1 ${
                activeTab === "all"
                  ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-xs font-black"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Chế độ cuộn: Hiển thị tất cả các mục"
            >
              <span className="material-symbols-outlined text-[14px]">view_agenda</span>
              <span>Xem tất cả</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Section Contents (Preserves DOM state so unsaved form drafts aren't lost) ── */}
      <div className="space-y-8">
        {/* Section 1: Basic Info */}
        <div
          id="section-basic"
          className={activeTab === "basic" || activeTab === "all" ? "block animate-in fade-in duration-300" : "hidden"}
        >
          {children.basic}
        </div>

        {/* Section 2: Media */}
        <div
          id="section-media"
          className={activeTab === "media" || activeTab === "all" ? "block animate-in fade-in duration-300" : "hidden"}
        >
          {children.media}
        </div>

        {/* Section 3: Specs */}
        <div
          id="section-specs"
          className={activeTab === "specs" || activeTab === "all" ? "block animate-in fade-in duration-300" : "hidden"}
        >
          {children.specs}
        </div>

        {/* Section 4: Variants */}
        <div
          id="section-variants"
          className={activeTab === "variants" || activeTab === "all" ? "block animate-in fade-in duration-300" : "hidden"}
        >
          {children.variants}
        </div>

        {/* Section 5: Matrix */}
        <div
          id="section-matrix"
          className={activeTab === "matrix" || activeTab === "all" ? "block animate-in fade-in duration-300" : "hidden"}
        >
          {children.matrix}
        </div>
      </div>
    </div>
  );
}
