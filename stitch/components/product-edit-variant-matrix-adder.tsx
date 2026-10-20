"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MultiTierVariantBuilder, type MultiTierConfig } from "./multi-tier-variant-builder";
import { VariantFormLiveCheck } from "./variant-form-live-check";
import { extractTiersFromVariants } from "@/lib/variant-tier-utils";

type ProductEditVariantMatrixAdderProps = {
  productId: number;
  productSku?: string;
  defaultPrice: number;
  fieldClass: string;
  existingVariants: Array<{ size: string; color: string }>;
  rawVariants?: any[];
  singleAddAction: (formData: FormData) => void | Promise<void>;
};

export function ProductEditVariantMatrixAdder({
  productId,
  productSku = "SP",
  defaultPrice,
  fieldClass,
  existingVariants,
  rawVariants,
  singleAddAction,
}: ProductEditVariantMatrixAdderProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"matrix" | "single">("matrix");
  const [multiTierConfig, setMultiTierConfig] = useState<MultiTierConfig | null>(null);
  const [isSubmittingMatrix, setIsSubmittingMatrix] = useState(false);

  const initialTiers = useMemo(() => {
    if (rawVariants && rawVariants.length > 0) {
      const extracted = extractTiersFromVariants(rawVariants);
      if (extracted.length > 0) {
        return extracted.map((et) => ({
          id: et.id,
          name: et.name,
          values: et.values,
          images: {},
        }));
      }
    }
    return undefined;
  }, [rawVariants]);

  const handleSaveMatrix = async () => {
    if (!multiTierConfig?.enabled || !multiTierConfig.combinations.length) {
      toast.error("Vui lòng bật phân loại đa tầng và thêm ít nhất một giá trị phân loại.");
      return;
    }

    const activeCombos = multiTierConfig.combinations.filter((c) => c.enabled);
    if (activeCombos.length === 0) {
      toast.error("Vui lòng kích hoạt ít nhất một tổ hợp biến thể.");
      return;
    }

    const invalidCombo = activeCombos.find((c) => !c.price || c.price <= 0);
    if (invalidCombo) {
      const comboLabel = invalidCombo.variantName || invalidCombo.tierValueList?.map((t) => t.value).join(" / ") || "biến thể";
      toast.error(`Phân loại "${comboLabel}" chưa có giá bán hợp lệ (> 0 VND).`);
      return;
    }

    setIsSubmittingMatrix(true);
    const toastId = toast.loading("Đang lưu các biến thể đa tầng...");

    try {
      const batchFormData = new FormData();
      const usedVariantIds = new Set<number>();

      const variantsPayload = activeCombos.map((c) => {
        const firstTier = c.tierValueList?.[0]?.value || "Mặc định";
        const remainingTiers = c.tierValueList?.slice(1).map((t) => t.value).join(" - ") || "Mặc định";

        let existingVariantId: number | undefined;
        if (rawVariants && rawVariants.length > 0) {
          // 1. Exact match on color and size
          const exact = rawVariants.find(
            (v) =>
              !usedVariantIds.has(v.id) &&
              String(v.color ?? "").trim().toLowerCase() === firstTier.toLowerCase() &&
              String(v.size ?? "").trim().toLowerCase() === remainingTiers.toLowerCase()
          );
          if (exact) {
            existingVariantId = exact.id;
            usedVariantIds.add(exact.id);
          } else {
            // 2. Prefix tier expansion match (e.g. existing variant had color "Đen", size "128GB", and new combo is "Đen", "128GB - 12 tháng")
            const prefixMatch = rawVariants.find(
              (v) =>
                !usedVariantIds.has(v.id) &&
                String(v.color ?? "").trim().toLowerCase() === firstTier.toLowerCase() &&
                remainingTiers.toLowerCase().startsWith(String(v.size ?? "").trim().toLowerCase() + " - ")
            );
            if (prefixMatch) {
              existingVariantId = prefixMatch.id;
              usedVariantIds.add(prefixMatch.id);
            }
          }
        }

        return {
          existingVariantId,
          color: firstTier,
          size: remainingTiers,
          variantName: c.variantName || c.tierValueList?.map((t) => t.value).join(" / "),
          attributesJson: JSON.stringify(
            (c.tierValueList || []).map((t) => ({
              name: t.name || t.tierName,
              tierName: t.tierName || t.name,
              value: t.value,
            }))
          ),
          sku: c.sku,
          price: c.price,
          originalPrice: c.originalPrice,
          availability: c.availability,
          tier1Value: firstTier,
        };
      });

      batchFormData.append("variantsJson", JSON.stringify(variantsPayload));

      for (const tier of multiTierConfig.tiers || []) {
        for (const [val, imgData] of Object.entries(tier.images || {})) {
          if (imgData?.file) {
            batchFormData.append(`tier1Image_${val}`, imgData.file);
          }
        }
      }

      const res = await fetch(`/api/admin/products/${productId}/variants/batch`, {
        method: "POST",
        body: batchFormData,
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(data.error || data.message || `Lỗi máy chủ (${res.status})`);
      }

      if (data.errors && data.errors.length > 0) {
        toast.warning(`Đã lưu ${data.added || 0} biến thể, có ${data.errors.length} biến thể bị lỗi: ${data.errors[0]}`, {
          id: toastId,
          duration: 6000,
        });
      } else {
        toast.success(`Đã lưu thành công ${data.added || 0} biến thể mới (${data.updated || 0} cập nhật nâng cấp)`, {
          id: toastId,
        });
      }

      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu ma trận biến thể", { id: toastId });
    } finally {
      setIsSubmittingMatrix(false);
    }
  };

  return (
    <div className="rounded-[2rem] border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-slate-50/50 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 p-6 shadow-sm sm:p-8 backdrop-blur-xl">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h3 className="font-headline text-lg font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[22px] text-indigo-600 dark:text-indigo-400">
              add_circle
            </span>
            Thêm biến thể sản phẩm
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
            Chọn thêm theo ma trận phân loại đa tầng hoặc thêm từng biến thể lẻ.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("matrix")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition-all ${
              activeTab === "matrix"
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">grid_on</span>
            Ma trận đa tầng
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("single")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition-all ${
              activeTab === "single"
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            Thêm 1 biến thể lẻ
          </button>
        </div>
      </div>

      {activeTab === "matrix" ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {initialTiers && initialTiers.length > 0 && (
            <div className="flex items-center gap-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 p-4 text-xs">
              <span className="material-symbols-outlined text-[20px] text-indigo-600 dark:text-indigo-400">
                auto_mode
              </span>
              <div>
                <p className="font-bold text-indigo-950 dark:text-indigo-200">
                  Đã tải {initialTiers.length} tầng phân loại hiện có của sản phẩm ({initialTiers.map((t) => t.name).join(" × ")}).
                </p>
                <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 mt-0.5">
                  Bạn có thể nhấn nút <strong>"+ Thêm tầng phân loại mới (Tầng {initialTiers.length + 1})"</strong> bên dưới để mở rộng thêm tầng (ví dụ Tầng 3) cho tất cả biến thể mà không làm mất dữ liệu tồn kho hiện có!
                </p>
              </div>
            </div>
          )}

          <MultiTierVariantBuilder
            basePrice={defaultPrice}
            baseSku={productSku}
            initialConfig={{ enabled: true, tiers: initialTiers }}
            onChange={setMultiTierConfig}
          />

          {multiTierConfig?.enabled && multiTierConfig.combinations.length > 0 && (() => {
            const activeCombos = multiTierConfig.combinations.filter((c) => c.enabled);
            const invalidCombos = activeCombos.filter((c) => !c.price || c.price <= 0);
            const hasErrors = invalidCombos.length > 0;

            return (
              <div className="sticky bottom-4 z-30 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/80 bg-white/95 dark:bg-zinc-900/95 p-4 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    <span className="material-symbols-outlined text-[22px]">checklist</span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Đã chọn lưu {activeCombos.length} biến thể</span>
                      {hasErrors ? (
                        <span className="text-[11px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">warning</span>
                          {invalidCombos.length} biến thể chưa có giá
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">check_circle</span>
                          Tất cả giá hợp lệ
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Hệ thống tự động bảo toàn ID và tồn kho của các biến thể cũ đã có trước đó.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isSubmittingMatrix || hasErrors || activeCombos.length === 0}
                    onClick={handleSaveMatrix}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 px-6 py-3 text-xs font-black text-white shadow-lg shadow-indigo-500/25 hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isSubmittingMatrix ? "sync" : "save"}
                    </span>
                    <span>
                      {isSubmittingMatrix
                        ? "Đang lưu biến thể..."
                        : `Lưu ma trận (${activeCombos.length} biến thể)`}
                    </span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        <div className="animate-in fade-in duration-200">
          <VariantFormLiveCheck
            action={singleAddAction}
            fieldClass={fieldClass}
            existingVariants={existingVariants}
            defaultPrice={defaultPrice}
          />
        </div>
      )}
    </div>
  );
}
