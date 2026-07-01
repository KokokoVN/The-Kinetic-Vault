import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth-server";
import { getAdminOrderById, updateAdminOrderStatus, type AdminOrder } from "@/lib/api";
import { getUserIdFromAccessToken } from "@/lib/auth";
import {
  allowedNextOrderStatuses,
  paymentStatusTone,
  viAdminOrderPipelineLabel,
  viPaymentMethodLabel,
  viPaymentStatusLabel,
} from "@/lib/order-status";
import { KineticSelect } from "@/components/kinetic-select";

export const dynamic = "force-dynamic";

function asMoneyVnd(raw?: number | string | null): string {
  const n = Number(raw ?? 0);
  if (!Number.isFinite(n)) return "—";
  return `${n.toLocaleString("vi-VN")} VND`;
}

function asDateOnlyVi(raw?: string | number[] | null): string {
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

// VIP Pro visual stepper steps
const PIPELINE_STEPS = ["CREATED", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const errorRaw = Array.isArray(sp.error) ? sp.error[0] : sp.error;
  const error = errorRaw ? decodeURIComponent(String(errorRaw)) : null;
  const session = await getAdminSession();
  const order = await getAdminOrderById(Number(id), { accessToken: session.token });
  
  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-rose-200 bg-rose-50 py-20 text-center">
        <span className="material-symbols-outlined text-4xl text-rose-400">error</span>
        <div>
          <h3 className="font-headline text-lg font-bold text-rose-900">Không tìm thấy đơn hàng</h3>
          <p className="mt-1 text-sm text-rose-700">Đơn hàng #{id} không tồn tại hoặc bạn không có quyền xem.</p>
        </div>
      </div>
    );
  }

  async function updateStatusAction(formData: FormData) {
    "use server";
    const s = await getAdminSession();
    if (!s.canMutateCatalog) {
      redirect(`/admin/orders/${id}`);
    }
    const userId = getUserIdFromAccessToken(s.token);
    const orderId = Number(String(formData.get("_orderId") ?? 0));
    const status = String(formData.get("status") ?? "").trim();
    const shippingAddress = String(formData.get("shippingAddress") ?? "").trim();
    if (!orderId || !status) {
      redirect(`/admin/orders/${id}`);
    }
    try {
      await updateAdminOrderStatus(
        orderId,
        { status, shippingAddress: shippingAddress || undefined },
        { accessToken: s.token, username: s.username, userId },
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Không thể cập nhật trạng thái. Vui lòng thử lại.";
      redirect(`/admin/orders/${id}?error=${encodeURIComponent(msg)}`);
    }
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin/orders");
    redirect(`/admin/orders/${id}`);
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const currentStatus = String(order.status ?? "PAYMENT_EXPECTED").trim().toUpperCase();
  const allowed = allowedNextOrderStatuses(currentStatus);
  const isPaid = String(order.paymentStatus).toUpperCase() === "PAID";

  // Calculate current pipeline step index
  let activeStepIndex = PIPELINE_STEPS.indexOf(currentStatus);
  if (activeStepIndex === -1) {
    if (currentStatus === "PACKING" || currentStatus === "READY_TO_SHIP") activeStepIndex = 2; // Treat as processing
    if (currentStatus === "OUT_FOR_DELIVERY") activeStepIndex = 3; // Treat as shipped
    if (currentStatus === "PAYMENT_EXPECTED" || currentStatus === "PAID") activeStepIndex = 1; // Between confirmed and processing
  }

  return (
    <div className="space-y-8 pb-20">
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        <Link href="/admin/orders" className="transition-colors hover:text-purple-600">Đơn hàng</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-purple-600">{order.orderNumber ?? `#${order.id}`}</span>
      </nav>

      {/* VIP PRO HEADER */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-900 p-8 shadow-2xl shadow-purple-900/40">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl"></div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="text-white">
            <h1 className="font-headline text-3xl font-black tracking-tight sm:text-4xl" style={{ textShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
              Chi tiết Đơn hàng
            </h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-purple-200">
              <span className="material-symbols-outlined text-[18px]">receipt</span>
              Mã đơn: <strong className="font-mono text-fuchsia-300">{order.orderNumber ?? `#${order.id}`}</strong>
            </p>
          </div>
          <div className="flex flex-col items-end rounded-2xl border border-white/20 bg-white/10 px-6 py-4 backdrop-blur-md">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-200">Tổng giá trị</p>
            <p className="font-headline text-2xl font-black text-white">{asMoneyVnd(order.total)}</p>
          </div>
        </div>
      </section>

      {error ? (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-rose-700 shadow-sm backdrop-blur-sm">
          <span className="material-symbols-outlined">error</span>
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : null}

      {/* VIP PROGRESS PIPELINE */}
      <section className="relative overflow-hidden rounded-[2rem] border border-white/40 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 p-6 shadow-xl shadow-purple-900/5 backdrop-blur-xl sm:p-8">
        <div className="flex items-center justify-between">
          {PIPELINE_STEPS.map((step, idx) => {
            const isActive = activeStepIndex === idx;
            const isCompleted = activeStepIndex > idx;
            const isPending = activeStepIndex < idx;
            
            return (
              <div key={step} className="relative flex w-full flex-col items-center">
                {/* Connecting Line */}
                {idx !== PIPELINE_STEPS.length - 1 && (
                  <div className={`absolute top-5 left-[50%] h-[2px] w-full ${isCompleted ? 'bg-gradient-to-r from-purple-500 to-indigo-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-slate-200 dark:bg-slate-700'}`} />
                )}
                {/* Node */}
                <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                  isCompleted ? 'border-transparent bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] scale-110' :
                  isActive ? 'border-fuchsia-500 bg-white dark:bg-slate-900 text-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.3)] scale-125' :
                  'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400'
                }`}>
                  <span className="material-symbols-outlined text-[18px]">
                    {isCompleted ? 'check' : step === 'CREATED' ? 'inventory_2' : step === 'CONFIRMED' ? 'fact_check' : step === 'PROCESSING' ? 'autorenew' : step === 'SHIPPED' ? 'local_shipping' : 'done_all'}
                  </span>
                </div>
                {/* Label */}
                <span className={`mt-3 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors ${isActive ? 'text-fuchsia-600' : isCompleted ? 'text-indigo-600' : 'text-slate-500 dark:text-slate-400'}`}>
                  {viAdminOrderPipelineLabel(step)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-12">
        <section className="space-y-6 lg:col-span-8">
          {/* INFO GRID */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="group rounded-[1.5rem] border border-white/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 p-5 shadow-lg shadow-indigo-900/5 backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/10 hover:bg-white/80">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Khách hàng</p>
                  <p className="font-headline font-bold text-slate-900 dark:text-white">{order.user?.userName ?? "Khách vãng lai"}</p>
                </div>
              </div>
              <p className="mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                ID Khách hàng: <span className="font-mono text-indigo-600">{order.user?.id != null ? `#${order.user.id}` : "—"}</span>
              </p>
            </div>

            <div className="group rounded-[1.5rem] border border-white/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 p-5 shadow-lg shadow-indigo-900/5 backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/10 hover:bg-white/80">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-600">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Thanh toán</p>
                  <p className="font-headline font-bold text-slate-900 dark:text-white">{viPaymentMethodLabel(order.paymentMethod)}</p>
                </div>
              </div>
              <div className="mt-4">
                <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${paymentStatusTone(order.paymentStatus)}`}>
                  {viPaymentStatusLabel(order.paymentStatus)}
                </span>
              </div>
            </div>

            <div className="group rounded-[1.5rem] border border-white/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 p-5 shadow-lg shadow-indigo-900/5 backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/10 hover:bg-white/80">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                  <span className="material-symbols-outlined">calendar_month</span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Ngày đặt hàng</p>
                  <p className="font-headline font-bold text-slate-900 dark:text-white">{asDateOnlyVi(order.orderedDate)}</p>
                </div>
              </div>
            </div>

            <div className="group rounded-[1.5rem] border border-white/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 p-5 shadow-lg shadow-indigo-900/5 backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/10 hover:bg-white/80">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <span className="material-symbols-outlined">event_available</span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Ngày giao dự kiến</p>
                  <p className="font-headline font-bold text-slate-900 dark:text-white">{asDateOnlyVi(order.estimatedDeliveryDate)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 p-6 shadow-lg shadow-indigo-900/5 backdrop-blur-md">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Địa chỉ Giao Hàng</p>
            <p className="mt-2 text-sm font-medium leading-relaxed text-slate-900 dark:text-white">{order.shippingAddress?.trim() || "Chưa cập nhật địa chỉ giao hàng."}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 p-5 shadow-lg shadow-indigo-900/5 backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Mã Vận Đơn (MVD)</p>
              <p className="mt-2 font-mono text-lg font-bold text-indigo-700">{order.mvd?.trim() || "—"}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 p-5 shadow-lg shadow-indigo-900/5 backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">4 Số Cuối SĐT</p>
              <p className="mt-2 font-mono text-lg font-bold text-slate-900 dark:text-white">{order.phoneLast4?.trim() || "—"}</p>
            </div>
          </div>

          {/* HIGH-END RECEIPT TABLE */}
          <div className="overflow-hidden rounded-[2rem] border border-white/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 shadow-xl shadow-indigo-900/10 backdrop-blur-xl">
            <div className="bg-white/40 dark:bg-slate-800/40 px-6 py-4 border-b border-white/50 dark:border-slate-700/50">
              <h2 className="font-headline text-sm font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Danh sách Sản phẩm</h2>
            </div>
            <table className="min-w-full text-left text-sm">
              <thead className="bg-transparent text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">Sản phẩm</th>
                  <th className="px-6 py-4 text-center">SL</th>
                  <th className="px-6 py-4 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {items.map((it, idx) => (
                  <tr key={`${it.id ?? idx}`} className="transition-colors hover:bg-purple-50/30">
                    <td className="px-6 py-5">
                      <p className="font-semibold text-slate-900 dark:text-white">{it.productNameSnapshot || it.product?.productName || "—"}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{it.productSkuSnapshot || it.product?.sku || "—"}</p>
                      {it.variantLabel?.trim() && (
                        <p className="mt-2 inline-flex rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-800">
                          {it.variantLabel}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-5 text-center font-bold text-slate-900 dark:text-white">{Number(it.quantity ?? 0).toLocaleString("vi-VN")}</td>
                    <td className="px-6 py-5 text-right font-headline text-base font-black text-indigo-600 dark:text-indigo-400">{asMoneyVnd(it.subTotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50/30 dark:bg-slate-800/30">
                <tr>
                  <td colSpan={2} className="px-6 py-5 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tổng Tiền:</td>
                  <td className="px-6 py-5 text-right font-headline text-xl font-black text-purple-700">{asMoneyVnd(order.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* UPDATE FORM */}
        <section className="lg:col-span-4">
          <div className="sticky top-6 rounded-[2rem] border border-white/60 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/70 p-6 shadow-2xl shadow-purple-900/10 backdrop-blur-2xl">
            <div className="mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 p-2 text-white shadow-md shadow-purple-500/30">edit_document</span>
              <h2 className="font-headline text-lg font-black text-slate-900 dark:text-white">Cập nhật Đơn hàng</h2>
            </div>
            
            <form action={updateStatusAction} className="space-y-5">
              <input type="hidden" name="_orderId" value={String(order.id ?? "")} />
              
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Trạng thái đơn hàng
                </label>
                <div className="relative">
                  <KineticSelect
                    name="status"
                    required
                    disabled={!session.canMutateCatalog}
                    value={currentStatus}
                    placeholder="Chọn trạng thái"
                    options={[
                      { value: currentStatus, label: viAdminOrderPipelineLabel(currentStatus), group: "Hiện tại" },
                      ...allowed.map((code) => ({ value: code, label: viAdminOrderPipelineLabel(code), group: "Chuyển sang" })),
                    ]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Địa chỉ giao hàng</label>
                <textarea
                  name="shippingAddress"
                  rows={3}
                  defaultValue={order.shippingAddress ?? ""}
                  disabled={!session.canMutateCatalog}
                  placeholder="Nhập địa chỉ giao hàng chi tiết..."
                  className="w-full resize-none rounded-2xl border border-white/50 bg-white/50 dark:bg-slate-800/50 px-4 py-3 text-sm font-medium outline-none transition-all focus:border-purple-500/50 focus:bg-white dark:bg-slate-900 focus:shadow-[0_0_20px_-5px_rgba(168,85,247,0.2)] disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={!session.canMutateCatalog}
                className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] hover:shadow-purple-600/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
                <span className="relative z-10 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">save</span>
                  Lưu Thay Đổi
                </span>
              </button>
            </form>

            {!session.canMutateCatalog && (
              <p className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-rose-500">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                Tài khoản chỉ xem
              </p>
            )}

            <div className="mt-6 pt-6 border-t border-white/30 dark:border-slate-800/50">
              <Link href="/admin/orders" className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-white/50 bg-white/40 dark:bg-slate-800/50 px-6 py-3.5 text-sm font-bold text-slate-900 dark:text-white transition-all hover:bg-white/80 dark:hover:bg-slate-800 hover:shadow-md hover:-translate-y-0.5">
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">arrow_back</span>
                Trở về Danh sách
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
