"use client";

import React, { useState, useEffect, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  checkBrandNameAction,
  checkBrandSlugAction,
  uploadBrandLogoAction,
  createBrandAction,
  updateBrandAction,
} from "@/app/admin/brands/actions";
import { type AdminBrand } from "@/lib/api";
import { FloatingNotice } from "@/components/floating-notice";
import { 
  UploadCloud, 
  Globe, 
  Link2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Wand2, 
  Image as ImageIcon, 
  Trash2, 
  Sparkles,
  Eye,
  RotateCw,
  Building2
} from "lucide-react";

const COMMON_COUNTRIES = [
  { code: "VN", name: "Việt Nam", flag: "🇻🇳" },
  { code: "US", name: "Mỹ", flag: "🇺🇸" },
  { code: "JP", name: "Nhật Bản", flag: "🇯🇵" },
  { code: "KR", name: "Hàn Quốc", flag: "🇰🇷" },
  { code: "DE", name: "Đức", flag: "🇩🇪" },
  { code: "CH", name: "Thụy Sĩ", flag: "🇨🇭" },
  { code: "FR", name: "Pháp", flag: "🇫🇷" },
  { code: "IT", name: "Ý", flag: "🇮🇹" },
  { code: "GB", name: "Anh", flag: "🇬🇧" },
  { code: "CN", name: "Trung Quốc", flag: "🇨🇳" },
  { code: "TW", name: "Đài Loan", flag: "🇹🇼" },
  { code: "DK", name: "Đan Mạch", flag: "🇩🇰" },
];

