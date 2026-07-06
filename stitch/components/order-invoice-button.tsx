"use client";

import { useState } from "react";

export function OrderInvoiceButton({ orderId }: { orderId: string | number }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const fetchUrl = `/api/admin/orders/${orderId}/invoice`;
      
      const res = await fetch(fetchUrl);
      if (!res.ok) {
        throw new Error("Không thể kết nối tới backend.");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice_${orderId}.pdf`;
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
      className="group relative flex h-10 items-center justify-center gap-2 overflow-hidden rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-bold text-white shadow-lg backdrop-blur-md transition-all hover:scale-[1.02] hover:bg-white/20 hover:shadow-purple-500/30 disabled:pointer-events-none disabled:opacity-50"
    >
      <span className="material-symbols-outlined text-[18px]">
        {loading ? "sync" : "print"}
      </span>
      {loading ? "Đang xử lý..." : "In Hóa Đơn"}
    </button>
  );
}
