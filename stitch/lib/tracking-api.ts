import { apiUrl, parseJsonSafe } from "./api";

export type TrackingOrderItem = {
  id: number;
  productId: number;
  quantity: number;
  subTotal: number;
  variantId?: number | null;
  variantLabel?: string | null;
  productNameSnapshot?: string | null;
  productSkuSnapshot?: string | null;
  product?: {
    id: number;
    productName: string;
    price: number;
    primaryImageUrl?: string | null;
  } | null;
};

export type TrackingOrder = {
  id: number;
  orderNumber: string;
  orderedDate: string | number[];
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: string;
  mvd: string;
  phoneLast4: string;
  estimatedDeliveryDate: string | number[] | null;
  userId: number;
  userName: string;
  total: number;
  items: TrackingOrderItem[];
};

export type TrackingResult =
  | { ok: true; order: TrackingOrder }
  | { ok: false; error: string };

/**
 * Tra cứu vận đơn bằng mã vận đơn (MVD) và 4 số cuối số điện thoại.
 * Endpoint: GET /api/shop/orders/check?mvd=...&phoneLast4=...
 * Endpoint này là public (không cần JWT).
 */
export async function trackOrder(mvd: string, phoneLast4: string): Promise<TrackingResult> {
  const trimmedMvd = (mvd ?? "").trim();
  const trimmedPhone = (phoneLast4 ?? "").replace(/\D/g, "");

  if (!trimmedMvd) {
    return { ok: false, error: "Vui lòng nhập mã vận đơn." };
  }
  if (trimmedPhone.length !== 4) {
    return { ok: false, error: "Vui lòng nhập đúng 4 số cuối số điện thoại." };
  }

  try {
    const res = await fetch(
      apiUrl(`/shop/orders/check?mvd=${encodeURIComponent(trimmedMvd)}&phoneLast4=${encodeURIComponent(trimmedPhone)}`),
      { cache: "no-store" },
    );

    if (res.status === 404) {
      return { ok: false, error: "Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã vận đơn và số điện thoại." };
    }
    if (res.status === 400) {
      return { ok: false, error: "Thông tin tra cứu không hợp lệ. Vui lòng kiểm tra lại." };
    }
    if (!res.ok) {
      return { ok: false, error: `Lỗi hệ thống (${res.status}). Vui lòng thử lại sau.` };
    }

    const order = await parseJsonSafe<TrackingOrder>(res);
    if (!order || !order.id) {
      return { ok: false, error: "Không tìm thấy đơn hàng." };
    }

    return { ok: true, order };
  } catch {
    return { ok: false, error: "Không kết nối được tới hệ thống. Vui lòng kiểm tra mạng và thử lại." };
  }
}
