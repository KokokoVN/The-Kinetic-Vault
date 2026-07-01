import Link from "next/link";
import { cookies } from "next/headers";
import { getUsernameFromAccessToken, isAccessTokenExpired, getUserIdFromAccessToken } from "@/lib/auth";
import { StorefrontLayout } from "@/components/storefront-layout";
import { getResolvedApiRoot } from "@/app/api/cart/_shared";
import { syncOrderPaidFromPaymentRecords } from "@/lib/order-payment-sync";
import { PostSuccessRefresh } from "./post-success-refresh";
import { getMyOrderById } from "@/lib/api";

export const dynamic = "force-dynamic";

function asMoneyVnd(raw?: number | string | null): string {
  const n = Number(raw ?? 0);
  if (!Number.isFinite(n)) return "—";
  return `${n.toLocaleString("vi-VN")} đ`;
}

function statusColor(status?: string | null) {
  switch (status) {
    case "PENDING":
    case "CONFIRMED":
    case "PROCESSING":
      return "text-indigo-700 bg-indigo-50 border-indigo-200";
    case "SHIPPED":
      return "text-cyan-700 bg-cyan-50 border-cyan-200";
    case "DELIVERED":
      return "text-emerald-700 bg-emerald-50 border-emerald-200";
    case "CANCELLED":
      return "text-rose-700 bg-rose-50 border-rose-200";
    default:
      return "text-slate-700 bg-slate-50 border-slate-200";
  }
}

function statusLabel(status?: string | null) {
  switch (status) {
    case "PENDING": return "Chờ xác nhận";
    case "CONFIRMED": return "Đã xác nhận";
    case "PROCESSING": return "Đang chuẩn bị hàng";
    case "SHIPPED": return "Đang giao hàng";
    case "DELIVERED": return "Giao thành công";
    case "CANCELLED": return "Đã hủy";
    default: return status || "Không rõ";
  }
}


async function reconcileOrderPaidFromPayments(orderId: number, accessToken?: string | null): Promise<void> {
  const paymentBase = (process.env.PAYMENT_SERVICE_URL ?? "http://localhost:8814").trim().replace(/\/+$/, "");
  const apiRoot = getResolvedApiRoot();
  const urlDirect = `${paymentBase}/order/${orderId}/reconcile-paid`;
  const urlGw = `${apiRoot}/payments/order/${orderId}/reconcile-paid`;
  const token = String(accessToken ?? "").trim();
  const gwHeaders: Record<string, string> = {};
  if (token) gwHeaders.Authorization = `Bearer ${token}`;
  try {
    const direct = await fetch(urlDirect, { method: "POST", cache: "no-store" });
    if (direct.ok) return;
    await fetch(urlGw, { method: "POST", cache: "no-store", headers: gwHeaders });
  } catch {
    try {
      await fetch(urlGw, { method: "POST", cache: "no-store", headers: gwHeaders });
    } catch {
      /* ignore */
    }
  }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams?: Promise<{ orderId?: string; orderNumber?: string }>;
}) {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value;
  const isLoggedIn = Boolean(accessToken) && !isAccessTokenExpired(accessToken);
  const username = isLoggedIn ? getUsernameFromAccessToken(accessToken) : null;
  const userId = isLoggedIn ? getUserIdFromAccessToken(accessToken) : null;
  const sp = (await searchParams) ?? {};
  const orderId = Number(sp.orderId ?? 0);
  const detailHref = Number.isFinite(orderId) && orderId > 0 ? `/my-orders/${orderId}` : "/my-orders";

  let orderDetail = null;
  if (orderId > 0 && userId) {
    await reconcileOrderPaidFromPayments(orderId, accessToken);
    await syncOrderPaidFromPaymentRecords(orderId, accessToken);
    orderDetail = await getMyOrderById(orderId, { accessToken, userId });
  }

  return (
    <StorefrontLayout isLoggedIn={isLoggedIn} username={username} activeMenu="orders">
      {orderId > 0 ? <PostSuccessRefresh orderId={orderId} /> : null}
      <main className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900 p-8 shadow-2xl shadow-emerald-900/5 sm:p-12">
          {/* Decorative background element */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
          
          <section className="relative text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Thành công</p>
            <h1 className="mt-2 font-headline text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">Cảm ơn bạn đã đặt hàng!</h1>
            <p className="mx-auto mt-4 max-w-lg text-sm text-slate-500 dark:text-slate-400">
              Đơn hàng của bạn đã được tiếp nhận và đang trong quá trình xử lý. Chúng tôi sẽ thông báo cho bạn khi đơn hàng được giao.
            </p>

            {orderDetail && (
              <div className="mx-auto mt-10 max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-6 text-left">
                <h3 className="mb-4 border-b border-slate-100 dark:border-slate-800/50 pb-3 font-headline text-lg font-bold text-slate-900 dark:text-white">Chi tiết đơn hàng</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Mã đơn hàng</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{orderDetail.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Ngày đặt</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {orderDetail.createdAt ? new Date(orderDetail.createdAt as string | number).toLocaleDateString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Trạng thái</span>
                    <span className={`rounded-md border px-2 py-0.5 text-xs font-bold ${statusColor(orderDetail.status)}`}>
                      {statusLabel(orderDetail.status)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Thanh toán</span>
                    <span className="font-bold text-slate-900 dark:text-white">{orderDetail.paymentMethod === "COD" ? "Thanh toán khi nhận hàng" : "Chuyển khoản"}</span>
                  </div>
                  <div className="mt-4 border-t border-slate-100 dark:border-slate-800/50 pt-3 flex justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">Tổng cộng</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 text-base">{asMoneyVnd(orderDetail.total)}</span>
                  </div>
                </div>
              </div>
            )}

            {!orderDetail && orderId > 0 && (
              <div className="mt-8 text-sm font-bold text-emerald-700">Mã đơn: #{orderId}</div>
            )}

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href={detailHref} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 dark:bg-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-indigo-600 dark:bg-indigo-500/90 hover:shadow-primary/30">
                <span className="material-symbols-outlined text-sm">receipt_long</span>
                Xem chi tiết đơn hàng
              </Link>
              <Link href="/products" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 text-sm font-bold text-indigo-600 dark:text-indigo-400 transition hover:bg-slate-50 dark:bg-slate-800/50">
                <span className="material-symbols-outlined text-sm">shopping_bag</span>
                Tiếp tục mua sắm
              </Link>
            </div>
          </section>
        </div>
      </main>
    </StorefrontLayout>
  );
}
