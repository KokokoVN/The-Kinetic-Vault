"use client";

import { useState } from "react";
import { SelectiveExportModal } from "./selective-export-modal";

export function ExportTemplateButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-6 py-3.5 font-headline text-sm font-bold text-emerald-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-100 hover:shadow-md"
      >
        <span className="material-symbols-outlined text-[18px]">download</span>
        <span>Tải Template</span>
      </button>

      <SelectiveExportModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
