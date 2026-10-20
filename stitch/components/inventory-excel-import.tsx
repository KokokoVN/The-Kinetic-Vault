"use client";

import { useState, useRef, useMemo } from "react";
import {
  downloadInventoryTemplate,
  previewInventoryExcel,
  confirmInventoryExcel,
  type ExcelRowDto,
} from "@/lib/inventory-api";
import { downloadSelectiveInventoryTemplate, apiUrl } from "@/lib/api";
import { parseVariantTiers } from "@/lib/variant-tier-utils";

export function InventoryExcelImport({
  accessToken,
  username,
  products = [],
}: {
  accessToken: string;
  username: string;
  products?: { id: number; name: string; sku?: string; heroImage?: string }[];
}) {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<ExcelRowDto[]>([]);
  const [step, setStep] = useState<1 | 2>(1); // 1 = Upload, 2 = Preview/Edit
  const [result, setResult] = useState<{ successCount: number; errors: string[] } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"export" | "import">("export");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [selectedVariantIds, setSelectedVariantIds] = useState<number[]>([]);
  const [productVariantsMap, setProductVariantsMap] = useState<Record<number, any[]>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        p.id.toString().includes(q)
    );
  }, [products, searchQuery]);

  const isProductFullySelected = (p: { id: number }) => {
    const variants = productVariantsMap[p.id] || [];
    if (variants.length === 0) return selectedProductIds.includes(p.id);
    return variants.every((v) => selectedVariantIds.includes(v.id));
  };

  const isProductPartiallySelected = (p: { id: number }) => {
    const variants = productVariantsMap[p.id] || [];
    if (variants.length === 0) return false;
    const selectedCount = variants.filter((v) => selectedVariantIds.includes(v.id)).length;
    return selectedCount > 0 && selectedCount < variants.length;
  };

  const toggleProductSelection = async (p: { id: number }) => {
    if (isProductFullySelected(p)) {
      setSelectedProductIds((prev) => prev.filter((id) => id !== p.id));
      const variants = productVariantsMap[p.id] || [];
      setSelectedVariantIds((prev) => prev.filter((vId) => !variants.some((v) => v.id === vId)));
    } else {
      setSelectedProductIds((prev) => [...new Set([...prev, p.id])]);
      if (!productVariantsMap[p.id]) {
        await fetchVariants(p.id);
      }
      const variants = productVariantsMap[p.id] || [];
      setSelectedVariantIds((prev) => [...new Set([...prev, ...variants.map((v) => v.id)])]);
    }
  };

  const toggleVariantSelection = (productId: number, variantId: number) => {
    if (selectedVariantIds.includes(variantId)) {
      setSelectedVariantIds((prev) => prev.filter((id) => id !== variantId));
      setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
    } else {
      setSelectedVariantIds((prev) => [...prev, variantId]);
      if (!selectedProductIds.includes(productId)) {
        setSelectedProductIds((prev) => [...prev, productId]);
      }
    }
  };

  const fetchVariants = async (productId: number) => {
    if (productVariantsMap[productId]) return;
    try {
      const res = await fetch(apiUrl(`/catalog/products/${productId}/variants`), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProductVariantsMap((prev) => ({ ...prev, [productId]: data }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectAll = async () => {
    const allIds = filteredProducts.map((p) => p.id);
    setSelectedProductIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedProductIds([]);
    setSelectedVariantIds([]);
  };

  const handleDownloadSelectiveTemplate = async () => {
    if (selectedProductIds.length === 0) {
      alert("Vui lòng chọn ít nhất 1 sản phẩm để xuất file mẫu.");
      return;
    }
    setLoading(true);
    try {
      const blob = await downloadSelectiveInventoryTemplate(
        { productIds: selectedProductIds, variantIds: selectedVariantIds },
        { accessToken }
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Inventory_Template_Selected.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e.message || "Lỗi khi tải file");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadInventoryTemplate({ accessToken });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Inventory_Template_Blank.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e.message || "Lỗi khi tải file mẫu");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const previewData = await previewInventoryExcel(file, { accessToken, username });
      setRows(previewData);
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi khi đọc file Excel. Vui lòng kiểm tra lại cấu trúc file.");
    } finally {
      setLoading(false);
    }
  };

  const handleRowChange = (index: number, field: keyof ExcelRowDto, value: any) => {
    const newRows = [...rows];
    let updatedRow = { ...newRows[index], [field]: value };

    // Auto validate field changes
    let errors = updatedRow.errorMessages ? [...updatedRow.errorMessages] : [];

    if (field === "quantity") {
      if (Number(value) > 0) {
        errors = errors.filter((e) => !e.toLowerCase().includes("số lượng"));
      } else if (!errors.some((e) => e.toLowerCase().includes("số lượng"))) {
        errors.push("Số lượng phải lớn hơn 0");
      }
    }

    if (field === "unitCost") {
      if (Number(value) >= 0) {
        errors = errors.filter((e) => !e.toLowerCase().includes("giá") && !e.toLowerCase().includes("âm"));
      } else if (!errors.some((e) => e.toLowerCase().includes("giá") || e.toLowerCase().includes("âm"))) {
        errors.push("Giá nhập không được âm");
      }
    }

    updatedRow.errorMessages = errors;
    updatedRow.valid = errors.length === 0;

    newRows[index] = updatedRow;
    setRows(newRows);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await confirmInventoryExcel(rows, { accessToken, username });
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi khi xác nhận lưu dữ liệu kho.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueFixing = () => {
    if (result && result.errors && result.errors.length > 0) {
      const failedRowIds = result.errors
        .map((e: string) => {
          const match = e.match(/Dòng (\d+)/i);
          return match ? parseInt(match[1]) : -1;
        })
        .filter((id: number) => id > 0);

      if (failedRowIds.length > 0) {
        setRows(rows.filter((r: any) => failedRowIds.includes(r.rowId)));
      }
    }
    setResult(null);
  };

  const handleCancel = () => {
    setStep(1);
    setRows([]);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validRowsCount = rows.filter((r) => r.valid).length;
  const invalidRowsCount = rows.length - validRowsCount;

  return (
    <div className="relative w-full space-y-8 rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-zinc-950/80 p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-2xl transition-colors">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/10 dark:bg-blue-500/15 blur-3xl" />

      {/* Header & Mode Switcher */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <span className="material-symbols-outlined text-[20px]">table_view</span>
            </span>
            <h2 className="font-headline text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Nhập & Xuất Kho Qua Excel
            </h2>
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
            Tải file mẫu có sẵn dữ liệu sản phẩm, chỉnh sửa số lượng và nhập hàng loạt vào kho chỉ với 1 click.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-white/5 p-1 backdrop-blur-md">
          <button
            onClick={() => setActiveTab("export")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black transition-all ${
              activeTab === "export"
                ? "bg-white text-blue-600 shadow-md dark:bg-zinc-800 dark:text-blue-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">cloud_download</span>
            Xuất File Mẫu
          </button>
          <button
            onClick={() => setActiveTab("import")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black transition-all ${
              activeTab === "import"
                ? "bg-white text-emerald-600 shadow-md dark:bg-zinc-800 dark:text-emerald-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
            Nhập File Excel
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: XUẤT FILE MẪU EXCEL (EXPORT TEMPLATE)                              */}
      {/* ========================================================================= */}
      {activeTab === "export" && (
        <div className="animate-in fade-in space-y-6">
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 p-6 sm:p-8 shadow-sm backdrop-blur-xl space-y-5">
            {/* Description & Selection Counter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[20px]">checklist</span>
                  Chọn sản phẩm xuất Template
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Chọn các sản phẩm cần nhập kho để xuất file Excel đã điền sẵn mã ID, tên và phân loại biến thể.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/50 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300">
                  Đã chọn: <strong>{selectedProductIds.length}</strong> sản phẩm ({selectedVariantIds.length} biến thể)
                </span>
              </div>
            </div>

            {/* Search & Selection Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="relative flex-1 max-w-md">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-blue-500/15"
                  placeholder="Tìm theo tên sản phẩm hoặc mã SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  Chọn tất cả ({filteredProducts.length})
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  disabled={selectedProductIds.length === 0}
                  className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-40"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>

            {/* Products Selection List */}
            <div className="max-h-[380px] overflow-y-auto rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-950 p-2 space-y-1.5">
              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <span className="material-symbols-outlined text-3xl mb-1 opacity-50">search_off</span>
                  <p className="text-xs font-bold">Không tìm thấy sản phẩm phù hợp</p>
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const isAllSelected = isProductFullySelected(p);
                  const someSelected = isProductPartiallySelected(p);

                  return (
                    <div
                      key={p.id}
                      className="rounded-xl border border-slate-100 dark:border-white/5 p-3 hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = someSelected && !isAllSelected;
                          }}
                          onChange={() => toggleProductSelection(p)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                          {p.heroImage ? (
                            <img src={p.heroImage} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-slate-400 text-base">image</span>
                          )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{p.name}</h4>
                          <p className="text-[10px] font-semibold text-slate-400">
                            #{p.id} {p.sku ? `· SKU: ${p.sku}` : ""}
                          </p>
                        </div>

                        {/* Expand variants button */}
                        <button
                          type="button"
                          onClick={async () => {
                            if (!productVariantsMap[p.id]) await fetchVariants(p.id);
                          }}
                          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          {productVariantsMap[p.id] ? "Biến thể" : "Xem biến thể"}
                        </button>
                      </div>

                      {/* Expanded Variants */}
                      {productVariantsMap[p.id]?.length > 0 && (
                        <div className="mt-2.5 pl-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
                          {productVariantsMap[p.id].map((v) => {
                            const parsed = parseVariantTiers(v);
                            return (
                              <label
                                key={v.id}
                                className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-xs transition-colors ${
                                  selectedVariantIds.includes(v.id)
                                    ? "border-blue-300 bg-blue-50/70 text-blue-900 dark:bg-blue-950/40 dark:border-blue-700 dark:text-blue-300"
                                    : "border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-slate-600 dark:text-slate-400"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedVariantIds.includes(v.id)}
                                  onChange={() => toggleVariantSelection(p.id, v.id)}
                                  className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
                                />
                                <div className="flex flex-wrap items-center gap-1 overflow-hidden">
                                  {parsed.tiers.length > 0 ? (
                                    parsed.tiers.map((t, tIdx) => (
                                      <span key={tIdx} className="inline-flex items-center gap-0.5 rounded bg-blue-100/70 dark:bg-blue-900/40 px-1.5 py-0.5 text-[10px] font-bold text-blue-800 dark:text-blue-200">
                                        <span className="text-slate-400 font-normal">{t.name}:</span>
                                        <span>{t.value}</span>
                                      </span>
                                    ))
                                  ) : (
                                    <span className="truncate font-semibold">{parsed.fullLabel}</span>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100 dark:border-white/5 pt-5">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-5 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Tải file trống (chỉ tiêu đề)
              </button>

              <button
                type="button"
                onClick={handleDownloadSelectiveTemplate}
                disabled={selectedProductIds.length === 0 || loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-xs font-black text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className={`material-symbols-outlined text-[18px] ${loading ? "animate-spin" : ""}`}>
                  {loading ? "sync" : "cloud_download"}
                </span>
                {loading ? "Đang tạo file Excel..." : `Tải file có sẵn (${selectedProductIds.length} sản phẩm)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: NHẬP FILE EXCEL (IMPORT EXCEL) - BƯỚC 1: KÉO THẢ FILE                */}
      {/* ========================================================================= */}
      {activeTab === "import" && step === 1 && (
        <div className="animate-in fade-in flex flex-col items-center justify-center py-6">
          {errorMsg && (
            <div className="w-full max-w-2xl mb-6 flex items-center gap-2 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/90 dark:bg-rose-950/40 p-4 text-xs font-bold text-rose-700 dark:text-rose-400 shadow-sm">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="group relative flex w-full max-w-2xl min-h-[360px] flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-emerald-400/50 bg-gradient-to-b from-emerald-50/50 to-teal-50/20 dark:from-emerald-950/20 dark:to-zinc-950/40 p-8 sm:p-12 text-center backdrop-blur-xl transition-all hover:border-emerald-500 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30 hover:shadow-xl hover:shadow-emerald-900/10">
            <input
              type="file"
              accept=".xlsx, .xls"
              className="absolute inset-0 z-10 cursor-pointer opacity-0"
              onChange={handleFileChange}
              disabled={loading}
              ref={fileInputRef}
            />

            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/25 group-hover:scale-110 transition-transform mb-6 ring-8 ring-emerald-50 dark:ring-emerald-950/30">
              <span className={`material-symbols-outlined text-[36px] ${loading ? "animate-spin" : ""}`}>
                {loading ? "progress_activity" : "cloud_upload"}
              </span>
            </div>

            <h3 className="font-headline text-2xl font-black text-slate-900 dark:text-white">
              Kéo thả file Excel vào đây
            </h3>
            <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400 max-w-sm">
              Hỗ trợ định dạng <strong>.xlsx</strong> hoặc <strong>.xls</strong>. Hệ thống sẽ tự động đọc dữ liệu và kiểm tra tính hợp lệ trước khi lưu.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-7 py-3.5 text-xs font-black text-white shadow-lg shadow-emerald-500/25 transition-all group-hover:scale-105">
              <span className="material-symbols-outlined text-[18px]">folder_open</span>
              <span>{loading ? "Đang xử lý file..." : "Chọn file từ máy tính"}</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BƯỚC 2: XEM TRƯỚC VÀ CHỈNH SỬA DỮ LIỆU FILE                         */}
      {/* ========================================================================= */}
      {activeTab === "import" && step === 2 && (
        <div className="animate-in slide-in-from-bottom-3 space-y-6">
          {/* Preview Stats Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-headline text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 text-[22px]">preview</span>
                Xem trước & Kiểm tra dữ liệu
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Bạn có thể sửa trực tiếp số lượng, đơn giá và ghi chú ngay trên bảng trước khi bấm Lưu.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 dark:bg-white/10 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                Tổng cộng: <strong>{rows.length}</strong> dòng
              </span>
              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                Hợp lệ: <strong>{validRowsCount}</strong>
              </span>
              {invalidRowsCount > 0 && (
                <span className="rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 px-3 py-1 text-xs font-bold text-rose-700 dark:text-rose-400 animate-pulse">
                  Có lỗi: <strong>{invalidRowsCount}</strong>
                </span>
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/90 dark:bg-rose-950/40 p-4 text-xs font-bold text-rose-700 dark:text-rose-400">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Table Container */}
          <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/90 shadow-sm backdrop-blur-2xl">
            <div className="max-h-[500px] overflow-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 z-10 bg-slate-100/90 dark:bg-zinc-900/90 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 backdrop-blur-md border-b border-slate-200 dark:border-white/5">
                  <tr>
                    <th className="px-4 py-3.5 text-center">STT</th>
                    <th className="px-4 py-3.5">Mã SP</th>
                    <th className="px-4 py-3.5 min-w-[200px]">Tên Sản phẩm</th>
                    <th className="px-4 py-3.5">Mã BT</th>
                    <th className="px-4 py-3.5 min-w-[180px]">Phân loại biến thể</th>
                    <th className="px-4 py-3.5 min-w-[110px]">Số lượng</th>
                    <th className="px-4 py-3.5 min-w-[140px]">Đơn giá vốn</th>
                    <th className="px-4 py-3.5 min-w-[160px]">Ghi chú</th>
                    <th className="px-4 py-3.5 min-w-[110px]">Loại GD</th>
                    <th className="px-4 py-3.5 min-w-[160px]">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {rows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`transition-colors ${
                        row.valid
                          ? "hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20"
                          : "bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-50/80 dark:hover:bg-rose-950/30"
                      }`}
                    >
                      <td className="px-4 py-3 text-center font-black text-slate-400">{row.rowId}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-lg bg-slate-100 dark:bg-white/5 px-2 py-1 font-bold text-slate-600 dark:text-slate-300">
                          #{row.productId}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white line-clamp-2">
                        {row.productName || <span className="text-slate-400 italic font-normal">Chưa xác định</span>}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-500">
                        {row.variantId ? `#${row.variantId}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {row.variantAttributes || "Toàn bộ SP"}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={1}
                          className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs font-black text-indigo-600 dark:text-indigo-400 outline-none focus:border-indigo-500"
                          value={row.quantity ?? ""}
                          onChange={(e) => handleRowChange(idx, "quantity", Number(e.target.value))}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          step={1000}
                          className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                          value={row.unitCost ?? ""}
                          onChange={(e) => handleRowChange(idx, "unitCost", Number(e.target.value))}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          placeholder="Ghi chú..."
                          className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500"
                          value={row.note || ""}
                          onChange={(e) => handleRowChange(idx, "note", e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                          value={row.type || "INBOUND"}
                          onChange={(e) => handleRowChange(idx, "type", e.target.value)}
                        >
                          <option value="INBOUND">Nhập kho</option>
                          <option value="OUTBOUND">Xuất kho</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        {row.valid ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                            <span className="material-symbols-outlined text-[13px]">check_circle</span>
                            Hợp lệ
                          </span>
                        ) : (
                          <div className="text-rose-600 dark:text-rose-400 font-semibold text-[11px] leading-snug">
                            {row.errorMessages?.join(", ") || "Lỗi dữ liệu"}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Footer */}
          {!result && (
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-white/5 pt-5">
              <button
                type="button"
                onClick={handleCancel}
                className="w-full sm:w-auto rounded-2xl px-6 py-3 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Hủy bỏ & Chọn file khác
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading || invalidRowsCount > 0}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3.5 text-xs font-black text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className={`material-symbols-outlined text-[18px] ${loading ? "animate-spin" : ""}`}>
                  {loading ? "sync" : "verified"}
                </span>
                {loading ? "Đang lưu vào kho..." : `Xác nhận Lưu (${rows.length} dòng)`}
              </button>
            </div>
          )}

          {/* Result Card */}
          {result && (
            <div className="rounded-3xl border border-blue-200/80 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/70 to-indigo-50/30 dark:from-blue-950/30 dark:to-zinc-900/60 p-8 text-center space-y-4 shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
                <span className="material-symbols-outlined text-[28px]">task_alt</span>
              </div>
              <h3 className="font-headline text-2xl font-black text-slate-900 dark:text-white">
                Kết quả xử lý Import
              </h3>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Đã xử lý thành công <strong className="text-emerald-600 text-sm">{result.successCount}</strong> dòng.
                {result.errors.length > 0 && (
                  <span className="text-rose-600">
                    {" "}
                    (Thất bại <strong className="text-sm">{result.errors.length}</strong> dòng)
                  </span>
                )}
              </p>

              {result.errors.length > 0 && (
                <div className="mx-auto max-w-xl rounded-2xl bg-rose-50 dark:bg-rose-950/40 p-4 text-left border border-rose-200/80 dark:border-rose-900/50 max-h-40 overflow-y-auto">
                  <p className="font-bold text-xs text-rose-700 dark:text-rose-400 mb-1.5">Chi tiết lỗi từ máy chủ:</p>
                  <ul className="list-disc pl-5 text-xs text-rose-600 dark:text-rose-300 space-y-0.5">
                    {result.errors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-800 px-6 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  Hoàn tất & Đóng
                </button>
                {result.errors.length > 0 && (
                  <button
                    type="button"
                    onClick={handleContinueFixing}
                    className="rounded-2xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700"
                  >
                    Tiếp tục sửa các dòng lỗi
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
