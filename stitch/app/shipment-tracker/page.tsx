import Link from "next/link";
import { cookies } from "next/headers";
import { checkOrderByMvd } from "@/lib/api";
import { PhoneLast4Inputs } from "@/components/phone-last4-inputs";
import { viOrderStatusLabel, viPaymentStatusLabel } from "@/lib/order-status";
import { getUsernameFromAccessToken, isAccessTokenExpired } from "@/lib/auth";
import { StorefrontLayout } from "@/components/storefront-layout";
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

function asEtaDate(raw?: string | number[] | null): string {
  // Backend trả LocalDate (ISO hoặc mảng [y,m,d]).
  return asOrderDate(raw);
}

function etaFromStatus(status?: string | null): string {
  const s = String(status ?? "").toUpperCase();
  if (s === "DELIVERED") return "Đã giao thành công";
  if (s === "RETURNED") return "Đã hoàn hàng";
  if (s === "RETURNING") return "Đang hoàn hàng";
  if (s === "REFUSED") return "Khách từ chối nhận";
  if (s === "DELIVERY_FAILED") return "Giao thất bại";
  if (s === "RESCHEDULED") return "Hẹn lại ngày giao";
  if (s === "OUT_FOR_DELIVERY") return "Đang đi giao";
  if (s === "SHIPPED") return "Đang giao";
  if (s === "READY_TO_SHIP") return "Sẵn sàng bàn giao vận chuyển";
  if (s === "PACKING") return "Đang đóng gói";
  if (s === "PROCESSING") return "Đang xử lý";
  if (s === "CONFIRMED") return "Đã xác nhận";
  if (s === "CREATED") return "Mới tạo";
  return "Đang chờ xử lý";
}

