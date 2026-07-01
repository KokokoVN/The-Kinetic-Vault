import crypto from "crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getResolvedApiRoot } from "@/app/api/cart/_shared";

function sortQuery(params: URLSearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of params.entries()) {
    if (k === "vnp_SecureHash" || k === "vnp_SecureHashType") continue;
    out[k] = v;
  }
  const keys = Object.keys(out).sort();
  const sorted: Record<string, string> = {};
  for (const k of keys) sorted[k] = out[k];
  return sorted;
}

function buildQuery(params: Record<string, string>): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) usp.append(k, v);
  return usp.toString();
}

function hmacSha512Hex(secret: string, data: string): string {
  return crypto.createHmac("sha512", secret).update(Buffer.from(data, "utf-8")).digest("hex");
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = (url.searchParams.get("next") ?? "/checkout").trim() || "/checkout";
  const secureHash = (url.searchParams.get("vnp_SecureHash") ?? "").trim();
  if (!secureHash) {
    return NextResponse.redirect(new URL(`${next}?payment=failed&reason=missing_hash`, url.origin));
  }

  const hashSecret = (process.env.VNP_HASH_SECRET ?? "").trim();
  if (!hashSecret) {
    return NextResponse.redirect(new URL(`${next}?payment=failed&reason=missing_secret`, url.origin));
  }

  const sorted = sortQuery(url.searchParams);
  const signData = buildQuery(sorted);
  const expected = hmacSha512Hex(hashSecret, signData);
  if (expected.toLowerCase() !== secureHash.toLowerCase()) {
    return NextResponse.redirect(new URL(`${next}?payment=failed&reason=bad_signature`, url.origin));
  }

  // Optional: validate txn ref belongs to this session
  const jar = await cookies();
  const pendingRef = jar.get("vnpayTxnRef")?.value ?? "";
  const txnRef = sorted["vnp_TxnRef"] ?? "";
  if (pendingRef && txnRef && pendingRef !== txnRef) {
    return NextResponse.redirect(new URL(`${next}?payment=failed&reason=txn_mismatch`, url.origin));
  }

  const resCode = sorted["vnp_ResponseCode"] ?? "";
  const tranStatus = sorted["vnp_TransactionStatus"] ?? "";
  const ok = resCode === "00" && (tranStatus === "00" || tranStatus === "");

  const paymentIdRaw = Number(jar.get("vnpayPaymentId")?.value ?? 0);
  const paymentId = Number.isFinite(paymentIdRaw) && paymentIdRaw > 0 ? Math.floor(paymentIdRaw) : null;
  const orderIdRaw = Number(jar.get("vnpayOrderId")?.value ?? 0);
  const orderId = Number.isFinite(orderIdRaw) && orderIdRaw > 0 ? Math.floor(orderIdRaw) : null;
  const orderNumber = String(jar.get("vnpayOrderNumber")?.value ?? "").trim();

  if (paymentId != null) {
    const paymentBase = (process.env.PAYMENT_SERVICE_URL ?? "http://localhost:8814").trim().replace(/\/+$/, "");
    const apiRoot = getResolvedApiRoot();
    const actionPath = ok
      ? `/${paymentId}/complete?transactionRef=${encodeURIComponent(txnRef)}`
      : `/${paymentId}/fail`;
    try {
      let done = false;
      const direct = await fetch(`${paymentBase}${actionPath}`, { method: "POST", cache: "no-store" });
      done = direct.ok;
      if (!done) {
        const gw = await fetch(`${apiRoot}/payments${actionPath}`, { method: "POST", cache: "no-store" });
        done = gw.ok;
      }
      void done;
    } catch {
      // Keep callback redirect flow resilient.
    }
  }

  const q = new URLSearchParams();
  q.set("payment", ok ? "success" : "failed");
  if (txnRef) q.set("vnp_TxnRef", txnRef);
  if (orderId != null) q.set("orderId", String(orderId));
  if (orderNumber) q.set("orderNumber", orderNumber);
  const res = NextResponse.redirect(new URL(`${next}?${q.toString()}`, url.origin));
  res.cookies.delete("vnpayTxnRef");
  res.cookies.delete("vnpayPaymentId");
  res.cookies.delete("vnpayOrderId");
  res.cookies.delete("vnpayOrderNumber");
  if (ok) {
    res.cookies.delete("cartId");
  }
  return res;
}

