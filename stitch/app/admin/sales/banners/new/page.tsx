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
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/60 dark:bg-slate-900/60 shadow-sm border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl transition-transform hover:scale-105 hover:bg-white dark:hover:bg-slate-800"
        >
          <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">arrow_back</span>
        </Link>
        <div>
          <h1 className="font-headline text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-900 to-indigo-700 dark:from-purple-400 dark:to-indigo-400">
            Thêm Banner mới
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
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