export default async function ShipmentTrackerPage({
  searchParams,
}: {
  searchParams?: Promise<{ mvd?: string; phoneLast4?: string; d1?: string; d2?: string; d3?: string; d4?: string; verify?: string }>;
}) {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value;
  const isLoggedIn = Boolean(accessToken) && !isAccessTokenExpired(accessToken);
  const username = isLoggedIn ? getUsernameFromAccessToken(accessToken) : null;

  const sp = (await searchParams) ?? {};
  const mvd = String(sp.mvd ?? "").trim().toUpperCase();
  const d1 = String(sp.d1 ?? "").replace(/\D/g, "").slice(0, 1);
  const d2 = String(sp.d2 ?? "").replace(/\D/g, "").slice(0, 1);
  const d3 = String(sp.d3 ?? "").replace(/\D/g, "").slice(0, 1);
  const d4 = String(sp.d4 ?? "").replace(/\D/g, "").slice(0, 1);
  const phoneLast4 = (d1 + d2 + d3 + d4) || String(sp.phoneLast4 ?? "").replace(/\D/g, "").slice(-4);
  const canSearch = mvd.length > 0 && phoneLast4.length === 4;
  const order = canSearch ? await checkOrderByMvd(mvd, phoneLast4) : null;
  const verifyStep = String(sp.verify ?? "") === "1" && mvd.length > 0 && phoneLast4.length !== 4;
  const status = String(order?.status ?? "").toUpperCase();
  const failedLookup = canSearch && !order;

  if (order) {
    const orderCode = order.orderNumber ?? `#${order.id ?? "—"}`;
    const etaDate = asEtaDate(order.estimatedDeliveryDate);
    return (
      <StorefrontLayout isLoggedIn={isLoggedIn} username={username} activeMenu="home">
        <section className="mx-auto max-w-[1440px] px-4 pb-12 pt-8 md:px-8">
          <div className="mb-4 flex justify-end">
            <Link href="/shipment-tracker" className="rounded-xl border border-outline-variant/20 px-4 py-2 text-xs font-bold text-primary">
              Tra cứu đơn khác
            </Link>
          </div>
          <div className="mb-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary md:text-5xl">Theo dõi vận đơn</h1>
                <p className="mt-2 text-lg text-on-surface-variant">
                  ID: <span className="font-mono font-bold uppercase text-secondary">{mvd || "—"}</span>
                </p>
              </div>
              <div className="rounded-xl bg-surface-container-high px-5 py-3 text-sm">
                <p className="text-on-surface-variant">Ngày đặt: <span className="font-bold text-on-surface">{asOrderDate(order.orderedDate)}</span></p>
                <p className="text-on-surface-variant">Tổng tiền: <span className="font-bold text-on-surface">{asMoneyVnd(order.total)}</span></p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-8 lg:col-span-8">
              <section className="rounded-[1.75rem] bg-white/85 p-8 shadow-sm backdrop-blur">
                <div className="mb-10 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-headline text-2xl font-bold text-primary">
                    <span className="material-symbols-outlined text-secondary">route</span> Hành trình vận chuyển
                  </h2>
                  <div className="rounded-full bg-secondary-fixed px-4 py-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-on-secondary-fixed">{viOrderStatusLabel(order.status)}</span>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-4">
                    <p className="text-sm font-bold text-primary">Đơn hàng đã xử lý</p>
                    <p className="text-sm text-on-surface-variant">Đơn hàng đã được xác thực bằng MVD và 4 số cuối SĐT.</p>
                  </div>
                  <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-4">
                    <p className="text-sm font-bold text-primary">Trạng thái thanh toán</p>
                    <p className="text-sm text-on-surface-variant">{viPaymentStatusLabel(order.paymentStatus)}</p>
                  </div>
                  <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-4">
                    <p className="text-sm font-bold text-primary">Trạng thái đơn hiện tại</p>
                    <p className="text-sm text-on-surface-variant">{viOrderStatusLabel(order.status)}</p>
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-xl bg-white/85 p-6 shadow-sm backdrop-blur">
                  <p className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Thông tin giao hàng</p>
                  <p className="mt-2 text-lg font-bold">{order.shippingAddress?.trim() || "Chưa cập nhật địa chỉ giao hàng"}</p>
                </div>
                <div className="rounded-xl bg-white/85 p-6 shadow-sm backdrop-blur">
                  <p className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Thông tin kiện hàng</p>
                  <p className="mt-2 text-lg font-bold">Đơn hàng: {orderCode}</p>
                  <p className="text-sm text-on-surface-variant">MVD: {mvd || "—"}</p>
                </div>
              </section>
            </div>

            <aside className="space-y-6 lg:col-span-4">
              <div className="relative overflow-hidden rounded-[1.75rem] bg-primary p-8 text-white">
                <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-on-primary-container">Dự kiến giao</p>
                <h3 className="font-headline text-4xl font-black">{status === "DELIVERED" ? "ĐÃ GIAO" : "ETA"}</h3>
                <p className="mt-3 text-lg">{etaDate !== "—" ? etaDate : etaFromStatus(order.status)}</p>
                {etaDate !== "—" ? (
                  <p className="mt-1 text-sm text-white/80">Ngày giao dự kiến (lấy từ hệ thống)</p>
                ) : (
                  <p className="mt-1 text-sm text-white/80">Chưa có ngày dự kiến, đang hiển thị theo trạng thái</p>
                )}
              </div>
              <div className="rounded-[1.75rem] bg-white/85 p-8 shadow-sm backdrop-blur">
                <h3 className="mb-4 font-headline text-xl font-bold text-primary">Chỉ số vận đơn</h3>
                <div className="space-y-3 text-sm">
                  <p className="flex justify-between"><span className="text-on-surface-variant">Mã đơn</span><span className="font-semibold">{orderCode}</span></p>
                  <p className="flex justify-between"><span className="text-on-surface-variant">Thanh toán</span><span className="font-semibold">{viPaymentStatusLabel(order.paymentStatus)}</span></p>
                  <p className="flex justify-between"><span className="text-on-surface-variant">Trạng thái</span><span className="font-semibold">{viOrderStatusLabel(order.status)}</span></p>
                  <p className="flex justify-between"><span className="text-on-surface-variant">Ngày giao dự kiến</span><span className="font-semibold">{etaDate}</span></p>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </StorefrontLayout>
    );
  }

  if (failedLookup) {
    return (
      <StorefrontLayout isLoggedIn={isLoggedIn} username={username} activeMenu="home">
        <div className="flex h-[calc(100vh-220px)] min-h-[420px]">
          <section className="relative flex-1 overflow-hidden p-8 opacity-40 blur-[2px] grayscale">
            <h1 className="mb-2 font-headline text-4xl font-extrabold tracking-tight text-primary">Theo dõi vận đơn</h1>
            <p className="mb-8 text-on-surface-variant">Giám sát các kiện hàng đang lưu thông toàn cầu</p>
          </section>
        </div>

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md">
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-white/20 bg-surface-container-lowest shadow-2xl">
            <div className="px-8 pb-6 pt-10 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-error-container/30">
                <span className="material-symbols-outlined text-5xl text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
                  warning
                </span>
              </div>
              <h2 className="mb-3 font-headline text-2xl font-extrabold tracking-tight text-on-surface">Xác minh thất bại</h2>
              <p className="mb-8 text-base leading-relaxed text-on-surface-variant">
                Không tìm thấy đơn hàng tương ứng. Mã MVD hoặc 4 số cuối điện thoại bạn nhập chưa khớp với dữ liệu hệ thống.
              </p>

              <div className="mb-8 w-full rounded-xl border-l-4 border-error bg-surface-container-low p-4 text-left">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-error">error</span>
                  <div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Mã lỗi: ERR_ORDER_404</p>
                    <p className="text-sm text-on-surface-variant">MVD `{mvd}` và số `***{phoneLast4}` không hợp lệ hoặc không liên kết với đơn hàng.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Link href="/shipment-tracker" className="w-full rounded-xl bg-kinetic py-4 text-base font-bold text-white shadow-lg">
                  Thử lại
                </Link>
                <Link href="/" className="w-full rounded-xl bg-surface-container-high py-4 text-base font-bold text-primary">
                  Hủy
                </Link>
              </div>
            </div>
            <div className="h-1.5 w-full bg-gradient-to-r from-error/40 via-error to-error/40" />
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout isLoggedIn={isLoggedIn} username={username} activeMenu="home">
      <section className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-16">
        <div className="mb-6 flex w-full justify-end">
          <Link href="/admin/orders" className="rounded-xl border border-outline-variant/20 px-4 py-2 text-xs font-bold text-primary">
            Về quản trị đơn hàng
          </Link>
        </div>
        <div className="absolute left-10 top-20 h-56 w-56 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative w-full space-y-8 text-center">
          <div className="space-y-3">
            <h2 className="font-headline text-4xl font-black tracking-tight md:text-6xl">
              Tra cứu <span className="text-secondary">vận đơn</span> chính xác.
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-on-surface-variant md:text-base">
              Nhập mã MVD để tra cứu nhanh trạng thái đơn. Để bảo mật, hệ thống yêu cầu thêm 4 số cuối số điện thoại đặt hàng.
            </p>
          </div>

          <SoftNavigateForm actionPath="/shipment-tracker" className="mx-auto max-w-3xl rounded-[1.5rem] border border-outline-variant/20 bg-surface-container-lowest p-3 shadow-2xl">
            <input type="hidden" name="verify" value="1" />
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <div className="flex items-center rounded-xl bg-surface-container-low px-4">
                <span className="material-symbols-outlined mr-3 text-secondary">terminal</span>
                <input
                  name="mvd"
                  defaultValue={mvd}
                  placeholder="Nhập mã vận đơn MVD..."
                  className="w-full border-none bg-transparent py-4 font-headline text-base font-bold uppercase outline-none placeholder:text-outline"
                  required
                />
              </div>
              <button className="rounded-xl bg-kinetic px-6 py-4 font-headline text-sm font-extrabold text-white shadow-lg transition hover:opacity-95">
                Kiểm tra
              </button>
            </div>
          </SoftNavigateForm>
        </div>
      </section>

      {verifyStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md">
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-white/20 bg-surface-container-lowest shadow-2xl">
            <div className="px-8 pb-6 pt-10 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-container/15">
                <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  shield_lock
                </span>
              </div>
              <h2 className="mb-3 font-headline text-2xl font-extrabold tracking-tight text-on-surface">Verification Required</h2>
              <p className="mb-8 text-base leading-relaxed text-on-surface-variant">
                Nhập 4 số cuối số điện thoại liên kết với mã vận đơn <span className="font-bold text-primary">{mvd}</span>.
              </p>

              <SoftNavigateForm actionPath="/shipment-tracker" className="space-y-6">
                <input type="hidden" name="verify" value="1" />
                <input type="hidden" name="mvd" value={mvd} />
                <PhoneLast4Inputs d1={d1} d2={d2} d3={d3} d4={d4} />
                <div className="flex flex-col gap-3">
                  <button className="w-full rounded-xl bg-kinetic py-4 text-base font-bold text-white shadow-lg">Verify &amp; Access</button>
                  <Link href="/shipment-tracker" className="w-full rounded-xl bg-surface-container-high py-4 text-base font-bold text-primary">Hủy</Link>
                </div>
              </SoftNavigateForm>
            </div>
            <div className="h-1.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
          </div>
        </div>
      )}
    </StorefrontLayout>
  );
}
