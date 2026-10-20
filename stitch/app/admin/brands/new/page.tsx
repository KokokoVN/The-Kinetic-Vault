import React from "react";
import Link from "next/link";
import { NewBrandForm } from "@/components/new-brand-form";
import { ArrowLeft, Sparkles, Building2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function NewBrandPage() {
  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-20 text-slate-800 dark:text-zinc-100">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/brands"
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 shadow-xs backdrop-blur-xl transition-all hover:scale-105 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400"
          title="Quay lại danh sách"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-3 w-3" />
              Thương hiệu mới
            </span>
          </div>
          <h1 className="mt-1 font-headline text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-xs">
            Thêm thương hiệu đối tác mới
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium">
            Khởi tạo thương hiệu mới, định cấu hình SEO slug, tải lên logo chính thức và đồng bộ sản phẩm liên kết.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <section className="overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 shadow-sm dark:shadow-2xl backdrop-blur-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600" />
        <NewBrandForm />
      </section>
    </div>
  );
}
