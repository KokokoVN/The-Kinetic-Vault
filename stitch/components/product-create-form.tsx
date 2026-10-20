"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductMultiImageUploadPreview } from "./product-multi-image-upload-preview";
import { ProductNameLiveCheck } from "./product-name-live-check";
import { MultiTierVariantBuilder, type MultiTierConfig } from "./multi-tier-variant-builder";
import type { BackendCategory, AdminBrand } from "@/lib/api";

type ProductCreateFormProps = {
  categories: BackendCategory[];
  brands: AdminBrand[];
  allProducts: { id: string; name: string }[];
  defaultCategoryId: number | "";
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean; id?: number } | void>;
};

type CreateStep = "basic" | "media" | "variants" | "all";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function ProductCreateForm({
  categories,
  brands,
  allProducts,
  defaultCategoryId,
  action,
}: ProductCreateFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Navigation state
  const [activeStep, setActiveStep] = useState<CreateStep>("basic");

  // Basic Form States
  const [productName, setProductName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    defaultCategoryId === "" ? "" : String(defaultCategoryId)
  );
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [formPrice, setFormPrice] = useState<string>("");
  const [formSku, setFormSku] = useState<string>("");

  // Upload progress states
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<string | null>(null);
  const [uploadBytes, setUploadBytes] = useState<{ loaded: string; total: string } | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Multi-tier variants state
  const [multiTierConfig, setMultiTierConfig] = useState<MultiTierConfig | null>(null);
  const [variantProgressText, setVariantProgressText] = useState<string | null>(null);

  // Keyboard Shortcuts (Alt+1..3 to switch steps, Ctrl+S to save)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S / Cmd+S: Trigger save on product create form
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        const form = document.getElementById("product-create-form") as HTMLFormElement | null;
        if (form) {
          form.requestSubmit();
        }
      }

      // Alt+1..3 to switch steps
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.key === "1") {
          e.preventDefault();
          setActiveStep("basic");
        } else if (e.key === "2") {
          e.preventDefault();
          setActiveStep("media");
        } else if (e.key === "3") {
          e.preventDefault();
          setActiveStep("variants");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const appendTemplate = (text: string) => {
    setDescription((prev) => (prev ? `${prev.trim()}\n\n${text}` : text));
  };

  const uploadFilesWithProgress = (
    productId: number,
    files: File[],
    primaryIndex: number | null
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `/api/admin/products/${productId}/upload`);

      const uploadData = new FormData();
      files.forEach((file) => uploadData.append("files", file));
      if (primaryIndex !== null && primaryIndex >= 0) {
        uploadData.append("primaryIndex", String(primaryIndex));
      }

      let startTime = Date.now();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const loaded = event.loaded;
          const total = event.total;
          const percentage = Math.round((loaded / total) * 100);

          const elapsedTime = (Date.now() - startTime) / 1000;
          let speed = "0 KB/s";
          if (elapsedTime > 0) {
            const bps = loaded / elapsedTime;
            if (bps > 1024 * 1024) {
              speed = `${(bps / (1024 * 1024)).toFixed(1)} MB/s`;
            } else if (bps > 1024) {
              speed = `${(bps / 1024).toFixed(0)} KB/s`;
            } else {
              speed = `${bps.toFixed(0)} B/s`;
            }
          }

          setUploadProgress(percentage);
          setUploadSpeed(speed);
          setUploadBytes({
            loaded: formatBytes(loaded),
            total: formatBytes(total),
          });
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(xhr.responseText || `Lỗi tải lên (${xhr.status})`));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Lỗi kết nối mạng proxy."));
      };

      xhr.send(uploadData);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const imageFiles = formData.getAll("productImages").filter((x): x is File => x instanceof File && x.size > 0);
    const videoFiles = formData.getAll("productVideos").filter((x): x is File => x instanceof File && x.size > 0);
    const mergedFiles = [...imageFiles, ...videoFiles];

    const primaryRaw = Math.floor(Number(String(formData.get("primaryImageIndex") ?? "0").trim()));
    const primaryIndex =
      imageFiles.length > 0 ? Math.min(Math.max(0, Number.isFinite(primaryRaw) ? primaryRaw : 0), imageFiles.length - 1) : null;

    // Check video duration (<= 60s)
    for (const file of videoFiles) {
      if (file.type.startsWith("video/")) {
        try {
          const duration = await new Promise<number>((resolve, reject) => {
            const video = document.createElement("video");
            video.preload = "metadata";
            video.onloadedmetadata = () => {
              window.URL.revokeObjectURL(video.src);
              resolve(video.duration);
            };
            video.onerror = () => reject(new Error("Lỗi đọc video"));
            video.src = window.URL.createObjectURL(file);
          });
          if (duration > 60) {
            setError(`Video "${file.name}" vượt quá 60 giây (hiện tại: ${Math.round(duration)}s). Vui lòng chọn video khác.`);
            setActiveStep("media");
            return;
          }
        } catch (err) {
          setError(`Lỗi khi kiểm tra độ dài video "${file.name}".`);
          setActiveStep("media");
          return;
        }
      }
    }

    if (multiTierConfig?.enabled && multiTierConfig.combinations.length > 0) {
      const activeCombos = multiTierConfig.combinations.filter((c) => c.enabled);
      if (activeCombos.length === 0) {
        setError("Vui lòng kích hoạt ít nhất một tổ hợp phân loại hàng đa tầng.");
        setActiveStep("variants");
        return;
      }
      const invalidCombo = activeCombos.find((c) => !c.price || c.price <= 0);
      if (invalidCombo) {
        const comboLabel = invalidCombo.variantName || invalidCombo.tierValueList?.map((t) => t.value).join(" / ") || "biến thể";
        setError(`Phân loại "${comboLabel}" chưa nhập giá bán hợp lệ (> 0 VND).`);
        setActiveStep("variants");
        return;
      }
      const pRaw = Number(String(formData.get("price") ?? "").trim());
      if (!Number.isFinite(pRaw) || pRaw <= 0) {
        const minP = Math.min(...activeCombos.map((c) => c.price));
        formData.set("price", String(minP));
      }
      const sRaw = String(formData.get("sku") ?? "").trim();
      if (!sRaw) {
        formData.set("sku", `SP-${Date.now().toString(36).toUpperCase()}`);
      }
    }

    // Delete files from formData so Next.js server actions do not buffer them
    formData.delete("productImages");
    formData.delete("productVideos");

    startTransition(async () => {
      try {
        const res = await action(formData);
        if (res && res.error) {
          setError(res.error);
          return;
        }

        const createdId = res?.id;
        if (!createdId) {
          setError("create");
          return;
        }

        if (mergedFiles.length > 0) {
          setIsUploading(true);
          setUploadProgress(0);
          setUploadSpeed("0 KB/s");
          const totalSize = mergedFiles.reduce((acc, f) => acc + f.size, 0);
          setUploadBytes({ loaded: "0 B", total: formatBytes(totalSize) });

          try {
            await uploadFilesWithProgress(createdId, mergedFiles, primaryIndex);
          } catch (err: any) {
            console.error("Lỗi upload client-side:", err);
            router.push(`/admin/products/${encodeURIComponent(String(createdId))}/edit?error=upload_images`);
            return;
          } finally {
            setIsUploading(false);
          }
        }

        if (multiTierConfig?.enabled && multiTierConfig.combinations.some((c) => c.enabled)) {
          setVariantProgressText("Đang thiết lập ma trận biến thể đa tầng...");
          const activeCombos = multiTierConfig.combinations.filter((c) => c.enabled);
          const batchFormData = new FormData();

          const variantsPayload = activeCombos.map((c) => {
            const firstTier = c.tierValueList?.[0]?.value || "Mặc định";
            const remainingTiers = c.tierValueList?.slice(1).map((t) => t.value).join(" - ") || "Mặc định";
            return {
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

          try {
            await fetch(`/api/admin/products/${createdId}/variants/batch`, {
              method: "POST",
              body: batchFormData,
            });
          } catch (bErr) {
            console.warn("Lỗi lưu ma trận biến thể:", bErr);
          } finally {
            setVariantProgressText(null);
          }
        }

        router.push(`/admin/products/${encodeURIComponent(String(createdId))}/detail?success=create`);
      } catch (err: any) {
        setError(err.message || "create");
      }
    });
  };

  // Live validation checks
  const isBasicValid = Boolean(
    productName.trim() &&
    selectedCategory &&
    selectedBrand &&
    (multiTierConfig?.enabled || (Number(formPrice) > 0 && formSku.trim()))
  );

  const activeCombosCount = multiTierConfig?.enabled
    ? multiTierConfig.combinations.filter((c) => c.enabled).length
    : 0;

  const descWordCount = description.trim() ? description.trim().split(/\s+/).length : 0;
  const descCharCount = description.length;

  const steps: { id: CreateStep; label: string; icon: string; count?: string; shortcut: string }[] = [
    {
      id: "basic",
      label: "Thông tin cơ bản",
      icon: "edit_square",
      shortcut: "Alt+1",
      count: isBasicValid ? "✓" : undefined,
    },
    {
      id: "media",
      label: "Ảnh & Video",
      icon: "perm_media",
      shortcut: "Alt+2",
    },
    {
      id: "variants",
      label: "Phân loại đa tầng",
      icon: "grid_on",
      shortcut: "Alt+3",
      count: activeCombosCount > 0 ? `${activeCombosCount}` : undefined,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Progress Card khi đang tải ảnh hoặc tạo biến thể ── */}
      {(isUploading || variantProgressText) && (
        <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-white dark:bg-zinc-900 p-6 shadow-sm mb-6 animate-in fade-in">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 animate-pulse items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
              <span className="material-symbols-outlined text-[20px]">
                {variantProgressText ? "layers" : "cloud_upload"}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                {variantProgressText || "Đang tải lên hình ảnh & video"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Vui lòng giữ trình duyệt mở, không tải lại trang
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-bold text-slate-700 dark:text-zinc-200">
              <span>Tiến trình</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold border-t border-slate-100 dark:border-slate-800 pt-5 mt-5">
            <div className="flex items-center gap-1.5 font-mono bg-slate-50 dark:bg-zinc-800 px-3 py-1.5 rounded-lg">
              <span className="material-symbols-outlined text-[16px]">speed</span>
              <span>{uploadSpeed}</span>
            </div>
            <div className="font-mono bg-slate-50 dark:bg-zinc-800 px-3 py-1.5 rounded-lg">
              <span>
                {uploadBytes?.loaded} / {uploadBytes?.total}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Error Notification ── */}
      {error && (
        <div className="rounded-2xl bg-rose-50 dark:bg-rose-500/10 p-4 border border-rose-100 dark:border-rose-500/20 text-sm font-medium text-rose-600 dark:text-rose-400 flex items-start gap-3 animate-in shake">
          <span className="material-symbols-outlined text-[20px] mt-0.5">error</span>
          <div className="flex-1">
            <span className="font-bold">Lỗi: </span>
            <span>
              {error === "validation"
                ? "Vui lòng kiểm tra và điền đầy đủ các thông tin bắt buộc (*)."
                : error === "duplicate"
                ? "Tên sản phẩm này đã tồn tại trong danh mục, vui lòng chọn tên khác."
                : error === "duplicate_sku"
                ? "Mã SKU này đã tồn tại trong hệ thống, vui lòng nhập mã SKU khác."
                : error}
            </span>
          </div>
        </div>
      )}

      {/* ── Sticky Steps / Tabs Bar ── */}
      <div className="sticky top-4 z-30 -mx-1 px-2 py-2 backdrop-blur-xl bg-white/95 dark:bg-zinc-900/95 border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xl shadow-slate-900/5 transition-all">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Main Steps */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs font-bold">
            {steps.map((st) => {
              const isActive = activeStep === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setActiveStep(st.id)}
                  title={`${st.label} (Phím tắt: ${st.shortcut})`}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]"
                      : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[16px] ${
                      isActive ? "text-white" : "text-slate-500 dark:text-zinc-400"
                    }`}
                  >
                    {st.icon}
                  </span>
                  <span>{st.label}</span>
                  {st.count !== undefined && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                        st.count === "✓"
                          ? isActive
                            ? "bg-emerald-500 text-white"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          : isActive
                          ? "bg-white/25 text-white"
                          : "bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                      }`}
                    >
                      {st.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mode Switcher: Step View vs All View */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-zinc-800/80 p-1 text-[11px] font-bold text-slate-600 dark:text-zinc-400 border border-slate-200/60 dark:border-white/5 ml-auto">
            <button
              type="button"
              onClick={() => {
                if (activeStep === "all") setActiveStep("basic");
              }}
              className={`rounded-lg px-2.5 py-1 transition-all flex items-center gap-1 ${
                activeStep !== "all"
                  ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-xs font-black"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Chế độ bước gọn gàng: Chỉ hiển thị từng bước thao tác"
            >
              <span className="material-symbols-outlined text-[14px]">tab</span>
              <span>Theo bước</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveStep("all")}
              className={`rounded-lg px-2.5 py-1 transition-all flex items-center gap-1 ${
                activeStep === "all"
                  ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-xs font-black"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Hiển thị toàn bộ tất cả các mục trên một trang"
            >
              <span className="material-symbols-outlined text-[14px]">view_agenda</span>
              <span>Tất cả</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Form Form Element ── */}
      <form id="product-create-form" onSubmit={handleSubmit} className="space-y-6">
        
        {/* ========================================================
            STEP 1: THÔNG TIN CƠ BẢN
        ======================================================== */}
        <section
          id="section-basic"
          className={`relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 shadow-sm dark:shadow-2xl backdrop-blur-2xl transition-all ${
            activeStep === "basic" || activeStep === "all" ? "block" : "hidden"
          }`}
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
          
          <div className="p-6 sm:p-10 space-y-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <span className="material-symbols-outlined text-[22px]">info</span>
                </div>
                <div>
                  <h2 className="font-headline text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Bước 1: Thông tin sản phẩm
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Nhập tên, danh mục, thương hiệu, giá niêm yết và mô tả chi tiết
                  </p>
                </div>
              </div>

              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-zinc-800 px-3 py-1 text-xs font-bold text-slate-500 dark:text-zinc-400">
                Phím tắt: <kbd className="font-mono text-indigo-600 dark:text-indigo-400">Alt+1</kbd>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Cột trái: Tên sản phẩm & Mô tả */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <label
                    className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
                    htmlFor="productName"
                  >
                    <span className="material-symbols-outlined text-[15px] text-indigo-500">label</span>
                    Tên sản phẩm <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <ProductNameLiveCheck
                    fieldClass="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-zinc-900/60 px-5 py-3.5 text-sm font-medium text-slate-800 dark:text-white outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white dark:focus:bg-zinc-900 focus:ring-4 focus:ring-indigo-500/15"
                    defaultValue=""
                    hideLabel
                    onChange={setProductName}
                    existingNames={allProducts.map((p) => p.name)}
                  />
                </div>

                {/* Mô tả chi tiết với trợ lý soạn thảo */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
                      htmlFor="discription"
                    >
                      <span className="material-symbols-outlined text-[15px] text-indigo-500">description</span>
                      Mô tả chi tiết <span className="text-rose-500 ml-0.5">*</span>
                    </label>
                    <div className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                      {descWordCount} từ · {descCharCount} ký tự
                    </div>
                  </div>

                  {/* Trợ lý mẫu mô tả nhanh */}
                  <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 mr-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">auto_fix_high</span>
                      Mẫu nhanh:
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        appendTemplate(
                          "• Đặc điểm nổi bật:\n- Thiết kế hiện đại, sang trọng\n- Chất liệu cao cấp, độ bền cao\n- Dễ dàng sử dụng và bảo quản"
                        )
                      }
                      className="rounded-lg bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
                    >
                      + 💡 Đặc điểm nổi bật
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        appendTemplate(
                          "• Thông số kỹ thuật:\n- Xuất xứ: Chính hãng\n- Quy cách: Đóng gói tiêu chuẩn\n- Kích thước & Trọng lượng: Tiêu chuẩn"
                        )
                      }
                      className="rounded-lg bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
                    >
                      + 📋 Thông số cơ bản
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        appendTemplate(
                          "• Chính sách bảo hành:\n- Bảo hành chính hãng 12 tháng\n- Hỗ trợ đổi mới trong 30 ngày nếu có lỗi do nhà sản xuất"
                        )
                      }
                      className="rounded-lg bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
                    >
                      + 🛡️ Bảo hành
                    </button>
                  </div>

                  <textarea
                    id="discription"
                    name="discription"
                    rows={8}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full resize-none rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-zinc-900/60 px-5 py-3.5 text-sm font-medium text-slate-800 dark:text-white outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white dark:focus:bg-zinc-900 focus:ring-4 focus:ring-indigo-500/15 leading-relaxed"
                    placeholder="Nhập mô tả sản phẩm, công năng, thành phần hoặc bấm chọn mẫu nhanh phía trên..."
                  />
                </div>
              </div>

              {/* Cột phải: Phân loại, Thương hiệu, Giá & SKU */}
              <div className="lg:col-span-5 space-y-5">
                <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-zinc-900/50 p-6 space-y-6">
                  {/* Danh mục */}
                  <div>
                    <label
                      className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
                      htmlFor="categoryId"
                    >
                      <span className="material-symbols-outlined text-[15px] text-indigo-500">category</span>
                      Danh mục <span className="text-rose-500 ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="categoryId"
                        name="categoryId"
                        required
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full appearance-none rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-zinc-800/60 px-5 py-3.5 text-sm font-medium text-slate-800 dark:text-white outline-none transition-all focus:border-indigo-400 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-indigo-500/15"
                      >
                        <option value="" disabled>
                          — Chọn danh mục —
                        </option>
                        {categories.map((c) => (
                          <option key={c.id} value={String(c.id)}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">
                        expand_more
                      </span>
                    </div>
                  </div>

                  {/* Thương hiệu */}
                  <div>
                    <label
                      className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
                      htmlFor="brandId"
                    >
                      <span className="material-symbols-outlined text-[15px] text-indigo-500">stars</span>
                      Thương hiệu <span className="text-rose-500 ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="brandId"
                        name="brandId"
                        required
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="w-full appearance-none rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-zinc-800/60 px-5 py-3.5 text-sm font-medium text-slate-800 dark:text-white outline-none transition-all focus:border-indigo-400 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-indigo-500/15"
                      >
                        <option value="" disabled>
                          — Chọn thương hiệu —
                        </option>
                        {brands.map((b) => (
                          <option key={b.id} value={String(b.id)}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">
                        expand_more
                      </span>
                    </div>
                  </div>

                  {/* Giá niêm yết */}
                  <div>
                    <label
                      className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
                      htmlFor="price"
                    >
                      <span className="material-symbols-outlined text-[15px] text-emerald-500">payments</span>
                      Giá niêm yết{" "}
                      {multiTierConfig?.enabled ? (
                        <span className="text-slate-400 font-normal text-[10px]">
                          (Tự động đồng bộ từ ma trận biến thể)
                        </span>
                      ) : (
                        <span className="text-rose-500 ml-0.5">*</span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        id="price"
                        name="price"
                        type="number"
                        min={1}
                        step={1}
                        required={!multiTierConfig?.enabled}
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-zinc-800/60 px-5 py-3.5 pr-16 text-sm font-medium text-slate-800 dark:text-white outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-indigo-500/15"
                        placeholder={
                          multiTierConfig?.enabled ? "Tự động tính từ phân loại" : "Ví dụ: 150000"
                        }
                      />
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        VND
                      </span>
                    </div>
                    {Number(formPrice) > 0 && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <span className="material-symbols-outlined text-[15px]">check_circle</span>
                        <span>Định dạng: {Number(formPrice).toLocaleString("vi-VN")} ₫</span>
                      </p>
                    )}
                  </div>

                  {/* Mã SKU */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
                        htmlFor="sku"
                      >
                        <span className="material-symbols-outlined text-[15px] text-slate-400">barcode</span>
                        Mã SKU{" "}
                        {multiTierConfig?.enabled ? (
                          <span className="text-slate-400 font-normal text-[10px]">
                            (Làm tiền tố cho mã SKU biến thể)
                          </span>
                        ) : (
                          <span className="text-rose-500 ml-0.5">*</span>
                        )}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
                          setFormSku(`PRD-${rand}`);
                        }}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[13px]">shuffle</span>
                        <span>Tạo SKU ngẫu nhiên</span>
                      </button>
                    </div>
                    <input
                      id="sku"
                      name="sku"
                      required={!multiTierConfig?.enabled}
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-zinc-800/60 px-5 py-3.5 text-sm font-medium uppercase text-slate-800 dark:text-white outline-none transition-all placeholder:font-sans placeholder:normal-case placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-indigo-500/15"
                      placeholder="Mã SKU (VD: SP001)"
                    />
                    <div className="mt-3 flex items-start gap-2 rounded-xl bg-indigo-50/60 dark:bg-indigo-500/10 p-3.5 border border-indigo-100 dark:border-indigo-500/20">
                      <span className="material-symbols-outlined text-[16px] text-indigo-500 mt-0.5">info</span>
                      <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium leading-relaxed">
                        Tồn kho ban đầu luôn là 0. Bạn có thể làm phiếu Nhập kho theo từng biến thể trong trang chi tiết sau khi tạo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            STEP 2: HÌNH ẢNH & VIDEO
        ======================================================== */}
        <section
          id="section-media"
          className={`relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 shadow-sm dark:shadow-2xl backdrop-blur-2xl transition-all ${
            activeStep === "media" || activeStep === "all" ? "block" : "hidden"
          }`}
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600" />
          
          <div className="p-6 sm:p-10 space-y-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                  <span className="material-symbols-outlined text-[22px]">perm_media</span>
                </div>
                <div>
                  <h2 className="font-headline text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Bước 2: Hình ảnh & Video sản phẩm
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Tải lên bộ sưu tập ảnh chất lượng cao và video minh họa (tối đa 60 giây)
                  </p>
                </div>
              </div>

              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-zinc-800 px-3 py-1 text-xs font-bold text-slate-500 dark:text-zinc-400">
                Phím tắt: <kbd className="font-mono text-purple-600 dark:text-purple-400">Alt+2</kbd>
              </span>
            </div>

            <div className="space-y-8">
              <ProductMultiImageUploadPreview
                name="productImages"
                primaryIndexFieldName="primaryImageIndex"
                acceptType="images"
                label="Ảnh minh họa sản phẩm"
                hint="Có thể tải lên nhiều ảnh (JPG, PNG, WebP). Click vào ảnh xem trước để chọn ảnh đại diện chính."
              />

              <div className="pt-6 border-t border-slate-100 dark:border-zinc-800">
                <ProductMultiImageUploadPreview
                  name="productVideos"
                  acceptType="videos"
                  label="Video minh họa sản phẩm"
                  hint="Tải lên video giới thiệu sản phẩm (thời lượng bắt buộc dưới 60 giây)."
                />
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            STEP 3: CẤU HÌNH PHÂN LOẠI ĐA TẦNG
        ======================================================== */}
        <section
          id="section-variants"
          className={`relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 shadow-sm dark:shadow-2xl backdrop-blur-2xl transition-all ${
            activeStep === "variants" || activeStep === "all" ? "block" : "hidden"
          }`}
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600" />
          
          <div className="p-6 sm:p-10 space-y-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400">
                  <span className="material-symbols-outlined text-[22px]">grid_on</span>
                </div>
                <div>
                  <h2 className="font-headline text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Bước 3: Cấu hình biến thể đa tầng
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Thiết lập phân loại theo màu sắc, kích thước, dung lượng hoặc tuỳ chỉnh theo nhu cầu
                  </p>
                </div>
              </div>

              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-zinc-800 px-3 py-1 text-xs font-bold text-slate-500 dark:text-zinc-400">
                Phím tắt: <kbd className="font-mono text-teal-600 dark:text-teal-400">Alt+3</kbd>
              </span>
            </div>

            <div>
              <MultiTierVariantBuilder
                basePrice={Number(formPrice) || 0}
                baseSku={formSku || "SP"}
                onChange={setMultiTierConfig}
              />
            </div>
          </div>
        </section>

        {/* ========================================================
            STICKY ACTION / SUMMARY BAR
        ======================================================== */}
        <div className="sticky bottom-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-slate-200/80 dark:border-white/10 shadow-2xl backdrop-blur-xl">
          {/* Trạng thái tóm tắt nhanh */}
          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-zinc-300">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isBasicValid ? "bg-emerald-500" : "bg-amber-400 animate-pulse"
                }`}
              />
              <span className="font-bold">
                {productName ? (
                  <span className="text-slate-800 dark:text-white truncate max-w-[200px] inline-block align-bottom">
                    {productName}
                  </span>
                ) : (
                  "Chưa có tên sản phẩm"
                )}
              </span>
            </div>

            {multiTierConfig?.enabled && (
              <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                {activeCombosCount} biến thể
              </span>
            )}
          </div>

          {/* Nhóm nút điều hướng và lưu */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* Step navigation buttons if in step mode */}
            {activeStep === "basic" && (
              <button
                type="button"
                onClick={() => setActiveStep("media")}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <span>Tiếp: Ảnh & Video</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            )}

            {activeStep === "media" && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveStep("basic")}
                  className="flex items-center gap-1 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Quay lại</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep("variants")}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  <span>Tiếp: Đa tầng</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </>
            )}

            {activeStep === "variants" && (
              <button
                type="button"
                onClick={() => setActiveStep("media")}
                className="flex items-center gap-1 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Quay lại Media</span>
              </button>
            )}

            <Link
              prefetch
              href="/admin/products"
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              Huỷ
            </Link>

            <button
              type="submit"
              disabled={isPending || isUploading}
              title="Phím tắt: Ctrl+S"
              className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-500/40 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/15 transition-transform duration-700 group-hover:translate-x-full" />
              <span className="material-symbols-outlined text-[18px]">
                {isPending ? "hourglass_top" : "save"}
              </span>
              <span>{isPending ? "Đang tạo sản phẩm..." : "Lưu & Tạo sản phẩm"}</span>
              <kbd className="hidden sm:inline-block rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-mono font-medium text-white ml-1">
                Ctrl+S
              </kbd>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
