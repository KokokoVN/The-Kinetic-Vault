"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { resolveCatalogImageUrl } from "@/lib/api";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";

function normalize(v: string): string {
  return v.trim().toLowerCase();
}

type VariantPair = { size: string; color: string };

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
}: VariantEditFormLiveCheckProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [size, setSize] = useState(defaultSize);
  const [color, setColor] = useState(defaultColor);
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

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-3.5 text-sm font-bold text-indigo-600 shadow-sm transition-all hover:bg-indigo-100 hover:border-indigo-300 hover:shadow-md"
      >
        <span className="material-symbols-outlined text-[20px]">edit_square</span> Chỉnh sửa thông tin
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-5xl rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 sm:px-8">
              <h3 className="font-headline text-lg font-black text-indigo-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-indigo-500">edit_square</span>
                Chỉnh sửa biến thể
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
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

              <div className="grid w-full min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 rounded-3xl border border-slate-200/60 bg-slate-50/50 p-6 sm:p-8 shadow-inner">
                <div className="flex min-w-0 flex-col gap-3 lg:col-span-4">
                  <label className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-slate-500">
                    <span className="material-symbols-outlined text-[16px] text-pink-500">imagesmode</span>
                    Ảnh biến thể (Tuỳ chọn)
                  </label>
                  <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-white p-4 transition-all hover:border-pink-400 hover:bg-pink-50/30 min-h-[160px] flex items-center justify-center">
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
                        <p className="text-xs font-bold text-pink-600">Đã chọn ảnh mới (Nhấn đổi)</p>
                      </div>
                    ) : currentImg ? (
                      <div className="flex flex-col items-center gap-3 pointer-events-none">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={currentImg} alt="" className="h-28 w-28 rounded-xl object-cover shadow-sm border border-slate-200" />
                        <p className="text-xs font-semibold text-slate-500 group-hover:text-pink-600 transition-colors">Ảnh hiện tại (Nhấn đổi)</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 pointer-events-none opacity-60 group-hover:opacity-100">
                        <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:text-pink-500 transition-colors">add_photo_alternate</span>
                        <p className="text-xs font-semibold text-slate-500 group-hover:text-pink-600 text-center">Tải ảnh mới<br/>(Kéo thả hoặc click)</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Hoặc URL ảnh</label>
                    <input
                      name="variantImageUrl"
                      defaultValue={defaultVariantImageUrl}
                      placeholder="Để trống nếu tải file lên"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs outline-none transition-all focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-500/15"
                    />
                  </div>
                </div>

                <div className="min-w-0 space-y-6 lg:col-span-8 flex flex-col justify-center">
                  <div className="grid gap-5 sm:grid-cols-3">
                    <div className="space-y-2">
                      <label className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-slate-500">
                        <span className="material-symbols-outlined text-[16px] text-amber-500">format_size</span>
                        Size (Kích thước) <span className="text-rose-500 ml-0.5">*</span>
                      </label>
                      <input
                        name="editSize"
                        required
                        maxLength={64}
                        className={`w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium outline-none transition-all focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/15 ${duplicate ? "border-rose-400 bg-rose-50/50 ring-1 ring-rose-200 focus:border-rose-500" : ""}`}
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        aria-invalid={duplicate}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-slate-500">
                        <span className="material-symbols-outlined text-[16px] text-cyan-500">palette</span>
                        Color (Màu sắc) <span className="text-rose-500 ml-0.5">*</span>
                      </label>
                      <input
                        name="editColor"
                        required
                        maxLength={64}
                        className={`w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium outline-none transition-all focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-500/15 ${duplicate ? "border-rose-400 bg-rose-50/50 ring-1 ring-rose-200 focus:border-rose-500" : ""}`}
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        aria-invalid={duplicate}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-slate-500">
                        <span className="material-symbols-outlined text-[16px] text-emerald-500">payments</span>
                        Giá (VND) <span className="text-rose-500 ml-0.5">*</span>
                      </label>
                      <input
                        name="editVariantPrice"
                        type="number"
                        min={1}
                        step={1}
                        required
                        defaultValue={String(defaultPrice)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold outline-none transition-all focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/15"
                      />
                    </div>
                  </div>
                  {duplicate ? (
                    <div className="flex items-center gap-2 rounded-2xl border border-rose-200/80 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700 animate-in fade-in slide-in-from-top-1">
                      <span className="material-symbols-outlined text-[20px]">error</span>
                      Biến thể với Size & Màu này đã tồn tại.
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-5 py-4 text-[13px] font-semibold text-slate-500">
                      <span className="material-symbols-outlined text-[20px] text-indigo-400">info</span>
                      Tồn kho hiện tại không đổi. Hãy điều chỉnh tồn qua Nhập kho ở trang chi tiết sản phẩm.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-2xl border border-slate-200 bg-white px-8 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={duplicate}
                  className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-emerald-500/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/15 transition-transform duration-700 group-hover:translate-x-full" />
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
