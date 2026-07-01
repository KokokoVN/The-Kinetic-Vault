"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { checkBrandNameAction, uploadBrandLogoAction, createBrandAction } from "../actions";

export default function NewBrandPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [nameError, setNameError] = useState<string | null>(null);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nameError) return;
    if (!name.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

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
      setSubmitError(displayMsg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/brands"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/60 dark:bg-slate-900/60 shadow-sm border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl transition-transform hover:scale-105 hover:bg-white dark:hover:bg-slate-800"
        >
          <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">arrow_back</span>
        </Link>
        <div>
          <h1 className="font-headline text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-900 to-indigo-700 dark:from-purple-400 dark:to-indigo-400">
            Thêm thương hiệu mới
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Khởi tạo một thương hiệu mới để gắn vào các sản phẩm trong hệ thống.
          </p>
        </div>
      </div>



      {/* Form Card */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 shadow-xl shadow-purple-900/5 dark:shadow-none backdrop-blur-xl">
        <div className="h-2 w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-8">
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400" htmlFor="brand-name">
                  <span className="material-symbols-outlined text-[16px]">text_fields</span>
                  Tên thương hiệu <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="brand-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Nike, Samsung..."
                    className={`w-full rounded-2xl border bg-white/60 dark:bg-slate-800/60 px-5 py-4 text-sm font-medium outline-none transition-all backdrop-blur-md focus:bg-white dark:focus:bg-slate-800 focus:ring-4 dark:text-white ${
                      nameError 
                        ? "border-red-300 dark:border-red-500/50 focus:border-red-500 focus:ring-red-500/20" 
                        : "border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                    }`}
                  />
                  {isCheckingName && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <span className="material-symbols-outlined animate-spin text-slate-400">sync</span>
                    </div>
                  )}
                </div>
                {nameError && !isCheckingName && (
                  <p className="mt-2 flex items-center gap-1 text-xs font-medium text-red-500 dark:text-red-400 animate-in fade-in slide-in-from-top-1">
                    <span className="material-symbols-outlined text-[14px]">error</span> {nameError}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400" htmlFor="brand-desc">
                  <span className="material-symbols-outlined text-[16px]">description</span>
                  Mô tả thương hiệu
                </label>
                <textarea
                  id="brand-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả ngắn gọn về xuất xứ, đặc điểm nổi bật..."
                  rows={5}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 px-5 py-4 text-sm outline-none transition-all backdrop-blur-md focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                <span className="material-symbols-outlined text-[16px]">image</span>
                Logo đại diện
              </label>
              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 p-6 text-center backdrop-blur-sm transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/80">
                <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
                  {file ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">add_photo_alternate</span>
                  )}
                </div>
                
                <div className="flex flex-col items-center gap-2">
                  <input
                    type="file"
                    id="brand-logo-file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="brand-logo-file"
                    className="cursor-pointer rounded-xl bg-indigo-50 dark:bg-indigo-500/10 px-6 py-2.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-500/20"
                  >
                    Tải ảnh lên
                  </label>
                  <p className="text-xs text-slate-400">Định dạng JPG, PNG, WEBP. Tối đa 5MB.</p>
                </div>

                {file && (
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="mt-4 text-xs font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Xóa ảnh đã chọn
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-4 border-t border-slate-200/60 dark:border-slate-800/60 pt-6">
            <Link
              href="/admin/brands"
              className="rounded-xl px-6 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-800/80 backdrop-blur-sm"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              disabled={!!nameError || isSubmitting || !name.trim()}
              className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-600/30 disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                  Đang khởi tạo...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px] transition-transform group-hover:scale-110">add_circle</span>
                  Tạo thương hiệu
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
