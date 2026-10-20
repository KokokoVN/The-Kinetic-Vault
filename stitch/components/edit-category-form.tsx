"use client";

import React, { useState, useRef, useTransition } from "react";
import Link from "next/link";
import { type BackendCategory } from "@/lib/api";
import { CategoryNameAutoCheckField } from "@/components/category-name-auto-check-field";
import { uploadCategoryImageAction } from "@/app/(admin)/categories/actions";

type Props = {
  category: BackendCategory;
  onUpdate: (name: string, slug?: string, imageUrl?: string | null) => Promise<void>;
};

function getCategoryIcon(name: string): { icon: string; gradient: string; glow: string } {
  const n = String(name ?? "").toLowerCase();
  
  if (n.includes("điện thoại") || n.includes("phone") || n.includes("mobile") || n.includes("tai nghe") || n.includes("phụ kiện")) {
    return { icon: "devices", gradient: "from-blue-500 to-cyan-400", glow: "shadow-blue-500/20" };
  }
  if (n.includes("áo") || n.includes("quần") || n.includes("thời trang") || n.includes("giày") || n.includes("apparel") || n.includes("fashion")) {
    return { icon: "apparel", gradient: "from-purple-500 to-pink-500", glow: "shadow-purple-500/20" };
  }
  if (n.includes("bếp") || n.includes("nồi") || n.includes("gia dụng") || n.includes("chén") || n.includes("kitchen") || n.includes("dining")) {
    return { icon: "kitchen", gradient: "from-amber-500 to-orange-550", glow: "shadow-amber-500/20" };
  }
  if (n.includes("mỹ phẩm") || n.includes("son") || n.includes("phấn") || n.includes("skincare") || n.includes("beauty")) {
    return { icon: "face", gradient: "from-rose-400 to-pink-500", glow: "shadow-rose-500/20" };
  }
  if (n.includes("sách") || n.includes("vở") || n.includes("bút") || n.includes("book") || n.includes("stationery")) {
    return { icon: "menu_book", gradient: "from-emerald-500 to-teal-400", glow: "shadow-emerald-500/20" };
  }
  if (n.includes("thể thao") || n.includes("dã ngoại") || n.includes("xe đạp") || n.includes("sports") || n.includes("outdoor")) {
    return { icon: "sports_soccer", gradient: "from-teal-500 to-cyan-500", glow: "shadow-teal-500/20" };
  }
  
  return { icon: "category", gradient: "from-indigo-500 to-violet-500", glow: "shadow-indigo-500/20" };
}

