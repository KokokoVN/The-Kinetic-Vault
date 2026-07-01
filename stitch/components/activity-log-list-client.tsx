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
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end">
          <div className="min-w-[220px] flex-1">
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tìm kiếm</label>
            <input
              value={q}
              onChange={(e) => onFilterChanged({ q: e.target.value })}
              placeholder="Action, user, resource, path, detail..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">HTTP</label>
            <select
              value={methodFilter}
              onChange={(e) => onFilterChanged({ method: e.target.value })}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="all">Tất cả</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Dòng / trang</label>
            <select
              value={String(pageSize)}
              onChange={(e) => onFilterChanged({ size: Number(e.target.value) })}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <p className="text-slate-500 dark:text-slate-400">
            Kết quả: <span className="font-bold text-slate-900 dark:text-white">{totalFiltered}</span> bản ghi · đã chọn{" "}
            <span className="font-bold text-slate-900 dark:text-white">{selectedRows.length}</span> dòng để xuất
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportExcel}
              disabled={!hasSelections}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              Xuất Excel
            </button>
            <button
              type="button"
              onClick={exportTxt}
              disabled={!hasSelections}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              Xuất TXT
            </button>
            <button
              type="button"
              onClick={exportPdf}
              disabled={!hasSelections}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              Xuất PDF
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/70">
                <th className="border-b border-slate-200 px-4 py-4 text-center dark:border-slate-700">
                  <input type="checkbox" checked={pageAllSelected} onChange={(e) => toggleSelectPage(e.target.checked)} aria-label="Chọn tất cả dòng trong trang" />
                </th>
                <th className="border-b border-slate-200 px-6 py-5 text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:border-slate-700 dark:text-slate-400">Thời gian</th>
                <th className="border-b border-slate-200 px-6 py-5 text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:border-slate-700 dark:text-slate-400">Hành động</th>
                <th className="border-b border-slate-200 px-6 py-5 text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:border-slate-700 dark:text-slate-400">Tài nguyên</th>
                <th className="border-b border-slate-200 px-6 py-5 text-center text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:border-slate-700 dark:text-slate-400">HTTP</th>
                <th className="border-b border-slate-200 px-6 py-5 text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:border-slate-700 dark:text-slate-400">Người thực hiện</th>
                <th className="border-b border-slate-200 px-6 py-5 text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:border-slate-700 dark:text-slate-400">Chi tiết</th>
                <th className="border-b border-slate-200 px-6 py-5 text-right text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:border-slate-700 dark:text-slate-400">Xem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pageRows.map((row) => (
                <tr key={row.id} className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <td className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(Number(row.id))}
                      onChange={(e) => toggleRow(Number(row.id), e.target.checked)}
                      aria-label={`Chọn log ${row.id}`}
                    />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-300">{formatWebActivityTime(row.createdAt)}</td>
                  <td className="px-6 py-4">
                    <span className="font-headline text-sm font-bold text-slate-900 dark:text-white">{displayOrDash(row.action)}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="font-medium text-slate-800 dark:text-slate-100">{displayOrDash(row.resourceType)}</span>
                    <span className="mt-0.5 block font-mono text-xs text-slate-500 dark:text-slate-400">#{displayOrDash(row.resourceId)}</span>
                  </td>
                  <td className="px-6 py-4 text-center">{methodBadge(row.httpMethod)}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium text-slate-900 dark:text-white">{row.actorUsername ?? row.createdBy ?? "—"}</div>
                    {row.actorUserId != null && row.actorUserId !== "" && (
                      <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400">uid {row.actorUserId}</div>
                    )}
                  </td>
                  <td className="max-w-md px-6 py-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    <div className="line-clamp-2 break-words" title={row.detailJson ?? undefined}>
                      {detailPreview(row.detailJson)}
                    </div>
                    {row.requestPath != null && row.requestPath !== "" && (
                      <div className="mt-1 truncate font-mono text-[10px] text-slate-500 dark:text-slate-400" title={row.requestPath}>
                        {row.requestPath}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/activity-log/${row.id}`} className="inline-flex rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-700 dark:hover:bg-slate-800 dark:hover:text-blue-300" title="Chi tiết log">
                      <span className="material-symbols-outlined text-lg">open_in_new</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/40 sm:flex-row">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Trang <span className="font-bold text-slate-900 dark:text-white">{safePage}</span> / {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              Trước
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              Sau
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
