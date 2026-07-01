import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createManualOrder, getMyOrderById, getProductForUi, listMyOrders, updateAdminOrderStatus, getAdminUserProfile } from "@/lib/api";
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
  const userProfile = await getAdminUserProfile(userId, { accessToken }).catch(() => null);
  
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
  
  // Lấy giá trị thanh toán thực tế dựa trên sản phẩm (vd: sản phẩm khuyến mãi 1k)
  const displayTotal = items.length > 0 
    ? items.reduce((sum, it) => sum + Number(it.subTotal ?? 0), 0) 
    : Number(order.total ?? 0);
    
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
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        
        .timeline-line {
          position: absolute;
          left: 17px; /* 36px / 2 - 1px */
          top: 36px;
          bottom: -8px;
          width: 2px;
          background: #e2e8f0;
          z-index: 0;
        }
        .timeline-line.active {
          background: linear-gradient(to bottom, #6366f1, #8b5cf6);
        }
        .timeline-step:last-child .timeline-line {
          display: none;
        }
      ` }} />

      <div className="bg-gradient-to-br from-slate-50 via-indigo-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 min-h-[calc(100vh-80px)]">
        <main className="mx-auto max-w-[1440px] space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          
          {/* Breadcrumb & Navigation */}
          <div className="anim-fade-up">
            <Link
              href="/my-orders"
              className="inline-flex items-center gap-2 rounded-xl bg-white/60 px-4 py-2 text-sm font-bold text-slate-600 shadow-sm backdrop-blur-md transition-colors hover:bg-white/80"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_back</span>
              Quay lại danh sách
            </Link>
          </div>

          {/* Notifications */}
          <div className="anim-fade-up stagger-1 space-y-3">
            {notice === "cancelled" && (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-5 py-4 text-emerald-800 shadow-sm backdrop-blur-md">
                <span className="material-symbols-outlined">check_circle</span>
                <p className="text-sm font-semibold">Đơn hàng đã được hủy thành công.</p>
              </div>
            )}
            {notice === "reordered" && (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-5 py-4 text-emerald-800 shadow-sm backdrop-blur-md">
                <span className="material-symbols-outlined">check_circle</span>
                <p className="text-sm font-semibold">Đặt lại đơn hàng thành công.</p>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 px-5 py-4 text-rose-800 shadow-sm backdrop-blur-md">
                <span className="material-symbols-outlined">error</span>
                <p className="text-sm font-semibold">{decodeURIComponent(error)}</p>
              </div>
            )}
          </div>

          {/* Header Card (Order Summary) */}
          <section
            className="anim-scale-in stagger-1 overflow-hidden rounded-[2rem] border border-white/60 dark:border-slate-700/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl saturate-150"
          >
            <div className="flex flex-col justify-between gap-6 p-6 sm:flex-row sm:items-start sm:p-8">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 shadow-inner">
                    <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>local_mall</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">
                      {order.orderNumber ?? `#${order.id}`}
                    </h1>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>calendar_today</span>
                      Ngày đặt: {asDateVi(order.orderedDate)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-white/50 p-4 text-left shadow-sm backdrop-blur-sm sm:text-right">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tổng thanh toán</p>
                <p className="mt-1 text-3xl font-black text-indigo-600">{asMoneyVnd(displayTotal)}</p>
              </div>
            </div>

            {/* Status Grid */}
            <div className="grid border-t border-slate-100/50 bg-slate-50/50 sm:grid-cols-2">
              <div className="border-b border-slate-100/50 p-6 sm:border-b-0 sm:border-r">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Trạng thái đơn hàng</p>
                <div className="mt-3">
                  <span className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-black uppercase tracking-[0.1em] shadow-sm ${storefrontOrderBadgeTone(order.status, order.paymentStatus, order.paymentMethod)}`}>
                    {viUnifiedOrderProgressLabel(order.status, order.paymentStatus, order.paymentMethod)}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Trạng thái thanh toán</p>
                <div className="mt-3">
                  <span className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-black uppercase tracking-[0.1em] shadow-sm ${paymentStatusTone(order.paymentStatus)}`}>
                    {viPaymentStatusLabel(order.paymentStatus)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Toolbar */}
            {(canCancel || canReorder || order.status !== "CANCELLED") && (
              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100/50 bg-white/40 p-4 sm:px-8">
                {canCancel && (
                  <form action={cancelOrderAction}>
                    <button type="submit" className="flex items-center gap-2 rounded-xl bg-rose-50 px-5 py-2.5 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-100">
                      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>cancel</span>
                      Hủy đơn hàng
                    </button>
                  </form>
                )}
                {canReorder && (
                  <form action={reorderAction}>
                    <button type="submit" className="flex items-center gap-2 rounded-xl bg-indigo-50 px-5 py-2.5 text-sm font-bold text-indigo-600 transition-colors hover:bg-indigo-100">
                      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>shopping_cart_checkout</span>
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
            )}
          </section>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-12">
            
            {/* Left Column (Items) */}
            <section className="anim-fade-up stagger-2 space-y-6 lg:col-span-8">
              
              {/* Timeline Card */}
              <div className="rounded-[2rem] border border-white/60 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-8">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                  <span className="material-symbols-outlined text-indigo-500">local_shipping</span>
                  Hành trình giao hàng
                </h2>
                <div className="mt-6">
                  {timeline.kind === "cancelled" && (
                    <div className="flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-rose-800">
                      <span className="material-symbols-outlined">block</span>
                      <p className="text-sm font-semibold">Đơn hàng đã hủy. Không còn quy trình giao hàng.</p>
                    </div>
                  )}
                  {timeline.kind === "return-flow" && (
                    <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4 text-amber-800">
                      <span className="material-symbols-outlined">assignment_return</span>
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
                          <div key={s.step} className="timeline-step relative mb-8 flex items-start gap-4 last:mb-0">
                            <div className={`timeline-line ${done ? 'active' : ''}`} />
                            <div className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${done ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : active ? 'bg-indigo-100 text-indigo-600 ring-4 ring-indigo-50' : 'bg-slate-100 text-slate-400'}`}>
                              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>{icon}</span>
                            </div>
                            <div className="pt-1.5">
                              <h3 className={`text-sm font-bold ${active || done ? 'text-slate-800' : 'text-slate-500'}`}>{s.label}</h3>
                              <p className="mt-1 max-w-md text-xs font-medium text-slate-500">{s.hint}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Items Card */}
              <div className="rounded-[2rem] border border-white/60 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50/50 p-6 sm:p-8 sm:pb-6">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                    <span className="material-symbols-outlined text-indigo-500">shopping_bag</span>
                    Sản phẩm đã mua ({items.length})
                  </h2>
                </div>
                <div className="divide-y divide-slate-100 p-6 sm:p-8 sm:pt-4">
                  {items.map((it, idx) => (
                    <div key={`${it.id ?? idx}`} className="flex flex-col gap-4 py-6 first:pt-2 last:pb-2 sm:flex-row sm:items-center">
                      {/* Product Image */}
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-inner sm:h-24 sm:w-24">
                        {resolveImageUrl(it.productImageSnapshot ?? it.product?.primaryImageUrl ?? null) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={resolveImageUrl(it.productImageSnapshot ?? it.product?.primaryImageUrl ?? null) as string}
                            alt={it.productNameSnapshot || it.product?.productName || "Ảnh sản phẩm"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined mb-1">image_not_supported</span>
                            <span className="text-[10px] font-medium">Trống</span>
                          </div>
                        )}
                      </div>

                      {/* Info & Price */}
                      <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 pr-4">
                          <p className="truncate text-base font-bold text-slate-800">
                            {it.productNameSnapshot || it.product?.productName || "—"}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
                            <p>SKU: {it.productSkuSnapshot || it.product?.sku || "—"}</p>
                            <p>Phân loại: {it.variantLabel?.trim() || "Mặc định"}</p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between sm:mt-0 sm:flex-col sm:items-end">
                          <p className="text-xs font-semibold text-slate-400">SL: {Number(it.quantity ?? 0).toLocaleString("vi-VN")}</p>
                          <p className="mt-0.5 text-lg font-black text-indigo-600">{asMoneyVnd(it.subTotal)}</p>
                          {String(order.status ?? "").toUpperCase() === "DELIVERED" && !userReviews.some((r) => r.orderId === orderId && r.productId === Number(it.product?.id ?? it.productId ?? 0)) && (
                            <div className="mt-2">
                              <WriteReviewButton
                                orderId={orderId}
                                productId={Number(it.product?.id ?? it.productId ?? 0)}
                                variantId={Number(it.variantId ?? 0)}
                                productName={it.productNameSnapshot || it.product?.productName || ""}
                                accessToken={accessToken}
                                userId={String(userId)}
                              />
                            </div>
                          )}
                          {String(order.status ?? "").toUpperCase() === "DELIVERED" && userReviews.some((r) => r.orderId === orderId && r.productId === Number(it.product?.id ?? it.productId ?? 0)) && (
                            <div className="mt-2 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 shadow-inner">
                              Đã đánh giá
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>inbox</span>
                      </div>
                      <p className="mt-4 text-sm font-semibold text-slate-600">Đơn hàng không có sản phẩm nào.</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Right Column (Sidebar) */}
            <aside className="anim-fade-up stagger-3 space-y-6 lg:col-span-4">
              
              {/* Shipping Info */}
              <div className="rounded-[2rem] border border-white/60 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-8">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                  <span className="material-symbols-outlined text-indigo-500">location_on</span>
                  Địa chỉ giao hàng
                </h2>
                <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                  <p className="text-sm font-semibold leading-relaxed text-slate-700">
                    {order.shippingAddress?.trim() || "Chưa cập nhật địa chỉ giao hàng"}
                  </p>
                  {userProfile?.phoneNumber && (
                    <div className="mt-3 flex items-center gap-2 border-t border-slate-200/60 pt-3 text-sm font-semibold text-slate-600">
                      <span className="material-symbols-outlined text-indigo-500" style={{ fontSize: "18px" }}>call</span>
                      <span>{userProfile.phoneNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Metadata */}
              <div className="rounded-[2rem] border border-white/60 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-8">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                  <span className="material-symbols-outlined text-indigo-500">info</span>
                  Thông tin bổ sung
                </h2>
                <div className="mt-5 space-y-4">
                  <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>payments</span>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Thanh toán</p>
                      <p className="mt-0.5 text-sm font-bold text-slate-700">{viPaymentMethodLabel(order.paymentMethod)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>barcode</span>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Mã vận đơn</p>
                      <p className="mt-0.5 text-sm font-bold text-slate-700">{order.mvd?.trim() || "Chưa có"}</p>
                    </div>
                  </div>
                </div>
              </div>

            </aside>
          </div>

          {/* Related Products */}
          {firstProductId != null && (
            <div className="anim-fade-up mt-12 stagger-4">
              <SimilarProductsSection productId={Number(firstProductId)} limit={4} />
            </div>
          )}
        </main>
      </div>
    </StorefrontLayout>
  );
}
