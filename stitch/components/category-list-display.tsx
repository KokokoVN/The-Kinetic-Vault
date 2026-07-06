"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { type BackendCategory } from "@/lib/api";
import { CategoryDeleteButton } from "@/components/category-delete-button";

type Props = {
  items: BackendCategory[];
  start: number;
  canWrite: boolean;
  onRestore: (formData: FormData) => Promise<void>;
};

function getCategoryIcon(name: string): { icon: string; gradient: string; glow: string } {
  const n = String(name ?? "").toLowerCase();
  
  if (n.includes("điện thoại") || n.includes("phone") || n.includes("mobile") || n.includes("tai nghe") || n.includes("phụ kiện")) {
    return { icon: "devices", gradient: "from-blue-500 to-cyan-400", glow: "shadow-blue-500/20" };
  }
  if (n.includes("áo") || n.includes("quần") || n.includes("thời trang") || n.includes("giày") || n.includes("apparel") || n.includes("fashion")) {
    return { icon: "apparel", gradient: "from-purple-500 to-pink-500", glow: "shadow-purple-500/20" };
  }
  if (n.includes("bếp") || n.includes("nồi") || n.includes("gia dụng") || n.includes("chén") || n.includes("kitchen") || n.includes("dining")) {
    return { icon: "kitchen", gradient: "from-amber-500 to-orange-550", glow: "shadow-amber-500/20" };
  }
  if (n.includes("mỹ phẩm") || n.includes("son") || n.includes("phấn") || n.includes("skincare") || n.includes("beauty")) {
    return { icon: "face", gradient: "from-rose-400 to-pink-500", glow: "shadow-rose-500/20" };
  }
  if (n.includes("sách") || n.includes("vở") || n.includes("bút") || n.includes("book") || n.includes("stationery")) {
    return { icon: "menu_book", gradient: "from-emerald-500 to-teal-400", glow: "shadow-emerald-500/20" };
  }
  if (n.includes("thể thao") || n.includes("dã ngoại") || n.includes("xe đạp") || n.includes("sports") || n.includes("outdoor")) {
    return { icon: "sports_soccer", gradient: "from-teal-500 to-cyan-500", glow: "shadow-teal-500/20" };
  }
  
  // default
  return { icon: "category", gradient: "from-indigo-500 to-violet-500", glow: "shadow-indigo-500/20" };
}

