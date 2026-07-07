import crypto from "crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getResolvedApiRoot } from "@/app/api/cart/_shared";

type CreateVnpayRequest = {
  amountVnd: number;
  orderInfo?: string;
  returnPath?: string; // e.g. "/checkout"
  paymentChannel?: "atm_qr" | "card_sim";
  orderId?: number | null;
  orderNumber?: string | null;
};

function formatDateYYYYMMDDHHmmss(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

function sortParams(params: Record<string, string>): Record<string, string> {
  const keys = Object.keys(params).sort();
  const out: Record<string, string> = {};
  for (const k of keys) out[k] = params[k];
  return out;
}

function buildQuery(params: Record<string, string>): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) usp.append(k, v);
  return usp.toString();
}

function hmacSha512Hex(secret: string, data: string): string {
  return crypto.createHmac("sha512", secret).update(Buffer.from(data, "utf-8")).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as CreateVnpayRequest | null;
    const amountVnd = Number(body?.amountVnd ?? 0);
    const orderIdRaw = Number(body?.orderId ?? 0);
    const orderId = Number.isFinite(orderIdRaw) && orderIdRaw > 0 ? Math.floor(orderIdRaw) : null;
    if (!orderId) {
      return NextResponse.json({ error: "BAD_REQUEST", message: "Thiếu orderId cho giao dịch VNPAY." }, { status: 400 });
    }
    const orderNumber = String(body?.orderNumber ?? "").trim();

    if (!Number.isFinite(amountVnd) || amountVnd <= 0) {
      return NextResponse.json({ error: "BAD_REQUEST", message: "amountVnd không hợp lệ." }, { status: 400 });
    }

    const nodeVnpayBase = (process.env.VNP_NODEJS_URL ?? "").trim().replace(/\/+$/, "");
    const tmnCode = (process.env.VNP_TMN_CODE ?? "").trim();
    const hashSecret = (process.env.VNP_HASH_SECRET ?? "").trim();
    const vnpUrl = (process.env.VNP_URL ?? "").trim(); // e.g. https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
    const timezone = (process.env.VNP_TIMEZONE ?? "Asia/Ho_Chi_Minh").trim();
    const currCode = (process.env.VNP_CURR_CODE ?? "VND").trim();
    const locale = (process.env.VNP_LOCALE ?? "vn").trim();
    const orderType = (process.env.VNP_ORDER_TYPE ?? "other").trim();
    const paymentChannel = body?.paymentChannel === "card_sim" ? "card_sim" : "atm_qr";
    const cardSimBankCode = (process.env.VNP_CARD_SIM_BANK_CODE ?? "").trim();

    // Best-effort client IP: VNPAY requires vnp_IpAddr but we can’t reliably get it on edge.
    const ipAddr = (req.headers.get("x-forwarded-for") ?? "127.0.0.1").split(",")[0].trim() || "127.0.0.1";

    // Use Next.js origin to build returnUrl.
    const origin = req.headers.get("origin") ?? req.headers.get("x-forwarded-host") ?? "http://localhost:3000";
    const scheme = req.headers.get("x-forwarded-proto") ?? (String(origin).startsWith("https") ? "https" : "http");
    const host = req.headers.get("x-forwarded-host") ?? (new URL(String(origin))).host;

    const returnPath = (body?.returnPath ?? "/checkout").trim() || "/checkout";
    const returnUrl = `${scheme}://${host}/api/payments/vnpay/return?next=${encodeURIComponent(returnPath)}`;

    const now = new Date();
    // If you want strict timezone formatting, move this generation to server local TZ.
    void timezone;

    const txnRef = `TXN_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
    const createDate = formatDateYYYYMMDDHHmmss(now);

    // VNPAY amount is VND * 100
    const amount = String(Math.round(amountVnd * 100));
    const orderInfoRaw = (body?.orderInfo ?? "Thanh toán đơn hàng").trim() || "Thanh toán đơn hàng";
    const orderInfo = paymentChannel === "card_sim"
      ? `${orderInfoRaw} - The mo phong vnpay_nodejs`
      : orderInfoRaw;

    let paymentUrl = "";
    if (nodeVnpayBase) {
      // Prefer existing vnpay_nodejs app when available.
      const nodeBody: Record<string, unknown> = {
        amount: Math.round(amountVnd),
        language: locale,
      };
      if (paymentChannel === "card_sim" && cardSimBankCode) {
        nodeBody.bankCode = cardSimBankCode;
      }
      const nodeRes = await fetch(`${nodeVnpayBase}/order/create_payment_url`, {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nodeBody),
      });
      if (!nodeRes.ok) {
        const txt = await nodeRes.text().catch(() => "");
        return NextResponse.json(
          { error: "UPSTREAM_ERROR", message: txt || `vnpay_nodejs HTTP ${nodeRes.status}` },
          { status: 502 },
        );
      }
      const nodeJson = (await nodeRes.json().catch(() => null)) as { paymentUrl?: string } | null;
      paymentUrl = String(nodeJson?.paymentUrl ?? "").trim();
      if (!paymentUrl) {
        return NextResponse.json({ error: "UPSTREAM_ERROR", message: "vnpay_nodejs không trả paymentUrl." }, { status: 502 });
      }
    } else {
      if (!tmnCode || !hashSecret || !vnpUrl) {
        return NextResponse.json(
          {
            error: "INTERNAL",
            message: "Thiếu cấu hình VNPAY. Cần VNP_NODEJS_URL hoặc bộ VNP_TMN_CODE/VNP_HASH_SECRET/VNP_URL.",
          },
          { status: 500 },
        );
      }
      const vnpParams: Record<string, string> = sortParams({
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: tmnCode,
        vnp_Locale: locale,
        vnp_CurrCode: currCode,
        vnp_TxnRef: txnRef,
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: orderType,
        vnp_Amount: amount,
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
        ...((paymentChannel === "card_sim" && cardSimBankCode) ? { vnp_BankCode: cardSimBankCode } : {}),
      });
      const signData = buildQuery(vnpParams);
      const secureHash = hmacSha512Hex(hashSecret, signData);
      paymentUrl = `${vnpUrl}?${signData}&vnp_SecureHash=${secureHash}`;
    }

    // Store pending transaction reference so return handler can validate it belongs to current user session.
    const jar = await cookies();
    const accessToken = jar.get("accessToken")?.value?.trim();
    const headers: Record<string, string> = { 
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const paymentBase = (process.env.PAYMENT_SERVICE_URL ?? "http://127.0.0.1:8814").trim().replace(/\/+$/, "");
    const apiRoot = getResolvedApiRoot();
    const paymentCreateBody = {
      orderId,
      amount: Number(amountVnd.toFixed(0)),
      currency: "VND",
      method: "VNPAY",
    };
    let paymentId: number | null = null;
    try {
      const createRes = await fetch(`${paymentBase}/create`, {
        method: "POST",
        cache: "no-store",
        headers: { ...headers },
        body: JSON.stringify(paymentCreateBody),
      });
      if (createRes.ok) {
        const row = (await createRes.json().catch(() => null)) as { id?: number | null } | null;
        const pid = Number(row?.id ?? 0);
        paymentId = Number.isFinite(pid) && pid > 0 ? Math.floor(pid) : null;
      } else {
        // Fallback via gateway route in case direct payment-service endpoint is unavailable.
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
      // keep null, return error below
    }
    if (!paymentId) {
      return NextResponse.json({ error: "UPSTREAM_ERROR", message: "Không tạo được giao dịch payment-service." }, { status: 502 });
    }

    const res = NextResponse.json({
      paymentUrl,
      txnRef,
      paymentId,
      orderId,
      orderNumber: orderNumber || null,
    });
    res.cookies.set("vnpayTxnRef", txnRef, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: scheme === "https",
      maxAge: 15 * 60,
    });
    res.cookies.set("vnpayPaymentId", String(paymentId), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: scheme === "https",
      maxAge: 15 * 60,
    });
    res.cookies.set("vnpayOrderId", String(orderId), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: scheme === "https",
      maxAge: 15 * 60,
    });
    if (orderNumber) {
      res.cookies.set("vnpayOrderNumber", orderNumber, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: scheme === "https",
        maxAge: 15 * 60,
      });
    }
    // keep access token cookie untouched
    void jar;
    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: "INTERNAL", message }, { status: 500 });
  }
}

