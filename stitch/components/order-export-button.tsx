"use client";

import { useState } from "react";


export function OrderExportButton({
  status,
  paymentStatus,
  q,
  startDate,
  endDate,
  accessToken
}: {
  status?: string | null;
  paymentStatus?: string | null;
  q?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  accessToken?: string | null;
}) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (paymentStatus) params.append("paymentStatus", paymentStatus);
      if (q) params.append("q", q);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      
      const qs = params.toString();
      const fetchUrl = `/api/admin/orders/export${qs ? '?' + qs : ''}`;
      
      const res = await fetch(fetchUrl);
      if (!res.ok) {
        throw new Error("Không thể kết nối tới backend.");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Orders_Export_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Lỗi xuất file: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-6 font-bold text-white shadow-lg shadow-rose-600/30 transition-all hover:bg-rose-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none sm:flex-none"
    >
      <span className="material-symbols-outlined text-[20px]">
        {loading ? "sync" : "picture_as_pdf"}
      </span>
      {loading ? "Đang xuất..." : "Xuất PDF"}
    </button>
  );
}
