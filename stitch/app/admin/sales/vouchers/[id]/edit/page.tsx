import Link from "next/link";
import { notFound } from "next/navigation";
import { VoucherForm } from "@/components/voucher-form";
import { getAdminSession } from "@/lib/auth-server";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { getAdminVoucher } from "@/lib/sale-api";

export default async function EditVoucherPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  const userId = getUserIdFromAccessToken(session.token);
  const { id } = await params;
  
  const voucherId = Number(id);
  if (isNaN(voucherId)) return notFound();

  const voucher = await getAdminVoucher(voucherId, { accessToken: session.token });
  if (!voucher) return notFound();

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
            Cập nhật Voucher
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Chỉnh sửa thông tin mã giảm giá hiện tại.
          </p>
        </div>
      </div>

      <VoucherForm 
        initialData={voucher}
        accessToken={session.token} 
        username={session.username!} 
        userId={String(userId)} 
      />
    </div>
  );
}
