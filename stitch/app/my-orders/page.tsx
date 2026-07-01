import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createManualOrder, listMyOrders, type UserOrder, updateAdminOrderStatus } from "@/lib/api";
import { getUserIdFromAccessToken, getUsernameFromAccessToken, isAccessTokenExpired } from "@/lib/auth";
import {
  allowedNextOrderStatuses,
  storefrontOrderBadgeTone,
  storefrontOrderProgressPercent,
  STOREFRONT_ORDER_FILTER_STATUS_VALUES,
  viOrderStatusLabel,
  viUnifiedOrderProgressLabel,
} from "@/lib/order-status";
import { StorefrontLayout } from "@/components/storefront-layout";
import { SoftNavigateForm } from "@/components/soft-navigate-form";

export const dynamic = "force-dynamic";

function asMoneyVnd(raw?: number | string | null): string {
  const n = Number(raw ?? 0);
  if (!Number.isFinite(n)) return "—";
  return `${n.toLocaleString("vi-VN")} VND`;
}

function asDateVi(raw?: string | number[] | null): string {
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

function resolveImageUrl(raw?: string | null): string | null {
  const v = String(raw ?? "").trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v) || v.startsWith("data:")) return v;
  const origin = (process.env.API_SERVER_ORIGIN ?? "http://localhost:8900").replace(/\/+$/, "");
  if (v.startsWith("/")) return `${origin}${v}`;
  return `${origin}/api/catalog/admin/products/images/file/${v}`;
}

