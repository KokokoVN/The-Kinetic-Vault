export type OrderStatusCode =
  | "CREATED"
  | "CONFIRMED"
  | "PAYMENT_EXPECTED"
  | "PAID"
  | "PROCESSING"
  | "PACKING"
  | "READY_TO_SHIP"
  | "OUT_FOR_DELIVERY"
  | "SHIPPED"
  | "DELIVERY_FAILED"
  | "RESCHEDULED"
  | "REFUSED"
  | "RETURNING"
  | "RETURNED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatusCode = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type PaymentMethodCode = "COD" | "BANK_TRANSFER" | "CARD";

/**
 * Tiến trình xử lý / giao hàng (badge “đơn hàng”).
 * Phần chênh COD / QR / SePay chỉ thể hiện ở {@link viPaymentStatusLabel} — không trộn vào nhãn tiến trình đơn.
 */
/**
 * Các mã trạng thái đơn dùng cho bộ lọc `?status=` (đồng bộ backend, mọi hình thức thanh toán).
 * Nhãn hiển thị dùng {@link viOrderStatusLabel}.
 */
export const STOREFRONT_ORDER_FILTER_STATUS_VALUES: readonly string[] = [
  "CREATED",
  "PAYMENT_EXPECTED",
  "CONFIRMED",
  "PAID",
  "PROCESSING",
  "PACKING",
  "READY_TO_SHIP",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERY_FAILED",
  "RESCHEDULED",
  "REFUSED",
  "RETURNING",
  "RETURNED",
  "DELIVERED",
  "CANCELLED",
];

/**
 * Nhãn cột “tiến trình / đơn” — chỉ theo {@link OrderStatusCode}, không phụ thuộc thanh toán.
 * Giữ tham số payment* để không đổi call site; có thể bỏ qua.
 */
export function viUnifiedOrderProgressLabel(
  orderStatus?: string | null,
  _paymentStatus?: string | null,
  _paymentMethod?: string | null,
): string {
  return viFulfillmentProgressLabel(orderStatus);
}

export function storefrontOrderBadgeTone(orderStatus?: string | null, _paymentStatus?: string | null, _paymentMethod?: string | null): string {
  return orderStatusTone(orderStatus);
}

/** Thanh tiến trình trên card đơn (0–100), chỉ theo mã trạng thái đơn. */
export function storefrontOrderProgressPercent(orderStatus?: string | null, _paymentStatus?: string | null, _paymentMethod?: string | null): number {
  const s = String(orderStatus ?? "").toUpperCase();
  if (s === "CREATED" || s === "PAYMENT_EXPECTED") return 20;
  if (s === "CONFIRMED" || s === "PAID" || s === "PROCESSING" || s === "PACKING") return 45;
  if (s === "READY_TO_SHIP" || s === "SHIPPED" || s === "OUT_FOR_DELIVERY") return 75;
  if (s === "DELIVERED") return 100;
  if (s === "CANCELLED" || s === "REFUSED" || s === "RETURNED") return 0;
  return 30;
}

export function viFulfillmentProgressLabel(status?: string | null): string {
  const s = String(status ?? "").trim().toUpperCase();
  switch (s) {
    case "CREATED":
      return "Mới tạo";
    case "CONFIRMED":
      return "Shop đã xác nhận";
    case "PAYMENT_EXPECTED":
      return "Mới tạo";
    case "PAID":
      return "Đang chờ shop xử lý";
    case "PROCESSING":
      return "Đang xử lý đơn";
    case "PACKING":
      return "Đang đóng gói";
    case "READY_TO_SHIP":
      return "Chờ bàn giao vận chuyển";
    case "OUT_FOR_DELIVERY":
      return "Đang đi giao";
    case "SHIPPED":
      return "Đang giao";
    case "DELIVERY_FAILED":
      return "Giao thất bại";
    case "RESCHEDULED":
      return "Đã hẹn lại giao";
    case "REFUSED":
      return "Khách từ chối nhận";
    case "RETURNING":
      return "Đang hoàn hàng";
    case "RETURNED":
      return "Đã hoàn hàng";
    case "DELIVERED":
      return "Đã giao";
    case "CANCELLED":
      return "Đã hủy";
    default:
      return status?.trim() ? status.trim() : "—";
  }
}

