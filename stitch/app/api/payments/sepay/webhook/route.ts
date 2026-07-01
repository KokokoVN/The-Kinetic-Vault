import { NextResponse } from "next/server";
import { getResolvedApiRoot } from "@/app/api/cart/_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SepayWebhookBody = {
  id?: number;
  gateway?: string;
  transactionDate?: string;
  accountNumber?: string;
  code?: string | null;
  content?: string;
  transferType?: "in" | "out" | string;
  transferAmount?: number;
  accumulated?: number;
  subAccount?: string | null;
  referenceCode?: string;
  description?: string;
};

function isAuthOk(req: Request): boolean {
  const expected = (process.env.SEPAY_WEBHOOK_API_KEY ?? "").trim();
  if (!expected) return true;
  const auth = (req.headers.get("authorization") ?? "").trim();
  const xApiKey = (req.headers.get("x-api-key") ?? "").trim();
  const apiKey = (req.headers.get("api-key") ?? "").trim();
  const sepayApiKey = (req.headers.get("sepay-api-key") ?? "").trim();

  const candidates = [auth, xApiKey, apiKey, sepayApiKey].map((v) => String(v ?? "").trim()).filter(Boolean);
  if (candidates.length === 0) return false;

  for (const c of candidates) {
    if (c === expected) return true;
    // Common formats: "Apikey xxx", "Bearer xxx", "Apikey: xxx"
    const plain = c.replace(/^apikey[:\s]+/i, "").replace(/^bearer[:\s]+/i, "").trim();
    if (plain === expected) return true;
    // Last fallback: header contains key as substring
    if (c.toLowerCase().includes(expected.toLowerCase())) return true;
  }
  return false;
}

function extractPaymentCode(body: SepayWebhookBody | null): string {
  const direct = String(body?.code ?? "").trim();
  if (/^DH\d+$/i.test(direct)) return direct.toUpperCase();
  const content = String(body?.content ?? "").trim();
  const fromContent = content.match(/\b(DH\d+)\b/i)?.[1] ?? "";
  if (/^DH\d+$/i.test(fromContent)) return fromContent.toUpperCase();
  const description = String(body?.description ?? "").trim();
  const fromDescription = description.match(/\b(DH\d+)\b/i)?.[1] ?? "";
  if (/^DH\d+$/i.test(fromDescription)) return fromDescription.toUpperCase();
  return "";
}

export async function POST(req: Request) {
  if (!isAuthOk(req)) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as SepayWebhookBody | null;
  const code = extractPaymentCode(body);
  const transferType = String(body?.transferType ?? "").trim().toLowerCase();
  const transferAmount = Math.floor(Number(body?.transferAmount ?? 0));
  const transactionId = Number(body?.id ?? 0);
  const reference = String(body?.referenceCode ?? "").trim();

  if (!code || !code.startsWith("DH")) {
    // If SePay webhook is configured "Ignore if no payment code found", we likely won't get here.
    return NextResponse.json({ success: true }, { status: 200 });
  }
  if (transferType !== "in") {
    return NextResponse.json({ success: true }, { status: 200 });
  }
  const paymentIdRaw = Number(code.replace(/^DH/i, ""));
  const paymentId = Number.isFinite(paymentIdRaw) && paymentIdRaw > 0 ? Math.floor(paymentIdRaw) : null;
  if (!paymentId) {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  const paymentBase = (process.env.PAYMENT_SERVICE_URL ?? "http://localhost:8814").trim().replace(/\/+$/, "");
  const apiRoot = getResolvedApiRoot();

  try {
    // Load payment to validate amount and avoid duplicate completes.
    let payment: any = null;
    const direct = await fetch(`${paymentBase}/${paymentId}`, { method: "GET", cache: "no-store" });
    if (direct.ok) {
      payment = await direct.json().catch(() => null);
    } else {
      const gw = await fetch(`${apiRoot}/payments/${paymentId}`, { method: "GET", cache: "no-store" });
      if (gw.ok) payment = await gw.json().catch(() => null);
    }

    const status = String(payment?.status ?? "").toUpperCase();
    if (status === "COMPLETED") {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const expectedAmount = Math.floor(Number(payment?.amount ?? 0));
    if (!Number.isFinite(expectedAmount) || expectedAmount <= 0) {
      return NextResponse.json({ success: true }, { status: 200 });
    }
    if (!Number.isFinite(transferAmount) || transferAmount < expectedAmount) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const transactionRef = reference || (transactionId ? `SEPAY-${transactionId}` : "");
    const actionPath = `/${paymentId}/complete${transactionRef ? `?transactionRef=${encodeURIComponent(transactionRef)}` : ""}`;

    const done = await fetch(`${paymentBase}${actionPath}`, { method: "POST", cache: "no-store" });
    if (!done.ok) {
      await fetch(`${apiRoot}/payments${actionPath}`, { method: "POST", cache: "no-store" });
    }
  } catch {
    // Always respond fast to SePay to avoid retries storm.
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

