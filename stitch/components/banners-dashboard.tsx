"use client";

import React, { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type PromoBanner } from "@/lib/sale-api";
import { resolveCatalogImageUrl } from "@/lib/api";
import {
  toggleBannerActiveAction,
  deleteBannerAction,
  quickUpdateBannerAction,
} from "@/app/admin/sales/banners/actions";

interface Props {
  initialBanners: PromoBanner[];
  canWrite: boolean;
}

type FilterStatus = "all" | "active" | "upcoming" | "inactive" | "expired";

export function BannersDashboard({ initialBanners, canWrite }: Props) {
  const router = useRouter();
  const [banners, setBanners] = useState<PromoBanner[]>(initialBanners);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"position" | "newest" | "title">("position");

  // State for Modals
  const [previewBanner, setPreviewBanner] = useState<PromoBanner | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [quickEditBanner, setQuickEditBanner] = useState<PromoBanner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PromoBanner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingQuickEdit, setIsSavingQuickEdit] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [, startTransition] = useTransition();

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper to get banner status
  const getBannerStatus = (b: PromoBanner) => {
    const now = new Date();
    const isExpired = b.endAt && new Date(b.endAt) < now;
    const isUpcoming = b.startAt && new Date(b.startAt) > now;
    const isActive = b.active && !isExpired && !isUpcoming;

    if (isActive) return "active";
    if (isUpcoming && b.active) return "upcoming";
    if (isExpired) return "expired";
    return "inactive";
  };

  // Filter and sort banners
  const filteredBanners = useMemo(() => {
    let result = [...banners];

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((b) => getBannerStatus(b) === statusFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (b) =>
          (b.title && b.title.toLowerCase().includes(q)) ||
          (b.linkUrl && b.linkUrl.toLowerCase().includes(q)) ||
          String(b.position).includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "position") {
        return (a.position ?? 0) - (b.position ?? 0);
      }
      if (sortBy === "newest") {
        return (b.id ?? 0) - (a.id ?? 0);
      }
      if (sortBy === "title") {
        return (a.title || "").localeCompare(b.title || "", "vi");
      }
      return 0;
    });

    return result;
  }, [banners, statusFilter, searchQuery, sortBy]);

  // Status statistics counts
  const stats = useMemo(() => {
    let active = 0;
    let upcoming = 0;
    let inactive = 0;
    let expired = 0;

    banners.forEach((b) => {
      const st = getBannerStatus(b);
      if (st === "active") active++;
      else if (st === "upcoming") upcoming++;
      else if (st === "inactive") inactive++;
      else if (st === "expired") expired++;
    });

    return { total: banners.length, active, upcoming, inactive, expired };
  }, [banners]);

  // Handle active toggle
  const handleToggleActive = async (b: PromoBanner) => {
    if (!canWrite || togglingId !== null) return;
    setTogglingId(b.id);

    // Optimistic update
    setBanners((prev) =>
      prev.map((item) => (item.id === b.id ? { ...item, active: !item.active } : item))
    );

    const res = await toggleBannerActiveAction(b.id, b.active);
    setTogglingId(null);

    if (res.success) {
      showToast(`Đã ${res.active ? "kích hoạt" : "tạm ngưng"} banner #${b.id}`);
      startTransition(() => {
        router.refresh();
      });
    } else {
      // Revert optimistic update
      setBanners((prev) =>
        prev.map((item) => (item.id === b.id ? { ...item, active: b.active } : item))
      );
      showToast(res.error || "Lỗi cập nhật", "error");
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget || !canWrite) return;
    setIsDeleting(true);

    const res = await deleteBannerAction(deleteTarget.id);
    setIsDeleting(false);

    if (res.success) {
      setBanners((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      showToast(`Đã xóa banner "${deleteTarget.title || deleteTarget.id}"`);
      setDeleteTarget(null);
      startTransition(() => {
        router.refresh();
      });
    } else {
      showToast(res.error || "Lỗi xóa banner", "error");
    }
  };

  // Handle Quick Edit Save
  const handleSaveQuickEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!quickEditBanner || !canWrite) return;
    setIsSavingQuickEdit(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const linkUrl = formData.get("linkUrl") as string;
    const position = Number(formData.get("position"));
    const active = formData.get("active") === "on";
    const startAt = formData.get("startAt") as string;
    const endAt = formData.get("endAt") as string;

    const res = await quickUpdateBannerAction(quickEditBanner.id, {
      title,
      imageUrl: quickEditBanner.imageUrl,
      linkUrl,
      position,
      active,
      startAt: startAt || undefined,
      endAt: endAt || undefined,
    });

    setIsSavingQuickEdit(false);

    if (res.success) {
      setBanners((prev) =>
        prev.map((b) =>
          b.id === quickEditBanner.id
            ? {
                ...b,
                title,
                linkUrl,
                position,
                active,
                startAt: startAt ? new Date(startAt).toISOString() : undefined,
                endAt: endAt ? new Date(endAt).toISOString() : undefined,
              }
            : b
        )
      );
      showToast(`Đã cập nhật banner "${title || quickEditBanner.id}"`);
      setQuickEditBanner(null);
      startTransition(() => {
        router.refresh();
      });
    } else {
      showToast(res.error || "Lỗi cập nhật", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl px-5 py-3.5 text-xs font-bold text-white shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-300 ${
            toastMessage.type === "success"
              ? "bg-emerald-600/90 shadow-emerald-600/30 border border-emerald-400/40"
              : "bg-rose-600/90 shadow-rose-600/30 border border-rose-400/40"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {toastMessage.type === "success" ? "check_circle" : "error"}
          </span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Controls: Filter Pills, Search Bar, View Toggle */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-4 sm:p-5 shadow-sm backdrop-blur-xl">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              statusFilter === "all"
                ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-zinc-400"
            }`}
          >
            <span>Tất cả</span>
            <span className="rounded-md bg-white/20 dark:bg-black/20 px-1.5 py-0.5 text-[10px]">
              {stats.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              statusFilter === "active"
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Đang chạy</span>
            <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[10px]">{stats.active}</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("upcoming")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              statusFilter === "upcoming"
                ? "bg-amber-600 text-white shadow-sm shadow-amber-600/30"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span>Chờ chạy</span>
            <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[10px]">
              {stats.upcoming}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("inactive")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              statusFilter === "inactive"
                ? "bg-slate-600 text-white shadow-sm"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-zinc-400"
            }`}
          >
            <span>Tạm ngưng</span>
            <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[10px]">
              {stats.inactive}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("expired")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              statusFilter === "expired"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-zinc-400"
            }`}
          >
            <span>Đã hết hạn</span>
            <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[10px]">{stats.expired}</span>
          </button>
        </div>

        {/* Search, Sort & View Mode Switch */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tiêu đề, link..."
              className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50 dark:bg-zinc-900/80 py-2 pl-10 pr-8 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50 dark:bg-zinc-900/80 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 outline-none focus:border-indigo-500"
          >
            <option value="position">Thứ tự hiển thị (Vị trí)</option>
            <option value="newest">Mới tạo nhất</option>
            <option value="title">Tên tiêu đề A-Z</option>
          </select>

          {/* View Mode Toggle */}
          <div className="inline-flex rounded-2xl bg-slate-100/90 dark:bg-zinc-900/90 p-1 border border-slate-200/70 dark:border-white/5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === "grid"
                  ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-cyan-400 shadow-sm border border-slate-200/80 dark:border-white/10"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Dạng thẻ trực quan"
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              <span className="hidden sm:inline">Dạng thẻ</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === "table"
                  ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-cyan-400 shadow-sm border border-slate-200/80 dark:border-white/10"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Dạng bảng chi tiết"
            >
              <span className="material-symbols-outlined text-[16px]">table_rows</span>
              <span className="hidden sm:inline">Dạng bảng</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== 1. VISUAL CARD GRID VIEW ==================== */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {filteredBanners.map((b) => {
            const status = getBannerStatus(b);
            const isToggling = togglingId === b.id;

            return (
              <div
                key={b.id}
                className="group relative overflow-hidden rounded-[2.2rem] border border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-zinc-950/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between backdrop-blur-xl"
              >
                {/* Banner Image Preview Container */}
                <div className="relative aspect-[16/8] sm:aspect-[16/7] w-full overflow-hidden bg-slate-100 dark:bg-zinc-900 border-b border-slate-100 dark:border-white/5">
                  {b.imageUrl ? (
                    <img
                      src={resolveCatalogImageUrl(b.imageUrl)}
                      alt={b.title || "Banner"}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
                      <span className="material-symbols-outlined text-4xl">panorama</span>
                      <span className="text-xs font-semibold">Chưa có ảnh banner</span>
                    </div>
                  )}

                  {/* Gradient Overlay & Top Badges */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                  {/* Top Badges: Position & Status */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-auto">
                    <span className="inline-flex items-center gap-1 rounded-xl bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-black text-white shadow-sm border border-white/20">
                      <span className="text-amber-400 font-mono">#{b.position}</span>
                      <span>Vị trí</span>
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border ${
                        status === "active"
                          ? "bg-emerald-500/85 text-white border-emerald-400/50"
                          : status === "upcoming"
                          ? "bg-amber-500/85 text-white border-amber-400/50"
                          : status === "expired"
                          ? "bg-rose-500/85 text-white border-rose-400/50"
                          : "bg-zinc-700/85 text-zinc-200 border-zinc-600/50"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          status === "active" ? "bg-white animate-pulse" : "bg-white/80"
                        }`}
                      />
                      {status === "active"
                        ? "Đang chạy"
                        : status === "upcoming"
                        ? "Chờ chạy"
                        : status === "expired"
                        ? "Hết hạn"
                        : "Tạm ngưng"}
                    </span>
                  </div>

                  {/* Quick Preview Hover Button */}
                  <button
                    type="button"
                    onClick={() => setPreviewBanner(b)}
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-900 px-3 py-1.5 text-xs font-bold shadow-lg backdrop-blur-md transition-all active:scale-95"
                    title="Mô phỏng hiển thị trên máy tính & điện thoại"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span>Xem thử mockup</span>
                  </button>
                </div>

                {/* Banner Info Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-headline text-base sm:text-lg font-black text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors">
                      {b.title || "Banner không tên"}
                    </h3>

                    {/* Target Link */}
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
                      <span className="material-symbols-outlined text-[15px] shrink-0 text-slate-400">
                        link
                      </span>
                      {b.linkUrl ? (
                        <a
                          href={b.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="truncate hover:text-indigo-600 dark:hover:text-cyan-400 underline-offset-2 hover:underline"
                          title={b.linkUrl}
                        >
                          {b.linkUrl}
                        </a>
                      ) : (
                        <span className="italic text-slate-400">Chưa gắn đường dẫn đích</span>
                      )}
                    </div>

                    {/* Date Schedule Range */}
                    <div className="mt-2 text-[11px] text-slate-500 dark:text-zinc-400 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px] text-slate-400">
                          schedule
                        </span>
                        <span>
                          {b.startAt
                            ? `Từ: ${new Date(b.startAt).toLocaleDateString("vi-VN")}`
                            : "Bắt đầu: Bất kỳ lúc nào"}
                        </span>
                        <span className="text-slate-300 dark:text-zinc-600">·</span>
                        <span>
                          {b.endAt
                            ? `Đến: ${new Date(b.endAt).toLocaleDateString("vi-VN")}`
                            : "Không thời hạn"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer Bar */}
                  <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 dark:border-white/5">
                    {/* Toggle Switch */}
                    {canWrite ? (
                      <button
                        type="button"
                        onClick={() => handleToggleActive(b)}
                        disabled={isToggling}
                        className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                          b.active
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-100"
                            : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 hover:bg-slate-200"
                        }`}
                        title="Bấm để bật/tắt hiển thị banner"
                      >
                        <span
                          className={`material-symbols-outlined text-[16px] ${
                            isToggling ? "animate-spin" : ""
                          }`}
                        >
                          {isToggling ? "sync" : b.active ? "toggle_on" : "toggle_off"}
                        </span>
                        <span>{b.active ? "Đang bật" : "Đang tắt"}</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">Chỉ đọc</span>
                    )}

                    {/* Edit & Delete Buttons */}
                    {canWrite && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setQuickEditBanner(b)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-white/5 dark:hover:bg-indigo-500/20 text-slate-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-300 transition-colors"
                          title="Sửa nhanh thông số"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit_note</span>
                        </button>

                        <Link
                          href={`/admin/sales/banners/${b.id}/edit`}
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-white/5 dark:hover:bg-emerald-500/20 text-slate-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-300 transition-colors"
                          title="Sửa đầy đủ & đổi ảnh"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(b)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-white/5 dark:hover:bg-rose-500/20 text-slate-600 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 transition-colors"
                          title="Xóa banner"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ==================== 2. TABLE VIEW ==================== */
        <div className="overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 shadow-sm dark:shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/50 backdrop-blur-md">
                  <th className="px-5 py-4 text-center text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 w-16">
                    Vị trí
                  </th>
                  <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 w-36">
                    Ảnh Banner
                  </th>
                  <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                    Tiêu đề & Đích đến
                  </th>
                  <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                    Thời gian chạy
                  </th>
                  <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                    Trạng thái
                  </th>
                  {canWrite && (
                    <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                      Thao tác
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredBanners.map((b) => {
                  const status = getBannerStatus(b);
                  const isToggling = togglingId === b.id;

                  return (
                    <tr
                      key={b.id}
                      className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-white/5"
                    >
                      {/* Position */}
                      <td className="px-5 py-4 text-center">
                        <span className="font-mono text-xs font-black px-2 py-1 rounded-lg bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-white/5">
                          #{b.position}
                        </span>
                      </td>

                      {/* Image Thumbnail */}
                      <td className="px-5 py-4">
                        <div
                          className="relative h-14 w-28 overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 cursor-pointer group-hover:shadow-md transition-shadow"
                          onClick={() => setPreviewBanner(b)}
                          title="Bấm để xem mô phỏng mockup"
                        >
                          {b.imageUrl ? (
                            <img
                              src={resolveCatalogImageUrl(b.imageUrl)}
                              alt={b.title || "Banner"}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-400">
                              <span className="material-symbols-outlined text-[20px]">panorama</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Title & Link */}
                      <td className="px-5 py-4">
                        <p className="font-headline text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                          {b.title || "—"}
                        </p>
                        <p
                          className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate"
                          title={b.linkUrl || ""}
                        >
                          {b.linkUrl || "Chưa gắn link"}
                        </p>
                      </td>

                      {/* Schedule */}
                      <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">
                        <div>
                          Từ:{" "}
                          {b.startAt
                            ? new Date(b.startAt).toLocaleDateString("vi-VN")
                            : "Bất kỳ"}
                        </div>
                        <div className="mt-0.5">
                          Đến:{" "}
                          {b.endAt
                            ? new Date(b.endAt).toLocaleDateString("vi-VN")
                            : "Không thời hạn"}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              status === "active"
                                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50"
                                : status === "upcoming"
                                ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50"
                                : status === "expired"
                                ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50"
                                : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                status === "active" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                              }`}
                            />
                            {status === "active"
                              ? "Đang chạy"
                              : status === "upcoming"
                              ? "Chờ chạy"
                              : status === "expired"
                              ? "Hết hạn"
                              : "Tạm ngưng"}
                          </span>

                          {canWrite && (
                            <button
                              type="button"
                              onClick={() => handleToggleActive(b)}
                              disabled={isToggling}
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
                              title="Bật/Tắt hiển thị"
                            >
                              <span
                                className={`material-symbols-outlined text-[20px] ${
                                  isToggling ? "animate-spin" : ""
                                }`}
                              >
                                {isToggling ? "sync" : b.active ? "toggle_on" : "toggle_off"}
                              </span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Operations */}
                      {canWrite && (
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setPreviewBanner(b)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                              title="Xem thử mockup"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                visibility
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setQuickEditBanner(b)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"
                              title="Sửa nhanh"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                edit_note
                              </span>
                            </button>
                            <Link
                              href={`/admin/sales/banners/${b.id}/edit`}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
                              title="Sửa đầy đủ"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </Link>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(b)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400"
                              title="Xóa banner"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredBanners.length === 0 && (
        <div className="rounded-[2.5rem] border border-dashed border-slate-300 dark:border-white/10 bg-white/50 dark:bg-zinc-950/40 p-12 text-center backdrop-blur-xl">
          <span className="material-symbols-outlined text-5xl text-slate-400 mb-3">panorama</span>
          <h3 className="text-base font-bold text-slate-800 dark:text-zinc-200">
            Không tìm thấy banner phù hợp
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
            Không có banner nào khớp với từ khóa hoặc trạng thái đã chọn.
          </p>
        </div>
      )}

      {/* ==================== MODAL 1: LIVE DEVICE MOCKUP PREVIEW ==================== */}
      {previewBanner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewBanner(null)}
        >
          <div
            className="relative w-full max-w-4xl rounded-[2.5rem] border border-white/20 bg-slate-900/95 text-white p-6 sm:p-8 shadow-2xl backdrop-blur-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <span className="material-symbols-outlined text-2xl">devices</span>
                </div>
                <div>
                  <h3 className="font-headline text-lg font-black">{previewBanner.title}</h3>
                  <p className="text-xs text-zinc-400">
                    Mô phỏng hiển thị trên Storefront Khách hàng
                  </p>
                </div>
              </div>

              {/* Device Switcher */}
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-xl bg-white/10 p-1 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                      previewDevice === "desktop" ? "bg-white text-slate-950" : "text-zinc-300"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">desktop_windows</span>
                    <span>Desktop (16:9)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                      previewDevice === "mobile" ? "bg-white text-slate-950" : "text-zinc-300"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">smartphone</span>
                    <span>Mobile</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewBanner(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Simulation Canvas */}
            <div className="mt-6 flex justify-center items-center py-4">
              {previewDevice === "desktop" ? (
                /* Desktop Mockup Frame */
                <div className="w-full rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-zinc-950">
                  <div className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-900 border-b border-white/10">
                    <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                    <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-[11px] font-mono text-zinc-400">
                      https://kinetics-vault.vn/storefront
                    </span>
                  </div>
                  <div className="relative aspect-[16/7] w-full overflow-hidden">
                    <img
                      src={resolveCatalogImageUrl(previewBanner.imageUrl)}
                      alt={previewBanner.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-4 left-6 rounded-xl bg-black/60 backdrop-blur-md px-4 py-2 text-xs font-bold text-white border border-white/20">
                      🔗 Đích: {previewBanner.linkUrl || "Không có link"}
                    </div>
                  </div>
                </div>
              ) : (
                /* Mobile Mockup Frame */
                <div className="w-[320px] rounded-[2.5rem] overflow-hidden border-4 border-zinc-700 shadow-2xl bg-zinc-950 p-2">
                  <div className="flex justify-center pb-2">
                    <div className="h-3 w-20 rounded-full bg-zinc-800" />
                  </div>
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl">
                    <img
                      src={resolveCatalogImageUrl(previewBanner.imageUrl)}
                      alt={previewBanner.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-xs font-bold truncate">{previewBanner.title}</p>
                    <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                      {previewBanner.linkUrl}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL 2: QUICK EDIT MODAL ==================== */}
      {quickEditBanner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setQuickEditBanner(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-[2.5rem] border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#0c101d]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-cyan-400">
                  <span className="material-symbols-outlined text-2xl">edit_note</span>
                </div>
                <div>
                  <h3 className="font-headline text-lg font-black text-slate-900 dark:text-white">
                    Sửa Nhanh Banner
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">ID #{quickEditBanner.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickEditBanner(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-800"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveQuickEdit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                  Tiêu đề Banner
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={quickEditBanner.title || ""}
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 px-4 py-2.5 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                  Đường dẫn liên kết (Link đích)
                </label>
                <input
                  type="text"
                  name="linkUrl"
                  defaultValue={quickEditBanner.linkUrl || ""}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 px-4 py-2.5 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                    Vị trí (Ưu tiên)
                  </label>
                  <input
                    type="number"
                    name="position"
                    defaultValue={quickEditBanner.position}
                    required
                    min={0}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 px-4 py-2.5 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="quick_active"
                    name="active"
                    defaultChecked={quickEditBanner.active}
                    className="h-4 w-4 rounded accent-indigo-600"
                  />
                  <label
                    htmlFor="quick_active"
                    className="text-xs font-bold text-slate-800 dark:text-zinc-200 cursor-pointer"
                  >
                    Kích hoạt hiển thị
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                    Bắt đầu (Tùy chọn)
                  </label>
                  <input
                    type="datetime-local"
                    name="startAt"
                    defaultValue={
                      quickEditBanner.startAt
                        ? new Date(quickEditBanner.startAt).toISOString().slice(0, 16)
                        : ""
                    }
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 px-3 py-2 text-[11px] font-medium text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                    Kết thúc (Tùy chọn)
                  </label>
                  <input
                    type="datetime-local"
                    name="endAt"
                    defaultValue={
                      quickEditBanner.endAt
                        ? new Date(quickEditBanner.endAt).toISOString().slice(0, 16)
                        : ""
                    }
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 px-3 py-2 text-[11px] font-medium text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setQuickEditBanner(null)}
                  className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingQuickEdit}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/25 transition-all hover:scale-[1.02] disabled:opacity-60"
                >
                  {isSavingQuickEdit ? (
                    <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px]">save</span>
                  )}
                  <span>{isSavingQuickEdit ? "Đang lưu..." : "Lưu thay đổi"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL 3: DELETE CONFIRMATION ==================== */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="relative w-full max-w-md rounded-[2.5rem] border border-rose-200/50 dark:border-rose-900/40 bg-white/95 dark:bg-[#0c101d]/95 p-6 sm:p-7 shadow-2xl backdrop-blur-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-900/40">
                <span className="material-symbols-outlined text-2xl">delete_forever</span>
              </div>
              <div>
                <h3 className="font-headline text-lg font-black text-slate-900 dark:text-white">
                  Xác nhận xóa Banner
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                  Hành động này sẽ gỡ bỏ banner khỏi hệ thống và không thể hoàn tác.
                </p>
              </div>
            </div>

            {/* Thumbnail Preview */}
            <div className="mt-4 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-50 dark:bg-zinc-900">
              {deleteTarget.imageUrl && (
                <div className="aspect-[16/8] w-full overflow-hidden">
                  <img
                    src={resolveCatalogImageUrl(deleteTarget.imageUrl)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="p-3">
                <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  {deleteTarget.title || "Banner không tên"}
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  Vị trí: #{deleteTarget.position} · Link: {deleteTarget.linkUrl || "N/A"}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition-all hover:scale-[1.02] disabled:opacity-60"
              >
                {isDeleting ? (
                  <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                )}
                <span>{isDeleting ? "Đang xóa..." : "Xác nhận xóa"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
