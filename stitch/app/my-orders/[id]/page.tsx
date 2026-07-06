import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createManualOrder, getMyOrderById, getProductForUi, listMyOrders, updateAdminOrderStatus } from "@/lib/api";
import { getUserReviews } from "@/lib/review-api";
import { getUserIdFromAccessToken, getUsernameFromAccessToken, isAccessTokenExpired } from "@/lib/auth";
import {
  allowedNextOrderStatuses,
  paymentStatusTone,
  STOREFRONT_ORDER_STEP_LABELS,
  storefrontOrderBadgeTone,
  storefrontOrderTimeline,
  viPaymentMethodLabel,
  viPaymentStatusLabel,
  viUnifiedOrderProgressLabel,
} from "@/lib/order-status";
import { StorefrontLayout } from "@/components/storefront-layout";
import { OrderRepaySepay } from "@/components/order-repay-sepay";
import { WriteReviewButton } from "@/components/write-review-button";
import { SimilarProductsSection } from "@/components/similar-products-section";

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

async function enrichItemsForDisplay(items: Array<Record<string, unknown>>) {
  return Promise.all(
    items.map(async (raw) => {
      const item = raw as {
        id?: number | null;
        item_id?: number | null;
        productId?: number | null;
        product_id?: number | null;
        quantity?: number | null;
        item_quantity?: number | null;
        subTotal?: number | string | null;
        sub_total?: number | string | null;
        productImageSnapshot?: string | null;
        product_image_snapshot?: string | null;
        product?: { id?: number | null; productName?: string | null; sku?: string | null; primaryImageUrl?: string | null } | null;
        productNameSnapshot?: string | null;
        product_name_snapshot?: string | null;
        productSkuSnapshot?: string | null;
        product_sku_snapshot?: string | null;
        variantId?: number | null;
        variantLabel?: string | null;
      };
      const normalizedItem = {
        ...item,
        id: item.id ?? item.item_id ?? null,
        productId: item.productId ?? item.product_id ?? null,
        quantity: item.quantity ?? item.item_quantity ?? null,
        subTotal: item.subTotal ?? item.sub_total ?? null,
        productNameSnapshot: item.productNameSnapshot ?? item.product_name_snapshot ?? null,
        productSkuSnapshot: item.productSkuSnapshot ?? item.product_sku_snapshot ?? null,
        productImageSnapshot: item.productImageSnapshot ?? item.product_image_snapshot ?? null,
      };
      const productId = Number(normalizedItem.product?.id ?? normalizedItem.productId ?? 0);
      const hasName = Boolean(String(normalizedItem.productNameSnapshot ?? normalizedItem.product?.productName ?? "").trim());
      const hasImage = Boolean(
        String(normalizedItem.productImageSnapshot ?? normalizedItem.product?.primaryImageUrl ?? "").trim(),
      );
      if ((!hasName || !hasImage) && Number.isFinite(productId) && productId > 0) {
        const product = await getProductForUi(String(productId));
        if (product) {
          return {
            ...normalizedItem,
            productNameSnapshot: normalizedItem.productNameSnapshot || product.name,
            productSkuSnapshot: normalizedItem.productSkuSnapshot || product.sku,
            product: {
              ...(normalizedItem.product ?? {}),
              id: Number(product.id),
              productName: normalizedItem.product?.productName || product.name,
              sku: normalizedItem.product?.sku || product.sku,
              primaryImageUrl:
                normalizedItem.productImageSnapshot || normalizedItem.product?.primaryImageUrl || product.heroImage,
            },
          };
        }
      }
      return normalizedItem;
    }),
  );
}

