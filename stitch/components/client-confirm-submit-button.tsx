"use client";

import React, { useState } from "react";
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
  const { pending } = useFormStatus();

  return (
    <>
      <button
        type="button"
        title={title}
        className={className}
        disabled={pending}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
      >
        {pending ? <span className="material-symbols-outlined animate-spin">sync</span> : children}
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm sm:p-6 text-left" 
          onClick={(e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            setIsOpen(false); 
          }}
        >
          <div 
            className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-[2rem] bg-surface-container-lowest p-8 shadow-2xl animate-in zoom-in-95 duration-200" 
            onClick={e => e.stopPropagation()}
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 ring-8 ring-red-50/50">
              <span className="material-symbols-outlined text-3xl">warning</span>
            </div>
            <h2 className="mb-2 text-center font-headline text-2xl font-black text-slate-800">Xác nhận xóa</h2>
            <p className="mb-8 text-center text-slate-600">
              {confirmMessage}
            </p>
            <div className="flex items-center justify-center gap-4">
              <button 
                type="button"
                onClick={(e) => { 
                  e.preventDefault(); 
                  setIsOpen(false); 
                }} 
                className="rounded-xl bg-slate-100 px-6 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-200"
              >
                Hủy bỏ
              </button>
              <button 
                type="button"
                onClick={(e) => {
                  const form = e.currentTarget.closest("form");
                  if (form) form.requestSubmit();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-bold text-white shadow-lg shadow-red-600/20 transition-colors hover:bg-red-700"
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span> Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
