"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearAllAdminCartsAction } from "@/app/(admin)/carts/actions";

export function ClearAllCartsButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClearAll = async () => {
    const confirmed = window.confirm(
      "BẠN CÓ CHẮC CHẮN MUỐN XÓA TẤT CẢ GIỎ HÀNG?\n\nHành động này sẽ xóa sạch giỏ hàng của TẤT CẢ NGƯỜI DÙNG trên hệ thống và không thể hoàn tác. Bạn đã kiểm tra kỹ chưa?"
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const success = await clearAllAdminCartsAction();
      if (success) {
        alert("Đã xóa toàn bộ giỏ hàng thành công!");
        router.refresh();
      } else {
        alert("Có lỗi xảy ra khi xóa giỏ hàng. Vui lòng thử lại.");
      }
    } catch (err) {
      alert("Lỗi kết nối.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClearAll}
      disabled={loading}
      className="flex items-center gap-2 rounded-2xl border border-red-200/50 bg-red-500/90 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-500/20 backdrop-blur-sm transition-all hover:bg-red-600 hover:shadow-red-500/40 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
    >
      <span className="material-symbols-outlined text-[18px]">delete_forever</span>
      {loading ? "Đang xóa..." : "Xóa tất cả giỏ hàng"}
    </button>
  );
}
