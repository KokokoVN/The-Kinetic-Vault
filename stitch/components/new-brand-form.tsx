"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { checkBrandNameAction, uploadBrandLogoAction, createBrandAction } from "@/app/admin/brands/actions";

function getBrandIcon(name: string): { icon: string; gradient: string; glow: string } {
  const n = String(name ?? "").toLowerCase();
  
  if (n.includes("apple") || n.includes("samsung") || n.includes("xiaomi") || n.includes("oppo") || n.includes("sony") || n.includes("lg")) {
    return { icon: "devices", gradient: "from-blue-500 to-cyan-400", glow: "shadow-blue-500/20" };
  }
  if (n.includes("nike") || n.includes("adidas") || n.includes("puma") || n.includes("reebok") || n.includes("fila") || n.includes("lining")) {
    return { icon: "sports_handball", gradient: "from-purple-500 to-pink-500", glow: "shadow-purple-500/20" };
  }
  if (n.includes("logitech") || n.includes("razer") || n.includes("corsair") || n.includes("dareu")) {
    return { icon: "mouse", gradient: "from-amber-500 to-orange-550", glow: "shadow-amber-500/20" };
  }
  if (n.includes("dell") || n.includes("hp") || n.includes("asus") || n.includes("lenovo") || n.includes("acer") || n.includes("msi")) {
    return { icon: "laptop", gradient: "from-indigo-500 to-violet-500", glow: "shadow-indigo-500/20" };
  }
  if (n.includes("nestle") || n.includes("pepsi") || n.includes("coca") || n.includes("heineken")) {
    return { icon: "local_cafe", gradient: "from-rose-400 to-pink-500", glow: "shadow-rose-500/20" };
  }
  
  return { icon: "sell", gradient: "from-emerald-500 to-teal-400", glow: "shadow-emerald-500/20" };
}

export function NewBrandForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [nameError, setNameError] = useState<string | null>(null);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("dark");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!name.trim()) {
      setNameError(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsCheckingName(true);
      try {
        const exists = await checkBrandNameAction(name.trim());
        if (exists) {
          setNameError("Tên thương hiệu này đã tồn tại. Vui lòng chọn tên khác.");
        } else {
          setNameError(null);
        }
      } catch {
        // Ignore error
      } finally {
        setIsCheckingName(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [name]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (nameError || !name.trim()) return;

    startTransition(async () => {
      try {
        let logoUrl: string | null = null;
        if (file) {
          const formData = new FormData();
          formData.append("file", file);
          logoUrl = await uploadBrandLogoAction(formData);
        }
        
        await createBrandAction({
          name: name.trim(),
          description: description.trim() || null,
          logoUrl,
        });

        router.push("/admin/brands?success=create");
        router.refresh();
      } catch (err: any) {
        const errorMsg = err.message || "Tạo thương hiệu thất bại.";
        const displayMsg = errorMsg.includes(":") ? errorMsg.split(":")[1] : errorMsg;
        setNameError(displayMsg);
      }
    });
  };

  const style = getBrandIcon(name);
  const filePreviewUrl = file ? URL.createObjectURL(file) : null;

  return (
    <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Form Controls - Left Column */}
        <div className="space-y-6 lg:col-span-7">
          <div className="space-y-6">
            <h3 className="font-headline text-lg font-bold text-slate-800 dark:text-slate-200">
              Thông tin cấu hình
            </h3>
            
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/30 p-5 shadow-sm space-y-5">
              {/* Brand Name Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Tên thương hiệu *
                </label>
                <div className="relative">
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Nike, Samsung, Apple..."
                    className={`w-full rounded-xl border bg-white/60 dark:bg-slate-800/60 px-4 py-3 text-sm outline-none transition-all backdrop-blur-md dark:text-white ${
                      nameError 
                        ? "border-rose-350 dark:border-rose-500/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10" 
                        : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    }`}
                  />
                  {isCheckingName && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <span className="material-symbols-outlined animate-spin text-slate-400">sync</span>
                    </div>
                  )}
                </div>
                {nameError && !isCheckingName && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 animate-in fade-in">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    <span>{nameError}</span>
                  </p>
                )}
              </div>

              {/* Brand Description Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Mô tả ngắn
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Xuất xứ, đặc tính thương hiệu..."
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 outline-none transition-all focus:bg-white dark:focus:bg-slate-900 dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* Logo File Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Logo hình ảnh
                </label>
                <div className="rounded-xl border border-dashed border-slate-350 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 p-5 text-center transition-colors hover:bg-slate-50/80 dark:bg-slate-800/80 dark:hover:bg-slate-800/40">
                  <div className="flex flex-col items-center gap-3">
                    <input
                      type="file"
                      id="brand-logo-upload-input"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="brand-logo-upload-input"
                      className="cursor-pointer rounded-xl bg-indigo-50 dark:bg-indigo-500/10 px-5 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200/50 dark:border-indigo-900/30 shadow-sm"
                    >
                      Chọn file ảnh logo
                    </label>
                    <p className="text-[10px] text-slate-400">JPG, PNG, WEBP tối đa 5MB</p>
                  </div>
                  {file && (
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="mt-3 text-xs font-bold text-red-500 hover:underline"
                    >
                      Hủy ảnh đã chọn
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview - Right Column */}
        <div className="space-y-6 lg:col-span-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-lg font-bold text-slate-800 dark:text-slate-200">
                Thẻ thương hiệu (Live Preview)
              </h3>
              
              {/* Preview Theme Selector */}
              <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-900/70 p-0.5 border border-slate-200/50 dark:border-slate-800">
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

            {/* Live Category Card Display Box */}
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
                  {filePreviewUrl ? (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-2 shadow-inner border border-slate-250/20">
                      <img src={filePreviewUrl} alt="Preview" className="h-full w-full object-contain" />
                    </div>
                  ) : (
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${style.gradient} text-white shadow-lg ${style.glow}`}>
                      <span className="material-symbols-outlined text-2xl">{style.icon}</span>
                    </div>
                  )}
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-450 border border-emerald-250/20`}>
                    <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                    Mới
                  </span>
                </div>

                {/* Card Body */}
                <div className="mt-4 flex-1">
                  <h3 className={`font-headline text-base font-black truncate ${
                    previewTheme === "dark" ? "text-white" : "text-slate-800 dark:text-slate-100"
                  }`}>
                    {name || "Tên thương hiệu"}
                  </h3>
                  <div className="mt-2.5 space-y-1.5">
                    <p className="text-[10px] text-slate-450 font-medium">ID #999 · Đối tác liên kết</p>
                    <p className={`text-xs text-slate-550 line-clamp-2 leading-relaxed ${
                      previewTheme === "dark" ? "text-slate-400" : "text-slate-600 dark:text-slate-300"
                    }`}>
                      {description || "Chưa có mô tả chi tiết của thương hiệu."}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className={`mt-4 border-t pt-3 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400`}>
                  <span>Thương hiệu phân loại</span>
                  <span className="material-symbols-outlined text-xs">workspace_premium</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-4">
            <Link
              href="/admin/brands"
              className="rounded-xl px-5 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:bg-slate-800/60 backdrop-blur-sm"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={isPending || !!nameError || !name.trim()}
              className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
            >
              {isPending ? (
                <><span className="material-symbols-outlined animate-spin text-[18px]">sync</span> Đang khởi tạo...</>
              ) : (
                <><span className="material-symbols-outlined text-[18px]">add_circle</span> Tạo thương hiệu</>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
