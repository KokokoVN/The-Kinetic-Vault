import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getResolvedApiRoot } from "@/app/api/cart/_shared";
import { convertObjToQueryStr, getRequiredEnv, hmacSha256Hex, sortObjDataByKey } from "@/app/api/payments/payos/_shared";

type CreatePayosRequest = {
  orderId?: number | null;
  orderNumber?: string | null;
  amountVnd: number;
  description?: string | null;
  returnPath?: string | null; // e.g. "/checkout/success"
  cancelPath?: string | null; // e.g. "/checkout?payment=cancelled"
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as CreatePayosRequest | null;
    const amountVnd = Math.floor(Number(body?.amountVnd ?? 0));
    if (!Number.isFinite(amountVnd) || amountVnd <= 0) {
      return NextResponse.json({ error: "BAD_REQUEST", message: "amountVnd không hợp lệ." }, { status: 400 });
    }
    const orderIdRaw = Number(body?.orderId ?? 0);
    const orderId = Number.isFinite(orderIdRaw) && orderIdRaw > 0 ? Math.floor(orderIdRaw) : null;
    if (!orderId) {
      return NextResponse.json({ error: "BAD_REQUEST", message: "Thiếu orderId." }, { status: 400 });
    }
    const orderNumber = String(body?.orderNumber ?? "").trim();

    const payosBase = (process.env.PAYOS_API_BASE ?? "https://api-merchant.payos.vn").trim().replace(/\/+$/, "");
    const clientId = getRequiredEnv("PAYOS_CLIENT_ID");
    const apiKey = getRequiredEnv("PAYOS_API_KEY");
    const checksumKey = getRequiredEnv("PAYOS_CHECKSUM_KEY");

    const origin = req.headers.get("origin") ?? "http://localhost:3000";
    const u = new URL(String(origin));
    const siteOrigin = `${u.protocol}//${u.host}`;

    const returnPath = String(body?.returnPath ?? "/checkout/success").trim() || "/checkout/success";
    const cancelPath = String(body?.cancelPath ?? "/checkout?payment=cancelled").trim() || "/checkout?payment=cancelled";
    const normalizedReturnPath = returnPath.startsWith("/") ? returnPath : `/${returnPath}`;
    const normalizedCancelPath = cancelPath.startsWith("/") ? cancelPath : `/${cancelPath}`;
    const returnUrl = `${siteOrigin}/api/payments/payos/return?next=${encodeURIComponent(normalizedReturnPath)}`;
    const cancelUrl = `${siteOrigin}${normalizedCancelPath}`;

    // Use payment-service to create a Payment row; orderCode uses paymentId to keep uniqueness/int.
    const paymentBase = (process.env.PAYMENT_SERVICE_URL ?? "http://127.0.0.1:8814").trim().replace(/\/+$/, "");
    const apiRoot = getResolvedApiRoot();

    const paymentCreateBody = {
      orderId,
      amount: amountVnd,
      currency: "VND",
      method: "PAYOS",
    };

    const jar = await cookies();
    const accessToken = jar.get("accessToken")?.value?.trim();
    const headers: Record<string, string> = { 
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    let paymentId: number | null = null;
    try {
      const createRes = await fetch(`${paymentBase}/create`, {
        method: "POST",
        cache: "no-store",
        headers,
        body: JSON.stringify(paymentCreateBody),
      });
      if (createRes.ok) {
        const row = (await createRes.json().catch(() => null)) as { id?: number | null } | null;
        const pid = Number(row?.id ?? 0);
        paymentId = Number.isFinite(pid) && pid > 0 ? Math.floor(pid) : null;
      } else {
        const gatewayRes = await fetch(`${apiRoot}/payments/create`, {
          method: "POST",
          cache: "no-store",
          headers,
          body: JSON.stringify(paymentCreateBody),
        });
        if (gatewayRes.ok) {
          const row = (await gatewayRes.json().catch(() => null)) as { id?: number | null } | null;
          const pid = Number(row?.id ?? 0);
          paymentId = Number.isFinite(pid) && pid > 0 ? Math.floor(pid) : null;
        }
      }
    } catch {
      paymentId = null;
    }
    if (!paymentId) {
      return NextResponse.json({ error: "UPSTREAM_ERROR", message: "Không tạo được giao dịch payment-service." }, { status: 502 });
    }

    const orderCode = paymentId; // PayOS expects integer orderCode
    const desc = String(body?.description ?? `Thanh toan don ${orderNumber || "#" + orderId}`).trim() || `Thanh toan don ${orderNumber || "#" + orderId}`;
    const description = desc.length > 25 ? desc.slice(0, 25) : desc; // PayOS note: some banks limit length

    const signatureData = sortObjDataByKey({
      amount: amountVnd,
      cancelUrl,
      description,
      orderCode,
      returnUrl,
    } as Record<string, unknown>);
    const dataStr = convertObjToQueryStr(signatureData);
    const signature = hmacSha256Hex(checksumKey, dataStr);

    const payload = {
      orderCode,
      amount: amountVnd,
      description,
      returnUrl,
      cancelUrl,
      signature,
    };

    const payosRes = await fetch(`${payosBase}/v2/payment-requests`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": clientId,
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });
    const text = await payosRes.text().catch(() => "");
    if (!payosRes.ok) {
      return new NextResponse(text || "{}", { status: payosRes.status, headers: { "Content-Type": "application/json; charset=utf-8" } });
    }
    const json = (JSON.parse(text || "{}") ?? {}) as any;
    const checkoutUrl = String(json?.data?.checkoutUrl ?? "").trim();
    if (!checkoutUrl) {
      return NextResponse.json({ error: "UPSTREAM_ERROR", message: "PayOS không trả checkoutUrl." }, { status: 502 });
    }

    const jar = await cookies();
    void jar;
    const res = NextResponse.json({ checkoutUrl, orderCode, paymentId, orderId, orderNumber: orderNumber || null }, { status: 200 });
    res.cookies.set("payosOrderCode", String(orderCode), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 15 * 60 });
    res.cookies.set("payosPaymentId", String(paymentId), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 15 * 60 });
    res.cookies.set("payosOrderId", String(orderId), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 15 * 60 });
    if (orderNumber) res.cookies.set("payosOrderNumber", orderNumber, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 15 * 60 });
    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: "INTERNAL", message }, { status: 500 });
  }
}

