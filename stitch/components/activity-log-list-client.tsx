"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { formatWebActivityTime, type WebActivityLog } from "@/lib/api";

type Props = {
  logs: WebActivityLog[];
};

function detailPreview(detailJson: string | null | undefined): string {
  if (!detailJson?.trim()) return "—";
  try {
    const o = JSON.parse(detailJson) as Record<string, unknown>;
    const keys = Object.keys(o);
    if (keys.length === 0) return "—";
    return keys
      .slice(0, 6)
      .map((k) => `${k}: ${String(o[k])}`)
      .join(" · ");
  } catch {
    return detailJson.length > 140 ? `${detailJson.slice(0, 140)}...` : detailJson;
  }
}

function methodBadge(method: string | null | undefined) {
  const m = (method ?? "—").toUpperCase();
  const cls =
    m === "DELETE"
      ? "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200"
      : m === "POST"
        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200"
        : m === "PUT" || m === "PATCH"
          ? "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200"
          : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 font-mono text-[10px] font-black uppercase tracking-tight ${cls}`}>
      {m}
    </span>
  );
}

function normalizePageSize(raw: number): number {
  return [10, 20, 50, 100].includes(raw) ? raw : 20;
}

function displayOrDash(v: unknown): string {
  const s = String(v ?? "").trim();
  return s ? s : "—";
}

function matchesQuery(row: WebActivityLog, qLower: string, methodFilter: string): boolean {
  if (methodFilter !== "all" && String(row.httpMethod ?? "").toUpperCase() !== methodFilter) {
    return false;
  }
  if (!qLower) return true;
  const bag = [
    String(row.id ?? ""),
    String(row.action ?? ""),
    String(row.resourceType ?? ""),
    String(row.resourceId ?? ""),
    String(row.httpMethod ?? ""),
    String(row.actorUsername ?? ""),
    String(row.createdBy ?? ""),
    String(row.actorUserId ?? ""),
    String(row.requestPath ?? ""),
    String(row.detailJson ?? ""),
  ];
  return bag.some((v) => v.toLowerCase().includes(qLower));
}

function toExportRows(rows: WebActivityLog[]) {
  return rows.map((r) => ({
    ID: r.id,
    "Thời gian": formatWebActivityTime(r.createdAt),
    "Hành động": displayOrDash(r.action),
    "Loại tài nguyên": displayOrDash(r.resourceType),
    "Mã tài nguyên": displayOrDash(r.resourceId),
    "Phương thức": displayOrDash((r.httpMethod ?? "").toUpperCase()),
    "Người thực hiện": displayOrDash(r.actorUsername ?? r.createdBy),
    "Mã người dùng": displayOrDash(r.actorUserId),
    "Đường dẫn request": displayOrDash(r.requestPath),
    "Chi tiết": displayOrDash(r.detailJson),
  }));
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ActivityLogListClient({ logs }: Props) {
  const [logRows, setLogRows] = useState<WebActivityLog[]>(logs);
  const [q, setQ] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const qLower = q.trim().toLowerCase();
  const filtered = useMemo(() => logRows.filter((r) => matchesQuery(r, qLower, methodFilter)), [logRows, qLower, methodFilter]);
  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / normalizePageSize(pageSize)));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * normalizePageSize(pageSize);
  const pageRows = filtered.slice(start, start + normalizePageSize(pageSize));

  const selectedRows = useMemo(() => filtered.filter((r) => selectedIds.has(Number(r.id))), [filtered, selectedIds]);
  const hasSelections = selectedRows.length > 0;

  function onFilterChanged(next: { q?: string; method?: string; size?: number }) {
    if (next.q != null) setQ(next.q);
    if (next.method != null) setMethodFilter(next.method);
    if (next.size != null) setPageSize(normalizePageSize(next.size));
    setPage(1);
  }

  function toggleRow(id: number, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleSelectPage(checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const row of pageRows) {
        const id = Number(row.id);
        if (!Number.isFinite(id)) continue;
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  async function removeExportedRows(ids: number[]) {
    const normalized = Array.from(new Set(ids.filter((id) => Number.isFinite(id) && id > 0)));
    if (!normalized.length) return;
    const res = await fetch("/api/activity/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: normalized }),
    });
    if (!res.ok) {
      throw new Error("DELETE_FAILED");
    }
    setLogRows((prev) => prev.filter((row) => !normalized.includes(Number(row.id))));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of normalized) next.delete(id);
      return next;
    });
    setPage(1);
  }

  async function exportTxt() {
    if (!hasSelections) return;
    const exportedIds = selectedRows.map((r) => Number(r.id)).filter((id) => Number.isFinite(id) && id > 0);
    const lines = selectedRows.flatMap((r, i) => [
      `#${i + 1}`,
      `ID: ${r.id}`,
      `Thời gian: ${formatWebActivityTime(r.createdAt)}`,
      `Hành động: ${displayOrDash(r.action)}`,
      `Tài nguyên: ${displayOrDash(r.resourceType)}#${displayOrDash(r.resourceId)}`,
      `Phương thức: ${displayOrDash((r.httpMethod ?? "").toUpperCase())}`,
      `Người thực hiện: ${displayOrDash(r.actorUsername ?? r.createdBy)} (uid: ${displayOrDash(r.actorUserId)})`,
      `Đường dẫn: ${displayOrDash(r.requestPath)}`,
      `Chi tiết: ${displayOrDash(r.detailJson)}`,
      "",
    ]);
    triggerDownload(new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }), "nhat-ky-hoat-dong.txt");
    try {
      await removeExportedRows(exportedIds);
    } catch {
      alert("Xuất file thành công nhưng xóa log thất bại. Vui lòng thử lại.");
    }
  }

  async function exportExcel() {
    if (!hasSelections) return;
    const exportedIds = selectedRows.map((r) => Number(r.id)).filter((id) => Number.isFinite(id) && id > 0);
    const worksheet = XLSX.utils.json_to_sheet(toExportRows(selectedRows));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "NhatKyHoatDong");
    const data = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    triggerDownload(new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "nhat-ky-hoat-dong.xlsx");
    try {
      await removeExportedRows(exportedIds);
    } catch {
      alert("Xuất file thành công nhưng xóa log thất bại. Vui lòng thử lại.");
    }
  }

  async function exportPdf() {
    if (!hasSelections) return;
    const exportedIds = selectedRows.map((r) => Number(r.id)).filter((id) => Number.isFinite(id) && id > 0);
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    let y = 40;
    doc.setFontSize(14);
    doc.text("Xuat nhat ky hoat dong", 40, y);
    y += 24;
    doc.setFontSize(9);
    selectedRows.forEach((r, idx) => {
      const block = [
        `#${idx + 1} - ID ${r.id}`,
        `Thoi gian: ${formatWebActivityTime(r.createdAt)}`,
        `Hanh dong: ${displayOrDash(r.action)}`,
        `Tai nguyen: ${displayOrDash(r.resourceType)} #${displayOrDash(r.resourceId)}`,
        `Phuong thuc: ${displayOrDash((r.httpMethod ?? "").toUpperCase())}`,
        `Nguoi thuc hien: ${displayOrDash(r.actorUsername ?? r.createdBy)} (uid: ${displayOrDash(r.actorUserId)})`,
        `Duong dan: ${displayOrDash(r.requestPath)}`,
        `Chi tiet: ${displayOrDash(r.detailJson)}`,
      ];
      const wrapped = doc.splitTextToSize(block.join("\n"), 515);
      if (y + wrapped.length * 12 > 800) {
        doc.addPage();
        y = 40;
      }
      doc.text(wrapped, 40, y);
      y += wrapped.length * 12 + 10;
    });
doc.save("nhat-ky-hoat-dong.pdf");
    try {
      await removeExportedRows(exportedIds);
    } catch {
      alert("Xuất file thành công nhưng xóa log thất bại. Vui lòng thử lại.");
    }
  }

  const pageAllSelected = pageRows.length > 0 && pageRows.every((r) => selectedIds.has(Number(r.id)));

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-black/40 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-end">
          <div className="min-w-[260px] flex-1">
            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Tìm kiếm nâng cao</label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-cyan-400">search</span>
              <input
                value={q}
                onChange={(e) => onFilterChanged({ q: e.target.value })}
                placeholder="Action, user, resource, path..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-sm font-medium text-white outline-none transition-all focus:border-cyan-400/50 focus:bg-white/10 focus:ring-4 focus:ring-cyan-500/10 placeholder:text-slate-500"
              />
            </div>
          </div>
          <div className="w-full md:w-auto">
            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Giao thức HTTP</label>
            <div className="relative group">
              <select
                value={methodFilter}
                onChange={(e) => onFilterChanged({ method: e.target.value })}
                className="w-full appearance-none rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-5 pr-12 text-sm font-bold text-white outline-none transition-all focus:border-purple-400/50 focus:bg-white/10 focus:ring-4 focus:ring-purple-500/10 cursor-pointer"
              >
                <option value="all" className="bg-slate-900">Tất cả phương thức</option>
                <option value="GET" className="bg-slate-900">GET</option>
                <option value="POST" className="bg-slate-900">POST</option>
                <option value="PUT" className="bg-slate-900">PUT</option>
                <option value="PATCH" className="bg-slate-900">PATCH</option>
                <option value="DELETE" className="bg-slate-900">DELETE</option>
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-purple-400">expand_more</span>
            </div>
          </div>
          <div className="w-full md:w-auto">
            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Hiển thị</label>
            <div className="relative group">
              <select
                value={String(pageSize)}
                onChange={(e) => onFilterChanged({ size: Number(e.target.value) })}
                className="w-full appearance-none rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-5 pr-12 text-sm font-bold text-white outline-none transition-all focus:border-fuchsia-400/50 focus:bg-white/10 focus:ring-4 focus:ring-fuchsia-500/10 cursor-pointer"
              >
                <option value="10" className="bg-slate-900">10 dòng</option>
                <option value="20" className="bg-slate-900">20 dòng</option>
                <option value="50" className="bg-slate-900">50 dòng</option>
                <option value="100" className="bg-slate-900">100 dòng</option>
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-fuchsia-400">expand_more</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
            </span>
            <p className="text-xs text-slate-300">
              Tìm thấy <span className="font-black text-white">{totalFiltered}</span> kết quả · Đã chọn{" "}
              <span className="font-black text-cyan-400">{selectedRows.length}</span> mục
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={exportExcel}
              disabled={!hasSelections}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] hover:shadow-emerald-500/40 disabled:pointer-events-none disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[18px]">table_chart</span>
              Excel
            </button>
            <button
              type="button"
              onClick={exportTxt}
              disabled={!hasSelections}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-white/10 disabled:pointer-events-none disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[18px]">description</span>
              TXT
            </button>
            <button
              type="button"
              onClick={exportPdf}
              disabled={!hasSelections}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-rose-400 transition-all hover:bg-white/10 hover:text-rose-300 disabled:pointer-events-none disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              PDF
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 backdrop-blur-md">
                <th className="px-5 py-5 text-center">
                  <div className="inline-flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="peer sr-only"
                      checked={pageAllSelected} 
                      onChange={(e) => toggleSelectPage(e.target.checked)} 
                    />
                    <div className="flex h-5 w-5 cursor-pointer items-center justify-center rounded border-2 border-slate-500 bg-transparent transition-all peer-checked:border-cyan-500 peer-checked:bg-cyan-500">
                      <span className="material-symbols-outlined text-[14px] text-white opacity-0 transition-opacity peer-checked:opacity-100">check</span>
                    </div>
                  </div>
                </th>
                <th className="px-5 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Thời gian</th>
                <th className="px-5 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Hành động</th>
                <th className="px-5 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Tài nguyên</th>
                <th className="px-5 py-5 text-center text-xs font-black uppercase tracking-[0.2em] text-slate-400">HTTP</th>
                <th className="px-5 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Thực hiện bởi</th>
                <th className="px-5 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Chi tiết</th>
                <th className="px-5 py-5 text-right text-xs font-black uppercase tracking-[0.2em] text-slate-400">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pageRows.map((row) => (
                <tr key={row.id} className="group transition-colors hover:bg-white/5">
                  <td className="px-5 py-4 text-center">
                    <div className="inline-flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        className="peer sr-only"
                        checked={selectedIds.has(Number(row.id))}
                        onChange={(e) => toggleRow(Number(row.id), e.target.checked)}
                      />
                      <div className="flex h-5 w-5 cursor-pointer items-center justify-center rounded border-2 border-slate-600 bg-transparent transition-all peer-checked:border-cyan-500 peer-checked:bg-cyan-500 group-hover:border-slate-400">
                        <span className="material-symbols-outlined text-[14px] text-white opacity-0 transition-opacity peer-checked:opacity-100">check</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-[11px] text-slate-400 group-hover:text-cyan-300 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px] opacity-50">schedule</span>
                      {formatWebActivityTime(row.createdAt)}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-headline text-sm font-bold text-white drop-shadow-sm">{displayOrDash(row.action)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-200">{displayOrDash(row.resourceType)}</span>
                      <span className="mt-0.5 font-mono text-[10px] text-slate-500">#{displayOrDash(row.resourceId)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">{methodBadge(row.httpMethod)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-bold text-white shadow-md">
                        {(row.actorUsername ?? row.createdBy ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white">{row.actorUsername ?? row.createdBy ?? "—"}</span>
                        {row.actorUserId != null && row.actorUserId !== "" && (
                          <span className="font-mono text-[10px] text-slate-400">UID: {row.actorUserId}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col max-w-[250px]">
                      <span className="truncate text-xs font-medium text-slate-300" title={row.detailJson ?? undefined}>
                        {detailPreview(row.detailJson)}
                      </span>
                      {row.requestPath != null && row.requestPath !== "" && (
                        <span className="mt-1 truncate font-mono text-[10px] text-purple-400" title={row.requestPath}>
                          {row.requestPath}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link 
                      href={`/admin/activity-log/${row.id}`} 
                      className="inline-flex items-center justify-center rounded-xl bg-white/5 p-2 text-slate-400 transition-all hover:scale-110 hover:bg-cyan-500 hover:text-white hover:shadow-lg hover:shadow-cyan-500/30" 
                      title="Xem chi tiết"
                    >
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 bg-white/5 px-6 py-4 backdrop-blur-md sm:flex-row">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Trang <span className="rounded-md bg-white/10 px-2 py-1 text-white mx-1">{safePage}</span> / {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="flex items-center gap-1 rounded-xl bg-white/5 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-white/10 disabled:pointer-events-none disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              Trước
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="flex items-center gap-1 rounded-xl bg-white/5 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-white/10 disabled:pointer-events-none disabled:opacity-40"
            >
              Sau
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