function slugify(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function NewBrandForm({ initialBrand }: { initialBrand?: AdminBrand }) {
  const router = useRouter();
  const isEdit = !!initialBrand;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialBrand?.name || "");
  const [slug, setSlug] = useState(initialBrand?.slug || "");
  const [description, setDescription] = useState(initialBrand?.description || "");
  const [website, setWebsite] = useState(initialBrand?.website || "");
  const [country, setCountry] = useState(initialBrand?.country || "Mỹ");
  const [hidden, setHidden] = useState<boolean>(initialBrand?.hidden || false);

  const [file, setFile] = useState<File | null>(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(initialBrand?.logoUrl || null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialBrand?.logoUrl || null);

  const [nameError, setNameError] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [formNotice, setFormNotice] = useState<{ message: string; variant: "error" | "success" } | null>(null);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [isAutoSlug, setIsAutoSlug] = useState(!initialBrand?.slug);

  const [isPending, startTransition] = useTransition();

  // Auto generate slug from name
  useEffect(() => {
    if (isAutoSlug && name.trim()) {
      setSlug(slugify(name));
    }
  }, [name, isAutoSlug]);

  // Handle file preview
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (existingLogoUrl) {
      setPreviewUrl(existingLogoUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [file, existingLogoUrl]);

  // Debounced check name
  useEffect(() => {
    if (!name.trim()) {
      setNameError(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsCheckingName(true);
      try {
        const exists = await checkBrandNameAction(name.trim(), initialBrand?.id);
        if (exists) {
          setNameError("Tên thương hiệu đã tồn tại trong hệ thống.");
        } else {
          setNameError(null);
        }
      } catch {
        // ignore
      } finally {
        setIsCheckingName(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [name, initialBrand?.id]);

  // Debounced check slug
  useEffect(() => {
    if (!slug.trim()) {
      setSlugError(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const exists = await checkBrandSlugAction(slug.trim(), initialBrand?.id);
        if (exists) {
          setSlugError("Đường dẫn slug đã được sử dụng.");
        } else {
          setSlugError(null);
        }
      } catch {
        // ignore
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [slug, initialBrand?.id]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormNotice({ message: "Vui lòng nhập tên thương hiệu.", variant: "error" });
      return;
    }
    if (nameError) {
      setFormNotice({ message: nameError, variant: "error" });
      return;
    }
    if (slugError) {
      setFormNotice({ message: slugError, variant: "error" });
      return;
    }

    startTransition(async () => {
      try {
        let logoUrl = existingLogoUrl;
        if (file) {
          const formData = new FormData();
          formData.append("file", file);
          logoUrl = await uploadBrandLogoAction(formData);
        }

        const payload = {
          name: name.trim(),
          slug: slug.trim() || slugify(name),
          description: description.trim() || null,
          website: website.trim() || null,
          country: country.trim() || null,
          hidden,
          logoUrl,
        };

        if (isEdit && initialBrand) {
          await updateBrandAction(initialBrand.id, payload);
          router.push(`/admin/brands/${initialBrand.id}?success=update`);
        } else {
          await createBrandAction(payload);
          router.push("/admin/brands?success=create");
        }
        router.refresh();
      } catch (err: any) {
        const msg = err.message || "Thao tác thất bại. Vui lòng kiểm tra lại.";
        setNameError(msg);
        setFormNotice({ message: msg, variant: "error" });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
      {formNotice && <FloatingNotice key={formNotice.message} message={formNotice.message} variant={formNotice.variant} />}
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* ==================== LEFT COLUMN: FORM INPUTS ==================== */}
        <div className="space-y-6 lg:col-span-7">
          {/* Brand Name */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-zinc-900/40 p-5 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Thông tin định danh thương hiệu</span>
            </h3>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Tên thương hiệu <span className="text-rose-500">*</span>
                </label>
                {isCheckingName && (
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 animate-pulse">
                    <RotateCw className="h-3 w-3 animate-spin" />
                    Đang kiểm tra trùng lặp...
                  </span>
                )}
                {!isCheckingName && name.trim() && !nameError && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Tên hợp lệ
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Apple, Sony, Dell, Samsung, Logitech, Asus ROG..."
                className={`w-full rounded-2xl border ${
                  nameError
                    ? "border-rose-500 bg-rose-50/40 text-rose-900"
                    : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                } px-4 py-3 text-sm font-semibold outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 dark:focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 shadow-xs`}
              />
              {nameError && (
                <p className="mt-1.5 text-xs font-bold text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{nameError}</span>
                </p>
              )}
            </div>

            {/* Slug input with auto-generate toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Đường dẫn SEO (Slug)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsAutoSlug(!isAutoSlug);
                    if (!isAutoSlug && name.trim()) setSlug(slugify(name));
                  }}
                  className={`text-[11px] font-bold flex items-center gap-1 ${
                    isAutoSlug ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"
                  } hover:underline`}
                >
                  <Wand2 className="h-3 w-3" />
                  <span>{isAutoSlug ? "Tự động sinh slug (Bật)" : "Tùy chỉnh thủ công"}</span>
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-400 select-none">
                  /brands/
                </span>
                <input
                  type="text"
                  value={slug}
                  readOnly={isAutoSlug}
                  onChange={(e) => {
                    setSlug(slugify(e.target.value));
                    setIsAutoSlug(false);
                  }}
                  placeholder="slug-thuong-hieu"
                  className={`w-full rounded-2xl border ${
                    slugError
                      ? "border-rose-500 bg-rose-50/40 text-rose-900"
                      : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                  } pl-20 pr-4 py-3 font-mono text-xs font-semibold outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 dark:focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 shadow-xs`}
                />
              </div>
              {slugError && (
                <p className="mt-1.5 text-xs font-bold text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{slugError}</span>
                </p>
              )}
            </div>
          </div>

          {/* Country & Official Website */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-zinc-900/40 p-5 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Xuất xứ & Liên kết trực tuyến</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2">
                  Quốc gia xuất xứ
                </label>
                <div className="relative">
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-900 px-4 py-3 text-xs font-bold text-slate-800 dark:text-white outline-none transition-all focus:border-indigo-500 dark:focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 shadow-xs cursor-pointer"
                  >
                    {COMMON_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name} className="dark:bg-zinc-900">
                        {c.flag} {c.name}
                      </option>
                    ))}
                    <option value="Khác" className="dark:bg-zinc-900">
                      🌐 Quốc gia khác
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2">
                  Website chính thức
                </label>
                <div className="relative">
                  <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://apple.com"
                    className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-900 pl-10 pr-4 py-3 text-xs font-semibold text-slate-800 dark:text-white outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 dark:focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 shadow-xs"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2">
                Mô tả giới thiệu thương hiệu
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Giới thiệu sơ lược về lịch sử, triết lý thương hiệu, dòng sản phẩm chủ đạo phân phối..."
                className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-900 p-4 text-xs font-medium text-slate-800 dark:text-white outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 dark:focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 shadow-xs resize-none leading-relaxed"
              />
            </div>

            {/* Hidden toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-900">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">Ẩn khỏi bộ lọc tìm kiếm của khách hàng</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Khi bật, thương hiệu và sản phẩm thuộc hãng sẽ không hiển thị trên danh mục công khai
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hidden}
                  onChange={(e) => setHidden(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* ==================== RIGHT COLUMN: LOGO UPLOAD & LIVE PREVIEWS ==================== */}
        <div className="space-y-6 lg:col-span-5">
          {/* Logo Upload Dropzone */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/60 p-6 backdrop-blur-md">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-3 flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Logo & Nhận diện</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                }
              }}
            />

            {previewUrl ? (
              <div className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-indigo-300 dark:border-indigo-500/40 rounded-2xl bg-white dark:bg-zinc-800/60 group">
                <div className="relative h-28 w-28 overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white p-2 shadow-sm">
                  <Image
                    src={previewUrl}
                    alt="Logo preview"
                    fill
                    unoptimized
                    className="object-contain p-2"
                  />
                </div>
                <p className="mt-3 text-xs font-bold text-slate-700 dark:text-white truncate max-w-[200px]">
                  {file ? file.name : "Logo chính thức"}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/10 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition-all"
                  >
                    Thay đổi file
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setExistingLogoUrl(null);
                      setPreviewUrl(null);
                    }}
                    className="inline-flex items-center gap-1 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-all"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 dark:border-white/20 rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10 cursor-pointer transition-all text-center group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-white/5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform mb-3">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-white">Nhấp để tải lên logo thương hiệu</p>
                <p className="mt-1 text-[11px] text-slate-400 dark:text-zinc-500">
                  Hỗ trợ PNG, JPG, SVG hoặc WEBP (Nền trong suốt)
                </p>
              </div>
            )}
          </div>

          {/* Live Bento Card Preview */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-900/80 p-6 shadow-sm">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-3 flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>Xem trước hiển thị (Bento Card)</span>
            </p>
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-zinc-950/60 p-5">
              <div className="flex items-center gap-3.5 mb-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-800 p-1.5 shadow-xs">
                  {previewUrl ? (
                    <Image src={previewUrl} alt="Logo" fill unoptimized className="object-contain p-1" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 text-white font-black text-base">
                      {name ? name.slice(0, 2).toUpperCase() : "TK"}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                    {name || "Tên thương hiệu mẫu"}
                  </p>
                  <p className="font-mono text-[10px] text-slate-400 truncate">
                    /brands/{slug || "slug-mau"}
                  </p>
                  <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    {country}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                {description || "Mô tả giới thiệu chi tiết về thương hiệu sẽ hiển thị tại đây khi cập nhật..."}
              </p>
            </div>
          </div>

          {/* Google SERP Snippet Preview */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-900/80 p-6 shadow-sm">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-3 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-indigo-600" />
              <span>Xem trước Google Search SERP</span>
            </p>
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-950 p-4 space-y-1">
              <p className="text-[11px] text-slate-500 font-mono truncate">
                https://thekineticvault.vn › brands › {slug || "brand"}
              </p>
              <h4 className="text-xs font-bold text-blue-700 dark:text-blue-400 truncate">
                {name || "Thương Hiệu"} Chính Hãng — The Kinetic Vault
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-2">
                {description || `Mua sản phẩm ${name || "thương hiệu"} chính hãng, bảo hành toàn diện, ưu đãi hấp dẫn và giao hàng nhanh toàn quốc.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-200/80 dark:border-white/10 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-6 py-3 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
        >
          Hủy bỏ
        </button>
        <button
          type="submit"
          disabled={isPending || !name.trim() || !!nameError || !!slugError}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 px-8 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isPending && <RotateCw className="h-4 w-4 animate-spin" />}
          <span>{isEdit ? "Lưu thay đổi thương hiệu" : "Tạo thương hiệu mới"}</span>
        </button>
      </div>
    </form>
  );
}
