"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { resolveCatalogImageUrl } from "@/lib/api";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";

const TIER_PRESETS = [
  "Màu sắc",
  "Kích cỡ",
  "Dung lượng",
  "RAM",
  "Bảo hành",
  "Phiên bản",
  "Chất liệu",
  "Quy cách",
  "Xuất xứ",
];

function normalize(v: string): string {
  return v.trim().toLowerCase();
}

type VariantPair = { size: string; color: string };

type AttributeItem = { name: string; value: string };

function parseInitialAttributes(json?: string | null, fallbackColor = "", fallbackSize = ""): AttributeItem[] {
  if (json) {
    try {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const list: AttributeItem[] = [];
        for (const it of parsed) {
          if (typeof it === "object" && it !== null) {
            const name = String((it as any).tierName || (it as any).name || (it as any).key || "").trim();
            const val = String((it as any).value || (it as any).val || "").trim();
            if (name && val) list.push({ name, value: val });
          }
        }
        if (list.length > 0) return list;
      } else if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        const list: AttributeItem[] = [];
        for (const [key, val] of Object.entries(parsed)) {
          const name = String(key).trim();
          const strVal = String(val ?? "").trim();
          if (name && strVal) list.push({ name, value: strVal });
        }
        if (list.length > 0) return list;
      }
    } catch {}
  }
  const items: AttributeItem[] = [];
  if (fallbackColor.trim()) items.push({ name: "Màu sắc", value: fallbackColor.trim() });
  if (fallbackSize.trim()) {
    const parts = fallbackSize.split(/\s+[-•/]\s+/).map((p) => p.trim()).filter(Boolean);
    if (parts.length > 1) {
      parts.forEach((part, idx) => {
        const tierName = idx === 0 ? "Kích cỡ / Dung lượng" : idx === 1 ? "Phiên bản / Chất liệu" : `Tầng ${idx + 2}`;
        items.push({ name: tierName, value: part });
      });
    } else {
      items.push({ name: "Kích cỡ", value: fallbackSize.trim() });
    }
  }
  return items;
}

export type VariantEditFormLiveCheckProps = {
  action: (formData: FormData) => void | Promise<void>;
  variantId: number;
  defaultSize: string;
  defaultColor: string;
  defaultPrice: number;
  defaultVariantImageUrl: string;
  availabilityPreserve: number;
  otherVariants: VariantPair[];
  inputClassName: string;
  defaultVariantName?: string | null;
  defaultSku?: string | null;
  defaultOriginalPrice?: number | null;
  defaultAttributesJson?: string | null;
};

