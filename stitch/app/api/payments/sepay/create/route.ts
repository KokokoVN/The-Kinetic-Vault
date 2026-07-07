import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getResolvedApiRoot } from "@/app/api/cart/_shared";

type CreateSepayRequest = {
  orderId?: number | null;
  orderNumber?: string | null;
  amountVnd: number;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as CreateSepayRequest | null;
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

    const acc = (process.env.SEPAY_ACC_NUMBER ?? "").trim();
    const bank = (process.env.SEPAY_BANK ?? "").trim();
    if (!acc || !bank) {
      return NextResponse.json({ error: "INTERNAL", message: "Thiếu env: SEPAY_ACC_NUMBER / SEPAY_BANK" }, { status: 500 });
    }

    const paymentBase = (process.env.PAYMENT_SERVICE_URL ?? "http://127.0.0.1:8814").trim().replace(/\/+$/, "");
    const apiRoot = getResolvedApiRoot();

    const paymentCreateBody = {
      orderId,
      amount: amountVnd,
      currency: "VND",
      method: "SEPAY",
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentCreateBody),
      });
      
      let gatewayErrorText = "";

      if (createRes.ok) {
        const row = (await createRes.json().catch(() => null)) as { id?: number | null } | null;
        const pid = Number(row?.id ?? 0);
        paymentId = Number.isFinite(pid) && pid > 0 ? Math.floor(pid) : null;
      } else {
        console.error("Direct fetch failed:", createRes.status, await createRes.clone().text());
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
        } else {
          gatewayErrorText = `Gateway returned ${gatewayRes.status}: ${await gatewayRes.text()}`;
          console.error("Gateway fetch failed:", gatewayErrorText);
        }
      }
    } catch (err: any) {
      console.error("Sepay create error:", err);
      gatewayErrorText = err.message || String(err);
      paymentId = null;
    }

    if (!paymentId) {
      return NextResponse.json({ 
        error: "UPSTREAM_ERROR", 
        message: "Không tạo được giao dịch payment-service.",
        details: gatewayErrorText
      }, { status: 502 });
    }

    // SePay detects payment code from transfer description (code). Keep it unique & guess-hard.
    // Here we map: code == DH{paymentId}.
    const code = `DH${paymentId}`;

    const qrImageUrl =
      "https://qr.sepay.vn/img" +
      `?acc=${encodeURIComponent(acc)}` +
      `&bank=${encodeURIComponent(bank)}` +
      `&amount=${encodeURIComponent(String(amountVnd))}` +
      `&des=${encodeURIComponent(code)}`;

    return NextResponse.json(
      {
        paymentId,
        orderId,
        orderNumber: orderNumber || null,
        code,
        qrImageUrl,
      },
      { status: 200 },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: "INTERNAL", message }, { status: 500 });
  }
}

