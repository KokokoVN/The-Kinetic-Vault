"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  orderId: number;
  orderNumber?: string | null;
  amount: number;
  status?: string | null;
  paymentStatus?: string | null;
  paymentMethod?: string | null;
};

export function OrderRepaySepay({
  orderId,
  orderNumber,
  amount,
  status,
  paymentStatus,
  paymentMethod,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qr, setQr] = useState<{ qrImageUrl: string; code: string; paymentId: number } | null>(null);
  const pollRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current != null) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, []);

  const canRepay = useMemo(() => {
    const s = String(status ?? "").toUpperCase();
    const ps = String(paymentStatus ?? "").toUpperCase();
    const pm = String(paymentMethod ?? "").toUpperCase();
    
    if (ps === "PAID" || ps === "COMPLETED") return false;
    if (s === "CANCELLED" || s === "DELIVERED") return false;
    
    return (s === "PAYMENT_EXPECTED" || ps === "PENDING") && pm === "SEPAY";
  }, [status, paymentStatus, paymentMethod]);

  async function retryPay() {
    if (pollRef.current != null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/sepay/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          orderId,
          orderNumber: orderNumber ?? null,
          amountVnd: amount,
        }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        setError(txt || `Không tạo được QR thanh toán lại (HTTP ${res.status}).`);
        return;
      }
      const data = (await res.json().catch(() => null)) as any;
      const qrImageUrl = String(data?.qrImageUrl ?? "").trim();
      const code = String(data?.code ?? "").trim();
      const paymentId = Number(data?.paymentId ?? 0);
      if (!qrImageUrl || !code || !Number.isFinite(paymentId) || paymentId <= 0) {
        setError("Dữ liệu QR không hợp lệ.");
        return;
      }
      setQr({ qrImageUrl, code, paymentId: Math.floor(paymentId) });
      const check = window.setInterval(async () => {
        try {
          const sRes = await fetch(`/api/payments/sepay/status?paymentId=${encodeURIComponent(String(paymentId))}`, { cache: "no-store" });
          if (!sRes.ok) return;
          const sData = (await sRes.json().catch(() => null)) as any;
          const st = String(sData?.status ?? "").toUpperCase();
          if (st === "COMPLETED") {
            if (pollRef.current != null) {
              window.clearInterval(pollRef.current);
              pollRef.current = null;
            }
            try {
              await fetch("/api/payments/reconcile-order", {
                method: "POST",
                headers: { "content-type": "application/json" },
                cache: "no-store",
                body: JSON.stringify({ orderId }),
              });
            } catch {
              /* success page will reconcile again */
            }
            window.location.href = `/checkout/success?orderId=${encodeURIComponent(String(orderId))}${orderNumber ? `&orderNumber=${encodeURIComponent(orderNumber)}` : ""}`;
          }
        } catch {
          // ignore
        }
      }, 2500);
      pollRef.current = check;
    } catch {
      setError("Không kết nối được tới hệ thống thanh toán.");
    } finally {
      setLoading(false);
    }
  }

  if (!canRepay) return null;

  return (
    <div className="space-y-3">
      {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p> : null}
      <button
        type="button"
        onClick={() => void retryPay()}
        disabled={loading}
        className="rounded-xl bg-blue-100 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-200 disabled:opacity-60"
      >
        {loading ? "Đang tạo QR..." : "Thanh toán lại"}
      </button>
      {qr ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Mã thanh toán</p>
          <p className="mt-1 font-mono text-base font-black text-indigo-600 dark:text-indigo-400">{qr.code}</p>
          <img src={qr.qrImageUrl} alt="SePay QR repay" referrerPolicy="no-referrer" className="mt-3 w-full max-w-[220px] rounded-lg bg-white p-2 shadow-sm" />
        </div>
      ) : null}
    </div>
  );
}

