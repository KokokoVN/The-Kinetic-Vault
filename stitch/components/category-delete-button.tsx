"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getCategoryPreviewAction, deleteCategoryAction } from "@/app/(admin)/categories/actions";
import { toast } from "sonner";

export function CategoryDeleteButton({
  categoryId,
  categoryName,
  className,
}: {
  categoryId: number;
  categoryName: string;
  className?: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [preview, setPreview] = useState<{ childCategoryCount: number; productCount: number } | null>(null);

  const handleOpen = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
    setIsLoadingPreview(true);
    
    try {
      const result = await getCategoryPreviewAction(categoryId);
      if (result) {
        setPreview(result);
      } else {
        setPreview({ childCategoryCount: 0, productCount: 0 }); // Fallback
      }
    } catch (err) {
      setPreview({ childCategoryCount: 0, productCount: 0 });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsOpen(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    
    const confirmWithProducts = preview && preview.productCount > 0 ? true : false;
    
    try {
      const res = await deleteCategoryAction(categoryId, confirmWithProducts);
      if (res.success) {
        setIsOpen(false);
        router.push("/admin/categories?success=delete");
        router.refresh();
      } else if (res.conflict?.error === "HAS_CHILD_CATEGORIES") {
        toast.warning(`Không thể xóa: Còn ${res.conflict.childCategoryCount} danh mục con. Hãy xử lý danh mục con trước.`);
        setIsDeleting(false);
      } else if (res.conflict?.error === "REQUIRES_CONFIRMATION") {
        toast.warning(`Cần xác nhận lại: Danh mục này còn ${res.conflict.productCount} sản phẩm.`);
        setIsDeleting(false);
      } else {
        toast.error("Xóa danh mục thất bại. Vui lòng thử lại sau.");
        setIsDeleting(false);
      }
    } catch (err) {
      toast.error("Xóa danh mục thất bại do lỗi hệ thống.");
      setIsDeleting(false);
    }
  };

  const hasChildren = preview && preview.childCategoryCount > 0;

  return (
    <>
      <button
        type="button"
        title="Xóa danh mục"
        className={className}
        onClick={handleOpen}
      >
        <span className="material-symbols-outlined text-[18px]">delete</span>
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 dark:bg-slate-950/80 p-4 backdrop-blur-sm sm:p-6 text-left" 
          onClick={handleClose}
        >
          <div 
            className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200" 
            onClick={e => e.stopPropagation()}
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 ring-8 ring-red-50/50 dark:ring-red-950/10">
              <span className="material-symbols-outlined text-3xl material-filled">warning</span>
            </div>
            <h2 className="mb-2 text-center font-headline text-2xl font-black text-slate-900 dark:text-white">Xác nhận xóa danh mục</h2>
            
            {isLoadingPreview ? (
              <div className="flex flex-col items-center justify-center py-6 text-slate-500 dark:text-slate-400">
                <span className="material-symbols-outlined animate-spin text-3xl mb-2">sync</span>
                <p className="text-xs font-semibold">Đang kiểm tra dữ liệu liên quan...</p>
              </div>
            ) : (
              <>
                <p className="mb-6 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Bạn có chắc chắn muốn xóa danh mục <span className="font-bold text-red-600 dark:text-red-450">{categoryName}</span>?
                  <br /> Danh mục sẽ bị ẩn khỏi hệ thống (có thể khôi phục).
                </p>

                {preview && preview.childCategoryCount > 0 && (
                  <p className="mb-6 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 px-4 py-3 text-xs text-rose-800 dark:text-rose-400 text-left">
                    Không thể xóa: Còn <strong>{preview.childCategoryCount}</strong> danh mục con trực thuộc. Hãy xóa hoặc gỡ danh mục con trước.
                  </p>
                )}

                {preview && preview.childCategoryCount === 0 && preview.productCount > 0 && (
                  <p className="mb-6 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 px-4 py-3 text-xs text-amber-800 dark:text-amber-400 text-left">
                    Cảnh báo: Có <strong>{preview.productCount}</strong> sản phẩm đang dùng danh mục này. Khi xóa, các sản phẩm sẽ bị ẩn phân loại.
                  </p>
                )}

                {preview && preview.childCategoryCount === 0 && preview.productCount === 0 && (
                  <p className="mb-6 text-center text-xs text-slate-400">Không có sản phẩm nào thuộc danh mục này, xóa an toàn.</p>
                )}

                <div className="flex items-center justify-center gap-4">
                  <button 
                    type="button"
                    disabled={isDeleting}
                    onClick={handleClose} 
                    className="rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-705 px-5 py-3 text-xs sm:text-sm font-bold text-slate-650 dark:text-slate-300 transition-colors disabled:opacity-50"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting || Boolean(hasChildren)}
                    className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-650 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-red-600/20 dark:shadow-red-500/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:grayscale"
                  >
                    {isDeleting ? (
                      <><span className="material-symbols-outlined animate-spin text-[16px] sm:text-[18px]">sync</span> Đang xóa...</>
                    ) : (
                      <><span className="material-symbols-outlined text-[16px] sm:text-[18px]">delete</span> Xóa ngay</>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
