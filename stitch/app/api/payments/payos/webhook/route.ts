import { NextResponse } from "next/server";
import { getResolvedApiRoot } from "@/app/api/cart/_shared";
import { convertObjToQueryStr, getRequiredEnv, hmacSha256Hex, sortObjDataByKey } from "@/app/api/payments/payos/_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WebhookBody = {
  code?: string;
  desc?: string;
  success?: boolean;
  data?: Record<string, unknown> | null;
  signature?: string;
};

export async function POST(req: Request) {
  let body: WebhookBody | null = null;
  try {
    body = (await req.json().catch(() => null)) as WebhookBody | null;
  } catch {
    body = null;
  }
  if (!body || !body.data || typeof body.data !== "object") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const checksumKey = getRequiredEnv("PAYOS_CHECKSUM_KEY");
    const currentSignature = String(body.signature ?? "").trim();
    if (!currentSignature) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const sortedData = sortObjDataByKey(body.data as Record<string, unknown>);
    const dataStr = convertObjToQueryStr(sortedData);
    const expected = hmacSha256Hex(checksumKey, dataStr);
    if (expected.toLowerCase() !== currentSignature.toLowerCase()) {
      return NextResponse.json({ ok: false, error: "BAD_SIGNATURE" }, { status: 400 });
    }

    const orderCodeRaw = Number((body.data as any).orderCode ?? 0);
    const orderCode = Number.isFinite(orderCodeRaw) && orderCodeRaw > 0 ? Math.floor(orderCodeRaw) : null;
    if (!orderCode) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // In our mapping: orderCode == paymentId
    const paymentId = orderCode;
    const isPaid = String((body.data as any).code ?? "").trim() === "00" && (body.success === true || String(body.code ?? "") === "00");

    const paymentBase = (process.env.PAYMENT_SERVICE_URL ?? "http://localhost:8814").trim().replace(/\/+$/, "");
    const apiRoot = getResolvedApiRoot();
    const actionPath = isPaid ? `/${paymentId}/complete?transactionRef=${encodeURIComponent(String((body.data as any).reference ?? ""))}` : `/${paymentId}/fail`;
    try {
      const direct = await fetch(`${paymentBase}${actionPath}`, { method: "POST", cache: "no-store" });
      if (!direct.ok) {
        await fetch(`${apiRoot}/payments${actionPath}`, { method: "POST", cache: "no-store" });
      }
    } catch {
      // ignore
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "unknown" }, { status: 500 });
  }
}

