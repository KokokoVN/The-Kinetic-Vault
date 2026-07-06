"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { CategoryNameAutoCheckField } from "@/components/category-name-auto-check-field";

type Props = {
  onCreate: (name: string, slug?: string) => Promise<void>;
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

export function NewCategoryForm({ onCreate }: Props) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("dark");
  const [isPending, startTransition] = useTransition();

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug) {
      // Auto-suggest slug from name if user hasn't typed a slug manually yet
      const suggested = val
        .toLowerCase()
        .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
        .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
        .replace(/ì|í|ị|ỉ|ĩ/g, "i")
        .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
        .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
        .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      setSlug(suggested);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const finalName = String(formData.get("name") ?? "").trim();
    const finalSlug = String(formData.get("slug") ?? "").trim();
    
    startTransition(async () => {
      await onCreate(finalName, finalSlug || undefined);
    });
  };

  const style = getCategoryIcon(name);

  return (
    <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Form Controls - Left Column */}
        <div className="space-y-6 lg:col-span-7">
          <div className="space-y-4">
            <h3 className="font-headline text-lg font-bold text-slate-800 dark:text-slate-200">
              Thông tin cấu hình
            </h3>
            
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/30 p-5 shadow-sm space-y-4">
              {/* Category Name Auto Check Field wrapper */}
              <div className="space-y-2">
                <CategoryNameAutoCheckField 
                  label="Tên danh mục *" 
                  defaultValue={name}
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
                  Để trống để hệ thống tự động sinh ra dựa theo tên danh mục. Chỉ dùng chữ thường không dấu, số và dấu gạch ngang.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-blue-500">info</span>
              Hỗ trợ chuẩn SEO
            </p>
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              Đặt tên danh mục rõ nghĩa giúp cải thiện hiển thị trên các công cụ tìm kiếm và giúp khách hàng dễ dàng điều hướng sản phẩm của bạn.
            </p>
          </div>
        </div>

        {/* Live Preview Card - Right Column */}
        <div className="space-y-6 lg:col-span-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-lg font-bold text-slate-800 dark:text-slate-200">
                Xem trước hiển thị (Live Preview)
              </h3>
              
              {/* Preview Theme Selector */}
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

            {/* Live Category Card Display Box */}
            <div className={`rounded-3xl p-8 flex items-center justify-center border border-slate-200 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-950/40 shadow-inner min-h-[220px] transition-all`}>
              <div 
                className={`relative overflow-hidden rounded-3xl border p-6 shadow-xl transition-all duration-300 w-full max-w-[280px] min-h-[200px] flex flex-col justify-between ${
                  previewTheme === "dark" 
                    ? "bg-slate-900 border-slate-800 text-white shadow-none" 
                    : "bg-white border-slate-200 text-slate-800"
                }`}
              >
                {/* Visual Top Glow Shine */}
                <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${style.gradient}`} />
                
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${style.gradient} text-white shadow-lg ${style.glow}`}>
                    <span className="material-symbols-outlined text-2xl">{style.icon}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-450 border border-emerald-250/20`}>
                    <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                    Mới
                  </span>
                </div>

                {/* Card Body */}
                <div className="mt-4 flex-1">
                  <h3 className={`font-headline text-base font-black truncate ${
                    previewTheme === "dark" ? "text-white" : "text-slate-800"
                  }`}>
                    {name || "Tên danh mục"}
                  </h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-[10px] text-slate-450 font-medium">ID #999 · Mới Suggest</p>
                    <p className={`text-[10px] font-mono truncate px-2 py-0.5 rounded border ${
                      previewTheme === "dark" 
                        ? "bg-slate-800/40 border-slate-800 text-slate-400" 
                        : "bg-slate-50 border-slate-200/50 text-slate-550"
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
              href="/admin/categories"
              className="rounded-xl px-5 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60 backdrop-blur-sm"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              disabled={isPending || !name}
              className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
            >
              {isPending ? (
                <><span className="material-symbols-outlined animate-spin text-[18px]">sync</span> Đang tạo...</>
              ) : (
                <><span className="material-symbols-outlined text-[18px]">add_circle</span> Tạo danh mục</>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
