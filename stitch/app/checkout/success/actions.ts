"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getResolvedApiRoot } from "@/app/api/cart/_shared";

async function reconcilePaidViaPaymentService(orderId: number): Promise<void> {
  const paymentBase = (process.env.PAYMENT_SERVICE_URL ?? "http://localhost:8814").trim().replace(/\/+$/, "");
  const apiRoot = getResolvedApiRoot();
  const urlDirect = `${paymentBase}/order/${orderId}/reconcile-paid`;
  const urlGw = `${apiRoot}/payments/order/${orderId}/reconcile-paid`;
  const jar = await cookies();
  const token = jar.get("accessToken")?.value?.trim();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const direct = await fetch(urlDirect, { method: "POST", cache: "no-store" });
    if (direct.ok) return;
    await fetch(urlGw, { method: "POST", cache: "no-store", headers });
  } catch {
    try {
      await fetch(urlGw, { method: "POST", cache: "no-store", headers });
    } catch {
      /* ignore */
    }
  }
}

export async function revalidateMyOrdersAfterPayment(orderId: number) {
  const jar = await cookies();
  const token = jar.get("accessToken")?.value ?? null;
  if (Number.isFinite(orderId) && orderId > 0) {
    const { syncOrderPaidFromPaymentRecords } = await import("@/lib/order-payment-sync");
    await reconcilePaidViaPaymentService(orderId);
    await syncOrderPaidFromPaymentRecords(orderId, token);
  }
  revalidatePath("/my-orders");
  if (Number.isFinite(orderId) && orderId > 0) {
    revalidatePath(`/my-orders/${orderId}`);
  }
}
