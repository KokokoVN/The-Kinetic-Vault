import Link from "next/link";
import { BannerForm } from "@/components/banner-form";
import { getAdminSession } from "@/lib/auth-server";
import { getUserIdFromAccessToken } from "@/lib/auth";

export default async function NewBannerPage() {
  const session = await getAdminSession();
  const userId = getUserIdFromAccessToken(session.token);

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/sales/banners"
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 text-slate-600 dark:text-zinc-400 shadow-sm backdrop-blur-md transition-all hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </Link>
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Thêm Banner mới
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-zinc-400">
            Tạo banner quảng cáo mới và thiết lập vị trí hiển thị.
          </p>
        </div>
      </div>

      <BannerForm 
        accessToken={session.token} 
        username={session.username!} 
        userId={String(userId)} 
      />
    </div>
  );
}
