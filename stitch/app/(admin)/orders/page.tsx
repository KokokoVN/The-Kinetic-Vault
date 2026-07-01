import Link from "next/link";
import { getAdminSession } from "@/lib/auth-server";
import { searchAdminOrdersPage, type AdminOrder } from "@/lib/api";
import { orderStatusTone, viAdminOrderPipelineLabel } from "@/lib/order-status";
import { SoftNavigateForm } from "@/components/soft-navigate-form";

export const dynamic = "force-dynamic";

function asMoneyVnd(raw?: number | string | null): string {
  const n = Number(raw ?? 0);
  if (!Number.isFinite(n)) return "—";
  return `${n.toLocaleString("vi-VN")} VND`;
}

function asOrderDate(raw?: string | number[] | null): string {
  if (!raw) return "—";
  if (typeof raw === "string") {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? raw : d.toLocaleDateString("vi-VN");
  }
  if (Array.isArray(raw) && raw.length >= 3) {
    const y = Number(raw[0]);
    const m = Number(raw[1]);
    const d = Number(raw[2]);
    if (![y, m, d].every((v) => Number.isFinite(v))) return "—";
    return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
  }
  return "—";
}

function clampInt(raw: unknown, fallback: number, min: number, max: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

function buildHref(basePath: string, qs: Record<string, string | number | null | undefined>): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(qs)) {
    if (v == null) continue;
    const s = String(v).trim();
    if (!s) continue;
    params.set(k, s);
  }
  const suffix = params.toString();
  return suffix ? `${basePath}?${suffix}` : basePath;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getAdminSession();
  const canWrite = session.canMutateCatalog;
  const sp = (await searchParams) ?? {};

  const q = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const status = Array.isArray(sp.status) ? sp.status[0] : sp.status;
  const paymentStatus = Array.isArray(sp.paymentStatus) ? sp.paymentStatus[0] : sp.paymentStatus;
  const startDate = Array.isArray(sp.startDate) ? sp.startDate[0] : sp.startDate;
  const endDate = Array.isArray(sp.endDate) ? sp.endDate[0] : sp.endDate;
  const page = clampInt(Array.isArray(sp.page) ? sp.page[0] : sp.page, 0, 0, 10_000);
  const size = clampInt(Array.isArray(sp.size) ? sp.size[0] : sp.size, 20, 5, 200);

  const result = await searchAdminOrdersPage({
    accessToken: session.token,
    q: q?.trim() || null,
    status: status?.trim() || null,
    paymentStatus: paymentStatus?.trim() || null,
    startDate: startDate?.trim() || null,
    endDate: endDate?.trim() || null,
    page,
    size,
  });
  const orders = result.items;

  const pending = orders.filter((o) => String(o.status ?? "").toUpperCase().includes("PAYMENT_EXPECTED") || String(o.status ?? "").toUpperCase().includes("PROCESSING") || String(o.status ?? "").toUpperCase() === "CREATED").length;
  const shipping = orders.filter((o) => String(o.status ?? "").toUpperCase().includes("SHIPPED") || String(o.status ?? "").toUpperCase().includes("OUT_FOR_DELIVERY")).length;
  const delivered = orders.filter((o) => String(o.status ?? "").toUpperCase().includes("DELIVERED")).length;

  return (
    <div className="space-y-10 pb-20">
      {/* VIP PRO HERO SECTION */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-900 p-8 shadow-2xl shadow-purple-900/40 sm:p-10">
        {/* Abstract Background Elements */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-xl text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-200 backdrop-blur-md">
              <span className="material-symbols-outlined text-[14px]">diamond</span>
              Trung tâm Quản lý
            </div>
            <h1 className="mt-4 font-headline text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl" style={{ textShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
              Quản lý Đơn hàng
            </h1>
            <p className="mt-3 text-lg font-medium text-purple-200/80">
              Kiểm soát toàn diện vòng đời đơn hàng, từ tiếp nhận đến lúc giao tận tay khách hàng.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 lg:flex-nowrap">
            <div className="group relative flex min-w-[140px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-all hover:border-fuchsia-400/50 hover:bg-white/10 hover:shadow-[0_0_30px_-5px_rgba(217,70,239,0.3)] hover:-translate-y-1">
              <div className="mb-2 flex items-center gap-2 text-fuchsia-300">
                <span className="material-symbols-outlined text-lg">pending_actions</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">Chờ xử lý</span>
              </div>
              <p className="font-headline text-3xl font-black text-white">{pending}</p>
            </div>
            
            <div className="group relative flex min-w-[140px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-all hover:border-cyan-400/50 hover:bg-white/10 hover:shadow-[0_0_30px_-5px_rgba(34,211,238,0.3)] hover:-translate-y-1">
              <div className="mb-2 flex items-center gap-2 text-cyan-300">
                <span className="material-symbols-outlined text-lg">local_shipping</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">Đang giao</span>
              </div>
              <p className="font-headline text-3xl font-black text-white">{shipping}</p>
            </div>

            <div className="group relative flex min-w-[140px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-all hover:border-emerald-400/50 hover:bg-white/10 hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] hover:-translate-y-1">
              <div className="mb-2 flex items-center gap-2 text-emerald-300">
                <span className="material-symbols-outlined text-lg">task_alt</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">Thành công</span>
              </div>
              <p className="font-headline text-3xl font-black text-white">{delivered}</p>
            </div>
          </div>
        </div>
      </section>

      {!canWrite && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-amber-700 shadow-sm">
          <span className="material-symbols-outlined">warning</span>
          <p className="text-sm">
            Tài khoản hiện ở chế độ <strong>chỉ xem</strong>, không thể cập nhật trạng thái đơn.
          </p>
        </div>
      )}

      {/* VIP PRO FILTER COMMAND CENTER */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-lg shadow-primary/5">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-md"></div>
        <SoftNavigateForm className="relative z-10 grid gap-4 p-5 sm:p-6 md:grid-cols-12" actionPath="/admin/orders">
          <div className="md:col-span-4">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Tra cứu đơn hàng</label>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400 dark:text-slate-500">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </span>
              <input
                name="q"
                defaultValue={q ?? ""}
                placeholder="Mã đơn, SĐT, Email..."
                className="h-14 w-full rounded-2xl border-2 border-transparent bg-slate-50 dark:bg-slate-800/50 pl-12 pr-4 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all focus:border-purple-500/50 focus:bg-white dark:bg-slate-900 focus:shadow-[0_0_20px_-5px_rgba(168,85,247,0.2)]"
              />
            </div>
          </div>
          
          <div className="md:col-span-4">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Tiến trình xử lý</label>
            <div className="group relative mt-2">
              <select
                name="status"
                defaultValue={status ?? ""}
                className="h-14 w-full appearance-none rounded-2xl border-2 border-transparent bg-slate-50 dark:bg-slate-800/50 px-5 pr-12 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all hover:bg-slate-100 dark:bg-slate-800 hover:shadow-sm focus:border-purple-500/50 focus:bg-white dark:bg-slate-900 focus:shadow-[0_0_20px_-5px_rgba(168,85,247,0.2)]"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="CREATED">{viAdminOrderPipelineLabel("CREATED")}</option>
                <option value="CONFIRMED">{viAdminOrderPipelineLabel("CONFIRMED")}</option>
                <option value="PAYMENT_EXPECTED">{viAdminOrderPipelineLabel("PAYMENT_EXPECTED")}</option>
                <option value="PAID">{viAdminOrderPipelineLabel("PAID")}</option>
                <option value="PROCESSING">{viAdminOrderPipelineLabel("PROCESSING")}</option>
                <option value="PACKING">{viAdminOrderPipelineLabel("PACKING")}</option>
                <option value="READY_TO_SHIP">{viAdminOrderPipelineLabel("READY_TO_SHIP")}</option>
                <option value="SHIPPED">{viAdminOrderPipelineLabel("SHIPPED")}</option>
                <option value="OUT_FOR_DELIVERY">{viAdminOrderPipelineLabel("OUT_FOR_DELIVERY")}</option>
                <option value="DELIVERED">{viAdminOrderPipelineLabel("DELIVERED")}</option>
                <option value="CANCELLED">{viAdminOrderPipelineLabel("CANCELLED")}</option>
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400 dark:text-slate-500 transition-transform group-hover:translate-y-1 group-focus-within:text-purple-500">
                <span className="material-symbols-outlined text-[22px]">keyboard_arrow_down</span>
              </span>
            </div>
          </div>

          <div className="md:col-span-4">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Thanh toán</label>
            <div className="group relative mt-2">
              <select
                name="paymentStatus"
                defaultValue={paymentStatus ?? ""}
                className="h-14 w-full appearance-none rounded-2xl border-2 border-transparent bg-slate-50 dark:bg-slate-800/50 px-5 pr-12 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all hover:bg-slate-100 dark:bg-slate-800 hover:shadow-sm focus:border-purple-500/50 focus:bg-white dark:bg-slate-900 focus:shadow-[0_0_20px_-5px_rgba(168,85,247,0.2)]"
              >
                <option value="">Tất cả thanh toán</option>
                <option value="PENDING">⏳ Chờ thanh toán</option>
                <option value="PAID">✅ Đã thanh toán</option>
                <option value="FAILED">❌ Thanh toán lỗi</option>
                <option value="REFUNDED">💸 Đã hoàn tiền</option>
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400 dark:text-slate-500 transition-transform group-hover:translate-y-1 group-focus-within:text-purple-500">
                <span className="material-symbols-outlined text-[22px]">keyboard_arrow_down</span>
              </span>
            </div>
          </div>

          <div className="md:col-span-6 lg:col-span-3">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Từ ngày</label>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400 dark:text-slate-500">
                <span className="material-symbols-outlined text-[20px]">calendar_today</span>
              </span>
              <input
                type="date"
                name="startDate"
                defaultValue={startDate ?? ""}
                className="h-14 w-full rounded-2xl border-2 border-transparent bg-slate-50 dark:bg-slate-800/50 pl-12 pr-4 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all focus:border-purple-500/50 focus:bg-white dark:bg-slate-900 focus:shadow-[0_0_20px_-5px_rgba(168,85,247,0.2)]"
              />
            </div>
          </div>

          <div className="md:col-span-6 lg:col-span-3">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Đến ngày</label>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400 dark:text-slate-500">
                <span className="material-symbols-outlined text-[20px]">calendar_today</span>
              </span>
              <input
                type="date"
                name="endDate"
                defaultValue={endDate ?? ""}
                className="h-14 w-full rounded-2xl border-2 border-transparent bg-slate-50 dark:bg-slate-800/50 pl-12 pr-4 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all focus:border-purple-500/50 focus:bg-white dark:bg-slate-900 focus:shadow-[0_0_20px_-5px_rgba(168,85,247,0.2)]"
              />
            </div>
          </div>

          <input type="hidden" name="page" value="0" />
          <input type="hidden" name="size" value={String(size)} />

          <div className="mt-2 flex items-center gap-3 md:col-span-12">
            <button
              type="submit"
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 font-bold text-white shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] hover:shadow-purple-600/50 sm:flex-none"
            >
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
              Lọc Dữ Liệu
            </button>
            <Link
              href="/admin/orders"
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-transparent px-6 font-bold text-slate-900 dark:text-white transition-all hover:bg-slate-50 dark:bg-slate-800/50 sm:flex-none"
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
              Đặt lại
            </Link>
            <div className="ml-auto hidden items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 px-4 py-2 sm:flex">
              <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-sm">database</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tổng số:</span>
              <span className="font-headline text-lg font-black text-indigo-600 dark:text-indigo-400">{result.totalItems.toLocaleString("vi-VN")}</span>
            </div>
          </div>
        </SoftNavigateForm>
      </section>

      {/* VIP PRO DATA TABLE */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-sm dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/60 dark:bg-slate-800/60">
                <th className="whitespace-nowrap px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Thông tin đơn</th>
                <th className="whitespace-nowrap px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Khách hàng</th>
                <th className="whitespace-nowrap px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Trạng thái</th>
                <th className="whitespace-nowrap px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Thanh toán</th>
                <th className="whitespace-nowrap px-6 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Tổng giá trị</th>
                <th className="whitespace-nowrap px-6 py-5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Tác vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {orders.map((o: AdminOrder) => {
                const isPaid = String(o.paymentStatus).toUpperCase() === "PAID";
                return (
                  <tr key={String(o.id)} className="group relative transition-all duration-300 hover:bg-purple-50/40">
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-sm font-bold text-indigo-700">{o.orderNumber ?? `#${o.id ?? "—"}`}</span>
                        <span className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                          {asOrderDate(o.orderedDate)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 font-bold text-slate-700 shadow-sm">
                          {(o.user?.userName || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{o.user?.userName ?? "Khách vãng lai"}</span>
                          {o.user?.id != null && <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">ID: #{o.user.id}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] shadow-sm ${orderStatusTone(o.status)}`}>
                        {viAdminOrderPipelineLabel(o.status)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                        <span className={`material-symbols-outlined text-[14px] ${isPaid ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {isPaid ? 'check_circle' : 'schedule'}
                        </span>
                        {isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="font-headline text-lg font-black text-slate-900 dark:text-white">{asMoneyVnd(o.total)}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {o.id != null ? (
                        <Link 
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all hover:scale-110 hover:bg-purple-100 hover:text-purple-700 hover:shadow-lg hover:shadow-purple-500/20" 
                          href={`/admin/orders/${o.id}`}
                        >
                          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                        </Link>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pagination VIP PRO */}
      <section className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2 rounded-2xl bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 shadow-sm border border-slate-100 dark:border-slate-800/50">
          Trang <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-md bg-purple-100 px-1 font-bold text-purple-700">{result.totalPages === 0 ? 0 : result.page + 1}</span> 
          / <span className="font-bold text-slate-900 dark:text-white">{result.totalPages}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            aria-disabled={result.page <= 0}
            className={[
              "inline-flex h-10 items-center justify-center gap-2 rounded-2xl border px-5 text-sm font-bold transition-all",
              result.page <= 0
                ? "cursor-not-allowed border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 opacity-50"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:border-purple-300 hover:text-purple-700 hover:shadow-md hover:-translate-y-0.5",
            ].join(" ")}
            href={buildHref("/admin/orders", { q, status, paymentStatus, startDate, endDate, page: Math.max(0, result.page - 1), size: result.size })}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Trước
          </Link>
          <Link
            aria-disabled={result.page + 1 >= result.totalPages}
            className={[
              "inline-flex h-10 items-center justify-center gap-2 rounded-2xl border px-5 text-sm font-bold transition-all",
              result.page + 1 >= result.totalPages
                ? "cursor-not-allowed border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 opacity-50"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:border-purple-300 hover:text-purple-700 hover:shadow-md hover:-translate-y-0.5",
            ].join(" ")}
            href={buildHref("/admin/orders", { q, status, paymentStatus, startDate, endDate, page: result.page + 1, size: result.size })}
          >
            Sau
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
      </section>

      {orders.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-20 shadow-sm">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-500">
            <span className="material-symbols-outlined text-4xl">inbox</span>
          </div>
          <div className="text-center">
            <h3 className="font-headline text-lg font-bold text-slate-900 dark:text-white">Không tìm thấy đơn hàng</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Thử điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm.</p>
          </div>
        </div>
      )}
    </div>
  );
}

