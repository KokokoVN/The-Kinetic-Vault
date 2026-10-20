"use client";

import React, { useState, useMemo, useEffect } from "react";

export type VariantTier = {
  id: string;
  name: string;
  values: string[];
  images?: Record<string, { file?: File | null; url?: string }>;
};

export type VariantCombination = {
  id: string; // unique key
  tierValues: Record<string, string>; // tierName -> value
  tierValueList: Array<{ tierName: string; name?: string; value: string }>;
  variantName: string;
  price: number;
  originalPrice?: number;
  availability: number;
  sku: string;
  variantImageUrl?: string;
  imageFile?: File | null;
  enabled: boolean;
};

export type MultiTierConfig = {
  enabled: boolean;
  tiers: VariantTier[];
  // Backwards compatibility properties
  tier1Name: string;
  tier1Values: string[];
  tier1Images: Record<string, { file?: File | null; url?: string }>;
  tier2Enabled: boolean;
  tier2Name: string;
  tier2Values: string[];
  combinations: VariantCombination[];
};

type MultiTierVariantBuilderProps = {
  basePrice?: number;
  baseSku?: string;
  initialConfig?: Partial<MultiTierConfig>;
  onChange: (config: MultiTierConfig) => void;
  className?: string;
};

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toUpperCase();
}

