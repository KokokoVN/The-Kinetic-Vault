import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getResolvedApiRoot } from "@/app/api/cart/_shared";
import { syncOrderPaidFromPaymentRecords } from "@/lib/order-payment-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let orderId = 0;
  try {
    const body = (await req.json().catch(() => null)) as { orderId?: number | string | null } | null;
    orderId = Math.floor(Number(body?.orderId ?? 0));
  } catch {
    orderId = 0;
  }
  if (!Number.isFinite(orderId) || orderId <= 0) {
    const url = new URL(req.url);
    orderId = Math.floor(Number(url.searchParams.get("orderId") ?? 0));
  }
  if (!Number.isFinite(orderId) || orderId <= 0) {
    return NextResponse.json({ error: "BAD_REQUEST", message: "orderId không hợp lệ." }, { status: 400 });
  }

  const paymentBase = (process.env.PAYMENT_SERVICE_URL ?? "http://localhost:8814").trim().replace(/\/+$/, "");
  const apiRoot = getResolvedApiRoot();
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value ?? null;
  const gwHeaders: Record<string, string> = {};
  if (accessToken?.trim()) gwHeaders.Authorization = `Bearer ${accessToken.trim()}`;

  try {
    const direct = await fetch(`${paymentBase}/order/${orderId}/reconcile-paid`, { method: "POST", cache: "no-store" });
    if (direct.ok) {
      await syncOrderPaidFromPaymentRecords(orderId, accessToken);
      const json = (await direct.json().catch(() => ({}))) as Record<string, unknown>;
      return NextResponse.json(json, { status: 200 });
    }
    const gw = await fetch(`${apiRoot}/payments/order/${orderId}/reconcile-paid`, {
      method: "POST",
      cache: "no-store",
      headers: gwHeaders,
    });
    await syncOrderPaidFromPaymentRecords(orderId, accessToken);
    const text = await gw.text().catch(() => "{}");
    return new NextResponse(text || "{}", {
      status: gw.status,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch {
    await syncOrderPaidFromPaymentRecords(orderId, accessToken).catch(() => {});
    return NextResponse.json({ error: "UPSTREAM_ERROR" }, { status: 502 });
  }
}
