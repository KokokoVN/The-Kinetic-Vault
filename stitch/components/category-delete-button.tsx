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
            className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-[2.5rem] border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-zinc-950/95 p-7 sm:p-9 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-200 text-center" 
            onClick={e => e.stopPropagation()}
          >
            {/* Visual Accent Top Bar */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-rose-500 via-red-500 to-amber-500" />

            {/* Close 'X' Button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all hover:bg-slate-200 dark:hover:bg-white/10"
              title="Đóng"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 ring-8 ring-rose-50/60 dark:ring-rose-950/20 shadow-xs">
              <span className="material-symbols-outlined text-3xl">delete_forever</span>
            </div>

            <h2 className="mb-2 font-headline text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Xác nhận xóa danh mục
            </h2>
            
            {isLoadingPreview ? (
              <div className="flex flex-col items-center justify-center py-6 text-slate-500 dark:text-slate-400">
                <span className="material-symbols-outlined animate-spin text-3xl mb-2 text-rose-500">sync</span>
                <p className="text-xs font-semibold">Đang kiểm tra dữ liệu liên quan...</p>
              </div>
            ) : (
              <>
                <p className="mb-6 text-center text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
                  Bạn có chắc chắn muốn xóa danh mục <span className="font-bold text-rose-600 dark:text-rose-400">"{categoryName}"</span>?
                  <br />
                  <span className="text-xs text-slate-400 dark:text-zinc-500">Danh mục sẽ được chuyển vào thùng rác (có thể khôi phục sau).</span>
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

                <div className="flex items-center justify-center gap-3 w-full">
                  <button 
                    type="button"
                    disabled={isDeleting}
                    onClick={handleClose} 
                    className="flex-1 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-100 dark:bg-zinc-800/90 px-5 py-3.5 text-sm font-bold text-slate-700 dark:text-zinc-200 transition-all hover:bg-slate-200 dark:hover:bg-zinc-700 active:scale-95 shadow-xs disabled:opacity-50"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting || Boolean(hasChildren)}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-600/25 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale"
                  >
                    {isDeleting ? (
                      <><span className="material-symbols-outlined animate-spin text-[18px]">sync</span> Đang xóa...</>
                    ) : (
                      <><span className="material-symbols-outlined text-[18px]">delete</span> Xóa ngay</>
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
