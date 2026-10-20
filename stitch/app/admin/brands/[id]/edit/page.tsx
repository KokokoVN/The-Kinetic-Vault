import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth-server";
import { getAdminBrandById } from "@/lib/api";
import { NewBrandForm } from "@/components/new-brand-form";
import { ArrowLeft, Edit3, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await params;
  const id = Number(p.id);
  if (!id) notFound();

  const session = await getAdminSession();
  let brand = await getAdminBrandById(id, { accessToken: session.token });
  if (!brand) {
    const fallback = [
      {
        id: 1,
        name: "Apple Inc.",
        slug: "apple",
        country: "Mỹ",
        website: "https://apple.com/vn",
        description: "Tập đoàn công nghệ hàng đầu thế giới với hệ sinh thái iPhone, MacBook, iPad, Apple Watch.",
        logoUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=400&q=80",
        productCount: 5,
        hidden: false,
        deletedAt: null,
      },
      {
        id: 3,
        name: "Sony Corporation",
        slug: "sony",
        country: "Nhật Bản",
        website: "https://sony.com.vn",
        description: "Biểu tượng âm thanh đỉnh cao Hi-Res Audio, máy ảnh Alpha và PlayStation 5.",
        logoUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
        productCount: 2,
        hidden: false,
        deletedAt: null,
      },
    ].find((b) => b.id === id);
    if (fallback) {
      brand = fallback as any;
    } else {
      notFound();
    }
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-20 text-slate-800 dark:text-zinc-100">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/brands/${brand.id}`}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 shadow-xs backdrop-blur-xl transition-all hover:scale-105 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400"
          title="Quay lại chi tiết"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <Edit3 className="h-3 w-3" />
              Chỉnh sửa đối tác
            </span>
          </div>
          <h1 className="mt-1 font-headline text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-xs">
            Cập nhật: {brand.name}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium">
            Cập nhật tên, logo nhận diện, đường dẫn SEO, xuất xứ quốc gia và liên kết website chính thức.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <section className="overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 shadow-sm dark:shadow-2xl backdrop-blur-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600" />
        <NewBrandForm initialBrand={brand} />
      </section>
    </div>
  );
}
