"use client";

import { useState } from "react";
import { Download, Upload, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { 
  downloadProductExcelTemplate, 
  previewProductExcel, 
  confirmProductExcelImport, 
  ProductExcelRowDto 
} from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ProductExcelImportProps = {
  accessToken: string;
  username: string;
  userId: string;
  brands: any[];
  categories: any[];
};

export function ProductExcelImport({ accessToken, username, userId, brands, categories }: ProductExcelImportProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<ProductExcelRowDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"upload" | "preview">("upload");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadProductExcelTemplate({ accessToken });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Product_Template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      toast.error(e.message || "Lỗi tải file mẫu");
    }
  };

  const handlePreview = async () => {
    if (!file) return toast.error("Vui lòng chọn file");
    setLoading(true);
    try {
      const data = await previewProductExcel(file, { accessToken, username });
      setPreviewRows(data);
      setStep("preview");
      toast.success(`Đã phân tích ${data.length} dòng`);
    } catch (e: any) {
      toast.error(e.message || "Lỗi đọc file Excel");
    } finally {
      setLoading(false);
    }
  };

  const updateRow = (index: number, updates: Partial<ProductExcelRowDto>) => {
    setPreviewRows(prev => {
      const newRows = [...prev];
      const r = { ...newRows[index], ...updates };
      
      let remainingErrors = [...(r.errorMessages || [])];
      
      if (updates.brandId !== undefined) {
        remainingErrors = remainingErrors.filter(e => !e.includes('Thương hiệu'));
      }
      if (updates.categoryId !== undefined) {
        remainingErrors = remainingErrors.filter(e => !e.includes('Danh mục'));
      }
      if (updates.productName !== undefined) {
        remainingErrors = remainingErrors.filter(e => !e.includes('Tên sản phẩm'));
      }
      if (updates.sku !== undefined) {
        remainingErrors = remainingErrors.filter(e => !e.includes('SKU'));
      }
      
      r.errorMessages = remainingErrors;
      r.valid = remainingErrors.length === 0;
      
      newRows[index] = r;
      return newRows;
    });
  };

  const handleConfirm = () => {
    let hasNewErrors = false;
    const updatedRows = previewRows.map(row => {
      const r = { ...row };
      const currentErrors = r.errorMessages || [];
      const newErrors: string[] = [];

      // Check empty fields
      if (!r.sku || !r.sku.trim()) newErrors.push("SKU không được để trống");
      if (!r.productName || !r.productName.trim()) newErrors.push("Tên sản phẩm không được để trống");
      if (!r.brandId) newErrors.push("Thương hiệu không được để trống");
      if (!r.categoryId) newErrors.push("Danh mục không được để trống");

      // We don't overwrite DB errors if they still exist (we only cleared them on change)
      // So we merge currentErrors that might be from backend with new frontend errors
      const combinedErrors = Array.from(new Set([...currentErrors, ...newErrors]));
      r.errorMessages = combinedErrors;
      r.valid = combinedErrors.length === 0;
      return r;
    });

    // Check file-level duplicate product names (same name but different SKUs)
    const nameToSkus = new Map<string, Set<string>>();
    updatedRows.forEach(r => {
      if (r.productName && r.sku && r.productName.trim() !== "") {
        const nameLower = r.productName.trim().toLowerCase();
        if (!nameToSkus.has(nameLower)) nameToSkus.set(nameLower, new Set());
        nameToSkus.get(nameLower)!.add(r.sku.trim());
      }
    });

    updatedRows.forEach(r => {
      if (r.productName && r.productName.trim() !== "") {
        const nameLower = r.productName.trim().toLowerCase();
        const skus = nameToSkus.get(nameLower);
        if (skus && skus.size > 1) {
          if (!r.errorMessages.some(e => e.includes("trùng lặp giữa nhiều SKU"))) {
            r.errorMessages.push("Tên sản phẩm bị trùng lặp giữa nhiều SKU trong file");
            r.valid = false;
            hasNewErrors = true;
          }
        } else {
          // If the user fixed the duplication, we should remove the duplication error
          const dupErrIndex = r.errorMessages.findIndex(e => e.includes("trùng lặp giữa nhiều SKU"));
          if (dupErrIndex >= 0) {
             r.errorMessages.splice(dupErrIndex, 1);
             r.valid = r.errorMessages.length === 0;
          }
        }
      }
    });

    // Only set state if we actually changed validation status
    if (JSON.stringify(updatedRows) !== JSON.stringify(previewRows)) {
      setPreviewRows(updatedRows);
    }

    const invalidCount = updatedRows.filter(r => !r.valid).length;
    
    if (hasNewErrors) {
       toast.error("Có lỗi dữ liệu! Vui lòng kiểm tra lại các trường trống hoặc trùng lặp tên sản phẩm.");
    }

    if (invalidCount > 0) {
      setShowConfirm(true);
    } else {
      executeImport();
    }
  };

  const executeImport = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const res = await confirmProductExcelImport(previewRows, { accessToken, username, userId });
      const totalFailed = previewRows.length - res.successCount;
      if (totalFailed > 0) {
        toast.warning(`Import thành công ${res.successCount} dòng, thất bại ${totalFailed} dòng`);
      } else {
        toast.success(`Import thành công toàn bộ ${res.successCount} dòng`);
      }
      
      if (res.errors && res.errors.length > 0) {
        console.warn("Import errors:", res.errors);
      }
      
      setTimeout(() => router.push("/admin/products"), 1500);
    } catch (e: any) {
      toast.error(e.message || "Lỗi khi import");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-6 relative">
      {step === "upload" && (
        <div className="space-y-6">
          <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-8 text-center bg-slate-50 dark:bg-slate-800/50">
            <Download className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Bước 1: Tải file mẫu</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
              Sử dụng file Excel chuẩn để điền thông tin sản phẩm và biến thể.
              Các sản phẩm cùng SKU sẽ được gộp chung.
            </p>
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 px-4 py-2 font-semibold text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50"
            >
              <Download className="h-4 w-4" />
              Tải Template
            </button>
          </div>

          <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-8 text-center bg-slate-50 dark:bg-slate-800/50">
            <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Bước 2: Tải lên file Excel</h3>
            <p className="mt-2 text-sm text-slate-500 mb-6">
              Sau khi điền dữ liệu, tải file lên để hệ thống kiểm tra.
            </p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50"
            />
            {file && (
              <button
                onClick={handlePreview}
                disabled={loading}
                className="mt-6 inline-flex w-full justify-center items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Đang xử lý..." : "Xem trước dữ liệu"}
              </button>
            )}
          </div>
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Kiểm tra dữ liệu</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setStep("upload")}
                className="rounded-xl px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Tải lại file khác
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Đang Import..." : "Xác nhận Import"}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-4 font-bold border-b border-slate-200 dark:border-slate-700">Dòng</th>
                  <th className="p-4 font-bold border-b border-slate-200 dark:border-slate-700">SKU</th>
                  <th className="p-4 font-bold border-b border-slate-200 dark:border-slate-700">Tên SP</th>
                  <th className="p-4 font-bold border-b border-slate-200 dark:border-slate-700">Thương hiệu</th>
                  <th className="p-4 font-bold border-b border-slate-200 dark:border-slate-700">Danh mục</th>
                  <th className="p-4 font-bold border-b border-slate-200 dark:border-slate-700">Size/Color</th>
                  <th className="p-4 font-bold border-b border-slate-200 dark:border-slate-700">Thông số</th>
                  <th className="p-4 font-bold border-b border-slate-200 dark:border-slate-700">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {previewRows.map((row, i) => (
                  <tr key={i} className={!row.valid ? "bg-red-50 dark:bg-red-900/10" : "bg-transparent"}>
                    <td className="p-4 font-medium text-slate-900 dark:text-slate-100">{row.rowId}</td>
                    <td className="p-4">
                      <input
                        type="text"
                        className={`w-full rounded-lg border px-2 py-1 text-sm bg-transparent text-slate-900 dark:text-slate-100 ${(!row.sku || (!row.valid && row.errorMessages.some(e => e.includes('SKU')))) ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-700'}`}
                        value={row.sku || ""}
                        onChange={(e) => updateRow(i, { sku: e.target.value })}
                        title={row.sku}
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="text"
                        className={`w-full rounded-lg border px-2 py-1 text-sm bg-transparent text-slate-900 dark:text-slate-100 ${(!row.productName || (!row.valid && row.errorMessages.some(e => e.includes('Tên sản phẩm')))) ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-700'}`}
                        value={row.productName || ""}
                        onChange={(e) => updateRow(i, { productName: e.target.value })}
                        title={row.productName}
                      />
                    </td>
                    <td className="p-4">
                      {/* Interactive Brand Select */}
                      <select 
                        className={`w-full rounded-lg border px-2 py-1 text-sm bg-transparent text-slate-900 dark:text-slate-100 ${!row.brandId || (!row.valid && row.errorMessages.some(e => e.includes('Thương hiệu'))) ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-700'}`}
                        value={row.brandId || ""}
                        onChange={(e) => updateRow(i, { brandId: e.target.value ? Number(e.target.value) : undefined })}
                      >
                        <option value="">-- Chọn Thương hiệu --</option>
                        {brands.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      {/* Interactive Category Select */}
                      <select 
                        className={`w-full rounded-lg border px-2 py-1 text-sm bg-transparent text-slate-900 dark:text-slate-100 ${!row.categoryId || (!row.valid && row.errorMessages.some(e => e.includes('Danh mục'))) ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-700'}`}
                        value={row.categoryId || ""}
                        onChange={(e) => updateRow(i, { categoryId: e.target.value ? Number(e.target.value) : undefined })}
                      >
                        <option value="">-- Chọn Danh mục --</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">
                      {row.size} / {row.color}
                    </td>
                    <td className="p-4">
                      {row.specs && row.specs.length > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/30 px-2 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400">
                          {row.specs.length} TS
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      {row.valid ? (
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Hợp lệ
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-900/30 px-2.5 py-1 text-xs font-bold text-red-700 dark:text-red-400 w-fit">
                            <XCircle className="h-3.5 w-3.5" />
                            Lỗi
                          </div>
                          {row.errorMessages.map((err, idx) => (
                            <span key={idx} className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> {err}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 transform transition-all">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mx-auto mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-center text-slate-800 dark:text-white mb-3">Xác nhận bỏ qua lỗi</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-8">
              Có <span className="font-bold text-red-600 dark:text-red-400">{previewRows.filter(r => !r.valid).length}</span> dòng không hợp lệ trong danh sách tải lên. 
              Bạn có muốn bỏ qua chúng và tiếp tục import các dòng hợp lệ không?
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={executeImport}
                className="flex-1 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors shadow-lg shadow-amber-500/30"
              >
                Tiếp tục Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
