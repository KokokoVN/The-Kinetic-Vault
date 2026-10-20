import Link from "next/link";
import { NewCategoryForm } from "@/components/new-category-form";

export const dynamic = "force-dynamic";

export default function NewCategoryPage() {
  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-20 text-slate-800 dark:text-zinc-100">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/categories"
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 shadow-xs backdrop-blur-xl transition-all hover:scale-105 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-cyan-300"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-xs">
            Thêm danh mục mới
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium">
            Khởi tạo danh mục mới, định cấu hình SEO slug và đồng bộ hiển thị danh mục sản phẩm.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <section className="overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 shadow-sm dark:shadow-2xl backdrop-blur-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
        <NewCategoryForm />
      </section>
    </div>
  );
}
