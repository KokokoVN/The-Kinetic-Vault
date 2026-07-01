"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createAdminVoucher, updateAdminVoucher, checkAdminVoucherCode, type Voucher } from "@/lib/sale-api";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export function VoucherForm({
  initialData,
  accessToken,
  username,
  userId,
}: {
  initialData?: Voucher;
  accessToken: string | null;
  username: string;
  userId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Import Preview States
  const [importStep, setImportStep] = useState<"form" | "preview">("form");
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    code: initialData?.code || "",
    description: initialData?.description || "",
    discountType: initialData?.discountType || "PERCENT",
    discountValue: initialData?.discountValue || "",
    minOrderAmount: initialData?.minOrderAmount || "",
    maxDiscountAmount: initialData?.maxDiscountAmount || "",
    maxUsage: initialData?.maxUsage ?? "1",
    maxUsagePerUser: initialData?.maxUsagePerUser ?? "1",
    startsAt: initialData?.startsAt ? new Date(initialData.startsAt).toISOString().slice(0, 16) : "",
    expiresAt: initialData?.expiresAt ? new Date(initialData.expiresAt).toISOString().slice(0, 16) : "",
    active: initialData?.active ?? true,
  });

  const [codeError, setCodeError] = useState("");
  const [isValidatingCode, setIsValidatingCode] = useState(false);

  // Live Check Voucher Code
  useEffect(() => {
    const checkCode = async () => {
      const codeToCheck = formData.code.trim().toUpperCase();
      if (!codeToCheck) {
        setCodeError("");
        return;
      }
      setIsValidatingCode(true);
      try {
        const { exists } = await checkAdminVoucherCode(
          codeToCheck,
          isEdit ? initialData?.id : undefined,
          { accessToken }
        );
        if (exists) {
          setCodeError(`Mã Voucher '${codeToCheck}' đã tồn tại!`);
        } else {
          setCodeError("");
        }
      } catch (err) {
        // fail silently for live check
      } finally {
        setIsValidatingCode(false);
      }
    };
    
    const timeoutId = setTimeout(checkCode, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.code, isEdit, initialData?.id]);

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "VOUCHER-";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code: result });
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, [["Mã Voucher", "Mô tả", "Loại giảm (PERCENT/AMOUNT)", "Mức giảm", "Giảm tối đa", "Đơn tối thiểu", "Giới hạn toàn HT", "Giới hạn/Người", "Ngày bắt đầu (YYYY-MM-DDTHH:mm)", "Ngày kết thúc (YYYY-MM-DDTHH:mm)", "Kích hoạt (TRUE/FALSE)"]], { origin: "A1" });
    const colWidths = [{ wch: 20 }, { wch: 40 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 30 }, { wch: 20 }];
    ws["!cols"] = colWidths;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Voucher");
    XLSX.writeFile(wb, "Voucher_Import_Template.xlsx");
    toast.success("Tải template thành công!");
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        setLoading(true);
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        if (data.length === 0) {
          toast.error("File Excel trống!");
          setLoading(false);
          return;
        }

        const parsedRows = [];
        const seenCodes = new Set<string>();

        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          const code = row["Mã Voucher"]?.toString().trim().toUpperCase() || "";
          const discountType = row["Loại giảm (PERCENT/AMOUNT)"]?.toString().toUpperCase() === "AMOUNT" ? "AMOUNT" : "PERCENT";
          const discountValue = Number(row["Mức giảm"]) || 0;
          
          let valid = true;
          let errors = [];
          
          if (!code) { valid = false; errors.push("Thiếu Mã Voucher"); }
          if (discountValue <= 0) { valid = false; errors.push("Mức giảm phải > 0"); }

          if (code) {
            if (seenCodes.has(code)) {
              valid = false;
              errors.push("Mã bị trùng lặp trong file Excel");
            } else {
              seenCodes.add(code);
              try {
                const { exists } = await checkAdminVoucherCode(code, undefined, { accessToken });
                if (exists) { valid = false; errors.push("Mã Voucher đã tồn tại trong hệ thống"); }
              } catch (e: any) {
                valid = false;
                errors.push(`Lỗi check trùng: ${e.message}`);
              }
            }
          }

          parsedRows.push({
            rowId: i + 2,
            code,
            description: row["Mô tả"]?.toString() || "",
            discountType,
            discountValue,
            maxDiscountAmount: row["Giảm tối đa"] ? Number(row["Giảm tối đa"]) : undefined,
            minOrderAmount: row["Đơn tối thiểu"] ? Number(row["Đơn tối thiểu"]) : undefined,
            maxUsage: row["Giới hạn toàn HT"] ? Number(row["Giới hạn toàn HT"]) : undefined,
            maxUsagePerUser: row["Giới hạn/Người"] ? Number(row["Giới hạn/Người"]) : undefined,
            startsAt: row["Ngày bắt đầu (YYYY-MM-DDTHH:mm)"] ? new Date(row["Ngày bắt đầu (YYYY-MM-DDTHH:mm)"]).toISOString() : undefined,
            expiresAt: row["Ngày kết thúc (YYYY-MM-DDTHH:mm)"] || row["Hạn sử dụng (YYYY-MM-DDTHH:mm)"] ? new Date(row["Ngày kết thúc (YYYY-MM-DDTHH:mm)"] || row["Hạn sử dụng (YYYY-MM-DDTHH:mm)"]).toISOString() : undefined,
            active: row["Kích hoạt (TRUE/FALSE)"]?.toString().toUpperCase() !== "FALSE",
            valid,
            errors
          });
        }

        setPreviewRows(parsedRows);
        setImportStep("preview");
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (err) {
        toast.error("File không đúng định dạng hoặc có lỗi xảy ra!");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = async () => {
    const invalidCount = previewRows.filter(r => !r.valid).length;
    if (invalidCount > 0) {
      toast.error(`Có ${invalidCount} dòng không hợp lệ! Vui lòng sửa lại file Excel và tải lên lại.`);
      return;
    }

    const validRows = previewRows.filter(r => r.valid);
    if (validRows.length === 0) {
      toast.error("Không có dòng nào hợp lệ để import!");
      return;
    }

    setIsImporting(true);
    let successCount = 0;
    let failCount = 0;

    for (const row of validRows) {
      try {
        const payload = {
          code: row.code,
          description: row.description,
          discountType: row.discountType,
          discountValue: row.discountValue,
          maxDiscountAmount: row.maxDiscountAmount,
          minOrderAmount: row.minOrderAmount,
          maxUsage: row.maxUsage,
          maxUsagePerUser: row.maxUsagePerUser,
          startsAt: row.startsAt,
          expiresAt: row.expiresAt,
          active: row.active,
        };
        await createAdminVoucher(payload, { accessToken, username, userId });
        successCount++;
      } catch (e) {
        failCount++;
      }
    }

    if (successCount > 0) toast.success(`Đã tạo thành công ${successCount} Voucher!`);
    if (failCount > 0) toast.error(`Có ${failCount} mã bị lỗi khi lưu.`);
    
    setIsImporting(false);
    router.push("/admin/sales/vouchers");
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (codeError) {
      toast.error("Vui lòng nhập Mã Voucher khác do mã này đã tồn tại.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        description: formData.description,
        discountType: formData.discountType as "PERCENT" | "AMOUNT",
        discountValue: Number(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : undefined,
        maxDiscountAmount: formData.discountType === "PERCENT" && formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : undefined,
        maxUsage: formData.maxUsage ? Number(formData.maxUsage) : undefined,
        maxUsagePerUser: formData.maxUsagePerUser ? Number(formData.maxUsagePerUser) : undefined,
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : undefined,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
        active: formData.active,
      };

      if (isEdit) {
        await updateAdminVoucher(initialData.id, payload, { accessToken, username, userId });
      } else {
        await createAdminVoucher(payload, { accessToken, username, userId });
      }

      router.push("/admin/sales/vouchers");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi");
      setLoading(false);
    }
  };

  if (importStep === "preview") {
    return (
      <div className="w-full">
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-slate-800">Xác nhận Import Voucher</h2>
              <p className="mt-2 text-base text-slate-500">Vui lòng kiểm tra lại thông tin các mã Voucher trước khi lưu vào hệ thống.</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setImportStep("form")}
                className="rounded-xl bg-slate-100 px-8 py-4 font-bold text-slate-600 text-base transition-all hover:bg-slate-200"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={isImporting || previewRows.some(r => !r.valid)}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-bold text-white text-base transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting && <span className="material-symbols-outlined animate-spin">sync</span>}
                {isImporting ? "Đang xử lý..." : "Xác nhận Import"}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-base">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-5 font-bold">Dòng</th>
                  <th className="p-5 font-bold">Mã Voucher</th>
                  <th className="p-5 font-bold">Mức giảm</th>
                  <th className="p-5 font-bold">Ngày bắt đầu</th>
                  <th className="p-5 font-bold">Ngày kết thúc</th>
                  <th className="p-5 font-bold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewRows.map((row, i) => (
                  <tr key={i} className={!row.valid ? "bg-rose-50" : "bg-white"}>
                    <td className="p-5 font-medium text-slate-900">{row.rowId}</td>
                    <td className="p-5 font-mono font-bold text-blue-700 text-lg">{row.code || "-"}</td>
                    <td className="p-5 font-semibold text-emerald-600">
                      {row.discountValue > 0 ? (row.discountType === "PERCENT" ? `${row.discountValue}%` : `${row.discountValue.toLocaleString()}đ`) : "-"}
                    </td>
                    <td className="p-5 text-slate-600">
                      {row.startsAt ? new Date(row.startsAt).toLocaleString("vi-VN") : "Ngay lập tức"}
                    </td>
                    <td className="p-5 text-slate-600">
                      {row.expiresAt ? new Date(row.expiresAt).toLocaleString("vi-VN") : "Không giới hạn"}
                    </td>
                    <td className="p-5">
                      {row.valid ? (
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          Hợp lệ
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-rose-100 px-4 py-2 text-sm font-bold text-rose-700">
                            <span className="material-symbols-outlined text-[16px]">cancel</span>
                            Lỗi
                          </div>
                          {row.errors.map((err: string, idx: number) => (
                            <span key={idx} className="text-sm font-semibold text-rose-600 flex items-center gap-1">
                              • {err}
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
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 shadow-xl shadow-purple-900/5 dark:shadow-none backdrop-blur-xl relative">
      <div className="h-2 w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />
      <form onSubmit={handleSubmit} className="p-8 space-y-12">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/50 pb-6">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-lg shadow-blue-500/30">
              <span className="material-symbols-outlined text-3xl">local_activity</span>
            </div>
            <div>
              <h2 className="font-headline text-2xl font-black text-slate-800 dark:text-white">{isEdit ? "Cập nhật Voucher" : "Tạo Voucher Mới"}</h2>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">Thiết lập mã giảm giá, giới hạn sử dụng và thời hạn</p>
            </div>
          </div>
          
          {!isEdit && (
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-base font-bold text-slate-700 transition-all hover:bg-slate-200"
              >
                <span className="material-symbols-outlined text-[20px]">download</span>
                Tải Template
              </button>
              
              <input 
                type="file" 
                accept=".xlsx, .xls" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImportExcel}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-xl bg-emerald-100 px-5 py-3 text-base font-bold text-emerald-700 transition-all hover:bg-emerald-200"
              >
                <span className="material-symbols-outlined text-[20px]">upload</span>
                Nhập Excel
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="relative z-10 mb-8 flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/80 p-5 text-base font-semibold text-rose-700 backdrop-blur-md">
            <span className="material-symbols-outlined text-[22px]">error</span>
            <span>{error.replace("VALIDATION:", "")}</span>
          </div>
        )}

        <div className="relative z-10 grid gap-10 sm:grid-cols-2">
          {/* Nhóm Thông tin chung */}
          <div className="col-span-2 space-y-6 rounded-[2rem] border border-white/60 bg-white/40 p-8 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-200/50 pb-4">
              <span className="material-symbols-outlined text-emerald-600 text-2xl">info</span>
              <h3 className="font-headline text-xl font-bold text-slate-800">Thông tin chung</h3>
            </div>

            <div className="group">
              <label className="mb-2 block text-sm font-black uppercase tracking-widest text-slate-500 transition-colors group-focus-within:text-emerald-600">Mã Voucher <span className="text-rose-500">*</span></label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-500">sell</span>
                  <input
                    required
                    type="text"
                    className={`w-full uppercase rounded-2xl border ${codeError ? 'border-rose-400 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/20' : 'border-white/80 bg-white/60 focus:border-emerald-400 focus:ring-emerald-400/20'} py-4 pl-14 pr-5 font-mono text-lg text-emerald-700 outline-none ring-4 ring-transparent transition-all placeholder:text-slate-400 focus:bg-white`}
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="VD: SUMMER2024"
                  />
                  {isValidatingCode && (
                    <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-slate-400">sync</span>
                  )}
                </div>
                {!isEdit && (
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="flex h-16 items-center justify-center gap-2 rounded-2xl bg-slate-800 px-6 text-base font-bold text-white transition-all hover:bg-slate-700 hover:shadow-lg"
                  >
                    <span className="material-symbols-outlined text-[20px]">casino</span>
                    Tạo mã ngẫu nhiên
                  </button>
                )}
              </div>
              {codeError && (
                <div className="mt-2 flex items-center gap-1.5 text-sm font-bold text-rose-500">
                  <span className="material-symbols-outlined text-[16px]">warning</span>
                  {codeError}
                </div>
              )}
            </div>

            <div className="group">
              <label className="mb-2 block text-sm font-black uppercase tracking-widest text-slate-500 transition-colors group-focus-within:text-emerald-600">Mô tả (Tùy chọn)</label>
              <textarea
                className="w-full rounded-2xl border border-white/80 bg-white/60 px-5 py-4 text-base font-medium text-slate-700 outline-none ring-4 ring-transparent transition-all placeholder:font-normal placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-emerald-400/20"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ví dụ: Giảm giá mùa hè cho đơn từ 500k..."
                rows={3}
              />
            </div>
          </div>

          {/* Nhóm Cấu hình ưu đãi */}
          <div className="space-y-6 rounded-[2rem] border border-white/60 bg-white/40 p-8 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-200/50 pb-4">
              <span className="material-symbols-outlined text-blue-600 text-2xl">settings_suggest</span>
              <h3 className="font-headline text-xl font-bold text-slate-800">Cấu hình ưu đãi</h3>
            </div>

            <div className="group">
              <label className="mb-2 block text-sm font-black uppercase tracking-widest text-slate-500 transition-colors group-focus-within:text-blue-600">Loại giảm giá</label>
              <div className="relative">
                <select
                  className="w-full appearance-none rounded-2xl border border-white/80 bg-white/60 px-5 py-4 text-base font-bold text-slate-800 outline-none ring-4 ring-transparent transition-all focus:border-blue-400 focus:bg-white focus:ring-blue-400/20"
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                >
                  <option value="PERCENT">Giảm phần trăm (%)</option>
                  <option value="AMOUNT">Tiền cố định (VNĐ)</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
              </div>
            </div>

            <div className="group">
              <label className="mb-2 block text-sm font-black uppercase tracking-widest text-slate-500 transition-colors group-focus-within:text-blue-600">Mức giảm <span className="text-rose-500">*</span></label>
              <div className="relative">
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-2xl border border-white/80 bg-white/60 px-5 py-4 text-base font-bold text-slate-800 outline-none ring-4 ring-transparent transition-all placeholder:font-normal placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-blue-400/20"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  placeholder={formData.discountType === "PERCENT" ? "VD: 20" : "VD: 50000"}
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400">
                  {formData.discountType === "PERCENT" ? "%" : "₫"}
                </span>
              </div>
            </div>

            {formData.discountType === "PERCENT" && (
              <div className="group">
                <label className="mb-2 block text-sm font-black uppercase tracking-widest text-slate-500 transition-colors group-focus-within:text-blue-600">Giảm tối đa (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full rounded-2xl border border-white/80 bg-white/60 px-5 py-4 text-base font-bold text-slate-800 outline-none ring-4 ring-transparent transition-all placeholder:font-normal placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-blue-400/20"
                  value={formData.maxDiscountAmount}
                  onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                  placeholder="Để trống nếu không giới hạn"
                />
              </div>
            )}

            <div className="group">
              <label className="mb-2 block text-sm font-black uppercase tracking-widest text-slate-500 transition-colors group-focus-within:text-blue-600">Đơn tối thiểu (VNĐ)</label>
              <input
                type="number"
                min="0"
                className="w-full rounded-2xl border border-white/80 bg-white/60 px-5 py-4 text-base font-bold text-slate-800 outline-none ring-4 ring-transparent transition-all placeholder:font-normal placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-blue-400/20"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                placeholder="VD: 150000"
              />
            </div>
          </div>

          {/* Nhóm Giới hạn sử dụng & Thời gian */}
          <div className="space-y-6 rounded-[2rem] border border-white/60 bg-white/40 p-8 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-200/50 pb-4">
              <span className="material-symbols-outlined text-purple-600 text-2xl">rule</span>
              <h3 className="font-headline text-xl font-bold text-slate-800">Giới hạn & Thời gian</h3>
            </div>

            <div className="group">
              <label className="mb-2 block text-sm font-black uppercase tracking-widest text-slate-500 transition-colors group-focus-within:text-purple-600">Số lượng mã tối đa</label>
              <input
                type="number"
                min="1"
                className="w-full rounded-2xl border border-white/80 bg-white/60 px-5 py-4 text-base font-bold text-slate-800 outline-none ring-4 ring-transparent transition-all placeholder:font-normal placeholder:text-slate-400 focus:border-purple-400 focus:bg-white focus:ring-purple-400/20"
                value={formData.maxUsage}
                onChange={(e) => setFormData({ ...formData, maxUsage: e.target.value })}
                placeholder="Để trống nếu không giới hạn"
              />
            </div>

            <div className="group">
              <label className="mb-2 block text-sm font-black uppercase tracking-widest text-slate-500 transition-colors group-focus-within:text-purple-600">Lượt dùng / 1 Người</label>
              <input
                type="number"
                min="1"
                className="w-full rounded-2xl border border-white/80 bg-white/60 px-5 py-4 text-base font-bold text-slate-800 outline-none ring-4 ring-transparent transition-all placeholder:font-normal placeholder:text-slate-400 focus:border-purple-400 focus:bg-white focus:ring-purple-400/20"
                value={formData.maxUsagePerUser}
                onChange={(e) => setFormData({ ...formData, maxUsagePerUser: e.target.value })}
                placeholder="Để trống = 1 lần/người"
              />
            </div>

            <div className="group">
              <label className="mb-2 block text-sm font-black uppercase tracking-widest text-slate-500 transition-colors group-focus-within:text-purple-600">Ngày bắt đầu</label>
              <input
                type="datetime-local"
                className="w-full rounded-2xl border border-white/80 bg-white/60 px-5 py-4 text-base font-bold text-slate-800 outline-none ring-4 ring-transparent transition-all focus:border-purple-400 focus:bg-white focus:ring-purple-400/20"
                value={formData.startsAt}
                onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
              />
            </div>

            <div className="group">
              <label className="mb-2 block text-sm font-black uppercase tracking-widest text-slate-500 transition-colors group-focus-within:text-purple-600">Ngày kết thúc</label>
              <input
                type="datetime-local"
                className="w-full rounded-2xl border border-white/80 bg-white/60 px-5 py-4 text-base font-bold text-slate-800 outline-none ring-4 ring-transparent transition-all focus:border-purple-400 focus:bg-white focus:ring-purple-400/20"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/80 bg-white/60 px-5 py-4 transition-all hover:bg-white/90">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border-2 border-slate-300 transition-all checked:border-emerald-500 checked:bg-emerald-500 hover:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
                />
                <span className="material-symbols-outlined pointer-events-none absolute text-[16px] text-white opacity-0 transition-opacity peer-checked:opacity-100">check</span>
              </div>
              <label htmlFor="active" className="cursor-pointer text-base font-bold text-slate-700">Kích hoạt ngay</label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-6 mt-8 border-t border-slate-200/50 dark:border-slate-800/50">
          <Link
            href="/admin/sales/vouchers"
            className="rounded-xl px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Hủy bỏ
          </Link>
          <button
            type="submit"
            disabled={loading || !!codeError}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] hover:shadow-blue-600/30 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">save</span>
            )}
            {loading ? "Đang lưu..." : "Lưu voucher"}
          </button>
        </div>
      </form>
    </section>
  );
}
