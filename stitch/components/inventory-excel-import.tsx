"use client";

import { useState, useRef } from "react";
import { downloadInventoryTemplate, previewInventoryExcel, confirmInventoryExcel, type ExcelRowDto } from "@/lib/inventory-api";
import { downloadSelectiveInventoryTemplate, apiUrl } from "@/lib/api";

export function InventoryExcelImport({ 
  accessToken, 
  username, 
  products = [] 
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
  const [expandedProductIds, setExpandedProductIds] = useState<number[]>([]);
  const [productVariantsMap, setProductVariantsMap] = useState<Record<number, any[]>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
    p.id.toString().includes(searchQuery)
  );

  const isProductFullySelected = (p: { id: number }) => {
    const variants = productVariantsMap[p.id] || [];
    if (variants.length === 0) return selectedProductIds.includes(p.id);
    return variants.every(v => selectedVariantIds.includes(v.id));
  };

  const isProductPartiallySelected = (p: { id: number }) => {
    const variants = productVariantsMap[p.id] || [];
    if (variants.length === 0) return false;
    const selectedCount = variants.filter(v => selectedVariantIds.includes(v.id)).length;
    return selectedCount > 0 && selectedCount < variants.length;
  };

  const toggleProductSelection = async (p: { id: number }) => {
    if (isProductFullySelected(p)) {
      setSelectedProductIds(prev => prev.filter(id => id !== p.id));
      const variants = productVariantsMap[p.id] || [];
      setSelectedVariantIds(prev => prev.filter(vId => !variants.some(v => v.id === vId)));
    } else {
      setSelectedProductIds(prev => [...new Set([...prev, p.id])]);
      if (!productVariantsMap[p.id]) {
        await fetchVariants(p.id);
      }
      const variants = productVariantsMap[p.id] || [];
      setSelectedVariantIds(prev => [...new Set([...prev, ...variants.map(v => v.id)])]);
    }
  };

  const toggleVariantSelection = (productId: number, variantId: number) => {
    if (selectedVariantIds.includes(variantId)) {
      setSelectedVariantIds(prev => prev.filter(id => id !== variantId));
      setSelectedProductIds(prev => prev.filter(id => id !== productId));
    } else {
      setSelectedVariantIds(prev => [...prev, variantId]);
      if (!selectedProductIds.includes(productId)) {
        setSelectedProductIds(prev => [...prev, productId]);
      }
    }
  };

  const fetchVariants = async (productId: number) => {
    if (productVariantsMap[productId]) return;
    try {
      const res = await fetch(apiUrl(`/catalog/products/${productId}/variants`), {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProductVariantsMap(prev => ({ ...prev, [productId]: data }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadSelectiveTemplate = async () => {
    if (selectedProductIds.length === 0) {
      alert("Vui lòng chọn ít nhất 1 sản phẩm.");
      return;
    }
    setLoading(true);
    try {
      const blob = await downloadSelectiveInventoryTemplate({ productIds: selectedProductIds, variantIds: selectedVariantIds }, { accessToken });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Inventory_Template_Selected.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e.message || "Lỗi tải file");
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
      a.download = "Inventory_Template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e.message || "Lỗi tải file");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const previewData = await previewInventoryExcel(file, { accessToken, username });
      setRows(previewData);
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi upload");
    } finally {
      setLoading(false);
    }
  };

  const handleRowChange = (index: number, field: keyof ExcelRowDto, value: any) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRows(newRows);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await confirmInventoryExcel(rows, { accessToken, username });
      setResult(res);
      // We do not reset step or rows here so the user can see the result.
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi xác nhận");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setStep(1);
    setRows([]);
    setResult(null);
  };

  return (
    <div className="relative w-full space-y-12 rounded-[3rem] border border-white/50 bg-gradient-to-br from-slate-50/90 via-white/80 to-slate-100/90 p-12 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] backdrop-blur-3xl min-h-[85vh]">
      <div className="flex items-center justify-between border-b border-slate-200/50 pb-8">
        <div>
          <h2 className="text-4xl font-black text-slate-800">Quản Lý Nhập/Xuất Excel</h2>
        </div>
        <div className="flex rounded-2xl bg-slate-200/50 p-1.5">
          <button onClick={() => setActiveTab("export")} className={`px-6 py-3 font-bold rounded-xl ${activeTab === "export" ? "bg-white text-blue-600 shadow" : "text-slate-500"}`}>Xuất File</button>
          <button onClick={() => setActiveTab("import")} className={`px-6 py-3 font-bold rounded-xl ${activeTab === "import" ? "bg-white text-emerald-600 shadow" : "text-slate-500"}`}>Nhập File</button>
        </div>
      </div>

      {activeTab === "export" && (
        <div className="animate-in fade-in space-y-8">
          <div className="rounded-3xl bg-white/70 p-8 shadow-xl shadow-slate-200/50 border border-white/60 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-blue-500 text-3xl">list_alt</span>
              <h3 className="text-xl font-bold text-slate-800">Chọn Sản phẩm xuất Template</h3>
            </div>
            <p className="mb-6 text-sm text-slate-500">
              Chọn các sản phẩm cụ thể để tải xuống file Excel chứa sẵn thông tin. Bạn có thể chọn toàn bộ sản phẩm hoặc chỉ chọn một số biến thể nhất định.
            </p>
            
            <div className="relative mb-6">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                type="text"
                className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm font-medium transition-all focus:border-blue-500 focus:bg-white focus:outline-none"
                placeholder="Tìm kiếm theo tên sản phẩm hoặc SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="max-h-[400px] overflow-y-auto rounded-2xl border-2 border-slate-100 bg-white">
              {filteredProducts.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-medium">Không tìm thấy sản phẩm nào.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const isAllSelected = isProductFullySelected(p);
                    const someSelected = isProductPartiallySelected(p);
                    return (
                      <div key={p.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            ref={(el) => {
                              if (el) el.indeterminate = someSelected && !isAllSelected;
                            }}
                            onChange={() => toggleProductSelection(p)}
                            className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                            {p.heroImage ? (
                              <img src={p.heroImage} alt={p.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="material-symbols-outlined text-slate-400">image</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800 line-clamp-1">{p.name}</h4>
                            <p className="text-xs text-slate-500 font-medium">SKU: {p.sku || 'N/A'}</p>
                          </div>
                        </div>

                        {productVariantsMap[p.id]?.length > 0 && (
                          <div className="mt-3 pl-14 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {productVariantsMap[p.id].map((v) => (
                              <label key={v.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2 hover:border-blue-300 hover:bg-blue-50/50 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={selectedVariantIds.includes(v.id)}
                                  onChange={() => toggleVariantSelection(p.id, v.id)}
                                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div className="flex-1 text-sm">
                                  <span className="font-semibold text-slate-700">Màu: {v.color || "N/A"}</span>
                                  <span className="mx-2 text-slate-300">|</span>
                                  <span className="font-semibold text-slate-700">Size: {v.size || "N/A"}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="mt-8 flex justify-end gap-4 border-t border-slate-100 pt-6">
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2 rounded-xl bg-slate-200 px-6 py-3 font-bold text-slate-700 transition-all hover:bg-slate-300"
              >
                <span className="material-symbols-outlined">download</span>
                Tải File Trống (Chỉ Header)
              </button>
              <button
                onClick={handleDownloadSelectiveTemplate}
                disabled={(selectedProductIds.length === 0 && selectedVariantIds.length === 0) || loading}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className="material-symbols-outlined">{loading ? "sync" : "cloud_download"}</span>
                {loading ? "Đang tải..." : "Tải File (Có dữ liệu)"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "import" && step === 1 && (
        <div className="animate-in fade-in flex flex-col items-center justify-center">
          <div className="group relative flex w-full max-w-3xl min-h-[400px] flex-col items-center justify-center rounded-[3rem] border-4 border-dashed border-emerald-300/60 bg-emerald-50/30 p-12 text-center backdrop-blur-lg transition-all hover:-translate-y-2 hover:border-emerald-400 hover:bg-emerald-50/80 hover:shadow-2xl hover:shadow-emerald-200/50 md:p-16">
            <input
              type="file"
              accept=".xlsx, .xls"
              className="absolute inset-0 z-10 cursor-pointer opacity-0"
              onChange={handleFileChange}
              disabled={loading}
              ref={fileInputRef}
            />
            <span className="material-symbols-outlined mb-8 text-[7rem] text-emerald-500 transition-transform group-hover:scale-110 drop-shadow-md">
              {loading ? "sync" : "cloud_upload"}
            </span>
            <h3 className="mb-4 text-3xl font-black text-slate-800">Kéo Thả File Excel</h3>
            <p className="mb-10 text-lg text-slate-500 max-w-sm mx-auto">Kéo thả file vào đây hoặc bấm để chọn file từ thiết bị của bạn.</p>
            <div className="inline-flex items-center gap-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-10 py-5 text-xl font-bold text-white shadow-xl shadow-emerald-500/30 transition-all group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:scale-105">
              <span className="material-symbols-outlined text-[28px]">{loading ? "hourglass_empty" : "upload_file"}</span>
              {loading ? "Đang xử lý..." : "Chọn File Import"}
            </div>
          </div>
        </div>
      )}

      {activeTab === "import" && step === 2 && (
        <div className="animate-in slide-in-from-bottom-4 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Dữ liệu xem trước (Preview)</h3>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
              Tổng số: {rows.length} dòng
            </span>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-2xl shadow-slate-200/50 backdrop-blur-2xl">
            <div className="max-h-[600px] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-slate-100/90 text-xs uppercase text-slate-500 backdrop-blur-md">
                  <tr>
                    <th className="px-5 py-4 font-bold tracking-wide text-slate-600">Dòng</th>
                    <th className="px-5 py-4 font-bold tracking-wide text-slate-600">Mã SP</th>
                    <th className="px-5 py-4 font-bold tracking-wide text-slate-600 min-w-[200px]">Tên SP</th>
                    <th className="px-5 py-4 font-bold tracking-wide text-slate-600">Mã BT</th>
                    <th className="px-5 py-4 font-bold tracking-wide text-slate-600 min-w-[250px]">Thuộc tính BT</th>
                    <th className="px-5 py-4 font-bold tracking-wide text-slate-600">Số lượng</th>
                    <th className="px-5 py-4 font-bold tracking-wide text-slate-600 min-w-[150px]">Giá nhập</th>
                    <th className="px-5 py-4 font-bold tracking-wide text-slate-600 min-w-[200px]">Ghi chú</th>
                    <th className="px-5 py-4 font-bold tracking-wide text-slate-600">Loại GD</th>
                    <th className="px-5 py-4 font-bold tracking-wide text-slate-600 min-w-[200px]">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50">
                  {rows.map((row, idx) => (
                    <tr key={idx} className={row.valid ? "bg-emerald-50/20 transition-colors hover:bg-emerald-50/60" : "bg-red-50/30 transition-colors hover:bg-red-50/80"}>
                      <td className="px-5 py-4 font-black text-slate-500">{row.rowId}</td>
                      <td className="px-5 py-4">
                        <input
                          type="number"
                          className={`w-full min-w-[100px] rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm transition-all focus:ring-4 ${row.productId ? 'border-slate-100 bg-slate-50 text-slate-500 focus:border-slate-200 focus:ring-0 cursor-not-allowed' : 'border-slate-200/80 bg-white text-slate-700 focus:border-blue-500 focus:ring-blue-500/20'}`}
                          value={row.productId ?? ""}
                          onChange={(e) => handleRowChange(idx, "productId", Number(e.target.value))}
                          readOnly={!!row.productId}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-bold text-slate-800 line-clamp-2">
                          {row.productName || <span className="text-slate-400 italic font-medium">Không có tên</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <input
                          type="number"
                          className={`w-full min-w-[100px] rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm transition-all focus:ring-4 ${row.variantId ? 'border-slate-100 bg-slate-50 text-slate-500 focus:border-slate-200 focus:ring-0 cursor-not-allowed' : 'border-slate-200/80 bg-white text-slate-700 focus:border-blue-500 focus:ring-blue-500/20'}`}
                          value={row.variantId ?? ""}
                          onChange={(e) => handleRowChange(idx, "variantId", Number(e.target.value))}
                          readOnly={!!row.variantId}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-medium text-slate-600 line-clamp-2">
                          {row.variantAttributes || <span className="text-slate-400 italic">N/A</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <input
                          type="number"
                          className="w-full w-24 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm font-bold text-blue-700 shadow-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                          value={row.quantity ?? ""}
                          onChange={(e) => handleRowChange(idx, "quantity", Number(e.target.value))}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 text-sm font-bold">₫</span>
                          <input
                            type="number"
                            className="w-full rounded-xl border border-slate-200/80 bg-white pl-7 pr-3 py-2 text-sm font-bold text-emerald-700 shadow-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                            value={row.unitCost ?? ""}
                            onChange={(e) => handleRowChange(idx, "unitCost", Number(e.target.value))}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <input
                          type="text"
                          placeholder="Nhập ghi chú..."
                          className="w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                          value={row.note || ""}
                          onChange={(e) => handleRowChange(idx, "note", e.target.value)}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <select
                          className="w-full min-w-[110px] rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm font-bold shadow-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                          value={row.type || "INBOUND"}
                          onChange={(e) => handleRowChange(idx, "type", e.target.value)}
                        >
                          <option value="INBOUND">Nhập</option>
                          <option value="OUTBOUND">Xuất</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 text-sm">
                        {row.valid ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 font-bold text-emerald-700 shadow-sm border border-emerald-200">
                            <span className="material-symbols-outlined text-[18px]">check_circle</span> Hợp lệ
                          </span>
                        ) : (
                          <div className="flex flex-col gap-2 rounded-xl bg-red-50/80 p-3 border border-red-200/50 shadow-sm text-red-600">
                            <span className="flex items-center gap-1.5 font-bold">
                              <span className="material-symbols-outlined text-[18px]">error</span> Có lỗi
                            </span>
                            <ul className="list-disc pl-5 font-medium leading-relaxed">
                              {row.errorMessages?.map((msg, i) => (
                                <li key={i}>{msg}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {!result && (
            <div className="flex items-center justify-end gap-4 border-t border-slate-200/50 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-xl px-6 py-2.5 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-2.5 text-sm font-bold text-white shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-0.5 hover:shadow-blue-500/40 disabled:pointer-events-none disabled:opacity-60"
              >
                <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></span>
                <span className="material-symbols-outlined text-[20px]">{loading ? "sync" : "save"}</span>
                {loading ? "Đang xử lý..." : "Xác nhận Lưu"}
              </button>
            </div>
          )}

          {result && (
            <div className="rounded-3xl border border-blue-100 bg-blue-50/50 p-8 text-center mt-6">
              <span className="material-symbols-outlined mb-4 text-5xl text-blue-500">check_circle</span>
              <h3 className="mb-2 text-2xl font-black text-slate-800">Kết quả Import</h3>
              <p className="text-slate-600 mb-6">
                Đã xử lý thành công <strong className="text-emerald-600">{result.successCount}</strong> dòng.
                {result.errors.length > 0 && (
                  <span> Thất bại <strong className="text-red-600">{result.errors.length}</strong> dòng.</span>
                )}
              </p>
              
              {result.errors.length > 0 && (
                <div className="mb-6 rounded-2xl bg-red-50 p-4 text-left border border-red-100 max-h-40 overflow-y-auto">
                  <p className="font-bold text-red-700 mb-2">Chi tiết lỗi:</p>
                  <ul className="list-disc pl-5 text-sm text-red-600 space-y-1">
                    {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
              
              <button
                onClick={handleCancel}
                className="rounded-xl bg-slate-800 px-8 py-3 text-sm font-bold text-white transition-all hover:bg-slate-700"
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
