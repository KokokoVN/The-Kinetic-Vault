"use client";

import { useState, useEffect, useRef } from "react";
import { apiUrl } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as XLSX from "xlsx";
import { createAdminSaleProgram, updateAdminSaleProgram, type SaleProgram, type SaleProgramItem } from "@/lib/sale-api";
import { parseVariantTiers } from "@/lib/variant-tier-utils";
import { toast } from "sonner";
import { ProductPickerModal } from "./product-picker-modal";
import { VariantPickerModal } from "./variant-picker-modal";
import { SelectiveExportModal } from "./selective-export-modal";

function moneyVnd(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "0₫";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

export function SaleProgramForm({
  initialData,
  accessToken,
  username,
  userId,
  products = [],
}: {
  initialData?: SaleProgram;
  accessToken: string | null;
  username: string;
  userId: string;
  products?: { id: number; name: string; sku?: string; availability?: number }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    discountType: initialData?.discountType || "PERCENT",
    discountValue: initialData?.discountValue || "",
    active: initialData?.active ?? true,
    sendEmailNotification: false,
    startAt: initialData?.startAt ? new Date(initialData.startAt).toISOString().slice(0, 16) : "",
    endAt: initialData?.endAt ? new Date(initialData.endAt).toISOString().slice(0, 16) : "",
  });

  const [items, setItems] = useState<SaleProgramItem[]>(initialData?.items || []);
  const [variantsCache, setVariantsCache] = useState<Record<number, any[]>>({});
  const [overlapErrors, setOverlapErrors] = useState<Record<number, string>>({});
  const [qtyErrors, setQtyErrors] = useState<Record<number, string>>({});
  const [pickerOpenForIndex, setPickerOpenForIndex] = useState<number | null>(null);
  const [variantPickerOpenForIndex, setVariantPickerOpenForIndex] = useState<number | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const loadVariants = async (productId: number) => {
    if (!productId || variantsCache[productId]) return;
    try {
      const res = await fetch(apiUrl(`/catalog/products/${productId}/variants`));
      if (res.ok) {
        const data = await res.json();
        setVariantsCache(prev => ({ ...prev, [productId]: Array.isArray(data) ? data : [] }));
      }
    } catch (e) {}
  };

  useEffect(() => {
    items.forEach(item => {
      if (item.productId) loadVariants(item.productId);
    });
  }, []);

  const handleAddItem = () => {
    setItems([...items, { productId: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);

    setOverlapErrors(prev => {
      const newErr: Record<number, string> = {};
      Object.keys(prev).forEach(k => {
        const numK = Number(k);
        if (numK < index) newErr[numK] = prev[numK];
        else if (numK > index) newErr[numK - 1] = prev[numK];
      });
      return newErr;
    });

    setQtyErrors(prev => {
      const newErr: Record<number, string> = {};
      Object.keys(prev).forEach(k => {
        const numK = Number(k);
        if (numK < index) newErr[numK] = prev[numK];
        else if (numK > index) newErr[numK - 1] = prev[numK];
      });
      return newErr;
    });
  };

  const validateOverlap = async (index: number, productId: number, variantId?: number, start?: string, end?: string) => {
    if (!productId || !start || !end) return;
    try {
      const qs = new URLSearchParams({
        productId: productId.toString(),
        startAt: new Date(start).toISOString(),
        endAt: new Date(end).toISOString()
      });
      if (variantId) qs.append("variantId", variantId.toString());
      if (isEdit && initialData?.id) qs.append("excludeProgramId", initialData.id.toString());
      
      const res = await fetch(apiUrl(`/sales/admin/sales/programs/check-overlap?${qs.toString()}`), {
        headers: { "Authorization": `Bearer ${accessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOverlapErrors(prev => {
          const newErr = { ...prev };
          if (data.overlap) {
            newErr[index] = data.message;
          } else {
            delete newErr[index];
          }
          return newErr;
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const checkQtyLimit = (index: number, limit: any, productId: number, variantId?: number) => {
    if (!limit) {
      setQtyErrors(prev => { const n = {...prev}; delete n[index]; return n; });
      return;
    }
    const limitNum = Number(limit);
    
    setQtyErrors(prev => {
      const newErr = { ...prev };
      if (limitNum <= 0) {
        newErr[index] = `Số lượng khuyến mãi phải lớn hơn 0.`;
      } else {
        delete newErr[index];
      }
      return newErr;
    });
  };

  const handleChangeItem = (index: number, field: keyof SaleProgramItem, value: any) => {
    const newItems = [...items];
    const prevProductId = newItems[index].productId;
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === "productId" && prevProductId !== value) {
      newItems[index].variantId = undefined;
      if (value && !variantsCache[value]) {
        loadVariants(Number(value));
      }
    }
    setItems(newItems);

    // Trigger validations
    const updatedItem = newItems[index];
    if (field === "productId" || field === "variantId") {
      validateOverlap(index, Number(updatedItem.productId), updatedItem.variantId ? Number(updatedItem.variantId) : undefined, formData.startAt, formData.endAt);
      checkQtyLimit(index, updatedItem.promoQtyLimit, Number(updatedItem.productId), updatedItem.variantId ? Number(updatedItem.variantId) : undefined);
    }
    if (field === "promoQtyLimit") {
      checkQtyLimit(index, value, Number(updatedItem.productId), updatedItem.variantId ? Number(updatedItem.variantId) : undefined);
    }
  };

  // Re-validate overlaps when dates change
  useEffect(() => {
    if (formData.startAt && formData.endAt) {
      items.forEach((item, index) => {
        if (item.productId) {
          validateOverlap(index, item.productId, item.variantId ?? undefined, formData.startAt, formData.endAt);
        }
      });
    }
  }, [formData.startAt, formData.endAt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.startAt || !formData.endAt) {
      toast.error("Vui lòng chọn thời gian bắt đầu và kết thúc.");
      return;
    }

    if (new Date(formData.endAt) <= new Date(formData.startAt)) {
      toast.error("Thời gian kết thúc phải diễn ra sau thời gian bắt đầu.");
      return;
    }

    if (items.length === 0) {
      toast.error("Vui lòng thêm ít nhất một sản phẩm.");
      return;
    }

    // Client-side duplicate check within the form itself
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const item1 = items[i];
        const item2 = items[j];
        if (item1.productId && item1.productId === item2.productId) {
          if (!item1.variantId || !item2.variantId || item1.variantId === item2.variantId) {
            toast.error(`Sản phẩm #${item1.productId} bị chọn trùng lặp giữa dòng ${i + 1} và ${j + 1}.`);
            return;
          }
        }
      }
    }

    if (Object.keys(overlapErrors).length > 0 || Object.keys(qtyErrors).length > 0) {
      toast.error("Vui lòng khắc phục các lỗi ở danh sách sản phẩm trước khi lưu.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        discountType: formData.discountType as "PERCENT" | "AMOUNT",
        discountValue: Number(formData.discountValue),
        active: formData.active,
        sendEmailNotification: formData.sendEmailNotification,
        startAt: new Date(formData.startAt).toISOString(),
        endAt: new Date(formData.endAt).toISOString(),
        items: items.map(item => ({
          productId: Number(item.productId),
          variantId: item.variantId ? Number(item.variantId) : null,
          promoQtyLimit: item.promoQtyLimit ? Number(item.promoQtyLimit) : null,
        }))
      };

      if (isEdit) {
        await updateAdminSaleProgram(initialData.id, payload, { accessToken, username, userId });
        toast.success("Cập nhật chương trình khuyến mãi thành công!");
      } else {
        await createAdminSaleProgram(payload, { accessToken, username, userId });
        toast.success("Tạo chương trình khuyến mãi thành công!");
      }

      router.push("/admin/sales/programs");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message?.replace("VALIDATION:", "") || "Đã xảy ra lỗi khi lưu.");
      setLoading(false);
    }
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length > 0) {
          const configRow: any = data.find((r: any) => r["Tên Chương Trình"] || r["Mức Giảm"]) || data[0];
          if (configRow) {
            setFormData(prev => ({
              ...prev,
              name: configRow["Tên Chương Trình"] !== undefined ? String(configRow["Tên Chương Trình"]) : prev.name,
              description: configRow["Mô tả"] !== undefined ? String(configRow["Mô tả"]) : prev.description,
              discountType: (configRow["Loại Giảm (PERCENT/AMOUNT)"] === "PERCENT" || configRow["Loại Giảm (PERCENT/AMOUNT)"] === "AMOUNT") ? configRow["Loại Giảm (PERCENT/AMOUNT)"] : prev.discountType,
              discountValue: configRow["Mức Giảm"] !== undefined ? String(configRow["Mức Giảm"]) : prev.discountValue,
              startAt: configRow["Bắt đầu (YYYY-MM-DDTHH:mm)"] !== undefined ? String(configRow["Bắt đầu (YYYY-MM-DDTHH:mm)"]) : prev.startAt,
              endAt: configRow["Kết thúc (YYYY-MM-DDTHH:mm)"] !== undefined ? String(configRow["Kết thúc (YYYY-MM-DDTHH:mm)"]) : prev.endAt,
            }));
          }
        }

        const newItems: SaleProgramItem[] = [];
        let validCount = 0;

        for (const row of data as any[]) {
          const pId = row["Mã SP"] || row["Product ID"];
          const vId = row["Mã BT"] || row["Variant ID"];
          const qty = row["Giới hạn Số lượng"];

          if (pId && !isNaN(Number(pId))) {
            const qtyLimit = (qty && !isNaN(Number(qty)) && Number(qty) > 0) ? Number(qty) : undefined;
            const variantId = (vId && !isNaN(Number(vId))) ? Number(vId) : undefined;
            
            newItems.push({
              productId: Number(pId),
              variantId: variantId,
              promoQtyLimit: qtyLimit
            });
            validCount++;
          }
        }

        if (validCount > 0) {
          setItems(prev => [...prev, ...newItems]);
          toast.success(`Đã thêm thành công ${validCount} dòng từ file Excel!`);
          
          newItems.forEach(item => {
            if (item.productId) loadVariants(item.productId);
          });
        } else {
          toast.error("Không tìm thấy dữ liệu hợp lệ trong file Excel.");
        }
      } catch (err) {
        toast.error("Lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng.");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Live calculation preview
  const sampleOriginalPrice = 500000;
  const numDiscountValue = Number(formData.discountValue) || 0;
  const sampleSalePrice = formData.discountType === "PERCENT"
    ? Math.max(0, Math.round(sampleOriginalPrice * (1 - numDiscountValue / 100)))
    : Math.max(0, numDiscountValue);
  const sampleSaved = Math.max(0, sampleOriginalPrice - sampleSalePrice);

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
      {/* Top accent gradient bar */}
      <div className="h-2 w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600" />
      
      <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-10">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30">
              <span className="material-symbols-outlined text-3xl">loyalty</span>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  {isEdit ? "Cập Nhật Chương Trình Sale" : "Tạo Mới Chương Trình Sale"}
                </h2>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {isEdit ? `#${initialData?.id}` : "Studio White"}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                Thiết lập chiến dịch khuyến mãi chi tiết theo biến thể nhiều tầng hoặc toàn bộ sản phẩm.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/sales/programs"
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-7 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] hover:shadow-indigo-500/35 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">save</span>
              )}
              {loading ? "Đang lưu..." : (isEdit ? "Lưu thay đổi" : "Lưu chương trình")}
            </button>
          </div>
        </div>

        {/* Form Sections Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Section 1: Thông tin cơ bản */}
          <div className="space-y-6 rounded-3xl border border-slate-200/80 bg-slate-50/60 p-6 md:p-8 dark:border-slate-800 dark:bg-slate-800/30">
            <div className="flex items-center gap-3 border-b border-slate-200/60 pb-4 dark:border-slate-700/60">
              <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">info</span>
              <h3 className="font-headline text-lg font-bold text-slate-900 dark:text-white">Thông tin cơ bản</h3>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Tên Chương Trình Sale <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">campaign</span>
                <input
                  required
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-3.5 pl-12 pr-4 text-sm font-semibold text-slate-900 dark:text-slate-100 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Flash Sale Giữa Tháng, Đại Tiệc Giảm Giá..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Mô tả chi tiết (Tùy chọn)
              </label>
              <textarea
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nhập ghi chú hoặc mô tả chiến dịch khuyến mãi..."
                rows={3}
              />
            </div>
            
            {/* Toggles */}
            <div className="space-y-3 pt-2">
              <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-700">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Kích hoạt chiến dịch ngay</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Cho phép chương trình chạy tự động khi nằm trong khung giờ áp dụng.</p>
                </div>
              </label>
              
              <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-sm transition-all hover:border-indigo-300 dark:border-indigo-900/50 dark:bg-indigo-950/30">
                <input
                  type="checkbox"
                  id="sendEmailNotification"
                  checked={formData.sendEmailNotification}
                  onChange={(e) => setFormData({ ...formData, sendEmailNotification: e.target.checked })}
                  className="h-5 w-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-sm font-bold text-indigo-950 dark:text-indigo-200">Gửi Email thông báo khách hàng</span>
                  <p className="text-xs text-indigo-700/80 dark:text-indigo-400">Tự động kích hoạt email quảng bá chiến dịch giảm giá đến khách hàng.</p>
                </div>
              </label>
            </div>
          </div>

          {/* Section 2: Cấu hình ưu đãi & Thời gian */}
          <div className="space-y-6 rounded-3xl border border-slate-200/80 bg-slate-50/60 p-6 md:p-8 dark:border-slate-800 dark:bg-slate-800/30">
            <div className="flex items-center gap-3 border-b border-slate-200/60 pb-4 dark:border-slate-700/60">
              <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">tune</span>
              <h3 className="font-headline text-lg font-bold text-slate-900 dark:text-white">Cấu hình ưu đãi & Thời gian</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">Loại giảm giá</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-slate-100 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                  >
                    <option value="PERCENT">Giảm phần trăm (%)</option>
                    <option value="AMOUNT">Đồng giá (VNĐ)</option>
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">expand_more</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">Mức giảm</label>
                <div className="relative">
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-slate-100 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder={formData.discountType === "PERCENT" ? "VD: 20" : "VD: 99000"}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
                    {formData.discountType === "PERCENT" ? "%" : "₫"}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Interactive Preview Box */}
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/50 p-4 dark:border-indigo-900/60 dark:bg-slate-850">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  Xem trước huy hiệu & mức giá mô phỏng
                </span>
                {formData.discountType === "PERCENT" ? (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 px-2.5 py-0.5 text-xs font-black text-white shadow-xs">
                    <span className="material-symbols-outlined text-[13px]">bolt</span>
                    FLASH SALE -{numDiscountValue}%
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-2.5 py-0.5 text-xs font-black text-white shadow-xs">
                    <span className="material-symbols-outlined text-[13px]">sell</span>
                    ĐỒNG GIÁ {moneyVnd(numDiscountValue)}
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                Giá gốc: <span className="line-through text-slate-400">{moneyVnd(sampleOriginalPrice)}</span> ➔ Giá bán: <span className="font-black text-emerald-600 dark:text-emerald-400">{moneyVnd(sampleSalePrice)}</span>
                {sampleSaved > 0 && (
                  <span className="ml-2 font-bold text-rose-500">(Tiết kiệm {moneyVnd(sampleSaved)})</span>
                )}
              </p>
            </div>

            <div className="border-t border-slate-200/60 pt-4 dark:border-slate-700/60 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">Bắt đầu từ</label>
                  <input
                    required
                    type="datetime-local"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-bold text-slate-900 dark:text-slate-100 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    value={formData.startAt}
                    onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">Kết thúc lúc</label>
                  <input
                    required
                    type="datetime-local"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-bold text-slate-900 dark:text-slate-100 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    value={formData.endAt}
                    onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Sản phẩm áp dụng */}
        <div className="space-y-6 rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <span className="material-symbols-outlined text-2xl">category</span>
              </div>
              <div>
                <h3 className="font-headline text-xl font-black text-slate-900 dark:text-white">Danh sách sản phẩm áp dụng</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Thêm sản phẩm, chọn biến thể nhiều tầng hoặc áp dụng cho cả sản phẩm</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setExportModalOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">file_download</span>
                Tải Template Excel
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
                className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 shadow-xs hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-900/60 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">file_upload</span>
                Nhập Excel
              </button>

              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:scale-[1.02] transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Thêm sản phẩm
              </button>
            </div>
          </div>

          {/* Product Items List */}
          <div className="space-y-4">
            {items.map((item, index) => {
              const selectedProduct = products.find(p => p.id === item.productId);
              const productVariants = variantsCache[item.productId] || [];
              const selectedVariant = item.variantId ? productVariants.find(v => v.id === item.variantId) : null;
              const parsedVariant = selectedVariant ? parseVariantTiers(selectedVariant) : null;

              return (
                <div 
                  key={index}
                  className="group relative flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 shadow-xs transition-all hover:border-indigo-300 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-850 dark:hover:border-indigo-700"
                >
                  {/* Order badge */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-black text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {index + 1}
                  </div>

                  {/* Product Picker */}
                  <div className="flex-1 min-w-[260px]">
                    <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Sản phẩm <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setPickerOpenForIndex(index)}
                      className="group/btn flex w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-left shadow-xs transition-all hover:border-indigo-400"
                    >
                      <div className="min-w-0 pr-2">
                        {item.productId ? (
                          <>
                            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                              {selectedProduct?.name || `Sản phẩm #${item.productId}`}
                            </p>
                            <p className="text-xs text-slate-400">
                              ID: #{item.productId} {selectedProduct?.sku && `• SKU: ${selectedProduct.sku}`}
                              {selectedProduct?.availability != null && ` • Tồn: ${selectedProduct.availability}`}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm font-medium text-slate-400">Bấm để chọn sản phẩm...</p>
                        )}
                      </div>
                      <span className="material-symbols-outlined text-slate-400 group-hover/btn:text-indigo-600 transition-colors">
                        expand_more
                      </span>
                    </button>
                  </div>

                  {/* Variant Picker */}
                  <div className="flex-1 min-w-[280px]">
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Biến thể áp dụng
                      </label>
                      {item.variantId && (
                        <button
                          type="button"
                          onClick={() => handleChangeItem(index, "variantId", undefined)}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 underline"
                        >
                          ✕ Đổi sang toàn bộ SP
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={!item.productId || productVariants.length === 0}
                      onClick={() => setVariantPickerOpenForIndex(index)}
                      className="group/btn flex w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-left shadow-xs transition-all hover:border-indigo-400 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800/50"
                    >
                      <div className="min-w-0 pr-2">
                        {!item.productId ? (
                          <p className="text-xs font-medium text-slate-400">Chưa chọn sản phẩm</p>
                        ) : productVariants.length === 0 ? (
                          <p className="text-xs font-semibold text-slate-500">Sản phẩm không có biến thể</p>
                        ) : item.variantId && parsedVariant ? (
                          <div>
                            {parsedVariant.tiers.length > 0 ? (
                              <div className="flex flex-wrap items-center gap-1.5">
                                {parsedVariant.tiers.map((t, tidx) => (
                                  <span key={tidx} className="inline-flex items-center gap-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                                    <span className="text-slate-400 font-medium">{t.name}:</span>
                                    <span>{t.value}</span>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{parsedVariant.fullLabel}</p>
                            )}
                            <p className="mt-1 text-[11px] font-mono text-slate-400">
                              ID: #{item.variantId} • Tồn: {parsedVariant.availability ?? 0}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                              <span className="material-symbols-outlined text-[14px]">all_inclusive</span>
                              Áp dụng toàn bộ ({productVariants.length} biến thể)
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="material-symbols-outlined text-slate-400 group-hover/btn:text-indigo-600 transition-colors">
                        tune
                      </span>
                    </button>
                  </div>

                  {/* Quantity Limit with preset pills */}
                  <div className="w-[160px]">
                    <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      SL Giới Hạn
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-center text-sm font-bold text-slate-900 dark:text-slate-100 shadow-xs outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                      value={item.promoQtyLimit || ""}
                      onChange={(e) => handleChangeItem(index, "promoQtyLimit", e.target.value)}
                      placeholder="∞ Vô hạn"
                    />
                    {/* Presets */}
                    <div className="mt-1.5 flex items-center justify-between gap-1">
                      {[
                        { label: "∞", val: "" },
                        { label: "10", val: 10 },
                        { label: "50", val: 50 },
                        { label: "100", val: 100 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => handleChangeItem(index, "promoQtyLimit", preset.val)}
                          className="flex-1 rounded-lg border border-slate-200 bg-white py-0.5 text-[10px] font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <div className="flex items-end pb-3">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition-colors"
                      title="Xóa dòng này"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>

                  {/* Inline Errors */}
                  {(overlapErrors[index] || qtyErrors[index]) && (
                    <div className="w-full mt-1 flex flex-col gap-1.5 animate-in slide-in-from-top-1">
                      {overlapErrors[index] && (
                        <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300">
                          <span className="material-symbols-outlined text-[16px]">error</span>
                          <span>{overlapErrors[index]}</span>
                        </div>
                      )}
                      {qtyErrors[index] && (
                        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-300">
                          <span className="material-symbols-outlined text-[16px]">warning</span>
                          <span>{qtyErrors[index]}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-16 text-slate-400 dark:border-slate-800">
                <span className="material-symbols-outlined mb-2 text-4xl opacity-40">inventory_2</span>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Chưa có sản phẩm nào trong chương trình</p>
                <p className="mt-1 text-xs text-slate-400">Bấm nút "Thêm sản phẩm" hoặc tải tệp Excel lên để bắt đầu</p>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Thêm sản phẩm ngay
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
          <Link
            href="/admin/sales/programs"
            className="rounded-xl px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            Hủy bỏ
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] hover:shadow-indigo-500/35 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">save</span>
            )}
            {loading ? "Đang lưu..." : (isEdit ? "Cập nhật chương trình" : "Lưu chương trình")}
          </button>
        </div>

        {/* Modals */}
        <ProductPickerModal 
          isOpen={pickerOpenForIndex !== null}
          onClose={() => setPickerOpenForIndex(null)}
          onSelect={(productId) => {
            if (pickerOpenForIndex !== null) {
              handleChangeItem(pickerOpenForIndex, "productId", productId);
            }
          }}
          products={products}
          currentValue={pickerOpenForIndex !== null ? items[pickerOpenForIndex]?.productId : undefined}
        />
        
        <VariantPickerModal
          isOpen={variantPickerOpenForIndex !== null}
          onClose={() => setVariantPickerOpenForIndex(null)}
          onSelect={(variantId) => {
            if (variantPickerOpenForIndex !== null) {
              handleChangeItem(variantPickerOpenForIndex, "variantId", variantId);
            }
          }}
          variants={variantPickerOpenForIndex !== null && items[variantPickerOpenForIndex]?.productId ? (variantsCache[items[variantPickerOpenForIndex].productId] || []) : []}
          currentValue={variantPickerOpenForIndex !== null ? (items[variantPickerOpenForIndex]?.variantId ?? undefined) : undefined}
        />

        <SelectiveExportModal
          isOpen={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
        />
      </form>
    </section>
  );
}
