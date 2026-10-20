"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { type AdminBrand } from "@/lib/api";
import { 
  LayoutGrid, 
  List, 
  Eye, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  ExternalLink, 
  Globe, 
  Package, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  X
} from "lucide-react";

type Props = {
  items: AdminBrand[];
  startIndex: number;
  canWrite: boolean;
  gatewayOrigin: string;
  onDelete: (formData: FormData) => Promise<void>;
  onRestore?: (formData: FormData) => Promise<void>;
};

function getCountryFlag(country?: string | null): string {
  if (!country) return "🌐";
  const c = country.toLowerCase().trim();
  if (c.includes("mỹ") || c.includes("usa") || c.includes("united states")) return "🇺🇸";
  if (c.includes("nhật") || c.includes("japan")) return "🇯🇵";
  if (c.includes("hàn") || c.includes("korea")) return "🇰🇷";
  if (c.includes("việt") || c.includes("vietnam")) return "🇻🇳";
  if (c.includes("đức") || c.includes("germany")) return "🇩🇪";
  if (c.includes("thụy sĩ") || c.includes("switzerland")) return "🇨🇭";
  if (c.includes("pháp") || c.includes("france")) return "🇫🇷";
  if (c.includes("ý") || c.includes("italy")) return "🇮🇹";
  if (c.includes("anh") || c.includes("uk") || c.includes("england")) return "🇬🇧";
  if (c.includes("trung") || c.includes("china")) return "🇨🇳";
  if (c.includes("đài") || c.includes("taiwan")) return "🇹🇼";
  if (c.includes("đan mạch") || c.includes("denmark")) return "🇩🇰";
  return "🌐";
}

function getBrandGradient(name: string): string {
  const n = String(name ?? "").toLowerCase();
  if (n.includes("apple")) return "from-slate-800 to-slate-950";
  if (n.includes("sony")) return "from-zinc-900 via-neutral-800 to-zinc-900";
  if (n.includes("samsung")) return "from-blue-600 to-indigo-800";
  if (n.includes("dell")) return "from-sky-600 to-blue-800";
  if (n.includes("logitech")) return "from-teal-600 to-emerald-800";
  if (n.includes("asus") || n.includes("rog")) return "from-rose-600 to-red-800";
  if (n.includes("keychron")) return "from-orange-600 to-amber-700";
  if (n.includes("razer")) return "from-emerald-500 to-green-700";
  return "from-indigo-600 to-purple-800";
}

