"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getCategoryPreviewAction, deleteCategoryAction } from "@/app/(admin)/categories/actions";

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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpen = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
    setErrorMsg(null);
    setIsLoadingPreview(true);
    
    try {
      const result = await getCategoryPreviewAction(categoryId);
      if (result) {
        setPreview(result);
      } else {
        setPreview({ childCategoryCount: 0, productCount: 0 }); // Fallback
      }
    } catch (err) {
      // Ignore preview fetch error, user can still try to delete and handle server error
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
    setErrorMsg(null);
    
    const confirmWithProducts = preview && preview.productCount > 0 ? true : false;
    
    try {
      const res = await deleteCategoryAction(categoryId, confirmWithProducts);
      if (res.success) {
        setIsOpen(false);
        router.push("/admin/categories?success=delete");
        router.refresh();
      } else if (res.conflict?.error === "HAS_CHILD_CATEGORIES") {
        setErrorMsg(`Không thể xóa: Còn ${res.conflict.childCategoryCount} danh mục con. Hãy xử lý danh mục con trước.`);
        setIsDeleting(false);
      } else if (res.conflict?.error === "REQUIRES_CONFIRMATION") {
        setErrorMsg(`Cần xác nhận lại: Danh mục này còn ${res.conflict.productCount} sản phẩm.`);
        setIsDeleting(false);
      } else {
        setErrorMsg("Xóa danh mục thất bại. Vui lòng thử lại sau.");
        setIsDeleting(false);
      }
    } catch (err) {
      setErrorMsg("Xóa danh mục thất bại do lỗi hệ thống.");
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
        <span className="material-symbols-outlined text-[18px] transition-transform group-hover:scale-110">delete</span>
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 dark:bg-slate-900/80 p-4 backdrop-blur-sm sm:p-6 text-left" 
          onClick={handleClose}
        >
          <div 
            className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-[2rem] border border-white/20 dark:border-slate-800/50 bg-white dark:bg-slate-900 p-8 shadow-2xl animate-in zoom-in-95 duration-200" 
            onClick={e => e.stopPropagation()}
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 ring-8 ring-red-50/50 dark:ring-red-900/20">
              <span className="material-symbols-outlined text-3xl">warning</span>
            </div>
            <h2 className="mb-2 text-center font-headline text-2xl font-black text-slate-800 dark:text-slate-200">Xác nhận xóa danh mục</h2>
            
            {isLoadingPreview ? (
              <div className="flex flex-col items-center justify-center py-6 text-slate-500 dark:text-slate-400">
                <span className="material-symbols-outlined animate-spin text-3xl mb-2">sync</span>
                <p>Đang kiểm tra dữ liệu liên quan...</p>
              </div>
            ) : (
              <>
                <p className="mb-6 text-center text-slate-600 dark:text-slate-400">
                  Bạn có chắc chắn muốn xóa danh mục <span className="font-bold text-red-600 dark:text-red-400">{categoryName}</span>?
                  <br /> Danh mục sẽ bị xóa mềm (ẩn khỏi hệ thống).
                </p>

                {errorMsg && (
                  <p className="mb-6 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-sm text-rose-900 dark:text-rose-400 text-center">
                    {errorMsg}
                  </p>
                )}

                {!errorMsg && preview && preview.childCategoryCount > 0 && (
                  <p className="mb-6 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-400 text-center">
                    Không thể xóa: Còn <strong>{preview.childCategoryCount}</strong> danh mục con. Hãy xóa hoặc đổi danh mục cha trước.
                  </p>
                )}

                {!errorMsg && preview && preview.productCount > 0 && (
                  <p className="mb-6 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-400 text-center">
                    Cảnh báo: Có <strong>{preview.productCount}</strong> sản phẩm đang dùng danh mục này. Xóa sẽ khiến các sản phẩm này bị ẩn danh mục.
                  </p>
                )}

                <div className="flex items-center justify-center gap-4">
                  <button 
                    type="button"
                    disabled={isDeleting}
                    onClick={handleClose} 
                    className="rounded-xl bg-slate-100 dark:bg-slate-800 px-6 py-3 font-bold text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting || Boolean(hasChildren)}
                    className="flex items-center gap-2 rounded-xl bg-red-600 dark:bg-red-500 px-6 py-3 font-bold text-white shadow-lg shadow-red-600/20 dark:shadow-red-500/20 transition-colors hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 disabled:grayscale"
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
