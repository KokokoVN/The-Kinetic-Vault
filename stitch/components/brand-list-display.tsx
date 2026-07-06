"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { type AdminBrand } from "@/lib/api";
import { ClientConfirmSubmitButton } from "@/components/client-confirm-submit-button";

type Props = {
  items: AdminBrand[];
  startIndex: number;
  canWrite: boolean;
  gatewayOrigin: string;
  onDelete: (formData: FormData) => Promise<void>;
};

function getBrandIcon(name: string): { icon: string; gradient: string; glow: string } {
  const n = String(name ?? "").toLowerCase();
  
  if (n.includes("apple") || n.includes("samsung") || n.includes("xiaomi") || n.includes("oppo") || n.includes("sony") || n.includes("lg")) {
    return { icon: "devices", gradient: "from-blue-500 to-cyan-400", glow: "shadow-blue-500/20" };
  }
  if (n.includes("nike") || n.includes("adidas") || n.includes("puma") || n.includes("reebok") || n.includes("fila") || n.includes("lining")) {
    return { icon: "sports_handball", gradient: "from-purple-500 to-pink-500", glow: "shadow-purple-500/20" };
  }
  if (n.includes("logitech") || n.includes("razer") || n.includes("corsair") || n.includes("dareu")) {
    return { icon: "mouse", gradient: "from-amber-500 to-orange-550", glow: "shadow-amber-500/20" };
  }
  if (n.includes("dell") || n.includes("hp") || n.includes("asus") || n.includes("lenovo") || n.includes("acer") || n.includes("msi")) {
    return { icon: "laptop", gradient: "from-indigo-500 to-violet-500", glow: "shadow-indigo-500/20" };
  }
  if (n.includes("nestle") || n.includes("pepsi") || n.includes("coca") || n.includes("heineken")) {
    return { icon: "local_cafe", gradient: "from-rose-400 to-pink-500", glow: "shadow-rose-500/20" };
  }
  
  return { icon: "sell", gradient: "from-emerald-500 to-teal-400", glow: "shadow-emerald-500/20" };
}

export function BrandListDisplay({ items, startIndex, canWrite, gatewayOrigin, onDelete }: Props) {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  useEffect(() => {
    const saved = localStorage.getItem("brand_view_mode");
    if (saved === "grid" || saved === "table") {
      setViewMode(saved);
    }
  }, []);

  const handleToggleView = (mode: "grid" | "table") => {
    setViewMode(mode);
    localStorage.setItem("brand_view_mode", mode);
  };

  return (
    <div className="space-y-6">
      {/* View Toggle */}
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
                ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm"
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
                ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">table_rows</span>
            <span>Dạng bảng</span>
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-200">
          {items.map((brand, idx) => {
            const style = getBrandIcon(brand.name);
            const resolvedLogoUrl = brand.logoUrl
              ? (brand.logoUrl.startsWith("http") ? brand.logoUrl : `${gatewayOrigin}${brand.logoUrl}`)
              : null;
            const stt = startIndex + idx + 1;

            return (
              <div
                key={brand.id}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 p-6 shadow-md hover:shadow-xl dark:shadow-none hover:-translate-y-1 transition-all duration-300 backdrop-blur-xl flex flex-col justify-between min-h-[220px]"
              >
                {/* Top Border Shine */}
                <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${style.gradient}`} />

                {/* Card Header */}
                <div className="flex items-start justify-between gap-4">
                  {/* Brand Logo / Mapped Icon */}
                  {resolvedLogoUrl ? (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-white dark:bg-slate-950 p-2 shadow-inner border border-slate-100 dark:border-slate-850 group-hover:scale-105 transition-transform duration-300">
                      <img src={resolvedLogoUrl} alt={brand.name} className="h-full w-full object-contain" />
                    </div>
                  ) : (
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${style.gradient} text-white shadow-lg ${style.glow} group-hover:scale-110 transition-transform duration-300`}>
                      <span className="material-symbols-outlined text-2xl">{style.icon}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/admin/brands/${brand.id}`}
                      title="Chi tiết"
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 hover:bg-purple-50 dark:bg-slate-800 dark:hover:bg-purple-900/30 text-slate-450 hover:text-purple-600 dark:hover:text-purple-400 border border-slate-100 dark:border-slate-700 transition-colors shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                    </Link>
                    {canWrite && (
                      <>
                        <Link
                          href={`/admin/brands/${brand.id}/edit`}
                          title="Sửa"
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-900/30 text-slate-450 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-100 dark:border-slate-700 transition-colors shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </Link>
                        <Link
                          href={`/admin/brands/${brand.id}/delete`}
                          title="Xóa"
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-900/30 text-slate-450 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-100 dark:border-slate-700 transition-all shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="mt-4 flex-1">
                  <h3 className="font-headline text-base sm:text-lg font-black text-slate-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                    {brand.name}
                  </h3>
                  <div className="mt-2.5 space-y-1.5">
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">ID #{brand.id}</span>
                      <span> · Thứ tự: {stt}</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {brand.description || <span className="italic opacity-60">Chưa có thông tin mô tả.</span>}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-5 border-t border-slate-100 dark:border-slate-800/80 pt-3 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Thương hiệu phân loại</span>
                  <span className="material-symbols-outlined text-xs">workspace_premium</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <section className="overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/60 shadow-xl shadow-blue-900/5 dark:shadow-none backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-4 sm:px-6 py-5 text-right text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 w-16">
                    STT
                  </th>
                  <th className="px-4 sm:px-6 py-5 text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                    Logo
                  </th>
                  <th className="px-4 sm:px-6 py-5 text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                    Tên thương hiệu
                  </th>
                  <th className="px-4 sm:px-6 py-5 text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                    Mô tả
                  </th>
                  <th className="px-4 sm:px-6 py-5 text-right text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((brand, idx) => {
                  const resolvedLogoUrl = brand.logoUrl
                    ? (brand.logoUrl.startsWith("http") ? brand.logoUrl : `${gatewayOrigin}${brand.logoUrl}`)
                    : null;
                  const stt = startIndex + idx + 1;

                  return (
                    <tr key={brand.id} className="group transition-colors hover:bg-slate-55/50 dark:hover:bg-slate-900/40">
                      <td className="px-4 sm:px-6 py-4 text-right font-mono text-xs text-slate-400 dark:text-slate-500">
                        {stt}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        {resolvedLogoUrl ? (
                          <img
                            src={resolvedLogoUrl}
                            alt={brand.name}
                            className="h-10 w-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 object-contain p-1 shadow-sm"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-slate-200/50 dark:border-slate-800 shadow-inner">
                            <span className="material-symbols-outlined text-sm">sell</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-headline text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-650 dark:group-hover:text-purple-400 transition-colors">
                            {brand.name}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                            ID: #{brand.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {brand.description ?? "—"}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/brands/${brand.id}`}
                            title="Xem chi tiết"
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all hover:scale-105 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </Link>
                          {canWrite && (
                            <>
                              <Link
                                href={`/admin/brands/${brand.id}/edit`}
                                title="Chỉnh sửa"
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all hover:scale-105 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </Link>
                              <Link
                                href={`/admin/brands/${brand.id}/delete`}
                                title="Xóa"
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all hover:scale-105 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-455"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </Link>
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