export function BrandListDisplay({
  items,
  startIndex,
  canWrite,
  gatewayOrigin,
  onDelete,
  onRestore,
}: Props) {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [confirmRestoreId, setConfirmRestoreId] = useState<number | null>(null);

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
      {/* View Switcher Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Hiển thị:
          </span>
          <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/40 px-2.5 py-0.5 text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
            {items.length} thương hiệu
          </span>
        </div>

        <div className="inline-flex rounded-2xl bg-slate-100/90 dark:bg-zinc-900/90 p-1 border border-slate-200/80 dark:border-white/10 shadow-xs">
          <button
            type="button"
            onClick={() => handleToggleView("grid")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              viewMode === "grid"
                ? "bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-300 shadow-sm"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Bento Cards</span>
          </button>
          <button
            type="button"
            onClick={() => handleToggleView("table")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              viewMode === "table"
                ? "bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-300 shadow-sm"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            <span>Bảng Dữ Liệu</span>
          </button>
        </div>
      </div>

      {/* ==================== BENTO GRID VIEW ==================== */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-300">
          {items.map((brand, idx) => {
            const isDeleted = brand.deletedAt != null;
            const flag = getCountryFlag(brand.country);
            const gradient = getBrandGradient(brand.name);
            const resolvedLogoUrl = brand.logoUrl
              ? brand.logoUrl.startsWith("http")
                ? brand.logoUrl
                : `${gatewayOrigin}${brand.logoUrl}`
              : null;
            const stt = startIndex + idx + 1;

            return (
              <div
                key={brand.id}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isDeleted
                    ? "border-rose-200/80 dark:border-rose-950/40 bg-rose-50/20 dark:bg-rose-950/10 opacity-75"
                    : "border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-900/80 shadow-sm hover:border-indigo-500/40 dark:hover:border-indigo-500/40"
                } p-5 backdrop-blur-xl`}
              >
                {/* Top Badge Ribbon */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-slate-500 dark:text-zinc-400">
                    #{stt}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {brand.country && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-zinc-300">
                        <span>{flag}</span>
                        <span>{brand.country}</span>
                      </span>
                    )}

                    {isDeleted ? (
                      <span className="rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                        Đã xóa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        Hoạt động
                      </span>
                    )}
                  </div>
                </div>

                {/* Brand Identity: Logo & Name */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-zinc-800/80 p-2 shadow-xs group-hover:border-indigo-500/40 transition-colors">
                    {resolvedLogoUrl ? (
                      <Image
                        src={resolvedLogoUrl}
                        alt={brand.name}
                        fill
                        unoptimized
                        className="object-contain p-1.5"
                      />
                    ) : (
                      <div
                        className={`flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm font-black text-sm tracking-wider`}
                      >
                        {brand.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/brands/${brand.id}`}
                      className="block text-base font-extrabold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate"
                      title={brand.name}
                    >
                      {brand.name}
                    </Link>
                    {brand.slug && (
                      <p className="font-mono text-[11px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
                        /{brand.slug}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      <Package className="h-3.5 w-3.5" />
                      <span>{brand.productCount ?? 0} sản phẩm phân phối</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 min-h-[34px] mb-4 leading-relaxed">
                  {brand.description || "Chưa có mô tả chi tiết cho thương hiệu đối tác này."}
                </p>

                {/* Bottom Action Ribbon */}
                <div className="border-t border-slate-100 dark:border-white/10 pt-3.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {brand.website && (
                      <a
                        href={brand.website.startsWith("http") ? brand.website : `https://${brand.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 text-slate-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/70 dark:hover:bg-white/10 transition-all"
                        title="Website chính thức"
                      >
                        <Globe className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <Link
                      href={`/admin/brands/${brand.id}`}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-200/70 dark:hover:bg-white/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Chi tiết</span>
                    </Link>
                  </div>

                  {canWrite && (
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/brands/${brand.id}/edit`}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 text-slate-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/70 dark:hover:bg-white/10 transition-all"
                        title="Chỉnh sửa"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Link>

                      {isDeleted && onRestore ? (
                        <button
                          type="button"
                          onClick={() => setConfirmRestoreId(brand.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all"
                          title="Khôi phục thương hiệu"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(brand.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all"
                          title="Xóa thương hiệu"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ==================== TABLE VIEW ==================== */
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 shadow-sm dark:shadow-2xl backdrop-blur-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/75 dark:bg-zinc-900/60 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  <th className="py-4 px-4 w-12 text-center">#</th>
                  <th className="py-4 px-4">Thương hiệu</th>
                  <th className="py-4 px-4">Quốc gia</th>
                  <th className="py-4 px-4">Sản phẩm liên kết</th>
                  <th className="py-4 px-4">Website</th>
                  <th className="py-4 px-4">Trạng thái</th>
                  <th className="py-4 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs font-medium">
                {items.map((brand, idx) => {
                  const isDeleted = brand.deletedAt != null;
                  const flag = getCountryFlag(brand.country);
                  const gradient = getBrandGradient(brand.name);
                  const resolvedLogoUrl = brand.logoUrl
                    ? brand.logoUrl.startsWith("http")
                      ? brand.logoUrl
                      : `${gatewayOrigin}${brand.logoUrl}`
                    : null;
                  const stt = startIndex + idx + 1;

                  return (
                    <tr
                      key={brand.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-4 px-4 text-center font-mono text-slate-400 dark:text-zinc-500">
                        {stt}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-800 p-1">
                            {resolvedLogoUrl ? (
                              <Image
                                src={resolvedLogoUrl}
                                alt={brand.name}
                                fill
                                unoptimized
                                className="object-contain p-0.5"
                              />
                            ) : (
                              <div
                                className={`flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-white font-bold text-xs`}
                              >
                                {brand.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/admin/brands/${brand.id}`}
                              className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                              {brand.name}
                            </Link>
                            {brand.slug && (
                              <p className="font-mono text-[10px] text-slate-400 dark:text-zinc-500">
                                /{brand.slug}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {brand.country ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                            <span>{flag}</span>
                            <span>{brand.country}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/40 px-2.5 py-1 text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                          <Package className="h-3 w-3" />
                          <span>{brand.productCount ?? 0} SKUs</span>
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {brand.website ? (
                          <a
                            href={brand.website.startsWith("http") ? brand.website : `https://${brand.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-slate-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          >
                            <Globe className="h-3.5 w-3.5" />
                            <span className="max-w-[150px] truncate">
                              {brand.website.replace(/^https?:\/\//, "")}
                            </span>
                            <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {isDeleted ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-2.5 py-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                            Đã xóa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            Hoạt động
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/brands/${brand.id}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                            title="Chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          {canWrite && (
                            <>
                              <Link
                                href={`/admin/brands/${brand.id}/edit`}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                title="Sửa"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Link>
                              {isDeleted && onRestore ? (
                                <button
                                  type="button"
                                  onClick={() => setConfirmRestoreId(brand.id)}
                                  className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40 transition-colors"
                                  title="Khôi phục"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(brand.id)}
                                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors"
                                  title="Xóa"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
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
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 shadow-2xl">
            <button
              onClick={() => setConfirmDeleteId(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/60">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Xác nhận chuyển vào thùng rác
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Thao tác xóa mềm thương hiệu</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              Bạn có chắc chắn muốn chuyển thương hiệu này vào thùng rác? Các sản phẩm thuộc thương hiệu sẽ tạm thời bị ẩn. Bạn có thể khôi phục lại bất kỳ lúc nào từ tab Thùng rác.
            </p>
            <form
              action={async (formData) => {
                await onDelete(formData);
                setConfirmDeleteId(null);
              }}
              className="mt-6 flex items-center justify-end gap-3"
            >
              <input type="hidden" name="_brandId" value={confirmDeleteId} />
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-700 transition-all"
              >
                Đồng ý xóa
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Restore */}
      {confirmRestoreId !== null && onRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 shadow-2xl">
            <button
              onClick={() => setConfirmRestoreId(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/60">
                <RotateCcw className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Khôi phục thương hiệu
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Đưa thương hiệu trở lại hoạt động</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              Thương hiệu sẽ được kích hoạt trở lại và hiển thị trong danh mục đối tác cũng như trên toàn bộ cửa hàng trực tuyến.
            </p>
            <form
              action={async (formData) => {
                await onRestore(formData);
                setConfirmRestoreId(null);
              }}
              className="mt-6 flex items-center justify-end gap-3"
            >
              <input type="hidden" name="_brandId" value={confirmRestoreId} />
              <button
                type="button"
                onClick={() => setConfirmRestoreId(null)}
                className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition-all"
              >
                Đồng ý khôi phục
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
