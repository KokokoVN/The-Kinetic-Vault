"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import imageCompression from "browser-image-compression";

type VariantLike = {
  size: string;
  color: string;
};

type VariantFormLiveCheckProps = {
  action: (formData: FormData) => void | Promise<void>;
  fieldClass: string;
  existingVariants: VariantLike[];
  defaultPrice: number;
};

function normalize(v: string): string {
  return v.trim().toLowerCase();
}

export function VariantFormLiveCheck({ action, fieldClass, existingVariants, defaultPrice }: VariantFormLiveCheckProps) {
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<File | null>(null);
  const [priceSeed, setPriceSeed] = useState(0);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    // Khi danh sách biến thể thay đổi (thường là thêm thành công), reset form thêm mới.
    setSize("");
    setColor("");
    setPriceSeed((v) => v + 1);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setCompressedImage(null);
  }, [existingVariants]);

  const duplicate = useMemo(() => {
    const ns = normalize(size);
    const nc = normalize(color);
    if (!ns || !nc) return false;
    return existingVariants.some((v) => normalize(v.size) === ns && normalize(v.color) === nc);
  }, [size, color, existingVariants]);

  const sizeInvalid = duplicate && normalize(size) !== "";
  const colorInvalid = duplicate && normalize(color) !== "";

  const sizeClass = `${fieldClass} ${sizeInvalid ? "border-rose-400 bg-rose-50/40 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 focus:border-rose-500 focus:ring-rose-200" : ""}`;
  const colorClass = `${fieldClass} ${colorInvalid ? "border-rose-400 bg-rose-50/40 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 focus:border-rose-500 focus:ring-rose-200" : ""}`;

  return (
    <form
      action={async (formData: FormData) => {
        try {
          if (compressedImage) {
            formData.set("variantImage", compressedImage);
          }
          await action(formData);
          toast.success("Thêm biến thể thành công", { description: "Biến thể mới đã được lưu." });
        } catch (e: any) {
          if (isRedirectError(e)) throw e;
          const errMsg = e.message || "Không thể thêm biến thể. Vui lòng thử lại.";
          const displayMsg = errMsg.includes(":") ? errMsg.split(":")[1].trim() : errMsg;
          toast.error("Thêm biến thể thất bại", { description: displayMsg });
        }
      }}
      className="mt-4 w-full min-w-0 space-y-4"
    >
      <div className="flex flex-col gap-6 rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-5 shadow-sm sm:p-6 backdrop-blur-md">
        <div className="flex min-w-0 flex-col gap-3">
          <label className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400" htmlFor="variantImage">
            <span className="material-symbols-outlined text-[16px] text-pink-500">imagesmode</span>
            Ảnh biến thể (Tuỳ chọn)
          </label>
          <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 transition-all hover:border-pink-400 hover:bg-pink-50/30 dark:hover:bg-pink-950/10">
            <input
              id="variantImage"
              name="variantImage"
              type="file"
              accept="image/*"
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) {
                  setImagePreview((prev) => {
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
                    setImagePreview((prev) => {
                      if (prev) URL.revokeObjectURL(prev);
                      return null;
                    });
                    setCompressedImage(null);
                    return;
                  }
                  
                  const fileToUpload = new File([compressedFile], f.name, { type: compressedFile.type });
                  setCompressedImage(fileToUpload);
                  
                  setImagePreview((prev) => {
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
                  setImagePreview((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return null;
                  });
                  setCompressedImage(null);
                }
              }}
            />
            {imagePreview ? (
              <div className="flex flex-col items-center gap-3 pointer-events-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="" className="h-28 w-28 rounded-xl object-cover shadow-md" />
                <p className="text-xs font-bold text-pink-600 dark:text-pink-400">Đã chọn ảnh (Nhấn để đổi)</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 pointer-events-none opacity-60 group-hover:opacity-100">
                <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-500 group-hover:text-pink-500 transition-colors">add_photo_alternate</span>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-pink-600 dark:group-hover:text-pink-400 text-center">Tải ảnh lên<br/>(Kéo thả hoặc click)</p>
              </div>
            )}
          </div>
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 text-center">Ảnh tải lên sẽ tự động lưu vào kho ảnh của sản phẩm.</p>
        </div>

        <div className="min-w-0 space-y-5 flex flex-col justify-center">
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400" htmlFor="size">
                <span className="material-symbols-outlined text-[16px] text-amber-500">format_size</span>
                Size (Kích thước) <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <input
                id="size"
                name="size"
                required
                maxLength={64}
                className={sizeClass}
                placeholder="Ví dụ: M, L, XL, 42..."
                value={size}
                onChange={(e) => setSize(e.target.value)}
                aria-invalid={sizeInvalid}
                aria-describedby={sizeInvalid ? "variant-duplicate-error" : undefined}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400" htmlFor="color">
                <span className="material-symbols-outlined text-[16px] text-cyan-500">palette</span>
                Color (Màu sắc) <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <input
                id="color"
                name="color"
                required
                maxLength={64}
                className={colorClass}
                placeholder="Ví dụ: Đen, Trắng..."
                value={color}
                onChange={(e) => setColor(e.target.value)}
                aria-invalid={colorInvalid}
                aria-describedby={colorInvalid ? "variant-duplicate-error" : undefined}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400" htmlFor="variantPrice">
                <span className="material-symbols-outlined text-[16px] text-emerald-500">payments</span>
                Giá (VND) <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <input
                key={`variantPrice-${priceSeed}`}
                id="variantPrice"
                name="variantPrice"
                type="number"
                min={1}
                step={1}
                required
                defaultValue={String(Math.max(1, Math.round(defaultPrice) || 1))}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 px-5 py-3 text-sm font-bold text-slate-800 dark:text-white outline-none transition-all focus:border-emerald-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-500/15"
              />
            </div>
          </div>
          {duplicate ? (
            <div id="variant-duplicate-error" className="flex items-center gap-2 rounded-2xl border border-rose-200/80 dark:border-rose-950 bg-rose-50 dark:bg-rose-950/20 px-4 py-3 text-sm font-semibold text-rose-700 dark:text-rose-400 animate-in fade-in slide-in-from-top-1">
              <span className="material-symbols-outlined text-[18px]">error</span>
              Biến thể với Size & Màu này đã tồn tại.
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 px-4 py-3 text-[12px] font-semibold text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined text-[16px] text-indigo-400">info</span>
              Tồn kho ban đầu là 0. Hãy làm thủ tục Nhập kho sau khi thêm.
            </div>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end pt-2">
            <button
              type="submit"
              disabled={duplicate}
              className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-rose-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-rose-500/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/15 transition-transform duration-700 group-hover:translate-x-full" />
              <span className="material-symbols-outlined text-[20px]">add_task</span>
              Tạo biến thể
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
