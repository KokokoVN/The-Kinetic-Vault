"use client";

import React, { useState, useMemo } from "react";
import type { AdminProductSpec } from "@/lib/api";
import { useProductCompare } from "./product-compare-context";
import { toast } from "sonner";

function specValue(spec: AdminProductSpec): string {
  const unit = spec.unit?.trim();
  return unit ? `${spec.specValue} ${unit}` : spec.specValue;
}

function getGroupIcon(groupName: string): string {
  const g = groupName.toLowerCase();
  if (g.includes("màn hình") || g.includes("display") || g.includes("screen")) return "display_settings";
  if (g.includes("cấu hình") || g.includes("cpu") || g.includes("chip") || g.includes("ram") || g.includes("hiệu năng")) return "memory";
  if (g.includes("pin") || g.includes("sạc") || g.includes("battery")) return "battery_charging_full";
  if (g.includes("kích thước") || g.includes("trọng lượng") || g.includes("size") || g.includes("weight")) return "straighten";
  if (g.includes("thiết kế") || g.includes("chất liệu") || g.includes("màu")) return "palette";
  if (g.includes("kết nối") || g.includes("cổng") || g.includes("wifi") || g.includes("bluetooth")) return "wifi";
  if (g.includes("camera") || g.includes("quay phim") || g.includes("chụp ảnh")) return "photo_camera";
  if (g.includes("âm thanh") || g.includes("loa") || g.includes("audio")) return "volume_up";
  if (g.includes("bảo hành") || g.includes("xuất xứ")) return "verified_user";
  return "tune";
}

