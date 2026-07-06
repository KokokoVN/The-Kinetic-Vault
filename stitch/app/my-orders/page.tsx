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
        @keyframes floatingBlob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .anim-blob { animation: floatingBlob 20s infinite alternate; }
        .anim-blob-2 { animation: floatingBlob 25s infinite alternate-reverse; }
        .anim-blob-3 { animation: floatingBlob 30s infinite alternate; }
        
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-fade-up { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
        
        .order-card {
          transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .order-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 30px 60px rgba(99, 102, 241, 0.2), 0 0 0 1px rgba(99, 102, 241, 0.3) inset;
        }
        .order-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 2px;
          background: linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1), rgba(99,102,241,0.2));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.5s ease;
          pointer-events: none;
        }
        .order-card:hover::before { opacity: 1; }
        
        .glass-panel {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.6);
        }
        .dark .glass-panel {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      ` }} />
      <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Animated Background Orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="anim-blob absolute -left-[10%] -top-[10%] h-[50vw] w-[50vw] rounded-full bg-indigo-300/30 mix-blend-multiply blur-3xl filter dark:bg-indigo-900/30 dark:mix-blend-lighten" />
          <div className="anim-blob-2 absolute -right-[10%] top-[20%] h-[40vw] w-[40vw] rounded-full bg-purple-300/30 mix-blend-multiply blur-3xl filter dark:bg-purple-900/30 dark:mix-blend-lighten" />
          <div className="anim-blob-3 absolute -bottom-[10%] left-[20%] h-[45vw] w-[45vw] rounded-full bg-pink-300/30 mix-blend-multiply blur-3xl filter dark:bg-pink-900/30 dark:mix-blend-lighten" />
        </div>

        <main className="relative z-10 mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="anim-fade-up text-center mb-12" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex items-center justify-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 shadow-sm backdrop-blur-md dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400 mb-4">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              Quản lý tài khoản
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white" style={{ textShadow: "0 10px 30px rgba(99,102,241,0.2)" }}>
              Lịch sử Đơn hàng
            </h1>
            <p className="mt-4 text-lg font-medium text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Theo dõi và quản lý các đơn hàng của bạn một cách dễ dàng và trực quan.
            </p>
          </div>

          {/* Notifications */}
          <div className="anim-fade-up mb-8 space-y-3 max-w-3xl mx-auto" style={{ animationDelay: '0.2s' }}>
            {notice === "cancelled" && (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-5 py-4 text-emerald-800 shadow-lg shadow-emerald-500/10 backdrop-blur-xl">
                <span className="material-symbols-outlined">check_circle</span>
                <p className="text-sm font-semibold">Đã hủy đơn hàng thành công.</p>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 px-5 py-4 text-rose-800 shadow-lg shadow-rose-500/10 backdrop-blur-xl">
                <span className="material-symbols-outlined">error</span>
                <p className="text-sm font-semibold">{decodeURIComponent(error)}</p>
              </div>
            )}
          </div>

          {/* Floating Command Center Filter */}
          <section className="anim-fade-up mb-12 max-w-4xl mx-auto" style={{ animationDelay: '0.3s' }}>
            <SoftNavigateForm actionPath="/my-orders" className="glass-panel rounded-full p-2 shadow-[0_8px_32px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_8px_32px_rgba(99,102,241,0.15)] flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Tìm mã đơn, tên sản phẩm..."
                  className="w-full bg-transparent py-4 pl-14 pr-4 text-sm font-medium text-slate-700 dark:text-white outline-none placeholder:text-slate-400 focus:ring-0"
                />
              </div>
              <div className="hidden md:block w-[1px] bg-slate-200 dark:bg-slate-700 my-2"></div>
              <div className="relative flex-1 md:max-w-[200px]">
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">tune</span>
                <select
                  name="status"
                  defaultValue={status}
                  className="w-full h-full bg-transparent py-4 pl-14 pr-10 text-sm font-medium text-slate-700 dark:text-white outline-none appearance-none cursor-pointer"
                >
                  <option value="" className="text-slate-900">Tất cả</option>
                  {STOREFRONT_ORDER_FILTER_STATUS_VALUES.map((code) => (
                    <option key={code} value={code} className="text-slate-900">
                      {viOrderStatusLabel(code)}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
              </div>
              <button type="submit" className="flex items-center justify-center gap-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3.5 text-sm font-bold shadow-lg transition-transform hover:scale-105">
                Tìm kiếm
              </button>
            </SoftNavigateForm>
          </section>

          {/* Orders Grid */}
          <section className="grid gap-8 lg:grid-cols-2">
            {filtered.map((o: UserOrder, index: number) => {
              const itemsList = Array.isArray(o.items) ? o.items : [];
              const itemCount = itemsList.reduce((sum, it) => sum + Number(it.quantity ?? 0), 0);
              const displayTotal = Number(o.total ?? 0);
              const progress = storefrontOrderProgressPercent(o.status, o.paymentStatus, o.paymentMethod);
              const animDelay = `${0.4 + (index * 0.1)}s`;

              return (
                <article
                  key={String(o.id ?? o.orderNumber)}
                  className="order-card anim-fade-up relative flex flex-col overflow-hidden rounded-[2.5rem] glass-panel shadow-xl"
                  style={{ animationDelay: animDelay }}
                >
                  {/* Decorative Glow */}
                  <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl mix-blend-screen pointer-events-none"></div>

                  <div className="relative z-10 flex flex-1 flex-col p-6 sm:p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
                          <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>local_mall</span>
                        </div>
                        <div>
                          <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{o.orderNumber ?? `#${o.id}`}</p>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{asDateVi(o.orderedDate)}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] shadow-sm backdrop-blur-md ${storefrontOrderBadgeTone(o.status, o.paymentStatus, o.paymentMethod)}`}>
                        {viUnifiedOrderProgressLabel(o.status, o.paymentStatus, o.paymentMethod)}
                      </span>
                    </div>

                    {/* Image Stack & Details */}
                    <div className="flex flex-col sm:flex-row gap-6 mb-6">
                      <div className="flex -space-x-4 overflow-hidden py-1">
                        {itemsList.slice(0, 3).map((it, idx) => {
                          const imgUrl = resolveImageUrl(it.productImageSnapshot ?? it.product?.primaryImageUrl ?? null);
                          return (
                            <div key={idx} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white dark:border-slate-800 bg-slate-100 shadow-md">
                              {imgUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={imgUrl} alt="Product" className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-400"><span className="material-symbols-outlined text-sm">image</span></div>
                              )}
                            </div>
                          );
                        })}
                        {itemsList.length > 3 && (
                          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white dark:border-slate-800 bg-slate-900 text-white shadow-md z-10 font-bold text-sm">
                            +{itemsList.length - 3}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-baseline gap-2">
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Tổng tiền</p>
                          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700/50"></div>
                        </div>
                        <p className="mt-1 text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{asMoneyVnd(displayTotal)}</p>
                        <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                          {itemCount} sản phẩm
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-auto pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex items-center justify-between text-xs font-bold mb-2">
                        <span className="text-slate-500 uppercase tracking-widest">Tiến độ</span>
                        <span className="text-indigo-600 dark:text-indigo-400">{progress}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${progress}%`,
                            background: progress === 100 ? "linear-gradient(90deg, #10b981, #34d399)" : "linear-gradient(90deg, #6366f1, #a855f7)",
                            boxShadow: "0 0 10px rgba(99,102,241,0.5)"
                          }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        href={`/my-orders/${o.id}`}
                        className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 text-sm font-bold shadow-lg transition-transform hover:scale-[1.02]"
                      >
                        Chi tiết đơn
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </Link>
                      
                      {allowedNextOrderStatuses(o.status).includes("CANCELLED") && (
                        <form action={cancelOrderAction} className="flex-none">
                          <input type="hidden" name="orderId" value={String(o.id ?? "")} />
                          <button
                            type="submit"
                            className="flex h-full items-center justify-center gap-2 rounded-2xl bg-rose-100 text-rose-700 px-4 py-3 text-sm font-bold shadow-sm transition-colors hover:bg-rose-200"
                            title="Hủy đơn"
                          >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        </form>
                      )}

                      {String(o.status ?? "").toUpperCase() === "DELIVERED" && (
                        <form action={reorderAction} className="flex-none">
                          <input type="hidden" name="orderId" value={String(o.id ?? "")} />
                          <button
                            type="submit"
                            className="flex h-full items-center justify-center gap-2 rounded-2xl bg-emerald-100 text-emerald-700 px-4 py-3 text-sm font-bold shadow-sm transition-colors hover:bg-emerald-200"
                            title="Mua lại"
                          >
                            <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                          </button>
                        </form>
                      )}
                    </div>

                  </div>
                </article>
              );
            })}
          </section>

          {filtered.length === 0 && (
            <div className="anim-fade-up flex flex-col items-center justify-center rounded-[3rem] glass-panel py-32 text-center shadow-2xl mt-8">
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 shadow-inner">
                <span className="material-symbols-outlined text-[64px] text-slate-300 dark:text-slate-600">search_off</span>
                <div className="absolute -inset-4 rounded-full border border-slate-200/50 dark:border-slate-700/50 border-dashed animate-[spin_10s_linear_infinite]"></div>
              </div>
              <h3 className="mt-8 text-2xl font-black text-slate-900 dark:text-white">Không tìm thấy đơn hàng</h3>
              <p className="mt-3 text-base text-slate-500 max-w-sm">
                Chúng tôi không tìm thấy đơn hàng nào khớp với tìm kiếm của bạn.
              </p>
              <Link
                href="/my-orders"
                className="mt-8 rounded-full bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 transition-transform hover:scale-105"
              >
                Xóa bộ lọc
              </Link>
            </div>
          )}
        </main>
      </div>
    </StorefrontLayout>
  );
}
