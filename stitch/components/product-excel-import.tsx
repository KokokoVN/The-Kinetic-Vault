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
    <div className="rounded-3xl border border-white/10 bg-zinc-950/80 shadow-2xl backdrop-blur-2xl p-6 sm:p-8 relative text-zinc-100">
      {step === "upload" && (
        <div className="space-y-6">
          <div className="rounded-2xl border-2 border-dashed border-white/10 p-8 text-center bg-zinc-900/40 hover:bg-zinc-900/70 transition-colors">
            <Download className="mx-auto h-12 w-12 text-cyan-400 mb-4" />
            <h3 className="text-lg font-bold text-white">Bước 1: Tải file mẫu</h3>
            <p className="mt-2 text-sm text-zinc-400 mb-6 max-w-lg mx-auto">
              Sử dụng file Excel chuẩn để điền thông tin sản phẩm và biến thể.
              Các sản phẩm cùng SKU sẽ được gộp chung.
            </p>
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-5 py-2.5 font-bold text-cyan-300 hover:bg-cyan-500/20 transition-all shadow-sm"
            >
              <Download className="h-4 w-4" />
              Tải File Template
            </button>
          </div>

          <div className="rounded-2xl border-2 border-dashed border-white/10 p-8 text-center bg-zinc-900/40 hover:bg-zinc-900/70 transition-colors">
            <Upload className="mx-auto h-12 w-12 text-indigo-400 mb-4" />
            <h3 className="text-lg font-bold text-white">Bước 2: Tải lên file Excel</h3>
            <p className="mt-2 text-sm text-zinc-400 mb-6 max-w-lg mx-auto">
              Sau khi điền dữ liệu theo mẫu, tải file lên để hệ thống phân tích và xác thực.
            </p>
            <div className="max-w-md mx-auto">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-cyan-500/10 file:text-cyan-300 hover:file:bg-cyan-500/20 file:border file:border-cyan-500/30 cursor-pointer"
              />
            </div>
            {file && (
              <button
                onClick={handlePreview}
                disabled={loading}
                className="mt-6 inline-flex w-full max-w-md justify-center items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 px-6 py-3.5 font-bold text-white shadow-xl shadow-cyan-500/25 hover:from-cyan-400 hover:to-indigo-600 disabled:opacity-50 transition-all"
              >
                {loading ? "Đang xử lý..." : "Xem trước dữ liệu"}
              </button>
            )}
          </div>
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white">Kiểm tra & Hiệu chỉnh dữ liệu</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Xác nhận các dòng hợp lệ trước khi nhập vào kho hàng.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep("upload")}
                className="rounded-xl px-4 py-2 text-xs font-bold text-zinc-300 border border-white/10 hover:bg-zinc-800 transition-colors"
              >
                Tải lại file khác
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-indigo-600 disabled:opacity-50 transition-all"
              >
                {loading ? "Đang Import..." : "Xác nhận Import"}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-zinc-900/90 text-zinc-400">
                <tr>
                  <th className="p-4 font-bold border-b border-white/10 text-xs uppercase tracking-wider">Dòng</th>
                  <th className="p-4 font-bold border-b border-white/10 text-xs uppercase tracking-wider">SKU</th>
                  <th className="p-4 font-bold border-b border-white/10 text-xs uppercase tracking-wider">Tên SP</th>
                  <th className="p-4 font-bold border-b border-white/10 text-xs uppercase tracking-wider">Thương hiệu</th>
                  <th className="p-4 font-bold border-b border-white/10 text-xs uppercase tracking-wider">Danh mục</th>
                  <th className="p-4 font-bold border-b border-white/10 text-xs uppercase tracking-wider">Size/Color</th>
                  <th className="p-4 font-bold border-b border-white/10 text-xs uppercase tracking-wider">Thông số</th>
                  <th className="p-4 font-bold border-b border-white/10 text-xs uppercase tracking-wider">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {previewRows.map((row, i) => (
                  <tr key={i} className={!row.valid ? "bg-rose-950/20" : "hover:bg-white/[0.02]"}>
                    <td className="p-4 font-mono text-xs text-zinc-400">{row.rowId}</td>
                    <td className="p-4">
                      <input
                        type="text"
                        className={`w-full rounded-xl border px-3 py-1.5 text-xs bg-zinc-900 text-white outline-none focus:border-cyan-400 ${(!row.sku || (!row.valid && row.errorMessages.some(e => e.includes('SKU')))) ? 'border-rose-500/60 bg-rose-950/30' : 'border-white/10'}`}
                        value={row.sku || ""}
                        onChange={(e) => updateRow(i, { sku: e.target.value })}
                        title={row.sku}
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="text"
                        className={`w-full rounded-xl border px-3 py-1.5 text-xs bg-zinc-900 text-white outline-none focus:border-cyan-400 ${(!row.productName || (!row.valid && row.errorMessages.some(e => e.includes('Tên sản phẩm')))) ? 'border-rose-500/60 bg-rose-950/30' : 'border-white/10'}`}
                        value={row.productName || ""}
                        onChange={(e) => updateRow(i, { productName: e.target.value })}
                        title={row.productName}
                      />
                    </td>
                    <td className="p-4">
                      {/* Interactive Brand Select */}
                      <select 
                        className={`w-full rounded-xl border px-3 py-1.5 text-xs bg-zinc-900 text-white outline-none focus:border-cyan-400 ${!row.brandId || (!row.valid && row.errorMessages.some(e => e.includes('Thương hiệu'))) ? 'border-rose-500/60 bg-rose-950/30' : 'border-white/10'}`}
                        value={row.brandId || ""}
                        onChange={(e) => updateRow(i, { brandId: e.target.value ? Number(e.target.value) : undefined })}
                      >
                        <option value="" className="bg-zinc-900 text-white">-- Chọn Thương hiệu --</option>
                        {brands.map(b => (
                          <option key={b.id} value={b.id} className="bg-zinc-900 text-white">{b.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      {/* Interactive Category Select */}
                      <select 
                        className={`w-full rounded-xl border px-3 py-1.5 text-xs bg-zinc-900 text-white outline-none focus:border-cyan-400 ${!row.categoryId || (!row.valid && row.errorMessages.some(e => e.includes('Danh mục'))) ? 'border-rose-500/60 bg-rose-950/30' : 'border-white/10'}`}
                        value={row.categoryId || ""}
                        onChange={(e) => updateRow(i, { categoryId: e.target.value ? Number(e.target.value) : undefined })}
                      >
                        <option value="" className="bg-zinc-900 text-white">-- Chọn Danh mục --</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id} className="bg-zinc-900 text-white">{c.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-zinc-300 text-xs">
                      {row.size} / {row.color}
                    </td>
                    <td className="p-4">
                      {row.specs && row.specs.length > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-xs font-semibold text-cyan-300">
                          {row.specs.length} TS
                        </span>
                      ) : (
                        <span className="text-zinc-600">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      {row.valid ? (
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 text-xs font-bold text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Hợp lệ
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-950/60 border border-rose-500/30 px-2.5 py-1 text-xs font-bold text-rose-300 w-fit">
                            <XCircle className="h-3.5 w-3.5" />
                            Lỗi
                          </div>
                          {row.errorMessages.map((err, idx) => (
                            <span key={idx} className="text-[11px] text-rose-400 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3 shrink-0" /> {err}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-zinc-950 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/10 transform transition-all text-zinc-100">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-center text-white mb-3">Xác nhận bỏ qua lỗi</h3>
            <p className="text-zinc-400 text-center mb-8 text-sm">
              Có <span className="font-bold text-rose-400">{previewRows.filter(r => !r.valid).length}</span> dòng không hợp lệ trong danh sách tải lên. 
              Bạn có muốn bỏ qua chúng và tiếp tục import các dòng hợp lệ không?
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-6 py-3 rounded-xl border border-white/10 font-bold text-zinc-300 hover:bg-zinc-900 transition-colors text-sm"
              >
                Hủy
              </button>
              <button
                onClick={executeImport}
                className="flex-1 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-all shadow-lg shadow-amber-500/25 text-sm"
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
