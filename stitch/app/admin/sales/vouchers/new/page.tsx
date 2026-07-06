import Link from "next/link";
import { VoucherForm } from "@/components/voucher-form";
import { getAdminSession } from "@/lib/auth-server";
import { getUserIdFromAccessToken } from "@/lib/auth";

export default async function NewVoucherPage() {
  const session = await getAdminSession();
  const userId = getUserIdFromAccessToken(session.token);

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/sales/vouchers"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-900 text-white shadow-sm border border-white/10 backdrop-blur-xl transition-transform hover:scale-105 hover:bg-white/5 backdrop-blur-xl text-slate-200 dark:hover:bg-slate-800"
        >
          <span className="material-symbols-outlined text-slate-400">arrow_back</span>
        </Link>
        <div>
          <h1 className="font-headline text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-900 to-indigo-700 dark:from-purple-400 dark:to-indigo-400">
            Thêm Voucher mới
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Khởi tạo mã giảm giá mới và cấu hình điều kiện sử dụng.
          </p>
        </div>
      </div>

      <VoucherForm 
        accessToken={session.token} 
        username={session.username!} 
        userId={String(userId)} 
      />
    </div>
  );
}