export default async function UserOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ notice?: string; error?: string }>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const notice = String(sp.notice ?? "").trim();
  const error = String(sp.error ?? "").trim();
  const orderId = Number(id);
  if (!Number.isFinite(orderId) || orderId <= 0) redirect("/my-orders");

  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value?.trim() ?? "";
  const isLoggedIn = Boolean(accessToken) && !isAccessTokenExpired(accessToken);
  if (!isLoggedIn) redirect(`/login?next=/my-orders/${orderId}`);
  const username = getUsernameFromAccessToken(accessToken);
  const userIdRaw = getUserIdFromAccessToken(accessToken);
  const userId = Number(userIdRaw);
  if (!Number.isFinite(userId) || userId <= 0) redirect("/login?error=expired");

  const order = await getMyOrderById(orderId, { accessToken, userId });
  const userReviews = await getUserReviews(accessToken, String(userId)).catch(() => []);
  
  if (!order) {
    return (
      <StorefrontLayout isLoggedIn={isLoggedIn} username={username} activeMenu="orders">
        <main className="px-6 py-8">
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Không tìm thấy đơn hàng hoặc bạn không có quyền xem đơn này.</p>
          <Link href="/my-orders" className="mt-4 inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-bold text-indigo-600 dark:text-indigo-400">
            Quay lại lịch sử đơn hàng
          </Link>
        </main>
      </StorefrontLayout>
    );
  }

  const itemsRaw = Array.isArray(order.items) ? order.items : [];
  const items = await enrichItemsForDisplay(itemsRaw as Array<Record<string, unknown>>);
  
  // Lấy tổng tiền thực tế của đơn hàng từ CSDL (đã bao gồm phí ship, mã giảm giá, v.v.)
  const displayTotal = Number(order.total ?? 0);
    
  const firstProductId = items.length > 0 ? (items[0].productId ?? items[0].product?.id) : null;

  const canCancel = allowedNextOrderStatuses(order.status).includes("CANCELLED");
  const canReorder = String(order.status ?? "").toUpperCase() === "DELIVERED" && items.length > 0;
  const timeline = storefrontOrderTimeline(order.status);

  async function cancelOrderAction() {
    "use server";
    const jar = await cookies();
    const token = jar.get("accessToken")?.value?.trim() ?? "";
    const uid = Number(getUserIdFromAccessToken(token));
    if (!token || isAccessTokenExpired(token) || !Number.isFinite(uid) || uid <= 0) redirect(`/login?next=/my-orders/${orderId}`);
    const myOrders = await listMyOrders({ accessToken: token, userId: uid });
    const latest = myOrders.find((o) => Number(o.id) === orderId);
    if (!latest) redirect(`/my-orders/${orderId}?error=Không%20tìm%20thấy%20đơn`);
    if (!allowedNextOrderStatuses(latest.status).includes("CANCELLED")) {
      redirect(`/my-orders/${orderId}?error=Đơn%20hàng%20không%20thể%20hủy`);
    }
    try {
      await updateAdminOrderStatus(
        orderId,
        { status: "CANCELLED", shippingAddress: latest.shippingAddress ?? undefined },
        { accessToken: token, username: getUsernameFromAccessToken(token), userId: String(uid) },
      );
    } catch {
      redirect(`/my-orders/${orderId}?error=Hủy%20đơn%20thất%20bại`);
    }
    revalidatePath("/my-orders");
    revalidatePath(`/my-orders/${orderId}`);
    redirect(`/my-orders/${orderId}?notice=cancelled`);
  }

  async function reorderAction() {
    "use server";
    const jar = await cookies();
    const token = jar.get("accessToken")?.value?.trim() ?? "";
    const uid = Number(getUserIdFromAccessToken(token));
    if (!token || isAccessTokenExpired(token) || !Number.isFinite(uid) || uid <= 0) redirect(`/login?next=/my-orders/${orderId}`);
    const myOrders = await listMyOrders({ accessToken: token, userId: uid });
    const latest = myOrders.find((o) => Number(o.id) === orderId);
    const latestItems = Array.isArray(latest?.items) ? latest.items : [];
    if (!latest || String(latest.status ?? "").toUpperCase() !== "DELIVERED" || latestItems.length === 0) {
      redirect(`/my-orders/${orderId}?error=Chỉ%20đặt%20lại%20được%20đơn%20đã%20giao`);
    }
    try {
      const created = await createManualOrder(
        {
          userId: uid,
          shippingAddress: latest.shippingAddress ?? null,
          paymentMethod: latest.paymentMethod ?? null,
          items: latestItems
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
      redirect(`/my-orders/${orderId}?error=Đặt%20lại%20đơn%20thất%20bại`);
    }
  }

  return (
    <StorefrontLayout isLoggedIn={isLoggedIn} username={username} activeMenu="orders">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes lineGlow {
          0% { box-shadow: 0 0 5px rgba(99,102,241,0.2); }
          50% { box-shadow: 0 0 15px rgba(99,102,241,0.6); }
          100% { box-shadow: 0 0 5px rgba(99,102,241,0.2); }
        }
        .anim-fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .anim-scale-in { animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .anim-float { animation: float 6s ease-in-out infinite; }
        
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        
        .timeline-line {
          position: absolute;
          left: 17px;
          top: 36px;
          bottom: -8px;
          width: 2px;
          background: rgba(226, 232, 240, 0.5);
          z-index: 0;
        }
        .dark .timeline-line {
          background: rgba(51, 65, 85, 0.5);
        }
        .timeline-line.active {
          background: linear-gradient(to bottom, #6366f1, #a855f7);
          animation: lineGlow 2s infinite;
        }
        .timeline-step:last-child .timeline-line {
          display: none;
        }
        
        .glass-panel {
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.6);
        }
        .dark .glass-panel {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      ` }} />

      <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Background glow effects */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-[10%] top-[20%] h-[40vw] w-[40vw] rounded-full bg-indigo-400/20 mix-blend-multiply blur-[100px] filter dark:bg-indigo-900/30 dark:mix-blend-lighten" />
          <div className="absolute -right-[10%] -top-[10%] h-[30vw] w-[30vw] rounded-full bg-fuchsia-400/20 mix-blend-multiply blur-[100px] filter dark:bg-fuchsia-900/30 dark:mix-blend-lighten" />
        </div>

        <main className="relative z-10 mx-auto max-w-[1440px] space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          
          {/* Top Bar Navigation */}
          <div className="anim-fade-up flex items-center justify-between">
            <Link
              href="/my-orders"
              className="group inline-flex items-center gap-2 rounded-full glass-panel px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:bg-white/80 dark:hover:bg-slate-800/80 hover:scale-105"
            >
              <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1" style={{ fontSize: "18px" }}>arrow_back</span>
              Tất cả đơn hàng
            </Link>
          </div>

          {/* Notifications */}
          <div className="anim-fade-up stagger-1 space-y-3">
            {notice === "cancelled" && (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-5 py-4 text-emerald-800 shadow-lg shadow-emerald-500/10 backdrop-blur-xl">
                <span className="material-symbols-outlined">check_circle</span>
                <p className="text-sm font-semibold">Đơn hàng đã được hủy thành công.</p>
              </div>
            )}
            {notice === "reordered" && (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-5 py-4 text-emerald-800 shadow-lg shadow-emerald-500/10 backdrop-blur-xl">
                <span className="material-symbols-outlined">check_circle</span>
                <p className="text-sm font-semibold">Đặt lại đơn hàng thành công.</p>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 px-5 py-4 text-rose-800 shadow-lg shadow-rose-500/10 backdrop-blur-xl">
                <span className="material-symbols-outlined">error</span>
                <p className="text-sm font-semibold">{decodeURIComponent(error)}</p>
              </div>
            )}
          </div>

          {/* Main Layout Grid */}
          <div className="grid gap-8 lg:grid-cols-12 items-start">
            
            {/* LEFT COLUMN: Receipt & Items */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Order Header / Invoice Style */}
              <section className="anim-scale-in stagger-1 relative overflow-hidden rounded-[2.5rem] glass-panel p-8 shadow-xl">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <span className="material-symbols-outlined text-9xl">receipt_long</span>
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/50 bg-indigo-50/50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400 mb-4">
                      Hóa đơn điện tử
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                      {order.orderNumber ?? `#${order.id}`}
                    </h1>
                    <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                      <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                      Ngày đặt: {asDateVi(order.orderedDate)}
                    </p>
                  </div>
                  
                  <div className="md:text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tổng thanh toán</p>
                    <p className="mt-1 text-4xl font-black bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
                      {asMoneyVnd(displayTotal)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 md:justify-end">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] shadow-sm backdrop-blur-md ${storefrontOrderBadgeTone(order.status, order.paymentStatus, order.paymentMethod)}`}>
                        {viUnifiedOrderProgressLabel(order.status, order.paymentStatus, order.paymentMethod)}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] shadow-sm backdrop-blur-md ${paymentStatusTone(order.paymentStatus)}`}>
                        {viPaymentStatusLabel(order.paymentStatus)}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Items List */}
              <section className="anim-fade-up stagger-2 rounded-[2.5rem] glass-panel shadow-xl overflow-hidden">
                <div className="border-b border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 p-6 sm:p-8">
                  <h2 className="flex items-center gap-2 text-xl font-black text-slate-800 dark:text-white">
                    <span className="material-symbols-outlined text-indigo-500">shopping_bag</span>
                    Sản phẩm ({items.length})
                  </h2>
                </div>
                
                <div className="p-4 sm:p-8 space-y-4">
                  {items.map((it, idx) => (
                    <div key={`${it.id ?? idx}`} className="group relative overflow-hidden rounded-[2rem] bg-white/60 dark:bg-slate-800/60 p-4 transition-all hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1 sm:p-6 border border-white/40 dark:border-slate-700/50">
                      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                        {/* Image */}
                        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[1.5rem] bg-slate-100 dark:bg-slate-900 shadow-inner">
                          {resolveImageUrl(it.productImageSnapshot ?? it.product?.primaryImageUrl ?? null) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={resolveImageUrl(it.productImageSnapshot ?? it.product?.primaryImageUrl ?? null) as string}
                              alt={it.productNameSnapshot || it.product?.productName || "Ảnh sản phẩm"}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
                              <span className="material-symbols-outlined mb-1">image_not_supported</span>
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 w-full flex flex-col justify-between self-stretch">
                          <div>
                            <p className="truncate text-lg font-bold text-slate-800 dark:text-white">
                              {it.productNameSnapshot || it.product?.productName || "—"}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {it.variantLabel && it.variantLabel.trim() !== "" && (
                                <span className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                  {it.variantLabel}
                                </span>
                              )}
                              <span className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                SL: {Number(it.quantity ?? 0)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                            <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                              {asMoneyVnd(it.subTotal)}
                            </p>
                            
                            {/* Review Button */}
                            {String(order.status ?? "").toUpperCase() === "DELIVERED" && !userReviews.some((r) => r.orderId === orderId && r.productId === Number(it.product?.id ?? it.productId ?? 0)) && (
                              <WriteReviewButton
                                orderId={orderId}
                                productId={Number(it.product?.id ?? it.productId ?? 0)}
                                variantId={Number(it.variantId ?? 0)}
                                productName={it.productNameSnapshot || it.product?.productName || ""}
                                accessToken={accessToken}
                                userId={String(userId)}
                              />
                            )}
                            {String(order.status ?? "").toUpperCase() === "DELIVERED" && userReviews.some((r) => r.orderId === orderId && r.productId === Number(it.product?.id ?? it.productId ?? 0)) && (
                              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                ✓ Đã đánh giá
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600">inbox</span>
                      <p className="mt-4 text-sm font-semibold text-slate-500">Đơn hàng không có sản phẩm nào.</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Action Toolbar */}
              {(canCancel || canReorder || order.status !== "CANCELLED") && (
                <section className="anim-fade-up stagger-3 sticky bottom-8 z-50">
                  <div className="flex flex-wrap items-center justify-end gap-4 rounded-[2rem] glass-panel p-4 shadow-2xl shadow-indigo-500/20 backdrop-blur-xl">
                    {canCancel && (
                      <form action={cancelOrderAction} className="flex-1 md:flex-none">
                        <button type="submit" className="w-full flex items-center justify-center gap-2 rounded-2xl bg-rose-50 dark:bg-rose-500/10 px-6 py-3.5 text-sm font-bold text-rose-600 dark:text-rose-400 transition-colors hover:bg-rose-100 dark:hover:bg-rose-500/20 shadow-sm">
                          <span className="material-symbols-outlined">cancel</span>
                          Hủy đơn hàng
                        </button>
                      </form>
                    )}
                    {canReorder && (
                      <form action={reorderAction} className="flex-1 md:flex-none">
                        <button type="submit" className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 px-6 py-3.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-500/20 shadow-sm">
                          <span className="material-symbols-outlined">shopping_cart_checkout</span>
                          Mua lại đơn này
                        </button>
                      </form>
                    )}
                    <OrderRepaySepay
                      orderId={Number(order.id ?? 0)}
                      orderNumber={order.orderNumber ?? null}
                      amount={displayTotal}
                      status={order.status ?? null}
                      paymentStatus={order.paymentStatus ?? null}
                      paymentMethod={order.paymentMethod ?? null}
                    />
                  </div>
                </section>
              )}
            </div>

            {/* RIGHT COLUMN: Sidebar (Timeline & Metadata) */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Glowing Timeline */}
              <aside className="anim-fade-up stagger-2 rounded-[2.5rem] glass-panel p-8 shadow-xl">
                <h2 className="flex items-center gap-2 text-xl font-black text-slate-800 dark:text-white mb-8">
                  <span className="material-symbols-outlined text-indigo-500">route</span>
                  Hành trình đơn hàng
                </h2>
                
                <div className="mt-6">
                  {timeline.kind === "cancelled" && (
                    <div className="flex items-center gap-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 p-5 text-rose-800 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50">
                      <span className="material-symbols-outlined text-3xl">block</span>
                      <p className="text-sm font-semibold">Đơn hàng đã hủy. Không còn quy trình giao hàng.</p>
                    </div>
                  )}
                  {timeline.kind === "return-flow" && (
                    <div className="flex items-center gap-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 p-5 text-amber-800 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50">
                      <span className="material-symbols-outlined text-3xl">assignment_return</span>
                      <p className="text-sm font-semibold">
                        {timeline.phase === "returning" ? "Đơn hàng đang trong quy trình hoàn trả. Vui lòng theo dõi cập nhật." : "Quy trình hoàn trả đã hoàn tất."}
                      </p>
                    </div>
                  )}
                  {timeline.kind === "steps" && (
                    <div className="relative pl-2">
                      {STOREFRONT_ORDER_STEP_LABELS.map((s, i) => {
                        const done = timeline.activeStep > s.step;
                        const active = timeline.activeStep === s.step;
                        
                        let icon = "radio_button_unchecked";
                        if (done) icon = "check_circle";
                        else if (active) icon = "radio_button_checked";

                        return (
                          <div key={s.step} className="timeline-step relative mb-10 flex items-start gap-5 last:mb-0">
                            <div className={`timeline-line ${done ? 'active' : ''}`} />
                            <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-500 ${done ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : active ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 ring-4 ring-indigo-50 dark:ring-indigo-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>{icon}</span>
                            </div>
                            <div className="pt-2 flex-1">
                              <h3 className={`text-base font-bold ${active || done ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{s.label}</h3>
                              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-500">{s.hint}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </aside>

              {/* Shipping Address */}
              <aside className="anim-fade-up stagger-3 rounded-[2.5rem] glass-panel p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <span className="material-symbols-outlined text-8xl">local_shipping</span>
                </div>
                <h2 className="flex items-center gap-2 text-xl font-black text-slate-800 dark:text-white mb-6 relative z-10">
                  <span className="material-symbols-outlined text-indigo-500">location_on</span>
                  Giao hàng đến
                </h2>
                <div className="rounded-[1.5rem] bg-white/50 dark:bg-slate-800/50 p-6 border border-white/40 dark:border-slate-700/50 shadow-inner relative z-10">
                  <p className="text-sm font-semibold leading-relaxed text-slate-700 dark:text-slate-300">
                    {order.shippingAddress?.trim() || "Chưa cập nhật địa chỉ giao hàng"}
                  </p>
                </div>
              </aside>

              {/* Order Metadata */}
              <aside className="anim-fade-up stagger-3 rounded-[2.5rem] glass-panel p-8 shadow-xl">
                <h2 className="flex items-center gap-2 text-xl font-black text-slate-800 dark:text-white mb-6">
                  <span className="material-symbols-outlined text-indigo-500">info</span>
                  Thông tin bổ sung
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-5 rounded-[1.5rem] bg-white/50 dark:bg-slate-800/50 p-5 border border-white/40 dark:border-slate-700/50 shadow-inner transition-colors hover:bg-white/80 dark:hover:bg-slate-800/80">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 shadow-sm">
                      <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>payments</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Phương thức thanh toán</p>
                      <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">{viPaymentMethodLabel(order.paymentMethod)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-5 rounded-[1.5rem] bg-white/50 dark:bg-slate-800/50 p-5 border border-white/40 dark:border-slate-700/50 shadow-inner transition-colors hover:bg-white/80 dark:hover:bg-slate-800/80">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 shadow-sm">
                      <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>barcode</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Mã vận đơn</p>
                      <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">{order.mvd?.trim() || "Chưa có"}</p>
                    </div>
                  </div>
                </div>
              </aside>

            </div>
          </div>

          {/* Related Products Section */}
          {firstProductId != null && (
            <div className="anim-fade-up mt-16 stagger-3">
              <SimilarProductsSection productId={Number(firstProductId)} limit={4} />
            </div>
          )}
        </main>
      </div>
    </StorefrontLayout>
  );
}