export function ProductSpecsSection({
  productId,
  productTitle,
  productImage,
  productPrice,
  specs,
}: {
  productId: number;
  productTitle: string;
  productImage?: string;
  productPrice?: number | string;
  specs: AdminProductSpec[];
}) {
  const { isInCompare, toggleCompare } = useProductCompare();
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const inCompare = isInCompare(productId);

  // Group specs
  const groups = useMemo(() => {
    const map = new Map<string, AdminProductSpec[]>();
    for (const spec of specs) {
      const g = spec.specGroup?.trim() || "Thông tin chung";
      if (!map.has(g)) {
        map.set(g, []);
      }
      map.get(g)!.push(spec);
    }
    return map;
  }, [specs]);

  const groupNames = useMemo(() => Array.from(groups.keys()), [groups]);

  // Filtered specs
  const filteredSpecsByGroup = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result = new Map<string, AdminProductSpec[]>();

    groups.forEach((groupSpecs, gName) => {
      if (selectedGroup !== "ALL" && selectedGroup !== gName) return;

      const matched = groupSpecs.filter((s) => {
        if (!q) return true;
        const k = (s.specKey || "").toLowerCase();
        const v = (s.specValue || "").toLowerCase();
        const u = (s.unit || "").toLowerCase();
        return k.includes(q) || v.includes(q) || u.includes(q);
      });

      if (matched.length > 0) {
        result.set(gName, matched);
      }
    });

    return result;
  }, [groups, selectedGroup, searchQuery]);

  const totalFilteredCount = useMemo(() => {
    let count = 0;
    filteredSpecsByGroup.forEach((arr) => {
      count += arr.length;
    });
    return count;
  }, [filteredSpecsByGroup]);

  // Copy specs as markdown/text
  const handleCopySpecs = () => {
    let text = `📋 THÔNG SỐ KỸ THUẬT: ${productTitle}\n\n`;
    groups.forEach((items, gName) => {
      text += `[${gName}]\n`;
      items.forEach((it) => {
        text += `• ${it.specKey}: ${specValue(it)}\n`;
      });
      text += `\n`;
    });
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Đã sao chép thông số kỹ thuật", {
          description: "Bảng thông số đã được lưu vào khay nhớ tạm.",
        });
      })
      .catch(() => {
        toast.error("Không thể sao chép");
      });
  };

  if (specs.length === 0) {
    return null;
  }

  // Threshold for collapsing
  const maxCollapsedItems = 8;
  const shouldShowCollapse = specs.length > maxCollapsedItems && !searchQuery;

  return (
    <section className="mt-16 sm:mt-20">
      <div className="overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 backdrop-blur-2xl shadow-sm dark:shadow-2xl">
        {/* Header with Title & Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-200/80 dark:border-white/10 px-6 sm:px-8 py-5 sm:py-6 bg-slate-50/70 dark:bg-zinc-900/50 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
              <span className="material-symbols-outlined text-[22px]">tune</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Thông Số Kỹ Thuật Chi Tiết
                </h2>
                <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/40 dark:border-indigo-800/40 px-2.5 py-0.5 text-xs font-black text-indigo-600 dark:text-indigo-400">
                  {specs.length} thông số
                </span>
              </div>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                Cấu hình chi tiết & tiêu chuẩn kỹ thuật từ nhà sản xuất
              </p>
            </div>
          </div>

          {/* Action Buttons: Compare & Copy */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() =>
                toggleCompare({
                  id: productId,
                  title: productTitle,
                  image: productImage || "",
                  price: productPrice || 0,
                })
              }
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-black transition-all shadow-sm ${
                inCompare
                  ? "bg-indigo-600 text-white shadow-indigo-600/30"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">
                {inCompare ? "check_circle" : "balance"}
              </span>
              <span>{inCompare ? "Đang trong so sánh" : "So sánh sản phẩm"}</span>
            </button>

            <button
              type="button"
              onClick={handleCopySpecs}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              title="Sao chép toàn bộ thông số kỹ thuật"
            >
              <span className="material-symbols-outlined text-[17px]">content_copy</span>
              <span>Sao chép</span>
            </button>
          </div>
        </div>

        {/* Toolbar: Category Tabs & Live Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between border-b border-slate-100 dark:border-slate-800/60 px-6 sm:px-8 py-3.5 gap-3 bg-white/40 dark:bg-slate-900/30">
          {/* Spec Group Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedGroup("ALL")}
              className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-black transition-all ${
                selectedGroup === "ALL"
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Tất cả ({specs.length})
            </button>
            {groupNames.map((name) => {
              const count = groups.get(name)?.length || 0;
              const isSelected = selectedGroup === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedGroup(name)}
                  className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-black"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">{getGroupIcon(name)}</span>
                  <span>{name}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative flex items-center min-w-[200px] sm:min-w-[240px]">
            <span className="material-symbols-outlined absolute left-3 text-[18px] text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Lọc thông số..."
              className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 py-1.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[15px]">clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Specs Content Grid */}
        <div className="p-6 sm:p-8 space-y-8">
          {totalFilteredCount === 0 ? (
            <div className="py-10 text-center">
              <span className="material-symbols-outlined text-[40px] text-slate-300 dark:text-slate-600 mb-2">
                filter_alt_off
              </span>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                Không tìm thấy thông số phù hợp với từ khóa &ldquo;{searchQuery}&rdquo;
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedGroup("ALL");
                }}
                className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            Array.from(filteredSpecsByGroup.entries()).map(([groupName, groupSpecs]) => {
              // Handle collapsing if active
              const displayedItems = shouldShowCollapse && !isExpanded ? groupSpecs.slice(0, 4) : groupSpecs;

              return (
                <div key={groupName} className="space-y-3.5">
                  {/* Group Label */}
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                      <span className="material-symbols-outlined text-[16px]">
                        {getGroupIcon(groupName)}
                      </span>
                    </div>
                    <h3 className="font-headline text-xs font-black uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
                      {groupName}
                    </h3>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                  </div>

                  {/* Spec Items Matrix */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {displayedItems.map((spec) => (
                      <div
                        key={spec.id}
                        className="group flex items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-850/40 px-4 py-3.5 transition-all hover:border-indigo-500/40 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 hover:shadow-sm"
                      >
                        <dt className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                          {spec.specKey}
                        </dt>
                        <dd className="font-mono text-xs font-black text-slate-900 dark:text-slate-100 text-right ml-4">
                          <span>{spec.specValue}</span>
                          {spec.unit?.trim() && (
                            <span className="ml-1 text-[11px] font-sans font-bold text-indigo-500 dark:text-indigo-400">
                              {spec.unit.trim()}
                            </span>
                          )}
                        </dd>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}

          {/* Expand / Collapse Button */}
          {shouldShowCollapse && (
            <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/60 dark:bg-indigo-950/40 px-5 py-2 text-xs font-black text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition shadow-sm"
              >
                <span>{isExpanded ? "Thu gọn thông số" : `Xem thêm tất cả ${specs.length} thông số`}</span>
                <span className="material-symbols-outlined text-[16px]">
                  {isExpanded ? "expand_less" : "expand_more"}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