export function viOrderStatusLabel(status?: string | null): string {
  const s = String(status ?? "").trim().toUpperCase();
  switch (s) {
    case "CREATED":
      return "Mới tạo";
    case "CONFIRMED":
      return "Shop đã xác nhận";
    case "PAYMENT_EXPECTED":
      return "Chờ thanh toán";
    case "PAID":
      return "Đã thanh toán";
    case "PROCESSING":
      return "Đang xử lý";
    case "PACKING":
      return "Đang đóng gói";
    case "READY_TO_SHIP":
      return "Sẵn sàng bàn giao vận chuyển";
    case "OUT_FOR_DELIVERY":
      return "Đang đi giao";
    case "SHIPPED":
      return "Đang giao";
    case "DELIVERY_FAILED":
      return "Giao thất bại";
    case "RESCHEDULED":
      return "Hẹn lại ngày giao";
    case "REFUSED":
      return "Khách từ chối nhận";
    case "RETURNING":
      return "Đang hoàn hàng";
    case "RETURNED":
      return "Đã hoàn hàng";
    case "DELIVERED":
      return "Đã giao";
    case "CANCELLED":
      return "Đã hủy";
    default:
      return status?.trim() ? status.trim() : "—";
  }
}

/**
 * Trạng thái đơn trên màn admin: tiến trình xử lý / giao (field `status` API),
 * tách khỏi “tình trạng thanh toán” — tránh nhãn chỉ nghe như tiền (ví dụ PAYMENT_EXPECTED).
 */
export function viAdminOrderPipelineLabel(status?: string | null): string {
  const s = String(status ?? "").trim().toUpperCase();
  switch (s) {
    case "CREATED":
      return "Mới tạo";
    case "CONFIRMED":
      return "Shop đã xác nhận";
    case "PAYMENT_EXPECTED":
      return "Tiếp nhận đơn — chờ hoàn tất thanh toán";
    case "PAID":
      return "Đã thanh toán — chờ xử lý / giao";
    case "PROCESSING":
      return "Đang xử lý";
    case "PACKING":
      return "Đang đóng gói";
    case "READY_TO_SHIP":
      return "Sẵn sàng bàn giao vận chuyển";
    case "OUT_FOR_DELIVERY":
      return "Đang đi giao";
    case "SHIPPED":
      return "Đang giao";
    case "DELIVERY_FAILED":
      return "Giao thất bại";
    case "RESCHEDULED":
      return "Hẹn lại ngày giao";
    case "REFUSED":
      return "Khách từ chối nhận";
    case "RETURNING":
      return "Đang hoàn hàng";
    case "RETURNED":
      return "Đã hoàn hàng";
    case "DELIVERED":
      return "Đã giao";
    case "CANCELLED":
      return "Đã hủy";
    default:
      return status?.trim() ? status.trim() : "—";
  }
}

/** Timeline 4 bước cho trang chi tiết đơn khách (tách khỏi badge thanh toán). */
export type StorefrontOrderTimeline =
  | { kind: "steps"; activeStep: 1 | 2 | 3 | 4 }
  | { kind: "cancelled" }
  | { kind: "return-flow"; phase: "returning" | "returned" };

/**
 * Ước lược tiến trình giao hàng để hiển thị stepper (không thay cho trạng thái chi tiết từ API).
 */
export function storefrontOrderTimeline(status?: string | null): StorefrontOrderTimeline {
  const s = String(status ?? "").trim().toUpperCase();
  if (s === "CANCELLED") return { kind: "cancelled" };
  if (s === "RETURNING") return { kind: "return-flow", phase: "returning" };
  if (s === "RETURNED") return { kind: "return-flow", phase: "returned" };
  if (s === "DELIVERED") return { kind: "steps", activeStep: 4 };
  if (
    s === "SHIPPED" ||
    s === "OUT_FOR_DELIVERY" ||
    s === "DELIVERY_FAILED" ||
    s === "RESCHEDULED" ||
    s === "REFUSED"
  ) {
    return { kind: "steps", activeStep: 3 };
  }
  if (s === "CONFIRMED" || s === "PAID" || s === "PROCESSING" || s === "PACKING" || s === "READY_TO_SHIP") {
    return { kind: "steps", activeStep: 2 };
  }
  return { kind: "steps", activeStep: 1 };
}

export const STOREFRONT_ORDER_STEP_LABELS: ReadonlyArray<{ step: 1 | 2 | 3 | 4; label: string; hint: string }> = [
  { step: 1, label: "Đặt hàng", hint: "Tiếp nhận & chờ shop xử lý" },
  { step: 2, label: "Chuẩn bị", hint: "Xác nhận, đóng gói" },
  { step: 3, label: "Giao hàng", hint: "Vận chuyển tới bạn" },
  { step: 4, label: "Hoàn tất", hint: "Đã giao thành công" },
];

