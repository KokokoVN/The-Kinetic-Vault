import { getResolvedApiRoot } from "@/app/api/cart/_shared";

type PaymentRow = { status?: string | null; method?: string | null };

/**
 * Đọc payment-service (trực tiếp hoặc qua gateway có Bearer), nếu có giao dịch COMPLETED
 * thì POST trạng thái PAID sang order-service — không phụ thuộc Feign payment→order.
 */
export async function syncOrderPaidFromPaymentRecords(orderId: number, accessToken?: string | null): Promise<void> {
  if (!Number.isFinite(orderId) || orderId <= 0) return;

  const paymentBase = (process.env.PAYMENT_SERVICE_URL ?? "http://localhost:8814").trim().replace(/\/+$/, "");
  const orderBase = (process.env.ORDER_SERVICE_URL ?? "http://localhost:8813").trim().replace(/\/+$/, "");
  const apiRoot = getResolvedApiRoot();

  const token = String(accessToken ?? "").trim();
  const authHeaders: Record<string, string> = {};
  if (token) authHeaders.Authorization = `Bearer ${token}`;

  let payments: unknown = null;
  try {
    const r = await fetch(`${paymentBase}/order/${orderId}`, { method: "GET", cache: "no-store" });
    if (r.ok) payments = await r.json();
  } catch {
    /* direct payment-service unreachable */
  }

  if (!Array.isArray(payments) || payments.length === 0) {
    try {
      const r = await fetch(`${apiRoot}/payments/order/${orderId}`, {
        method: "GET",
        cache: "no-store",
        headers: { ...authHeaders },
      });
      if (r.ok) payments = await r.json();
    } catch {
      return;
    }
  }

  if (!Array.isArray(payments) || payments.length === 0) return;

  const completed = payments.find((p) => {
    const row = p as PaymentRow;
    return String(row?.status ?? "").toUpperCase() === "COMPLETED";
  }) as PaymentRow | undefined;

  if (!completed) return;

  const method = String(completed.method ?? "SEPAY").trim() || "SEPAY";
  const body = JSON.stringify({ paymentStatus: "PAID", paymentMethod: method });
  const postHeaders: Record<string, string> = { "content-type": "application/json", ...authHeaders };

  try {
    const r = await fetch(`${orderBase}/orders/${orderId}/payment-status`, {
      method: "POST",
      cache: "no-store",
      headers: postHeaders,
      body,
    });
    if (r.ok) return;
  } catch {
    /* try gateway */
  }

  try {
    await fetch(`${apiRoot}/shop/orders/${orderId}/payment-status`, {
      method: "POST",
      cache: "no-store",
      headers: postHeaders,
      body,
    });
  } catch {
    /* ignore */
  }
}