function formatVnd(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

const TIER_PRESETS = [
  "Màu sắc",
  "Kích cỡ",
  "Dung lượng",
  "RAM",
  "Chất liệu",
  "Phiên bản",
  "Bảo hành",
  "Quy cách",
  "Khối lượng",
];

const VALUE_PRESETS: Record<string, string[]> = {
  "màu": ["Đen", "Trắng", "Xám", "Bạc", "Xanh navy", "Xanh lá", "Đỏ", "Vàng", "Hồng", "Tím"],
  "size": ["S", "M", "L", "XL", "2XL", "3XL", "FreeSize"],
  "kích": ["S", "M", "L", "XL", "2XL", "3XL", "FreeSize"],
  "dung": ["64GB", "128GB", "256GB", "512GB", "1TB", "2TB"],
  "ram": ["4GB", "8GB", "16GB", "32GB", "64GB"],
  "chất": ["Cotton", "Kaki", "Lụa", "Jean", "Len", "Thun", "Nỉ"],
  "bảo": ["6 tháng", "12 tháng", "24 tháng", "Chính hãng", "Mở rộng"],
  "quy": ["Hộp", "Gói", "Chai", "Lon", "Thùng", "Túi"],
};

const COLOR_SWATCHES: Record<string, string> = {
  "đen": "#18181b",
  "trắng": "#f4f4f5",
  "xám": "#71717a",
  "bạc": "#cbd5e1",
  "xanh navy": "#1e3a8a",
  "xanh lá": "#16a34a",
  "đỏ": "#dc2626",
  "vàng": "#eab308",
  "hồng": "#ec4899",
  "tím": "#9333ea",
  "cam": "#ea580c",
  "nâu": "#78350f",
};

export function MultiTierVariantBuilder({
  basePrice = 0,
  baseSku = "SP",
  initialConfig,
  onChange,
  className = "",
}: MultiTierVariantBuilderProps) {
  const [isEnabled, setIsEnabled] = useState(initialConfig?.enabled ?? true);

  // Dynamic Tiers list
  const [tiers, setTiers] = useState<VariantTier[]>(() => {
    if (initialConfig?.tiers && initialConfig.tiers.length > 0) {
      return initialConfig.tiers;
    }
    return [
      {
        id: "tier_1",
        name: initialConfig?.tier1Name || "Màu sắc",
        values: initialConfig?.tier1Values || [],
        images: initialConfig?.tier1Images || {},
      },
      {
        id: "tier_2",
        name: initialConfig?.tier2Name || "Kích cỡ",
        values: initialConfig?.tier2Values || [],
        images: {},
      },
    ];
  });

  // Input states for each tier
  const [tierInputs, setTierInputs] = useState<Record<string, string>>({});

  // Preserved user edits on combos
  const [combos, setCombos] = useState<Record<string, VariantCombination>>(() => {
    const map: Record<string, VariantCombination> = {};
    if (initialConfig?.combinations) {
      for (const c of initialConfig.combinations) {
        map[c.id] = c;
      }
    }
    return map;
  });

  // Batch fill inputs
  const [batchPrice, setBatchPrice] = useState<string>("");
  const [batchOriginalPrice, setBatchOriginalPrice] = useState<string>("");
  const [batchSkuPrefix, setBatchSkuPrefix] = useState<string>("");

  // Row-level tier value overrides
  const [rowTierOverrides, setRowTierOverrides] = useState<Record<string, Record<number, string>>>({});

  // Matrix Filter & Search state
  const [matrixSearch, setMatrixSearch] = useState<string>("");
  const [filterTier1Val, setFilterTier1Val] = useState<string>("ALL");
  const [onlyEnabled, setOnlyEnabled] = useState<boolean>(false);

  // Handle row tier override change
  const handleRowTierChange = (comboId: string, tierIdx: number, newVal: string) => {
    setRowTierOverrides((prev) => ({
      ...prev,
      [comboId]: {
        ...(prev[comboId] || {}),
        [tierIdx]: newVal,
      },
    }));
  };

  // Move tier position (Up or Down)
  const handleMoveTier = (tierIdx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? tierIdx - 1 : tierIdx + 1;
    if (targetIdx < 0 || targetIdx >= tiers.length) return;
    setTiers((prev) => {
      const next = [...prev];
      const temp = next[tierIdx];
      next[tierIdx] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
  };

  // Add new tier
  const handleAddTier = () => {
    const usedNames = new Set(tiers.map((t) => t.name.trim().toLowerCase()));
    const firstUnusedPreset =
      TIER_PRESETS.find((p) => !usedNames.has(p.toLowerCase())) ||
      `Tầng ${tiers.length + 1}`;

    setTiers((prev) => [
      ...prev,
      {
        id: `tier_${Date.now()}`,
        name: firstUnusedPreset,
        values: [],
        images: {},
      },
    ]);
  };

  // Remove a tier
  const handleRemoveTier = (tierId: string) => {
    if (tiers.length <= 1) {
      setTiers((prev) => prev.map((t) => (t.id === tierId ? { ...t, values: [], images: {} } : t)));
      return;
    }
    setTiers((prev) => prev.filter((t) => t.id !== tierId));
  };

  // Update tier name
  const handleUpdateTierName = (tierId: string, name: string) => {
    setTiers((prev) => prev.map((t) => (t.id === tierId ? { ...t, name } : t)));
  };

  // Add tag values (supports comma separation or single value)
  const handleAddTierValue = (tierId: string, rawVal?: string) => {
    const input = rawVal !== undefined ? rawVal : (tierInputs[tierId] || "");
    const rawTokens = input.split(/[,;\n]+/).map((v) => v.trim()).filter(Boolean);
    if (rawTokens.length === 0) return;

    setTiers((prev) =>
      prev.map((t) => {
        if (t.id !== tierId) return t;
        const existingLower = new Set(t.values.map((v) => v.toLowerCase()));
        const newUnique = rawTokens.filter((token) => !existingLower.has(token.toLowerCase()));
        if (newUnique.length === 0) return t;
        return {
          ...t,
          values: [...t.values, ...newUnique],
        };
      })
    );

    setTierInputs((prev) => ({ ...prev, [tierId]: "" }));
  };

  // Remove tag value from a tier
  const handleRemoveTierValue = (tierId: string, valToRemove: string) => {
    setTiers((prev) =>
      prev.map((t) => {
        if (t.id !== tierId) return t;
        const newImages = { ...(t.images || {}) };
        delete newImages[valToRemove];
        return {
          ...t,
          values: t.values.filter((v) => v !== valToRemove),
          images: newImages,
        };
      })
    );
  };

  // Handle tier image upload
  const handleTierImageChange = (tierId: string, val: string, file: File | null) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setTiers((prev) =>
      prev.map((t) => {
        if (t.id !== tierId) return t;
        return {
          ...t,
          images: {
            ...(t.images || {}),
            [val]: { file, url: previewUrl },
          },
        };
      })
    );
  };

  // Generate Cartesian combinations for arbitrary N tiers
  const generatedCombinations = useMemo<VariantCombination[]>(() => {
    if (!isEnabled) return [];

    const activeTiers = tiers.filter((t) => t.values.length > 0);
    if (activeTiers.length === 0) return [];

    const cartesianLists = activeTiers.reduce<
      Array<Array<{ tierName: string; rawTierName: string; value: string; tierId: string; tierIndex: number }>>
    >((acc, tier, tierIdx) => {
      const effectiveName = tier.name?.trim() || TIER_PRESETS[tierIdx] || `Tầng ${tierIdx + 1}`;
      const result: Array<Array<{ tierName: string; rawTierName: string; value: string; tierId: string; tierIndex: number }>> = [];
      for (const prevCombo of acc) {
        for (const val of tier.values) {
          result.push([
            ...prevCombo,
            {
              tierName: effectiveName,
              rawTierName: tier.name || "",
              value: val,
              tierId: tier.id,
              tierIndex: tierIdx,
            },
          ]);
        }
      }
      return result;
    }, [[]]);

    return cartesianLists.map((comboList) => {
      const id = comboList.map((item) => item.value).join("__");
      const existing = combos[id];

      const tierValues: Record<string, string> = {};
      comboList.forEach((item) => {
        tierValues[item.tierName] = item.value;
        if (item.rawTierName) {
          tierValues[item.rawTierName] = item.value;
          tierValues[item.rawTierName.trim()] = item.value;
        }
        tierValues[item.tierId] = item.value;
      });

      let variantImageUrl: string | undefined = existing?.variantImageUrl;
      let imageFile: File | null | undefined = existing?.imageFile;

      if (!variantImageUrl) {
        for (const item of comboList) {
          const t = activeTiers.find((tier) => tier.id === item.tierId);
          if (t?.images?.[item.value]?.url) {
            variantImageUrl = t.images[item.value].url;
            imageFile = t.images[item.value].file;
            break;
          }
        }
      }

      const generatedSku = `${baseSku ? baseSku + "-" : ""}${comboList.map((item) => slugify(item.value)).join("-")}`;
      const variantName = comboList.map((item) => item.value).join(" - ");

      return {
        id,
        tierValues,
        tierValueList: comboList.map((item) => ({
          name: item.tierName,
          tierName: item.tierName,
          value: item.value,
        })),
        variantName,
        price: existing?.price !== undefined ? existing.price : (basePrice > 0 ? basePrice : 0),
        originalPrice: existing?.originalPrice,
        availability: existing?.availability !== undefined ? existing.availability : 0,
        sku: existing?.sku ? existing.sku : generatedSku,
        variantImageUrl,
        imageFile,
        enabled: existing?.enabled !== undefined ? existing.enabled : true,
      };
    });
  }, [tiers, isEnabled, combos, baseSku, basePrice]);

  // Apply row-level tier overrides
  const finalCombinations = useMemo(() => {
    return generatedCombinations.map((combo) => {
      const overrides = rowTierOverrides[combo.id];
      if (!overrides) return combo;

      const newTierValueList = combo.tierValueList.map((item, idx) => {
        if (overrides[idx]) {
          return { ...item, value: overrides[idx] };
        }
        return item;
      });

      const newTierValues = { ...combo.tierValues };
      newTierValueList.forEach((item) => {
        newTierValues[item.tierName] = item.value;
      });

      const newVariantName = newTierValueList.map((i) => i.value).join(" - ");
      return {
        ...combo,
        tierValueList: newTierValueList,
        tierValues: newTierValues,
        variantName: newVariantName,
      };
    });
  }, [generatedCombinations, rowTierOverrides]);

  // Notify parent on changes
  useEffect(() => {
    const tier1 = tiers[0] || { name: "Màu sắc", values: [], images: {} };
    const tier2 = tiers[1];

    onChange({
      enabled: isEnabled,
      tiers,
      tier1Name: tier1.name,
      tier1Values: tier1.values,
      tier1Images: tier1.images || {},
      tier2Enabled: Boolean(tier2 && tier2.values.length > 0),
      tier2Name: tier2?.name || "Kích cỡ",
      tier2Values: tier2?.values || [],
      combinations: finalCombinations,
    });
  }, [tiers, isEnabled, finalCombinations, onChange]);

  // Update specific combo
  const updateCombo = (id: string, patch: Partial<VariantCombination>) => {
    setCombos((prev) => {
      const current = prev[id] || finalCombinations.find((c) => c.id === id);
      if (!current) return prev;
      return {
        ...prev,
        [id]: {
          ...current,
          ...patch,
        },
      };
    });
  };

  // Bulk Apply Handler
  const handleBatchApply = () => {
    const numPrice = Number(batchPrice);
    const numOrig = Number(batchOriginalPrice);

    setCombos((prev) => {
      const next = { ...prev };
      finalCombinations.forEach((combo) => {
        const current = next[combo.id] || combo;
        next[combo.id] = {
          ...current,
          price: batchPrice !== "" && Number.isFinite(numPrice) && numPrice > 0 ? numPrice : current.price,
          originalPrice:
            batchOriginalPrice !== "" && Number.isFinite(numOrig) && numOrig >= 0
              ? numOrig
              : current.originalPrice,
          sku:
            batchSkuPrefix.trim() !== ""
              ? `${batchSkuPrefix.trim().toUpperCase()}-${combo.tierValueList.map((t) => slugify(t.value)).join("-")}`
              : current.sku,
        };
      });
      return next;
    });
  };

  // Copy First Row to All Rows
  const handleCopyFirstRow = () => {
    if (finalCombinations.length <= 1) return;
    const first = finalCombinations[0];
    setCombos((prev) => {
      const next = { ...prev };
      finalCombinations.slice(1).forEach((combo) => {
        const current = next[combo.id] || combo;
        next[combo.id] = {
          ...current,
          price: first.price,
          originalPrice: first.originalPrice,
        };
      });
      return next;
    });
  };

  // Auto-generate Smart SKUs for all rows
  const handleAutoGenerateSkus = () => {
    setCombos((prev) => {
      const next = { ...prev };
      finalCombinations.forEach((combo) => {
        const current = next[combo.id] || combo;
        const autoSku = `${baseSku ? baseSku + "-" : ""}${combo.tierValueList.map((t) => slugify(t.value)).join("-")}`;
        next[combo.id] = {
          ...current,
          sku: autoSku,
        };
      });
      return next;
    });
  };

  // Toggle All Rows
  const handleToggleAll = (targetState: boolean) => {
    setCombos((prev) => {
      const next = { ...prev };
      finalCombinations.forEach((combo) => {
        const current = next[combo.id] || combo;
        next[combo.id] = {
          ...current,
          enabled: targetState,
        };
      });
      return next;
    });
  };

  // Clone Price from one row to rows below
  const handleClonePriceDown = (startIdx: number) => {
    if (startIdx >= finalCombinations.length - 1) return;
    const source = finalCombinations[startIdx];
    setCombos((prev) => {
      const next = { ...prev };
      for (let i = startIdx + 1; i < finalCombinations.length; i++) {
        const target = finalCombinations[i];
        const current = next[target.id] || target;
        next[target.id] = {
          ...current,
          price: source.price,
          originalPrice: source.originalPrice,
        };
      }
      return next;
    });
  };

  // Filtered combos for matrix display
  const displayCombinations = useMemo(() => {
    let list = finalCombinations;

    if (onlyEnabled) {
      list = list.filter((c) => c.enabled);
    }

    if (filterTier1Val !== "ALL") {
      list = list.filter((c) => {
        const t1Val = c.tierValueList?.[0]?.value || "";
        return t1Val.toLowerCase() === filterTier1Val.toLowerCase();
      });
    }

    const q = matrixSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((c) => {
        const name = c.variantName.toLowerCase();
        const sku = c.sku.toLowerCase();
        const vals = c.tierValueList.map((t) => t.value.toLowerCase()).join(" ");
        return name.includes(q) || sku.includes(q) || vals.includes(q);
      });
    }

    return list;
  }, [finalCombinations, onlyEnabled, filterTier1Val, matrixSearch]);

  // Aggregate stats
  const { minP, maxP, enabledCount, invalidPriceCount } = useMemo(() => {
    const active = finalCombinations.filter((c) => c.enabled);
    const prices = active.map((c) => c.price).filter((p) => p > 0);
    const invalid = active.filter((c) => !c.price || c.price <= 0).length;
    return {
      minP: prices.length > 0 ? Math.min(...prices) : 0,
      maxP: prices.length > 0 ? Math.max(...prices) : 0,
      enabledCount: active.length,
      invalidPriceCount: invalid,
    };
  }, [finalCombinations]);

  const tier1Values = tiers[0]?.values || [];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ── Main Switch: Enable Multi-tier ── */}
      <div className="flex items-center justify-between rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-r from-indigo-50/70 via-blue-50/40 to-white dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/25">
            <span className="material-symbols-outlined text-[24px]">dataset</span>
          </div>
          <div>
            <h4 className="font-headline text-base font-black text-slate-900 dark:text-white">
              Phân loại hàng đa tầng (Multi-tier Variant Matrix)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Tạo và kết hợp các thuộc tính phân loại (Màu sắc × Kích cỡ × Dung lượng...) thành bảng biến thể.
            </p>
          </div>
        </div>

        {/* Modern Toggle Switch */}
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
            className="peer sr-only"
          />
          <div className="peer h-7 w-12 rounded-full bg-slate-200 dark:bg-zinc-700 after:absolute after:top-[3px] after:left-[4px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-5 peer-focus:outline-none" />
        </label>
      </div>

      {isEnabled && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* ── TIER CONFIG CARDS ── */}
          {tiers.map((tier, tierIdx) => {
            const tierNumber = tierIdx + 1;
            const inputVal = tierInputs[tier.id] || "";
            const isFirst = tierIdx === 0;
            const isLast = tierIdx === tiers.length - 1;

            return (
              <div
                key={tier.id}
                className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 p-5 sm:p-6 shadow-sm dark:shadow-xl space-y-4"
              >
                {/* Tier Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 font-black text-xs text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/20">
                      T{tierNumber}
                    </span>
                    <div>
                      <h5 className="font-headline text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Nhóm phân loại {tierNumber}</span>
                        {tier.name && (
                          <span className="rounded-lg bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                            {tier.name}
                          </span>
                        )}
                        <span className="text-xs font-medium text-slate-400">
                          ({tier.values.length} giá trị)
                        </span>
                      </h5>
                    </div>
                  </div>

                  {/* Move Up/Down & Delete */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    {tiers.length > 1 && (
                      <>
                        <button
                          type="button"
                          disabled={isFirst}
                          onClick={() => handleMoveTier(tierIdx, "up")}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          title="Di chuyển lên"
                        >
                          <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                        </button>
                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => handleMoveTier(tierIdx, "down")}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          title="Di chuyển xuống"
                        >
                          <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveTier(tier.id)}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ml-1"
                          title="Xóa tầng này"
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                          <span>Xóa</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                  {/* Left Column: Tên nhóm phân loại */}
                  <div className="lg:col-span-4 space-y-2.5">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                      Tên nhóm thuộc tính
                    </label>
                    <input
                      type="text"
                      value={tier.name}
                      onChange={(e) => handleUpdateTierName(tier.id, e.target.value)}
                      placeholder="Ví dụ: Màu sắc, Kích cỡ..."
                      className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />

                    {/* Presets Chips */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">
                        Gợi ý nhóm nhanh:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {TIER_PRESETS.map((preset) => {
                          const isCurrent = tier.name.trim().toLowerCase() === preset.toLowerCase();
                          const otherTiers = tiers.filter((t) => t.id !== tier.id);
                          const usedByOther = otherTiers.some(
                            (t) => t.name.trim().toLowerCase() === preset.toLowerCase()
                          );

                          return (
                            <button
                              key={preset}
                              type="button"
                              disabled={usedByOther}
                              onClick={() => handleUpdateTierName(tier.id, preset)}
                              className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${
                                isCurrent
                                  ? "bg-indigo-600 text-white shadow-xs"
                                  : usedByOther
                                  ? "bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed opacity-40 line-through"
                                  : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-zinc-700"
                              }`}
                            >
                              {preset}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Giá trị phân loại */}
                  <div className="lg:col-span-8 space-y-3">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                      Các giá trị phân loại (Hỗ trợ dán hoặc nhập nhiều giá trị cách nhau bằng dấu phẩy)
                    </label>

                    {/* Value suggestions */}
                    {(() => {
                      const tierKey = (tier.name || "").toLowerCase().trim();
                      const matchedKey = Object.keys(VALUE_PRESETS).find((k) => tierKey.includes(k));
                      const suggestedValues = matchedKey ? VALUE_PRESETS[matchedKey] : null;
                      if (!suggestedValues) return null;

                      return (
                        <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-1">
                            Gợi ý giá trị:
                          </span>
                          {suggestedValues.map((sug) => {
                            const isAdded = tier.values.some((v) => v.toLowerCase() === sug.toLowerCase());
                            const colorDot = COLOR_SWATCHES[sug.toLowerCase()];

                            return (
                              <button
                                key={sug}
                                type="button"
                                onClick={() => {
                                  if (isAdded) {
                                    handleRemoveTierValue(tier.id, sug);
                                  } else {
                                    handleAddTierValue(tier.id, sug);
                                  }
                                }}
                                className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all inline-flex items-center gap-1 ${
                                  isAdded
                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                                    : "bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-indigo-400 hover:text-indigo-600"
                                }`}
                              >
                                {colorDot && (
                                  <span
                                    className="h-2 w-2 rounded-full border border-black/20"
                                    style={{ backgroundColor: colorDot }}
                                  />
                                )}
                                <span>{isAdded ? `✓ ${sug}` : `+ ${sug}`}</span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* Tag Input Bar */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputVal}
                        onChange={(e) =>
                          setTierInputs((prev) => ({ ...prev, [tier.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            handleAddTierValue(tier.id);
                          }
                        }}
                        placeholder={`Nhập giá trị cho ${tier.name || `Tầng ${tierNumber}`} (ví dụ: Đen, Trắng, Đỏ) rồi nhấn Enter`}
                        className="flex-1 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddTierValue(tier.id)}
                        className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-500 transition-all active:scale-95"
                      >
                        + Thêm
                      </button>
                    </div>

                    {/* Value Tag Pills + Image Slot for Tier 1 */}
                    {tier.values.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                        {tier.values.map((val) => {
                          const img = tier.images?.[val]?.url;
                          const isTier1 = tierNumber === 1;
                          const colorDot = COLOR_SWATCHES[val.toLowerCase()];

                          return (
                            <div
                              key={val}
                              className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/80 dark:border-zinc-700 bg-slate-50/60 dark:bg-zinc-800/60 p-2 transition-all hover:border-indigo-400"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {isTier1 && (
                                  <label
                                    className="relative flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 hover:border-indigo-500 transition-colors"
                                    title={`Tải ảnh đại diện cho màu ${val}`}
                                  >
                                    {img ? (
                                      /* eslint-disable-next-line @next/next/no-img-element */
                                      <img src={img} alt={val} className="h-full w-full object-cover" />
                                    ) : (
                                      <span className="material-symbols-outlined text-[15px] text-slate-400">
                                        add_photo_alternate
                                      </span>
                                    )}
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="sr-only"
                                      onChange={(e) => {
                                        const f = e.target.files?.[0] || null;
                                        handleTierImageChange(tier.id, val, f);
                                      }}
                                    />
                                  </label>
                                )}

                                {colorDot && (
                                  <span
                                    className="h-3 w-3 shrink-0 rounded-full border border-black/20"
                                    style={{ backgroundColor: colorDot }}
                                  />
                                )}

                                <span className="font-bold text-xs text-slate-800 dark:text-zinc-100 truncate">
                                  {val}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveTierValue(tier.id, val)}
                                className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 transition-colors"
                                title="Xóa giá trị này"
                              >
                                <span className="material-symbols-outlined text-[14px]">close</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* ── ADD NEW TIER BUTTON ── */}
          <div className="flex items-center justify-center pt-1">
            <button
              type="button"
              onClick={handleAddTier}
              className="flex items-center gap-2 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-700/80 bg-indigo-50/40 dark:bg-indigo-950/20 px-6 py-3 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/40 transition-all hover:scale-[1.01] active:scale-98 shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>+ Thêm tầng phân loại mới (Tầng {tiers.length + 1})</span>
            </button>
          </div>

          {/* ── BẢNG MA TRẬN BIẾN THỂ (MATRIX TABLE) ── */}
          {generatedCombinations.length > 0 && (
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 shadow-xl backdrop-blur-xl mt-6 space-y-0">
              {/* Header & Stats Banner */}
              <div className="border-b border-slate-100 dark:border-zinc-800 p-5 sm:p-6 bg-slate-50/70 dark:bg-zinc-850/50">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-headline text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">grid_on</span>
                      <span>Ma trận biến thể</span>
                      <span className="rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 text-xs font-black">
                        {enabledCount} / {finalCombinations.length} đang bật
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">
                      Tổ hợp tự động:{" "}
                      <strong className="text-slate-700 dark:text-zinc-200">
                        {tiers
                          .filter((t) => t.values.length > 0)
                          .map((t, idx) => t.name?.trim() || `Tầng ${idx + 1}`)
                          .join(" × ")}
                      </strong>
                    </p>
                  </div>

                  {/* Badges tổng quan */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="rounded-xl border border-slate-200/80 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Khoảng giá</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {minP > 0 ? (minP === maxP ? formatVnd(minP) : `${formatVnd(minP)} ~ ${formatVnd(maxP)}`) : "Chưa có giá"}
                      </span>
                    </div>

                    {invalidPriceCount > 0 && (
                      <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 text-xs flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
                        <span className="material-symbols-outlined text-[16px]">warning</span>
                        <span>{invalidPriceCount} dòng chưa có giá</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── BATCH APPLY TOOLBAR ── */}
                <div className="mt-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-black text-indigo-950 dark:text-indigo-300">
                      <span className="material-symbols-outlined text-[18px] text-indigo-600">bolt</span>
                      <span>Thao tác nhanh cho tất cả {finalCombinations.length} phân loại</span>
                    </div>

                    {/* Quick utility buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={handleCopyFirstRow}
                        className="rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2.5 py-1 text-slate-700 dark:text-zinc-300 hover:border-indigo-500 hover:text-indigo-600 transition-colors shadow-2xs"
                        title="Sao chép giá bán và giá gốc của dòng 1 cho tất cả các dòng còn lại"
                      >
                        Sao chép từ dòng 1
                      </button>
                      <button
                        type="button"
                        onClick={handleAutoGenerateSkus}
                        className="rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2.5 py-1 text-slate-700 dark:text-zinc-300 hover:border-indigo-500 hover:text-indigo-600 transition-colors shadow-2xs"
                        title="Tự động tạo mã SKU chuẩn hoá cho tất cả biến thể"
                      >
                        ⚡ Tự động tạo SKU
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleAll(true)}
                        className="rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2.5 py-1 text-emerald-600 hover:bg-emerald-50 transition-colors shadow-2xs"
                      >
                        Bật tất cả
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleAll(false)}
                        className="rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2.5 py-1 text-rose-600 hover:bg-rose-50 transition-colors shadow-2xs"
                      >
                        Tắt tất cả
                      </button>
                    </div>
                  </div>

                  {/* Batch Input Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                          Giá bán (VND)
                        </label>
                        {basePrice > 0 && (
                          <button
                            type="button"
                            onClick={() => setBatchPrice(String(basePrice))}
                            className="text-[10px] font-bold text-indigo-600 hover:underline"
                          >
                            = Giá gốc
                          </button>
                        )}
                      </div>
                      <input
                        type="number"
                        min={1}
                        placeholder="VD: 150000"
                        value={batchPrice}
                        onChange={(e) => setBatchPrice(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                        Giá niêm yết / gốc (VND)
                      </label>
                      <input
                        type="number"
                        min={0}
                        placeholder="VD: 200000"
                        value={batchOriginalPrice}
                        onChange={(e) => setBatchOriginalPrice(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                        Tiền tố SKU
                      </label>
                      <input
                        type="text"
                        placeholder="VD: SP-NEW"
                        value={batchSkuPrefix}
                        onChange={(e) => setBatchSkuPrefix(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-mono uppercase font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={handleBatchApply}
                        className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-indigo-500/20 hover:brightness-110 active:scale-95 transition-all"
                      >
                        Áp dụng hàng loạt
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── MATRIX FILTER & SEARCH BAR ── */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-[11px] font-bold text-slate-400 mr-1">Lọc nhanh:</span>
                    <button
                      type="button"
                      onClick={() => setFilterTier1Val("ALL")}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                        filterTier1Val === "ALL"
                          ? "bg-indigo-600 text-white shadow-2xs"
                          : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700"
                      }`}
                    >
                      Tất cả ({finalCombinations.length})
                    </button>
                    {tier1Values.map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setFilterTier1Val(val)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                          filterTier1Val.toLowerCase() === val.toLowerCase()
                            ? "bg-indigo-600 text-white shadow-2xs"
                            : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={onlyEnabled}
                        onChange={(e) => setOnlyEnabled(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Chỉ hiện đang bật</span>
                    </label>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Tìm kiếm biến thể..."
                        value={matrixSearch}
                        onChange={(e) => setMatrixSearch(e.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 pl-8 pr-3 py-1.5 text-xs font-medium text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                      />
                      <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[14px] text-slate-400">
                        search
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── TABLE VIEW ── */}
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 z-20 backdrop-blur-md bg-slate-50/95 dark:bg-zinc-800/95 shadow-2xs">
                    <tr className="border-b border-slate-200 dark:border-zinc-700 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                      <th className="py-3.5 pl-6 pr-2 w-12 text-center">STT</th>
                      {tiers
                        .filter((t) => t.values.length > 0)
                        .map((t, idx) => {
                          const displayName = t.name?.trim() || `Tầng ${idx + 1}`;
                          return (
                            <th key={t.id} className="py-3.5 px-3 min-w-[120px]">
                              T{idx + 1}: {displayName}
                            </th>
                          );
                        })}
                      <th className="py-3.5 px-3 min-w-[150px]">
                        Giá bán (VND) <span className="text-rose-500">*</span>
                      </th>
                      <th className="py-3.5 px-3 min-w-[130px]">Giá gốc (VND)</th>
                      <th className="py-3.5 px-3 min-w-[80px] text-center">Tồn kho</th>
                      <th className="py-3.5 px-3 min-w-[140px]">Mã SKU</th>
                      <th className="py-3.5 pr-6 pl-3 w-16 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {displayCombinations.map((combo, comboIdx) => {
                      const img = combo.variantImageUrl;
                      const activeTiersList = tiers.filter((t) => t.values.length > 0);
                      const isPriceInvalid = combo.enabled && (!combo.price || combo.price <= 0);

                      return (
                        <tr
                          key={combo.id}
                          className={`group transition-colors ${
                            !combo.enabled
                              ? "opacity-40 bg-slate-50/50 dark:bg-zinc-950/40"
                              : isPriceInvalid
                              ? "bg-rose-50/40 dark:bg-rose-950/20"
                              : "hover:bg-indigo-50/25 dark:hover:bg-indigo-950/20"
                          }`}
                        >
                          {/* STT */}
                          <td className="py-3 pl-6 pr-2 font-mono font-bold text-xs text-center text-slate-400">
                            {comboIdx + 1}
                          </td>

                          {/* Tier Values with re-select */}
                          {activeTiersList.map((t, idx) => {
                            const val =
                              combo.tierValueList?.[idx]?.value ||
                              combo.tierValues?.[t.id] ||
                              "—";

                            return (
                              <td key={t.id} className="py-3 px-3">
                                {idx === 0 ? (
                                  <div className="flex items-center gap-2">
                                    {img ? (
                                      /* eslint-disable-next-line @next/next/no-img-element */
                                      <img
                                        src={img}
                                        alt={val}
                                        className="h-7 w-7 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-zinc-700 shrink-0"
                                      />
                                    ) : (
                                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-zinc-800 text-[10px] font-bold text-slate-400 shrink-0">
                                        —
                                      </span>
                                    )}

                                    {t.values.length > 1 ? (
                                      <select
                                        disabled={!combo.enabled}
                                        value={val}
                                        onChange={(e) => handleRowTierChange(combo.id, idx, e.target.value)}
                                        className="rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1 text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
                                      >
                                        {t.values.map((opt) => (
                                          <option key={opt} value={opt}>
                                            {opt}
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      <span className="font-bold text-slate-800 dark:text-white text-xs">
                                        {val}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  t.values.length > 1 ? (
                                    <select
                                      disabled={!combo.enabled}
                                      value={val}
                                      onChange={(e) => handleRowTierChange(combo.id, idx, e.target.value)}
                                      className="rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1 text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
                                    >
                                      {t.values.map((opt) => (
                                        <option key={opt} value={opt}>
                                          {opt}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <span className="rounded-md bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-bold text-slate-700 dark:text-zinc-200">
                                      {val}
                                    </span>
                                  )
                                )}
                              </td>
                            );
                          })}

                          {/* Giá bán with live formatted currency */}
                          <td className="py-3 px-3">
                            <div className="space-y-1">
                              <div className="relative group/price flex items-center">
                                <input
                                  type="number"
                                  min={1}
                                  required
                                  disabled={!combo.enabled}
                                  value={combo.price > 0 ? combo.price : ""}
                                  onChange={(e) =>
                                    updateCombo(combo.id, { price: Number(e.target.value) || 0 })
                                  }
                                  placeholder="Giá bán"
                                  className={`w-full rounded-lg border px-2.5 py-1.5 pr-8 text-xs font-bold outline-none transition-all ${
                                    isPriceInvalid
                                      ? "border-rose-400 bg-rose-50/50 text-rose-700 focus:border-rose-600"
                                      : "border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 focus:border-emerald-500"
                                  }`}
                                />
                                {comboIdx < displayCombinations.length - 1 && combo.price > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleClonePriceDown(comboIdx)}
                                    title={`Sao chép giá ${formatVnd(combo.price)} xuống tất cả dòng bên dưới`}
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 dark:bg-zinc-700 text-slate-500 hover:bg-indigo-600 hover:text-white transition-all shadow-2xs opacity-0 group-hover/price:opacity-100 focus:opacity-100"
                                  >
                                    <span className="material-symbols-outlined text-[13px]">arrow_downward</span>
                                  </button>
                                )}
                              </div>
                              {combo.price > 0 && (
                                <p className="text-[10px] font-mono font-bold text-emerald-600/80 dark:text-emerald-400/80">
                                  {formatVnd(combo.price)}
                                </p>
                              )}
                              {isPriceInvalid && (
                                <p className="text-[10px] font-bold text-rose-600 flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[11px]">warning</span>
                                  Bắt buộc
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Giá gốc */}
                          <td className="py-3 px-3">
                            <input
                              type="number"
                              min={0}
                              disabled={!combo.enabled}
                              value={combo.originalPrice ?? ""}
                              onChange={(e) =>
                                updateCombo(combo.id, {
                                  originalPrice: e.target.value !== "" ? Number(e.target.value) : undefined,
                                })
                              }
                              placeholder="Giá gốc"
                              className="w-full rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-slate-500 outline-none focus:border-indigo-500"
                            />
                          </td>

                          {/* Tồn kho (Locked) */}
                          <td className="py-3 px-3 text-center">
                            <span
                              title="Tồn kho ban đầu là 0. Số lượng kho được nhập qua chức năng Quản lý kho."
                              className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-[11px] font-mono font-bold text-slate-400 select-none"
                            >
                              0
                            </span>
                          </td>

                          {/* Mã SKU */}
                          <td className="py-3 px-3">
                            <input
                              type="text"
                              disabled={!combo.enabled}
                              value={combo.sku}
                              onChange={(e) => updateCombo(combo.id, { sku: e.target.value })}
                              placeholder="Mã SKU"
                              className="w-full rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-xs font-mono uppercase text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
                            />
                          </td>

                          {/* Toggle Switch */}
                          <td className="py-3 pr-6 pl-3 text-center">
                            <label className="relative inline-flex cursor-pointer items-center justify-center">
                              <input
                                type="checkbox"
                                checked={combo.enabled}
                                onChange={() => updateCombo(combo.id, { enabled: !combo.enabled })}
                                className="peer sr-only"
                              />
                              <div className="peer h-5 w-9 rounded-full bg-slate-200 dark:bg-zinc-700 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-xs after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-4 peer-focus:outline-none" />
                            </label>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