export function EditCategoryForm({ category, onUpdate }: Props) {
  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug ?? "");
  const [imageUrl, setImageUrl] = useState(category.imageUrl ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(category.imageUrl ?? null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("dark");
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNameChange = (val: string) => {
    setName(val);
  };

  const handleFileSelect = (f: File) => {
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const finalName = name.trim();
    const finalSlug = slug.trim();
    
    startTransition(async () => {
      let finalImageUrl: string | null = previewUrl ? (imageUrl.trim() || previewUrl) : null;
      if (file) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          finalImageUrl = await uploadCategoryImageAction(formData);
        } catch (err: any) {
          console.error("Upload error:", err);
        }
      }
      await onUpdate(finalName, finalSlug || undefined, finalImageUrl);
    });
  };

  const style = getCategoryIcon(name);
  const activeImage = previewUrl || (imageUrl.trim() ? imageUrl.trim() : null);

  return (
    <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Form Fields - Left Column */}
        <div className="space-y-6 lg:col-span-7">
          <div className="space-y-4">
            <h3 className="font-headline text-lg font-bold text-slate-800 dark:text-slate-200">
              Thông tin cấu hình
            </h3>
            
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-850/40 p-5 shadow-sm space-y-5">
              {/* Category Name auto checker */}
              <div className="space-y-2">
                <CategoryNameAutoCheckField 
                  label="Tên danh mục *" 
                  defaultValue={category.name}
                  excludeId={category.id}
                  onChangeOverride={handleNameChange}
                />
              </div>

              {/* Slug Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Đường dẫn (Slug)
                </label>
                <input
                  name="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="vd: thiet-bi-dien-tu"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 outline-none transition-all focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
                  Để trống để hệ thống tự tạo lại slug theo tên mới. Chỉ sử dụng ký tự không dấu và gạch ngang.
                </p>
              </div>

              {/* Image Upload Box */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Hình ảnh đại diện danh mục
                  </label>
                  {activeImage && (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span> Đã có ảnh
                    </span>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />

                {activeImage ? (
                  <div className="relative flex items-center gap-4 p-4 rounded-2xl border border-blue-200 dark:border-cyan-500/30 bg-blue-50/40 dark:bg-cyan-950/20">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white dark:border-white/10 bg-white shadow-sm">
                      <img
                        src={activeImage}
                        alt="Category preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                        {file ? file.name : "Ảnh danh mục hiện tại"}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate font-mono">
                        {activeImage}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/10 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/20 transition-all shadow-xs"
                        >
                          Đổi ảnh
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFile(null);
                            setPreviewUrl(null);
                            setImageUrl("");
                          }}
                          className="rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 px-2.5 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-all shadow-xs"
                        >
                          Xóa ảnh
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileSelect(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all text-center group ${
                      isDragging
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                        : "border-slate-300 dark:border-white/15 hover:border-blue-500 dark:hover:border-cyan-400 hover:bg-slate-50/80 dark:hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors mb-2">
                      <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-white">Kéo thả ảnh hoặc nhấp để tải lên</p>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
                      PNG, JPG, WEBP, SVG dung lượng tối đa 10MB
                    </p>
                  </div>
                )}

                {/* Direct URL input */}
                <div className="pt-2">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
                      link
                    </span>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setPreviewUrl(e.target.value.trim() || null);
                        if (file) setFile(null);
                      }}
                      placeholder="Hoặc dán URL hình ảnh trực tiếp (https://...)"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none transition-all focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-350 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-blue-500">info</span>
              Thông tin bổ sung
            </p>
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              Khi thay đổi Slug (đường dẫn), hãy lưu ý rằng các liên kết cũ trỏ tới danh mục này của khách hàng có thể bị lỗi 404 nếu không thiết lập redirect.
            </p>
          </div>
        </div>

        {/* Live Preview - Right Column */}
        <div className="space-y-6 lg:col-span-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-lg font-bold text-slate-800 dark:text-slate-200">
                Xem trước giao diện
              </h3>
              
              <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-900 p-0.5 border border-slate-200/50 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPreviewTheme("light")}
                  className={`rounded-md p-1 text-xs font-bold transition-all ${
                    previewTheme === "light"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  title="Sáng"
                >
                  <span className="material-symbols-outlined text-[14px] block">light_mode</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTheme("dark")}
                  className={`rounded-md p-1 text-xs font-bold transition-all ${
                    previewTheme === "dark"
                      ? "bg-slate-850 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-350"
                  }`}
                  title="Tối"
                >
                  <span className="material-symbols-outlined text-[14px] block">dark_mode</span>
                </button>
              </div>
            </div>

            {/* Display Box */}
            <div className="rounded-3xl p-6 sm:p-8 flex items-center justify-center border border-slate-200 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-950/40 shadow-inner min-h-[220px] transition-all">
              <div 
                className={`relative overflow-hidden rounded-3xl border p-5 shadow-xl transition-all duration-300 w-full max-w-[290px] flex flex-col justify-between ${
                  previewTheme === "dark" 
                    ? "bg-slate-900 border-slate-800 text-white shadow-none" 
                    : "bg-white border-slate-200 text-slate-800"
                }`}
              >
                <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${style.gradient}`} />
                
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  {activeImage ? (
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white shadow-md">
                      <img
                        src={activeImage}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${style.gradient} text-white shadow-lg ${style.glow}`}>
                      <span className="material-symbols-outlined text-2xl">{style.icon}</span>
                    </div>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-500/10 text-blue-800 dark:text-blue-400 border border-blue-300/30">
                    ID #{category.id}
                  </span>
                </div>

                {/* Body */}
                <div className="mt-4 flex-1">
                  <h3 className={`font-headline text-base font-black truncate ${
                    previewTheme === "dark" ? "text-white" : "text-slate-800"
                  }`}>
                    {name || category.name}
                  </h3>
                  <div className="mt-2 space-y-1.5">
                    <p className="text-[10px] text-slate-450 font-medium">
                      {category.productCount != null ? `${category.productCount} sản phẩm liên kết` : "Sẵn sàng liên kết"}
                    </p>
                    <p className={`text-[10px] font-mono truncate px-2 py-0.5 rounded border ${
                      previewTheme === "dark" 
                        ? "bg-slate-800/40 border-slate-800 text-slate-400" 
                        : "bg-slate-50 border-slate-200/50 text-slate-550"
                    }`}>
                      slug: {slug || category.slug || "chua-co-slug"}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 border-t border-slate-100 dark:border-white/5 pt-3 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Trạng thái: Hoạt động</span>
                  <span className="material-symbols-outlined text-xs text-emerald-500">check_circle</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 mt-4">
            <Link
              href={`/admin/categories/${category.id}`}
              className="rounded-xl px-5 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60 backdrop-blur-sm"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              disabled={isPending || !name.trim()}
              className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
            >
              {isPending ? (
                <><span className="material-symbols-outlined animate-spin text-[18px]">sync</span> Đang lưu...</>
              ) : (
                <><span className="material-symbols-outlined text-[18px]">save</span> Lưu thay đổi</>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
