"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SpecEditFormLiveCheck } from "./spec-edit-form-live-check";

type SpecData = {
  id: number;
  specKey?: string | null;
  specValue?: string | null;
  unit?: string | null;
  specGroup?: string | null;
  sortOrder?: number | null;
};

export type SpecGroupCardProps = {
  groupName: string;
  groupSpecs: SpecData[];
  allSpecs: SpecData[];
  existingGroups: string[];
  deleteSpecAction: (formData: FormData) => void | Promise<void>;
  updateSpecAction: (formData: FormData) => void | Promise<void>;
};

export function SpecGroupCard({
  groupName,
  groupSpecs,
  allSpecs,
  existingGroups,
  deleteSpecAction,
  updateSpecAction,
}: SpecGroupCardProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const variantEditInputClass =
    "w-full rounded-xl border border-outline-variant/20 bg-white px-3 py-2.5 text-sm text-blue-950 outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400";

  return (
    <>
      <article
        onClick={() => setIsOpen(true)}
        className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-indigo-100/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 ring-1 ring-indigo-500/20 transition-transform duration-300 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white">
            <span className="material-symbols-outlined text-[24px]">category</span>
          </div>
          <div>
            <h3 className="font-headline text-lg font-black text-slate-800">{groupName}</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">{groupSpecs.length} thông số</p>
          </div>
        </div>
      </article>

      {isOpen &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[50] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
            <div className="flex w-full max-w-5xl max-h-[90vh] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200">
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/50 p-6 sm:px-8">
                <div>
                  <h3 className="font-headline text-2xl font-black text-indigo-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-500 text-[28px]">folder_open</span>
                    Nhóm: {groupName}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">Quản lý chi tiết các thông số trong nhóm này</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-rose-50 hover:text-rose-600 hover:ring-rose-200"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 sm:px-8 custom-scrollbar bg-slate-50/30">
                <div className="flex flex-col gap-4">
                  {groupSpecs.map((s) => (
                    <article
                      key={s.id}
                      className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-headline text-lg font-black text-slate-800">{s.specKey}</p>
                          <span className="shrink-0 rounded-lg bg-slate-50 px-2 py-1 font-mono text-[10px] font-bold text-slate-400 ring-1 ring-slate-200/50">
                            #{s.id}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{s.specValue}</p>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {s.unit?.trim() && (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-500/20">
                            <span className="material-symbols-outlined text-[12px]">straighten</span> {s.unit}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2 py-1 text-[10px] font-bold text-sky-700 ring-1 ring-sky-500/20">
                          <span className="material-symbols-outlined text-[12px]">sort</span> Vị trí: {s.sortOrder ?? 0}
                        </span>
                      </div>
                      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                        <div className="flex-1">
                          <SpecEditFormLiveCheck
                            action={updateSpecAction}
                            specId={s.id}
                            defaultSpecKey={String(s.specKey ?? "")}
                            defaultSpecValue={String(s.specValue ?? "")}
                            defaultUnit={String(s.unit ?? "")}
                            defaultSpecGroup={String(s.specGroup ?? "")}
                            defaultSortOrder={Number.isFinite(Number(s.sortOrder)) ? Number(s.sortOrder) : 0}
                            otherSpecKeys={allSpecs.filter((x) => x.id !== s.id).map((x) => String(x.specKey ?? ""))}
                            inputClassName={variantEditInputClass}
                            existingGroups={existingGroups}
                          />
                        </div>
                        <form action={deleteSpecAction} className="shrink-0 w-[45%]">
                          <input type="hidden" name="specId" value={String(s.id)} />
                          <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 shadow-sm transition hover:bg-rose-100 hover:border-rose-300 h-full"
                            title="Xóa thông số"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span> Xóa
                          </button>
                        </form>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