export default async function UserOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; status?: string; notice?: string; error?: string }>;
}) {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value?.trim() ?? "";
  const isLoggedIn = Boolean(accessToken) && !isAccessTokenExpired(accessToken);
  if (!isLoggedIn) redirect("/login?next=/my-orders");
  const username = getUsernameFromAccessToken(accessToken);
  const userIdRaw = getUserIdFromAccessToken(accessToken);
  const userId = Number(userIdRaw);
  if (!Number.isFinite(userId) || userId <= 0) redirect("/login?error=expired");

  const sp = (await searchParams) ?? {};
  const q = String(sp.q ?? "").trim().toLowerCase();
  const status = String(sp.status ?? "").trim().toUpperCase();
  const notice = String(sp.notice ?? "").trim();
  const error = String(sp.error ?? "").trim();

  const all = await listMyOrders({ accessToken, userId });
  const filtered = all.filter((o) => {
    if (status && String(o.status ?? "").toUpperCase() !== status) return false;
    if (!q) return true;
    const hay = `${o.orderNumber ?? ""} ${o.id ?? ""} ${o.items?.map((i) => i.productNameSnapshot || i.product?.productName || "").join(" ") ?? ""}`.toLowerCase();
    return hay.includes(q);
  });

  async function cancelOrderAction(formData: FormData) {
    "use server";
    const jar = await cookies();
    const token = jar.get("accessToken")?.value?.trim() ?? "";
    const uid = Number(getUserIdFromAccessToken(token));
    if (!token || isAccessTokenExpired(token) || !Number.isFinite(uid) || uid <= 0) {
      redirect("/login?next=/my-orders");
    }
    const orderId = Number(String(formData.get("orderId") ?? 0));
    if (!Number.isFinite(orderId) || orderId <= 0) redirect("/my-orders");
    const currentOrders = await listMyOrders({ accessToken: token, userId: uid });
    const order = currentOrders.find((o) => Number(o.id) === orderId);
    if (!order) redirect("/my-orders?error=Không%20tìm%20thấy%20đơn%20hàng");
    const canCancel = allowedNextOrderStatuses(order.status).includes("CANCELLED");
    if (!canCancel) redirect("/my-orders?error=Đơn%20hàng%20không%20thể%20hủy%20ở%20trạng%20thái%20hiện%20tại");
    try {
      await updateAdminOrderStatus(
        orderId,
        { status: "CANCELLED", shippingAddress: order.shippingAddress ?? undefined },
        { accessToken: token, username: getUsernameFromAccessToken(token), userId: String(uid) },
      );
    } catch {
      redirect("/my-orders?error=Hủy%20đơn%20thất%20bại");
    }
    revalidatePath("/my-orders");
    redirect("/my-orders?notice=cancelled");
  }

  async function reorderAction(formData: FormData) {
    "use server";
    const jar = await cookies();
    const token = jar.get("accessToken")?.value?.trim() ?? "";
    const uid = Number(getUserIdFromAccessToken(token));
    if (!token || isAccessTokenExpired(token) || !Number.isFinite(uid) || uid <= 0) {
      redirect("/login?next=/my-orders");
    }
    const orderId = Number(String(formData.get("orderId") ?? 0));
    if (!Number.isFinite(orderId) || orderId <= 0) redirect("/my-orders");
    const currentOrders = await listMyOrders({ accessToken: token, userId: uid });
    const order = currentOrders.find((o) => Number(o.id) === orderId);
    if (!order) redirect("/my-orders?error=Không%20tìm%20thấy%20đơn%20hàng");
    const isDelivered = String(order.status ?? "").toUpperCase() === "DELIVERED";
    const items = Array.isArray(order.items) ? order.items : [];
    if (!isDelivered || items.length === 0) {
      redirect("/my-orders?error=Chỉ%20đặt%20lại%20được%20đơn%20đã%20giao");
    }
    try {
      const created = await createManualOrder(
        {
          userId: uid,
          shippingAddress: order.shippingAddress ?? null,
          paymentMethod: order.paymentMethod ?? null,
          items: items
            .map((it) => ({
              productId: Number(it.product?.id ?? 0),
              quantity: Math.max(1, Number(it.quantity ?? 1)),
              variantId: it.variantId ?? null,
              variantLabel: it.variantLabel ?? null,
            }))
            .filter((it) => Number.isFinite(it.productId) && it.productId > 0),
        },
        { accessToken: token },
      );
      revalidatePath("/my-orders");
      redirect(`/my-orders/${created.id}?notice=reordered`);
    } catch {
      redirect("/my-orders?error=Đặt%20lại%20đơn%20thất%20bại");
    }
  }

  return (
    <StorefrontLayout isLoggedIn={isLoggedIn} username={username} activeMenu="orders">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .anim-fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .anim-scale-in { animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .order-card {
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .order-card:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 25px 50px rgba(99, 102, 241, 0.15), 0 10px 20px rgba(0, 0, 0, 0.05);
        }
      ` }} />
      <div className="bg-gradient-to-br from-slate-50 via-indigo-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 min-h-[calc(100vh-80px)]">
        <main className="mx-auto max-w-[1440px] space-y-8 px-4 py-12 sm:px-6 lg:px-8">
          {/* Notifications */}
          <div className="space-y-3">
            {notice === "cancelled" && (
              <div className="anim-fade-up flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-5 py-4 text-emerald-800 shadow-sm backdrop-blur-md">
                <span className="material-symbols-outlined">check_circle</span>
                <p className="text-sm font-semibold">Hủy đơn hàng thành công.</p>
              </div>
            )}
            {error && (
              <div className="anim-fade-up flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 px-5 py-4 text-rose-800 shadow-sm backdrop-blur-md">
                <span className="material-symbols-outlined">error</span>
                <p className="text-sm font-semibold">{decodeURIComponent(error)}</p>
              </div>
            )}
          </div>

          {/* Header & Filter Section */}
          <section
            className="anim-scale-in rounded-[2rem] border border-white/60 dark:border-slate-700/50 p-6 shadow-2xl shadow-indigo-900/10 sm:p-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl saturate-150"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-tight" style={{ color: "#0f172a" }}>Lịch sử đặt hàng</h1>
                <p className="mt-1 text-sm font-medium text-slate-500">Quản lý và theo dõi tiến trình đơn hàng của bạn.</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>inventory_2</span>
              </div>
            </div>

            <SoftNavigateForm actionPath="/my-orders" className="mt-8 grid gap-4 md:grid-cols-12">
              <div className="relative md:col-span-5">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Tìm mã đơn, tên sản phẩm..."
                  className="w-full rounded-[1.25rem] border border-white/40 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 py-3.5 pl-12 pr-4 text-sm font-medium text-slate-700 dark:text-white shadow-inner outline-none backdrop-blur-md transition-all focus:border-indigo-500/50 focus:bg-white/80 dark:focus:bg-slate-800/80 focus:shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                />
              </div>
              <div className="relative md:col-span-4">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">filter_list</span>
                <select
                  name="status"
                  defaultValue={status}
                  className="w-full appearance-none rounded-[1.25rem] border border-white/40 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 py-3.5 pl-12 pr-10 text-sm font-medium text-slate-700 dark:text-white shadow-inner outline-none backdrop-blur-md transition-all focus:border-indigo-500/50 focus:bg-white/80 dark:focus:bg-slate-800/80 focus:shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                >
                  <option value="">Tất cả trạng thái</option>
                  {STOREFRONT_ORDER_FILTER_STATUS_VALUES.map((code) => (
                    <option key={code} value={code}>
                      {viOrderStatusLabel(code)}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
              </div>
              <button type="submit" className="flex items-center justify-center gap-2 rounded-[1.25rem] bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 hover:shadow-indigo-600/50 md:col-span-2">
                Lọc
              </button>
              <Link href="/my-orders" className="group flex items-center justify-center rounded-[1.25rem] border border-white/50 bg-white/40 dark:border-slate-700/50 dark:bg-slate-800/50 px-4 py-3.5 text-sm font-bold text-slate-600 dark:text-slate-300 transition-all hover:bg-white/80 dark:hover:bg-slate-700 md:col-span-1">
                <span className="material-symbols-outlined transition-transform group-hover:rotate-180 duration-500" style={{ fontSize: "20px" }}>refresh</span>
              </Link>
            </SoftNavigateForm>
          </section>

          {/* Orders List */}
          <section className="space-y-6">
            {filtered.map((o: UserOrder, index: number) => {
              const itemCount = Array.isArray(o.items) ? o.items.reduce((sum, it) => sum + Number(it.quantity ?? 0), 0) : 0;
              const firstItem = Array.isArray(o.items) && o.items.length > 0 ? o.items[0] : null;
              
              // Lấy giá trị thanh toán thực tế dựa trên sản phẩm (vd: sản phẩm khuyến mãi 1k)
              const displayTotal = Array.isArray(o.items) && o.items.length > 0
                ? o.items.reduce((sum, it: any) => sum + Number(it.subTotal ?? it.sub_total ?? 0), 0)
                : Number(o.total ?? 0);

              const imageUrl = resolveImageUrl(
                firstItem?.productImageSnapshot ?? firstItem?.product?.primaryImageUrl ?? null,
              );
              const progress = storefrontOrderProgressPercent(o.status, o.paymentStatus, o.paymentMethod);
              
              // Custom delay for staggered animation
              const animDelay = `${index * 0.1}s`;

              return (
                <article
                  key={String(o.id ?? o.orderNumber)}
                  className="order-card anim-fade-up overflow-hidden rounded-[2rem] border border-white/60 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 shadow-xl shadow-indigo-900/10 backdrop-blur-2xl"
                  style={{ animationDelay: animDelay }}
                >
                  {/* Header part of card */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/40 dark:border-slate-800/50 bg-white/40 dark:bg-slate-800/40 px-6 py-4 sm:px-8">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 shadow-sm">
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>receipt_long</span>
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 dark:text-white">{o.orderNumber ?? `#${o.id}`}</p>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{asDateVi(o.orderedDate)}</p>
                      </div>
                    </div>
                    <span
                      title="Tiến trình đơn hàng"
                      className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.1em] shadow-sm ${storefrontOrderBadgeTone(o.status, o.paymentStatus, o.paymentMethod)}`}
                    >
                      {viUnifiedOrderProgressLabel(o.status, o.paymentStatus, o.paymentMethod)}
                    </span>
                  </div>

                  {/* Body part of card */}
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                      {/* Product Image */}
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[1.25rem] border border-white/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 shadow-inner sm:h-32 sm:w-32">
                        {imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={imageUrl} alt={firstItem?.productNameSnapshot || firstItem?.product?.productName || "Ảnh sản phẩm"} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined mb-1">image_not_supported</span>
                            <span className="text-[10px] font-medium">Trống</span>
                          </div>
                        )}
                        {itemCount > 1 && (
                          <div className="absolute bottom-2 right-2 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-slate-900/80 px-2 text-[10px] font-bold text-white backdrop-blur-sm">
                            +{itemCount - 1}
                          </div>
                        )}
                      </div>

                      {/* Details & Progress */}
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-bold text-slate-800 dark:text-white">
                          {firstItem?.productNameSnapshot || firstItem?.product?.productName || "Sản phẩm"}
                        </h3>
                        {firstItem?.variantLabel && (
                          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">Phân loại: {firstItem.variantLabel}</p>
                        )}
                        
                        <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3">
                          <div className="rounded-xl border border-white/40 dark:border-slate-700/50 bg-white/40 dark:bg-slate-800/40 px-4 py-2 backdrop-blur-sm">
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Tổng tiền</p>
                            <p className="mt-1 text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">{asMoneyVnd(displayTotal)}</p>
                          </div>
                          <div className="rounded-xl border border-white/40 dark:border-slate-700/50 bg-white/40 dark:bg-slate-800/40 px-4 py-2 backdrop-blur-sm">
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Mã vận đơn</p>
                            <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-300">{o.mvd?.trim() || "Chưa có"}</p>
                          </div>
                        </div>

                        <div className="mt-6">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                            <span>Tiến độ xử lý</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/50 dark:bg-slate-800/50 shadow-inner">
                            <div
                              className="h-full rounded-full transition-all duration-1000 ease-out"
                              style={{
                                width: `${progress}%`,
                                background: progress === 100 ? "linear-gradient(90deg, #10b981, #34d399)" : "linear-gradient(90deg, #6366f1, #8b5cf6)"
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-white/40 dark:border-slate-800/50 pt-6">
                      <Link
                        href={`/my-orders/${o.id}`}
                        className="flex items-center gap-2 rounded-[1rem] border border-indigo-200/50 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-500/10 px-5 py-2.5 text-sm font-bold text-indigo-700 dark:text-indigo-400 transition-all hover:bg-indigo-100 dark:hover:bg-indigo-500/20 hover:scale-105"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>visibility</span>
                        Xem chi tiết
                      </Link>

                      {allowedNextOrderStatuses(o.status).includes("CANCELLED") && (
                        <form action={cancelOrderAction}>
                          <input type="hidden" name="orderId" value={String(o.id ?? "")} />
                          <button
                            type="submit"
                            className="flex items-center gap-2 rounded-xl bg-rose-50 px-5 py-2.5 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-100"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>cancel</span>
                            Hủy đơn
                          </button>
                        </form>
                      )}

                      {String(o.status ?? "").toUpperCase() === "DELIVERED" && (
                        <form action={reorderAction}>
                          <input type="hidden" name="orderId" value={String(o.id ?? "")} />
                          <button
                            type="submit"
                            className="flex items-center gap-2 rounded-[1rem] bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-500/30 transition-all hover:scale-105 hover:shadow-purple-500/50"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>shopping_cart_checkout</span>
                            Mua lại
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}

            {filtered.length === 0 && (
              <div className="anim-fade-up flex flex-col items-center justify-center rounded-[2rem] border border-white/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 py-20 text-center backdrop-blur-xl shadow-xl shadow-indigo-900/10">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100/50 dark:bg-slate-800/50 text-slate-400 shadow-inner">
                  <span className="material-symbols-outlined" style={{ fontSize: "40px" }}>search_off</span>
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-800 dark:text-white">Không tìm thấy đơn hàng</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                  Chưa có đơn hàng nào khớp với điều kiện tìm kiếm của bạn. Hãy thử thay đổi bộ lọc hoặc từ khóa.
                </p>
                <Link
                  href="/my-orders"
                  className="mt-6 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-105"
                >
                  Xóa bộ lọc
                </Link>
              </div>
            )}
          </section>
        </main>
      </div>
    </StorefrontLayout>
  );
}