export function VariantEditFormLiveCheck({
  action,
  variantId,
  defaultSize,
  defaultColor,
  defaultPrice,
  defaultVariantImageUrl,
  availabilityPreserve,
  otherVariants,
  inputClassName,
  defaultVariantName,
  defaultSku,
  defaultOriginalPrice,
  defaultAttributesJson,
}: VariantEditFormLiveCheckProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [size, setSize] = useState(defaultSize);
  const [color, setColor] = useState(defaultColor);
  const [variantName, setVariantName] = useState(defaultVariantName ?? "");
  const [sku, setSku] = useState(defaultSku ?? "");
  const [originalPrice, setOriginalPrice] = useState<string>(
    defaultOriginalPrice != null && Number(defaultOriginalPrice) > 0 ? String(defaultOriginalPrice) : ""
  );
  const [attributes, setAttributes] = useState<AttributeItem[]>(() =>
    parseInitialAttributes(defaultAttributesJson, defaultColor, defaultSize)
  );
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<File | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const duplicate = useMemo(() => {
    const ns = normalize(size);
    const nc = normalize(color);
    if (!ns || !nc) return false;
    return otherVariants.some((v) => normalize(v.size) === ns && normalize(v.color) === nc);
  }, [size, color, otherVariants]);

  const currentImg = defaultVariantImageUrl.trim() ? resolveCatalogImageUrl(defaultVariantImageUrl) : null;

  function syncAttributes(updated: AttributeItem[]) {
    setAttributes(updated);
    if (updated.length > 0) {
      const nextColor = updated[0]?.value.trim() || "Mặc định";
      const nextSize =
        updated.slice(1).map((a) => a.value.trim()).filter(Boolean).join(" - ") ||
        updated[0]?.value.trim() ||
        "Mặc định";
      setColor(nextColor);
      setSize(nextSize);
      const suggestedName = updated.map((a) => a.value.trim()).filter(Boolean).join(" / ");
      if (suggestedName) setVariantName(suggestedName);
    }
  }

  function handleAttributeValueChange(index: number, nextValue: string) {
    const updated = attributes.map((a, i) => (i === index ? { ...a, value: nextValue } : a));
    syncAttributes(updated);
  }

  function handleAttributeNameChange(index: number, nextName: string) {
    const updated = attributes.map((a, i) => (i === index ? { ...a, name: nextName } : a));
    syncAttributes(updated);
  }

  function handleAddAttributeTier() {
    const usedNames = new Set(attributes.map((a) => a.name.trim().toLowerCase()));
    const firstUnused = TIER_PRESETS.find((p) => !usedNames.has(p.toLowerCase())) || `Tầng ${attributes.length + 1}`;
    const updated = [...attributes, { name: firstUnused, value: "" }];
    syncAttributes(updated);
  }

  function handleRemoveAttributeTier(index: number) {
    if (attributes.length <= 1) return;
    const updated = attributes.filter((_, i) => i !== index);
    syncAttributes(updated);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-3.5 text-sm font-bold text-indigo-600 shadow-sm transition-all hover:bg-indigo-100 hover:border-indigo-300 hover:shadow-md dark:border-indigo-800 dark:bg-indigo-950/20 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
      >
        <span className="material-symbols-outlined text-[20px]">edit_square</span> Chỉnh sửa thông tin
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-5xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 sm:px-8">
              <h3 className="font-headline text-lg font-black text-indigo-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-indigo-500">edit_square</span>
                Chỉnh sửa biến thể #{variantId}
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-350 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <form
              action={async (formData: FormData) => {
                try {
                  if (compressedImage) {
                    formData.set("variantImageEdit", compressedImage);
                  }
                  formData.set("editAttributesJson", JSON.stringify(attributes));
                  await action(formData);
                  toast.success("Cập nhật biến thể thành công", { description: "Biến thể đã được cập nhật." });
                  setIsOpen(false);
                } catch (e: any) {
                  const errMsg = e.message || "Không thể cập nhật biến thể. Vui lòng thử lại.";
                  const displayMsg = errMsg.includes(":") ? errMsg.split(":")[1].trim() : errMsg;
                  toast.error("Cập nhật biến thể thất bại", { description: displayMsg });
                }
              }}
              className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto custom-scrollbar"
            >
              <input type="hidden" name="variantId" value={String(variantId)} />
              <input type="hidden" name="variantAvailabilityPreserve" value={String(availabilityPreserve)} />

              <div className="grid w-full min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 rounded-3xl border border-slate-200/60 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-950/20 p-6 sm:p-8 shadow-inner">
                <div className="flex min-w-0 flex-col gap-3 lg:col-span-4">
                  <label className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    <span className="material-symbols-outlined text-[16px] text-pink-500">imagesmode</span>
                    Ảnh biến thể (Tuỳ chọn)
                  </label>
                  <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 transition-all hover:border-pink-400 hover:bg-pink-50/30 dark:hover:bg-pink-950/10 min-h-[160px] flex items-center justify-center">
                    <input
                      name="variantImageEdit"
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) {
                          setFilePreview((prev) => {
                            if (prev) URL.revokeObjectURL(prev);
                            return null;
                          });
                          setCompressedImage(null);
                          return;
                        }
                        
                        if (f.size > 2 * 1024 * 1024) {
                          toast.info("Kích thước ảnh lớn", { description: "Hệ thống đang nén ảnh để tối ưu tốc độ tải lên..." });
                        }

                        try {
                          const options = {
                            maxSizeMB: 1.5,
                            maxWidthOrHeight: 1920,
                            useWebWorker: true,
                          };
                          const compressedFile = await imageCompression(f, options);
                          
                          if (compressedFile.size > 2 * 1024 * 1024) {
                            toast.error("Ảnh quá lớn", { description: "Dù đã nén nhưng dung lượng vẫn vượt quá 2MB. Vui lòng chọn ảnh khác." });
                            e.target.value = "";
                            setFilePreview((prev) => {
                              if (prev) URL.revokeObjectURL(prev);
                              return null;
                            });
                            setCompressedImage(null);
                            return;
                          }
                          
                          const fileToUpload = new File([compressedFile], f.name, { type: compressedFile.type });
                          setCompressedImage(fileToUpload);
                          
                          setFilePreview((prev) => {
                            if (prev) URL.revokeObjectURL(prev);
                            return URL.createObjectURL(fileToUpload);
                          });
                          
                          if (f.size > 2 * 1024 * 1024) {
                            toast.success("Nén ảnh thành công", { description: "Đã giảm dung lượng ảnh để upload nhanh hơn." });
                          }
                        } catch (error) {
                          console.error(error);
                          toast.error("Lỗi xử lý ảnh", { description: "Không thể xử lý ảnh này, vui lòng chọn ảnh dung lượng thấp hơn." });
                          e.target.value = "";
                          setFilePreview((prev) => {
                            if (prev) URL.revokeObjectURL(prev);
                            return null;
                          });
                          setCompressedImage(null);
                        }
                      }}
                    />
                    {filePreview ? (
                      <div className="flex flex-col items-center gap-3 pointer-events-none">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={filePreview} alt="" className="h-28 w-28 rounded-xl object-cover shadow-md border-2 border-pink-400/50" />
                        <p className="text-xs font-bold text-pink-600 dark:text-pink-400">Đã chọn ảnh mới (Nhấn đổi)</p>
                      </div>
                    ) : currentImg ? (
                      <div className="flex flex-col items-center gap-3 pointer-events-none">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={currentImg} alt="" className="h-28 w-28 rounded-xl object-cover shadow-sm border border-slate-200 dark:border-slate-700" />
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-pink-600 transition-colors">Ảnh hiện tại (Nhấn đổi)</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 pointer-events-none opacity-60 group-hover:opacity-100">
                        <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-500 group-hover:text-pink-500 transition-colors">add_photo_alternate</span>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-pink-600 text-center">Tải ảnh mới<br/>(Kéo thả hoặc click)</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Hoặc URL ảnh</label>
                    <input
                      name="variantImageUrl"
                      defaultValue={defaultVariantImageUrl}
                      placeholder="Để trống nếu tải file lên"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-xs text-slate-800 dark:text-white outline-none transition-all focus:border-pink-400 focus:ring-4 focus:ring-pink-500/15"
                    />
                  </div>
                </div>

                <div className="min-w-0 space-y-6 lg:col-span-8 flex flex-col justify-center">
                  {/* Dynamic Multi-Tier attribute fields */}
                  <div className="rounded-2xl border border-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/20 p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 dark:border-indigo-900/40 pb-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[18px]">account_tree</span>
                          Các tầng phân loại của biến thể ({attributes.length} tầng)
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                          Hỗ trợ mở rộng không giới hạn tầng phân loại (Màu sắc, Size, Dung lượng, RAM, Bảo hành...).
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddAttributeTier}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-black text-white shadow-sm hover:bg-indigo-500 active:scale-95 transition-all self-start sm:self-auto"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_circle</span>
                        + Thêm tầng {attributes.length + 1}
                      </button>
                    </div>

                    <div className="space-y-3">
                      {attributes.map((attr, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-black text-xs">
                            {idx + 1}
                          </span>

                          {/* Tier Name */}
                          <div className="w-full sm:w-1/3 space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Tên phân loại {idx + 1}
                            </label>
                            <input
                              type="text"
                              value={attr.name}
                              onChange={(e) => handleAttributeNameChange(idx, e.target.value)}
                              placeholder={`Tầng ${idx + 1}`}
                              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-400"
                            />
                            {/* Preset buttons */}
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {TIER_PRESETS.slice(0, 5).map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => handleAttributeNameChange(idx, preset)}
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md transition-all ${
                                    attr.name.toLowerCase() === preset.toLowerCase()
                                      ? "bg-indigo-600 text-white"
                                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                                  }`}
                                >
                                  {preset}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Tier Value */}
                          <div className="w-full sm:flex-1 space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Giá trị {idx + 1} ({attr.name || `Tầng ${idx + 1}`}) <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={attr.value}
                              onChange={(e) => handleAttributeValueChange(idx, e.target.value)}
                              placeholder={`VD: ${idx === 0 ? "Đen" : idx === 1 ? "128GB" : "12 tháng"}`}
                              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-400"
                            />
                          </div>

                          {/* Delete Tier Button */}
                          {attributes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveAttributeTier(idx)}
                              title="Xóa tầng này"
                              className="self-end sm:self-center flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Auto-sync preview */}
                    <div className="rounded-xl border border-indigo-200/60 dark:border-indigo-800/40 bg-white/80 dark:bg-slate-900/80 p-3 text-xs flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-indigo-500">sync</span>
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                          Đồng bộ CSDL: <strong className="text-cyan-600 dark:text-cyan-400">Tầng 1: {color || "—"}</strong>
                          {" | "}
                          <strong className="text-amber-600 dark:text-amber-400">Tầng 2+: {size || "—"}</strong>
                        </span>
                      </div>
                      <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 border border-emerald-200/60">
                        {attributes.length} tầng hợp lệ
                      </span>
                    </div>

                    {/* Hidden inputs to feed FormAction */}
                    <input type="hidden" name="editColor" value={color} />
                    <input type="hidden" name="editSize" value={size} />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        <span className="material-symbols-outlined text-[16px] text-indigo-500">label</span>
                        Tên biến thể
                      </label>
                      <input
                        name="editVariantName"
                        value={variantName}
                        onChange={(e) => setVariantName(e.target.value)}
                        placeholder="VD: Đen / 128GB / 12 tháng"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-white outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        <span className="material-symbols-outlined text-[16px] text-violet-500">qr_code</span>
                        Mã SKU
                      </label>
                      <input
                        name="editSku"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="VD: SP-BLK-128"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-mono font-medium text-slate-800 dark:text-white outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/15"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        <span className="material-symbols-outlined text-[16px] text-emerald-500">payments</span>
                        Giá bán (VND) <span className="text-rose-500 ml-0.5">*</span>
                      </label>
                      <input
                        name="editVariantPrice"
                        type="number"
                        min={1}
                        step={1}
                        required
                        defaultValue={String(defaultPrice)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-bold text-slate-800 dark:text-white outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/15"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">price_change</span>
                        Giá gốc niêm yết (Gạch ngang)
                      </label>
                      <input
                        name="editOriginalPrice"
                        type="number"
                        min={0}
                        step={1}
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        placeholder="VD: 500000 (tuỳ chọn)"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-500/15"
                      />
                    </div>
                  </div>

                  {duplicate ? (
                    <div className="flex items-center gap-2 rounded-2xl border border-rose-200/80 bg-rose-50 dark:bg-rose-950/20 px-5 py-4 text-sm font-semibold text-rose-700 dark:text-rose-400 animate-in fade-in slide-in-from-top-1">
                      <span className="material-symbols-outlined text-[20px]">error</span>
                      Biến thể với tổ hợp các tầng này đã tồn tại ở sản phẩm này.
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4 text-[13px] font-semibold text-slate-500 dark:text-slate-400">
                      <span className="material-symbols-outlined text-[20px] text-indigo-400">info</span>
                      Tồn kho hiện tại: <strong className="text-slate-800 dark:text-white ml-1">{availabilityPreserve} sp</strong>. Có thể chỉnh tồn qua Nhập kho ở trang chi tiết sản phẩm.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 px-8 py-3.5 text-sm font-bold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={duplicate}
                  className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-emerald-500/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white dark:bg-slate-900/15 transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
