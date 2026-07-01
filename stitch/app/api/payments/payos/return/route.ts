import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getResolvedApiRoot } from "@/app/api/cart/_shared";
import { getRequiredEnv } from "@/app/api/payments/payos/_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = (url.searchParams.get("next") ?? "/checkout/success").trim() || "/checkout/success";

  const jar = await cookies();
  const paymentIdRaw = Number(jar.get("payosPaymentId")?.value ?? 0);
  const paymentId = Number.isFinite(paymentIdRaw) && paymentIdRaw > 0 ? Math.floor(paymentIdRaw) : null;
  const orderIdRaw = Number(jar.get("payosOrderId")?.value ?? 0);
  const orderId = Number.isFinite(orderIdRaw) && orderIdRaw > 0 ? Math.floor(orderIdRaw) : null;
  const orderNumber = String(jar.get("payosOrderNumber")?.value ?? "").trim();
  const orderCodeRaw = Number(jar.get("payosOrderCode")?.value ?? 0);
  const orderCode = Number.isFinite(orderCodeRaw) && orderCodeRaw > 0 ? Math.floor(orderCodeRaw) : null;

  const paymentBase = (process.env.PAYMENT_SERVICE_URL ?? "http://localhost:8814").trim().replace(/\/+$/, "");
  const apiRoot = getResolvedApiRoot();
  const payosBase = (process.env.PAYOS_API_BASE ?? "https://api-merchant.payos.vn").trim().replace(/\/+$/, "");

  let ok = false;
  if (paymentId && orderCode) {
    try {
      const clientId = getRequiredEnv("PAYOS_CLIENT_ID");
      const apiKey = getRequiredEnv("PAYOS_API_KEY");
      const payosRes = await fetch(`${payosBase}/v2/payment-requests/${orderCode}`, {
        method: "GET",
        cache: "no-store",
        headers: { "x-client-id": clientId, "x-api-key": apiKey },
      });
      if (payosRes.ok) {
        const json = (await payosRes.json().catch(() => null)) as any;
        const status = String(json?.data?.status ?? "").toUpperCase();
        // Common statuses: PAID, CANCELLED, PENDING (depends on PayOS)
        ok = status === "PAID" || status === "SUCCESS" || status === "COMPLETED";
        const transactionRef = String(json?.data?.paymentLinkId ?? json?.data?.id ?? "").trim();
        if (ok) {
          const actionPath = `/${paymentId}/complete?transactionRef=${encodeURIComponent(transactionRef)}`;
          const direct = await fetch(`${paymentBase}${actionPath}`, { method: "POST", cache: "no-store" });
          if (!direct.ok) {
            await fetch(`${apiRoot}/payments${actionPath}`, { method: "POST", cache: "no-store" });
          }
        }
      }
    } catch {
      ok = false;
    }
  }

  const q = new URLSearchParams();
  q.set("payment", ok ? "success" : "pending");
  if (orderId) q.set("orderId", String(orderId));
  if (orderNumber) q.set("orderNumber", orderNumber);

  const res = NextResponse.redirect(new URL(`${next}${next.includes("?") ? "&" : "?"}${q.toString()}`, url.origin));
  res.cookies.delete("payosOrderCode");
  res.cookies.delete("payosPaymentId");
  res.cookies.delete("payosOrderId");
  res.cookies.delete("payosOrderNumber");
  if (ok) res.cookies.delete("cartId");
  return res;
}

