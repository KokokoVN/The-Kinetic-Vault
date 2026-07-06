"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { type BackendCategory } from "@/lib/api";
import { CategoryNameAutoCheckField } from "@/components/category-name-auto-check-field";

type Props = {
  category: BackendCategory;
  onUpdate: (name: string, slug?: string) => Promise<void>;
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
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("dark");
  const [isPending, startTransition] = useTransition();

  const handleNameChange = (val: string) => {
    setName(val);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      await onUpdate(name.trim(), slug.trim() || undefined);
    });
  };

  const style = getCategoryIcon(name);

  return (
    <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Form Fields - Left Column */}
        <div className="space-y-6 lg:col-span-7">
          <div className="space-y-4">
            <h3 className="font-headline text-lg font-bold text-slate-800 dark:text-slate-200">
              Thông tin cấu hình
            </h3>
            
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/30 p-5 shadow-sm space-y-4">
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
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 outline-none transition-all focus:bg-white dark:focus:bg-slate-900 dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
                  Để trống để hệ thống tự tạo lại slug theo tên mới. Chỉ sử dụng ký tự không dấu và gạch ngang.
                </p>
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
                Xem trước hiển thị (Live Preview)
              </h3>
              
              {/* Preview Theme Switch */}
              <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-900 p-0.5 border border-slate-200/50 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPreviewTheme("light")}
                  className={`rounded-md p-1 text-xs font-bold transition-all ${
                    previewTheme === "light"
                      ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-200"
                  }`}
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
                >
                  <span className="material-symbols-outlined text-[14px] block">dark_mode</span>
                </button>
              </div>
            </div>

            {/* Visual Card Display Box */}
            <div className={`rounded-3xl p-8 flex items-center justify-center border border-slate-200 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-950/25 shadow-inner min-h-[220px] transition-all`}>
              <div 
                className={`relative overflow-hidden rounded-3xl border p-6 shadow-xl transition-all duration-300 w-full max-w-[280px] min-h-[200px] flex flex-col justify-between ${
                  previewTheme === "dark" 
                    ? "bg-slate-900 border-slate-800 text-white shadow-none" 
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                }`}
              >
                {/* Visual Top Glow Shine */}
                <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${style.gradient}`} />
                
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${style.gradient} text-white shadow-lg ${style.glow}`}>
                    <span className="material-symbols-outlined text-2xl">{style.icon}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-500/10 text-blue-800 dark:text-blue-400 border border-blue-250/20`}>
                    <span className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
                    ID #{category.id}
                  </span>
                </div>

                {/* Card Body */}
                <div className="mt-4 flex-1">
                  <h3 className={`font-headline text-base font-black truncate ${
                    previewTheme === "dark" ? "text-white" : "text-slate-800 dark:text-slate-100"
                  }`}>
                    {name || "Tên danh mục"}
                  </h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-[10px] text-slate-450 font-medium">Trạng thái: Hoạt động</p>
                    <p className={`text-[10px] font-mono truncate px-2 py-0.5 rounded border ${
                      previewTheme === "dark" 
                        ? "bg-slate-800/40 border-slate-800 text-slate-400" 
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700/50 text-slate-550"
                    }`}>
                      slug: {slug || "chua-co-slug"}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className={`mt-4 border-t pt-3 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400`}>
                  <span>Hiển thị công khai</span>
                  <span className="material-symbols-outlined text-xs">public</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-4">
            <Link
              href={`/admin/categories/${category.id}`}
              className="rounded-xl px-5 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:bg-slate-800/60 backdrop-blur-sm"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              disabled={isPending || !name}
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
