import Link from "next/link";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth-server";
import { listAdminVouchers, deleteAdminVoucher } from "@/lib/sale-api";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { ClientConfirmSubmitButton } from "@/components/client-confirm-submit-button";

export const dynamic = "force-dynamic";

export default async function AdminVouchersPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; success?: string; q?: string; page?: string }>;
}) {
  const sp = searchParams ? await searchParams : undefined;
  const session = await getAdminSession();
  const userId = getUserIdFromAccessToken(session.token);
  const canWrite = session.canMutateCatalog !== false;

  let vouchers = await listAdminVouchers({ accessToken: session.token });

  const q = sp?.q?.trim().toLowerCase() || "";
  if (q) {
    vouchers = vouchers.filter(
      (v) => v.code.toLowerCase().includes(q) || v.description?.toLowerCase().includes(q)
    );
  }

  const pageParam = parseInt(sp?.page || "1", 10);
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const pageSize = 10;
  const totalItems = vouchers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentVouchers = vouchers.slice(startIndex, endIndex);

  async function deleteAction(formData: FormData) {
    "use server";
    const session2 = await getAdminSession();
    const uid = getUserIdFromAccessToken(session2.token);
    const id = Number(formData.get("id"));
    if (id > 0) {
      try {
        await deleteAdminVoucher(id, { accessToken: session2.token, username: session2.username, userId: uid });
        revalidatePath("/admin/sales/vouchers");
      } catch (e) {
        console.error("Lỗi xóa voucher", e);
      }
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-zinc-950/80 p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-2xl transition-colors">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-violet-500/10 dark:bg-violet-600/20 blur-[100px]" />
          <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-indigo-500/10 dark:bg-indigo-600/20 blur-[100px]" />
        </div>
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 dark:border-violet-500/30 bg-violet-50/80 dark:bg-violet-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-[0.18em] text-violet-700 dark:text-violet-300 shadow-sm">
              <span className="material-symbols-outlined text-[15px]">sell</span>
              Catalog Khuyến Mãi
            </div>
            <h1 className="mt-4 font-headline text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Quản lý Voucher
            </h1>
            <p className="mt-2.5 max-w-2xl text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              Thiết lập mã giảm giá, giới hạn ngân sách và điều kiện áp dụng cho đơn hàng khách hàng.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 px-5 py-3.5 shadow-sm backdrop-blur-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <span className="material-symbols-outlined text-2xl">local_activity</span>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Tổng mã</p>
                <p className="font-headline text-2xl font-black text-slate-900 dark:text-white">{totalItems}</p>
              </div>
            </div>
            {canWrite && (
              <Link
                href="/admin/sales/vouchers/new"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:scale-[1.02] hover:shadow-indigo-500/35 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Tạo mới
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Header Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <form method="GET" action="/admin/sales/vouchers" className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">search</span>
            <input
              type="text"
              name="q"
              defaultValue={sp?.q}
              placeholder="Tìm kiếm mã voucher..."
              className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900/80 py-3 pl-11 pr-4 text-sm font-medium text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-800 px-5 py-3 text-sm font-bold text-slate-700 dark:text-white transition-colors hover:bg-slate-50 dark:hover:bg-zinc-700 shadow-sm"
          >
            Tìm
          </button>
        </form>
      </div>

      {/* List */}
      <section className="overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 shadow-sm dark:shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/50 backdrop-blur-md">
                <th className="px-6 py-5 text-right text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  STT
                </th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  Code
                </th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  Discount
                </th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  Usage
                </th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  Status
                </th>
                <th className="px-6 py-5 text-right text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {currentVouchers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm font-medium text-slate-400">
                    Chưa có voucher nào. Thêm voucher đầu tiên bên trên.
                  </td>
                </tr>
              )}
              {currentVouchers.map((v, idx) => {
                const now = new Date();
                const isExpired = v.expiresAt && new Date(v.expiresAt) < now;
                const isUpcoming = v.startsAt && new Date(v.startsAt) > now;
                const isDepleted = v.maxUsage && v.usageCount >= v.maxUsage;
                const isActive = v.active && !isExpired && !isUpcoming && !isDepleted;

                return (
                  <tr key={v.id} className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-white/5">
                    <td className="px-6 py-4 text-right font-mono text-xs text-slate-400 dark:text-slate-500">{startIndex + idx + 1}</td>
                    <td className="px-6 py-4">
                      <p className="font-headline text-sm font-bold text-slate-900 dark:text-white">{v.code}</p>
                      {v.description && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 max-w-[220px] truncate">{v.description}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {v.discountType === "PERCENT" ? `${v.discountValue}%` : `${v.discountValue.toLocaleString("vi-VN")}đ`}
                      </span>
                      {v.minOrderAmount && (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Đơn tối thiểu {v.minOrderAmount.toLocaleString("vi-VN")}đ</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {v.usageCount} / {v.maxUsage || "∞"}
                    </td>
                    <td className="px-6 py-4">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          Đang hoạt động
                        </span>
                      ) : isUpcoming && v.active ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                          Sắp áp dụng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                          {isDepleted ? "Đã hết lượt" : isExpired ? "Đã hết hạn" : "Tạm ngưng"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/sales/vouchers/${v.id}`}
                          title="Xem chi tiết"
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-slate-100 dark:hover:bg-white/10 hover:text-violet-600 dark:hover:text-violet-400"
                        >
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </Link>
                        {canWrite && (
                          <>
                          <Link
                            href={`/admin/sales/vouchers/${v.id}/edit`}
                            title="Chỉnh sửa"
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </Link>
                          <form action={deleteAction}>
                            <input type="hidden" name="id" value={v.id} />
                            <ClientConfirmSubmitButton
                              title="Xóa voucher"
                              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400"
                              confirmMessage={`Xóa voucher "${v.code}"? Hành động không thể hoàn tác.`}
                            >
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </ClientConfirmSubmitButton>
                          </form>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-6 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/40">
            {currentPage > 1 && (
              <Link
                href={`/admin/sales/vouchers?page=${currentPage - 1}${sp?.q ? `&q=${encodeURIComponent(sp.q)}` : ""}`}
                className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-white shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-zinc-700"
              >
                Trước
              </Link>
            )}
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 px-3">
              Trang {currentPage} / {totalPages}
            </span>
            {currentPage < totalPages && (
              <Link
                href={`/admin/sales/vouchers?page=${currentPage + 1}${sp?.q ? `&q=${encodeURIComponent(sp.q)}` : ""}`}
                className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-white shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-zinc-700"
              >
                Sau
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
