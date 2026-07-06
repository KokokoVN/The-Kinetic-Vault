import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/auth-server";
import { getAdminVoucher, listAdminVoucherUsages } from "@/lib/sale-api";
import { getAdminOrderById, getAdminUserBrief } from "@/lib/api";

export const dynamic = "force-dynamic";

function moneyVnd(value: number | null | undefined): string {
  const amount = Number(value ?? NaN);
  if (!Number.isFinite(amount)) return "-";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
}

function voucherStatus(input: {
  active: boolean;
  startsAt?: string;
  expiresAt?: string;
  usageCount: number;
  maxUsage?: number;
}) {
  const now = new Date();
  const startsAt = input.startsAt ? new Date(input.startsAt) : null;
  const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
  const depleted = input.maxUsage != null && input.usageCount >= input.maxUsage;
  if (!input.active) return { label: "Tạm ngưng", className: "bg-white/10 text-slate-300" };
  if (depleted) return { label: "Đã hết lượt", className: "bg-rose-100 text-rose-800" };
  if (startsAt && startsAt > now) return { label: "Sắp áp dụng", className: "bg-amber-100 text-amber-800" };
  if (expiresAt && expiresAt < now) return { label: "Đã hết hạn", className: "bg-white/10 text-slate-300" };
  return { label: "Đang hoạt động", className: "bg-emerald-100 text-emerald-800" };
}

export default async function AdminVoucherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const voucherId = Number(id);
  if (!Number.isFinite(voucherId) || voucherId <= 0) notFound();

  const session = await getAdminSession();
  const canWrite = session.canMutateCatalog !== false;
  const voucher = await getAdminVoucher(voucherId, { accessToken: session.token });
  if (!voucher) notFound();

  const usages = await listAdminVoucherUsages(voucherId, { accessToken: session.token });
  const enrichedUsages = await Promise.all(
    usages.map(async (usage) => {
      const [user, order] = await Promise.all([
        getAdminUserBrief(usage.userId, { accessToken: session.token }),
        usage.orderId ? getAdminOrderById(usage.orderId, { accessToken: session.token }) : Promise.resolve(null),
      ]);
      return { ...usage, user, order };
    }),
  );

  const status = voucherStatus(voucher);
  const totalUsers = new Set(enrichedUsages.map((usage) => usage.userId)).size;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Voucher #{voucher.id}</p>
          <h1 className="mt-2 font-headline text-3xl font-black text-blue-900">{voucher.code}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">{voucher.description || "Chưa có mô tả."}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canWrite ? (
            <Link
              href={`/admin/sales/vouchers/${voucher.id}/edit`}
              className="rounded-xl bg-kinetic px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/15 transition hover:opacity-95"
            >
              Chỉnh sửa
            </Link>
          ) : null}
          <Link
            href="/admin/sales/vouchers"
            className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-2.5 text-sm font-bold text-blue-900 shadow-sm hover:bg-surface-container-high"
          >
            ← Danh sách
          </Link>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl text-slate-200 px-5 py-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trạng thái</p>
          <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>{status.label}</span>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl text-slate-200 px-5 py-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Khuyến mãi</p>
          <p className="mt-1 font-headline text-lg font-black text-blue-900">
            {voucher.discountType === "PERCENT" ? `${voucher.discountValue}%` : moneyVnd(voucher.discountValue)}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl text-slate-200 px-5 py-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Đã dùng</p>
          <p className="mt-1 font-headline text-lg font-black text-blue-900">{voucher.usageCount.toLocaleString("vi-VN")}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl text-slate-200 px-5 py-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Số user đã dùng</p>
          <p className="mt-1 font-headline text-lg font-black text-blue-900">{totalUsers.toLocaleString("vi-VN")}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl text-slate-200 px-5 py-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Còn lại</p>
          <p className="mt-1 font-headline text-lg font-black text-emerald-700">
            {voucher.maxUsage != null ? Math.max(0, voucher.maxUsage - voucher.usageCount).toLocaleString("vi-VN") : "∞"}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl text-slate-200 p-5 shadow-sm">
        <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Kiểu giảm</p>
            <p className="mt-1 font-semibold text-white">{voucher.discountType === "PERCENT" ? "Theo phần trăm" : "Theo số tiền"}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Đơn tối thiểu</p>
            <p className="mt-1 font-semibold text-white">{moneyVnd(voucher.minOrderAmount)}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tối đa / user</p>
            <p className="mt-1 font-semibold text-white">{voucher.maxUsagePerUser ?? 1}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Giảm tối đa</p>
            <p className="mt-1 font-semibold text-white">{moneyVnd(voucher.maxDiscountAmount)}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Bắt đầu</p>
            <p className="mt-1 font-semibold text-white">{formatDateTime(voucher.startsAt)}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Hết hạn</p>
            <p className="mt-1 font-semibold text-white">{formatDateTime(voucher.expiresAt)}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tổng lượt tối đa</p>
            <p className="mt-1 font-semibold text-white">{voucher.maxUsage != null ? voucher.maxUsage.toLocaleString("vi-VN") : "∞"}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Lịch sử dùng</p>
            <p className="mt-1 font-semibold text-white">{enrichedUsages.length.toLocaleString("vi-VN")} bản ghi</p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl text-slate-200 shadow-sm">
        <div className="border-b border-white/10 px-6 py-5">
          <h2 className="font-headline text-xl font-black text-blue-900">User đã sử dụng voucher</h2>
          <p className="mt-1 text-sm text-slate-400">Hiển thị user, đơn hàng và thời điểm đã dùng mã voucher này.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead className="bg-white/10 border-white/10 text-white">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Tài khoản</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Đơn hàng</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Giá trị đơn</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Thời điểm dùng</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrichedUsages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                    Chưa có user nào sử dụng voucher này.
                  </td>
                </tr>
              ) : (
                enrichedUsages.map((usage) => (
                  <tr key={usage.id} className="hover:bg-white/10 border-white/10 text-white/70">
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">User #{usage.userId}</p>
                      <p className="mt-1 text-xs text-slate-400">{usage.user?.role?.roleName ?? "Khách hàng"}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      <p className="font-semibold">{usage.user?.userName ?? "-"}</p>
                      <p className="mt-1 text-xs text-slate-400">{usage.user?.email ?? "-"}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {usage.orderId ? (
                        <>
                          <p className="font-semibold">#{usage.orderId}</p>
                          <p className="mt-1 text-xs text-slate-400">{usage.order?.orderNumber ?? usage.order?.mvd ?? "-"}</p>
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-slate-300">{moneyVnd(Number(usage.order?.total ?? NaN))}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{formatDateTime(usage.usedAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          href={`/admin/customers/${usage.userId}`}
                          title="Xem user"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-blue-50 hover:text-blue-700"
                        >
                          <span className="material-symbols-outlined text-[20px]">person</span>
                        </Link>
                        {usage.orderId ? (
                          <Link
                            href={`/admin/orders/${usage.orderId}`}
                            title="Xem đơn hàng"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