export function viPaymentStatusLabel(status?: string | null): string {
  const s = String(status ?? "").trim().toUpperCase();
  switch (s) {
    case "PENDING":
      return "Chưa thanh toán";
    case "PAID":
      return "Đã thanh toán";
    case "FAILED":
      return "Thanh toán lỗi";
    case "REFUNDED":
      return "Đã hoàn tiền";
    default:
      return status?.trim() ? status.trim() : "—";
  }
}

export function viPaymentMethodLabel(method?: string | null): string {
  const s = String(method ?? "").trim().toUpperCase();
  switch (s) {
    case "COD":
      return "Thanh toán khi nhận hàng (COD)";
    case "BANK_TRANSFER":
      return "Chuyển khoản";
    case "CARD":
      return "Thẻ";
    default:
      return method?.trim() ? method.trim() : "—";
  }
}

export function orderStatusTone(status?: string | null): string {
  const s = String(status ?? "").toUpperCase();
  if (s.includes("CANCEL")) return "bg-rose-100 text-rose-800";
  if (s.includes("RETURN")) return "bg-slate-100 text-slate-800";
  if (s.includes("REFUSED")) return "bg-rose-100 text-rose-800";
  if (s.includes("DELIVERED")) return "bg-emerald-100 text-emerald-800";
  if (s.includes("FAILED")) return "bg-rose-100 text-rose-800";
  if (s.includes("RESCHEDULE")) return "bg-amber-100 text-amber-900";
  if (s.includes("OUT_FOR_DELIVERY")) return "bg-sky-100 text-sky-800";
  if (s.includes("SHIPPED")) return "bg-sky-100 text-sky-800";
  if (s.includes("READY_TO_SHIP")) return "bg-cyan-100 text-cyan-800";
  if (s.includes("PACKING")) return "bg-indigo-100 text-indigo-800";
  if (s.includes("PROCESSING")) return "bg-indigo-100 text-indigo-800";
  if (s.includes("PAID")) return "bg-violet-100 text-violet-800";
  if (s.includes("CONFIRMED")) return "bg-cyan-100 text-cyan-800";
  return "bg-amber-100 text-amber-900";
}

export function paymentStatusTone(status?: string | null): string {
  const s = String(status ?? "").toUpperCase();
  if (s.includes("PAID")) return "bg-emerald-100 text-emerald-800";
  if (s.includes("FAILED")) return "bg-rose-100 text-rose-800";
  if (s.includes("REFUND")) return "bg-sky-100 text-sky-800";
  return "bg-amber-100 text-amber-900";
}

/**
 * Luồng chuyển trạng thái phải đồng bộ với backend (`OrderServiceImpl#buildTransitionMap`).
 * Mục tiêu: chỉ render các lựa chọn hợp lệ để tránh 500 khi cập nhật.
 */
export function allowedNextOrderStatuses(current?: string | null): OrderStatusCode[] {
  const s = String(current ?? "").trim().toUpperCase();
  switch (s) {
    case "CREATED":
      return ["CONFIRMED", "CANCELLED"];
    case "CONFIRMED":
      return ["PACKING", "PROCESSING", "READY_TO_SHIP", "SHIPPED", "CANCELLED"];
    case "PAYMENT_EXPECTED":
      return ["PAID", "CANCELLED"];
    case "PAID":
      return ["CONFIRMED", "PROCESSING", "CANCELLED"];
    case "PROCESSING":
      return ["PACKING", "READY_TO_SHIP", "SHIPPED", "CANCELLED"];
    case "PACKING":
      return ["READY_TO_SHIP", "SHIPPED", "CANCELLED"];
    case "READY_TO_SHIP":
      return ["SHIPPED", "CANCELLED"];
    case "SHIPPED":
      return ["OUT_FOR_DELIVERY", "DELIVERY_FAILED", "RESCHEDULED", "DELIVERED"];
    case "OUT_FOR_DELIVERY":
      return ["DELIVERY_FAILED", "RESCHEDULED", "REFUSED", "DELIVERED"];
    case "DELIVERY_FAILED":
      return ["RESCHEDULED", "OUT_FOR_DELIVERY", "RETURNING", "CANCELLED"];
    case "RESCHEDULED":
      return ["OUT_FOR_DELIVERY", "DELIVERY_FAILED", "REFUSED", "DELIVERED", "CANCELLED"];
    case "REFUSED":
      return ["RETURNING", "CANCELLED"];
    case "RETURNING":
      return ["RETURNED"];
    case "RETURNED":
      return [];
    case "DELIVERED":
    case "CANCELLED":
    default:
      return [];
  }
}

