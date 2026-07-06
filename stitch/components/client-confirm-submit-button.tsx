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

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm sm:p-6 text-left animate-in fade-in duration-200" 
          onClick={handleClose}
        >
          <div 
            className="relative flex w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon Box */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10 text-red-655 dark:text-red-400 ring-8 ring-red-50/50 dark:ring-red-950/20">
              <span className="material-symbols-outlined text-3xl">warning</span>
            </div>
            
            <h2 className="mb-2.5 text-center font-headline text-2xl font-black text-slate-800 dark:text-white">
              Xác nhận xóa
            </h2>
            
            <p className="mb-8 text-center text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {confirmMessage}
            </p>
            
            <div className="flex items-center justify-center gap-3">
              <button 
                type="button"
                onClick={handleClose} 
                className="rounded-xl bg-slate-100 dark:bg-slate-800 px-5 py-3 text-sm font-bold text-slate-650 dark:text-slate-355 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
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
                className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02]"
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span> 
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
