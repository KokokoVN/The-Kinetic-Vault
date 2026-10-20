"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useFormStatus } from "react-dom";

export function ClientConfirmSubmitButton({
  confirmMessage,
  title,
  className,
  children,
}: {
  confirmMessage: string;
  title?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formRef, setFormRef] = useState<HTMLFormElement | null>(null);
  const { pending } = useFormStatus();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const form = e.currentTarget.closest("form");
    setFormRef(form);
    setIsOpen(true);
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        title={title}
        className={className}
        disabled={pending}
        onClick={handleOpen}
      >
        {pending ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : children}
      </button>

      {isOpen && mounted && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 dark:bg-black/75 p-4 backdrop-blur-md sm:p-6 text-left animate-in fade-in duration-200" 
          onClick={handleClose}
        >
          <div 
            className="relative flex w-full max-w-md flex-col overflow-hidden rounded-[2.5rem] border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-zinc-950/95 p-7 sm:p-9 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-200 text-center" 
            onClick={(e) => e.stopPropagation()}
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

            {/* Warning / Trash Icon Box */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 ring-8 ring-rose-50/60 dark:ring-rose-950/20 shadow-xs">
              <span className="material-symbols-outlined text-3xl">delete_forever</span>
            </div>
            
            <h2 className="mb-2 font-headline text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Xác nhận xóa
            </h2>
            
            <p className="mb-8 text-sm sm:text-base text-slate-600 dark:text-zinc-300 leading-relaxed">
              {confirmMessage}
            </p>
            
            <div className="flex items-center justify-center gap-3 w-full">
              <button 
                type="button"
                onClick={handleClose} 
                className="flex-1 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-100 dark:bg-zinc-800/90 px-5 py-3.5 text-sm font-bold text-slate-700 dark:text-zinc-200 transition-all hover:bg-slate-200 dark:hover:bg-zinc-700 active:scale-95 shadow-xs"
              >
                Hủy bỏ
              </button>
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (formRef) {
                    formRef.requestSubmit();
                  }
                  setIsOpen(false);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-600/25 transition-all hover:scale-[1.02] active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span> 
                <span>Xác nhận</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