export function CategoryListDisplay({ items, start, canWrite, onRestore }: Props) {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Load view mode from localStorage to persist user preference
  useEffect(() => {
    const saved = localStorage.getItem("category_view_mode");
    if (saved === "grid" || saved === "table") {
      setViewMode(saved);
    }
  }, []);

  const handleToggleView = (mode: "grid" | "table") => {
    setViewMode(mode);
    localStorage.setItem("category_view_mode", mode);
  };

  return (
    <div className="space-y-6">
      {/* View Mode Toggle Controls */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Chế độ hiển thị
        </span>
        <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-900/70 p-1 border border-slate-200/50 dark:border-slate-800">
          <button
            type="button"
            onClick={() => handleToggleView("grid")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              viewMode === "grid"
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">grid_view</span>
            <span>Dạng lưới</span>
          </button>
          <button
            type="button"
            onClick={() => handleToggleView("table")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              viewMode === "table"
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">table_rows</span>
            <span>Dạng bảng</span>
          </button>
        </div>
      </div>

      {/* Grid View Mode */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-200">
          {items.map((c, index) => {
            const isDeleted = c.deletedAt != null;
            const style = getCategoryIcon(c.name);
            const stt = start + index + 1;
            
            return (
              <div 
                key={c.id} 
                className="group relative overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 p-6 shadow-md hover:shadow-xl dark:shadow-none hover:-translate-y-1 transition-all duration-300 backdrop-blur-xl flex flex-col justify-between min-h-[220px]"
              >
                {/* Visual Top Glow Shine */}
                <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${style.gradient}`} />
                
                {/* Card Header */}
                <div className="flex items-start justify-between gap-4">
                  {/* Category Mapped Icon */}
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${style.gradient} text-white shadow-lg ${style.glow} group-hover:scale-110 transition-transform duration-300`}>
                    <span className="material-symbols-outlined text-2xl">{style.icon}</span>
                  </div>
                  
                  {/* Action Buttons overlay or standard */}
                  <div className="flex items-center gap-1">
                    {!isDeleted ? (
                      <>
                        <Link
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-900/30 text-slate-450 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-100 dark:border-slate-700 transition-colors shadow-sm"
                          href={`/admin/categories/${c.id}`}
                          title="Chi tiết"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                        </Link>
                        {canWrite ? (
                          <>
                            <Link
                              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-900/30 text-slate-455 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-100 dark:border-slate-700 transition-colors shadow-sm"
                              href={`/admin/categories/${c.id}/edit`}
                              title="Sửa"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </Link>
                            <CategoryDeleteButton 
                              categoryId={c.id} 
                              categoryName={c.name} 
                              className="group flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-900/30 text-slate-455 hover:text-rose-600 dark:hover:text-rose-450 border border-slate-100 dark:border-slate-700 transition-colors shadow-sm" 
                            />
                          </>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <Link
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-900/30 text-slate-450 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-100 dark:border-slate-700 transition-colors shadow-sm"
                          href={`/admin/categories/${c.id}`}
                          title="Chi tiết"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                        </Link>
                        {canWrite ? (
                          <form action={onRestore}>
                            <input type="hidden" name="_categoryId" value={String(c.id)} />
                            <button
                              type="submit"
                              className="flex h-8 items-center gap-1 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 px-2.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 transition-all hover:scale-105 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 shadow-sm"
                              title="Khôi phục danh mục"
                            >
                              <span className="material-symbols-outlined text-xs">settings_backup_restore</span>
                              <span>Khôi phục</span>
                            </button>
                          </form>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="mt-4 flex-1">
                  <h3 className="font-headline text-base sm:text-lg font-black text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {c.name}
                  </h3>
                  <div className="mt-2.5 space-y-1.5">
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
                      <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">ID #{c.id}</span>
                      <span>· Thứ tự: {stt}</span>
                    </p>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate bg-slate-50 dark:bg-slate-800/40 px-2.5 py-1 rounded-lg border border-slate-200/40 dark:border-slate-800">
                      slug: {c.slug ?? "—"}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-5 border-t border-slate-100 dark:border-slate-800/80 pt-3.5 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                    isDeleted 
                      ? "bg-rose-100 dark:bg-rose-500/10 text-rose-800 dark:text-rose-450 border border-rose-250/20" 
                      : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-450 border border-emerald-250/20"
                  }`}>
                    <span className={`h-1 w-1 rounded-full ${isDeleted ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 animate-ping'}`} />
                    {isDeleted ? "Đã ẩn" : "Hoạt động"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {isDeleted ? "Ẩn danh mục" : "Hiển thị công khai"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View Mode */
        <section className="overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/60 shadow-xl shadow-blue-900/5 dark:shadow-none backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200/60 dark:border-slate-800/60">
                  <th className="px-4 sm:px-6 py-5 text-right text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 w-16">
                    STT
                  </th>
                  <th className="px-4 sm:px-6 py-5 text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                    Danh mục
                  </th>
                  <th className="px-4 sm:px-6 py-5 text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                    Slug
                  </th>
                  <th className="px-4 sm:px-6 py-5 text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                    Trạng thái
                  </th>
                  <th className="px-4 sm:px-6 py-5 text-center text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                    Ẩn/Hiện
                  </th>
                  <th className="px-4 sm:px-6 py-5 text-right text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((c, index) => {
                  const isDeleted = c.deletedAt != null;
                  const stt = start + index + 1;
                  return (
                    <tr key={c.id} className="group transition-colors hover:bg-slate-55/50 dark:hover:bg-slate-900/40">
                      <td className="px-4 sm:px-6 py-4 text-right font-mono text-xs uppercase tracking-tight text-slate-400 dark:text-slate-500">
                        {stt}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 shadow-inner">
                            <span className="material-symbols-outlined text-xl">category</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-headline text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {c.name}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                              ID: #{c.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 sm:px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                        {c.slug ? (
                          <span className="rounded-lg bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 border border-slate-200/50 dark:border-slate-800">
                            {c.slug}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${
                          isDeleted 
                            ? "bg-rose-100 dark:bg-rose-500/10 text-rose-800 dark:text-rose-450 border border-rose-200/30" 
                            : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-455 border border-emerald-200/30"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${isDeleted ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                          {isDeleted ? "Đã ẩn" : "Hoạt động"}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-center">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${
                          isDeleted 
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400" 
                            : "bg-blue-150 dark:bg-blue-500/10 text-blue-800 dark:text-blue-400"
                        }`}>
                          {isDeleted ? "Ẩn" : "Hiện"}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isDeleted ? (
                            <>
                              <Link
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all hover:scale-105 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
                                href={`/admin/categories/${c.id}`}
                                title="Xem chi tiết"
                              >
                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                              </Link>
                              {canWrite ? (
                                <>
                                  <Link
                                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all hover:scale-105 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400"
                                    href={`/admin/categories/${c.id}/edit`}
                                    title="Sửa"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                  </Link>
                                  <CategoryDeleteButton 
                                    categoryId={c.id} 
                                    categoryName={c.name} 
                                    className="group flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all hover:scale-105 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400" 
                                  />
                                </>
                              ) : null}
                            </>
                          ) : (
                            <>
                              <Link
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all hover:scale-105 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
                                href={`/admin/categories/${c.id}`}
                                title="Xem chi tiết"
                              >
                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                              </Link>
                              {canWrite ? (
                                <form action={onRestore}>
                                  <input type="hidden" name="_categoryId" value={String(c.id)} />
                                  <button
                                    type="submit"
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-400 transition-all hover:scale-105 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
                                    title="Khôi phục danh mục"
                                  >
                                    <span className="material-symbols-outlined text-sm">settings_backup_restore</span>
                                    <span>Khôi phục</span>
                                  </button>
                                </form>
                              ) : null}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
