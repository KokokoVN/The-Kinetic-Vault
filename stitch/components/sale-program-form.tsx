"use client";

import { useState, useEffect, useRef } from "react";
import { apiUrl } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as XLSX from "xlsx";
import { createAdminSaleProgram, updateAdminSaleProgram, type SaleProgram, type SaleProgramItem } from "@/lib/sale-api";
import { toast } from "sonner";
import { ProductPickerModal } from "./product-picker-modal";
import { VariantPickerModal } from "./variant-picker-modal";
import { SelectiveExportModal } from "./selective-export-modal";

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
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    discountType: initialData?.discountType || "PERCENT",
    discountValue: initialData?.discountValue || "",
    active: initialData?.active ?? true,
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
    let maxAvailability = 0;
    
    if (variantId && variantsCache[productId]) {
      const v = variantsCache[productId].find(x => x.id === variantId);
      if (v) maxAvailability = v.availability || 0;
    } else if (products) {
      const p = products.find(x => x.id === productId);
      if (p) maxAvailability = p.availability || 0;
    }

    setQtyErrors(prev => {
      const newErr = { ...prev };
      if (limitNum > maxAvailability) {
        newErr[index] = `Số lượng khuyến mãi không được vượt quá tồn kho hiện tại (${maxAvailability}).`;
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
          
          // Load variants for the newly imported products so the UI can display variant names
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
    // Reset input
    e.target.value = '';
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 shadow-xl shadow-purple-900/5 dark:shadow-none backdrop-blur-xl relative">
      <div className="h-2 w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />
      <form onSubmit={handleSubmit} className="p-8 space-y-12">
      <div className="relative flex items-center gap-6 pb-6 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-lg shadow-blue-500/30">
          <span className="material-symbols-outlined text-3xl">loyalty</span>
        </div>
        <div>
          <h2 className="font-headline text-2xl font-black tracking-tight text-slate-800 dark:text-white">{isEdit ? "Cập nhật Chương trình Sale" : "Tạo Chương trình Sale"}</h2>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">Thiết lập chiến dịch giảm giá siêu tốc với giao diện quản lý cao cấp.</p>
        </div>
      </div>

      <div className="relative grid gap-8 lg:grid-cols-2">
        {/* Section 1: Thông tin cơ bản */}
        <div className="space-y-6 rounded-[2rem] border border-white/60 bg-white/40 p-8 shadow-sm backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-200/50 pb-4">
            <span className="material-symbols-outlined text-blue-600">info</span>
            <h3 className="font-headline text-lg font-bold text-slate-800">Thông tin cơ bản</h3>
          </div>

          <div className="group">
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500 transition-colors group-focus-within:text-blue-600">Tên Chương Trình Sale</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500">campaign</span>
              <input
                required
                type="text"
                className="w-full rounded-2xl border border-white/80 bg-white/50 py-4 pl-14 pr-5 text-sm font-semibold text-slate-800 outline-none ring-4 ring-transparent transition-all placeholder:font-normal placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:shadow-[0_0_30px_rgba(59,130,246,0.15)] focus:ring-blue-400/20"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Flash Sale Giữa Tháng..."
              />
            </div>
          </div>

          <div className="group">
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500 transition-colors group-focus-within:text-blue-600">Mô tả chi tiết (Tùy chọn)</label>
            <textarea
              className="w-full rounded-2xl border border-white/80 bg-white/50 px-5 py-4 text-sm font-semibold text-slate-800 outline-none ring-4 ring-transparent transition-all placeholder:font-normal placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:shadow-[0_0_30px_rgba(59,130,246,0.15)] focus:ring-blue-400/20"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Nhập mô tả chương trình để dễ dàng quản lý..."
              rows={4}
            />
          </div>
          
          <div className="flex items-center gap-4 rounded-2xl border border-white/80 bg-white/50 px-6 py-5 shadow-sm transition-all hover:bg-white/80">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="peer h-7 w-7 cursor-pointer appearance-none rounded-lg border-2 border-slate-300 transition-all checked:border-blue-500 checked:bg-blue-500 hover:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
              />
              <span className="material-symbols-outlined pointer-events-none absolute text-[18px] font-bold text-white opacity-0 transition-opacity peer-checked:opacity-100">check</span>
            </div>
            <div>
              <label htmlFor="active" className="cursor-pointer text-sm font-bold text-slate-800">Kích hoạt chiến dịch ngay</label>
              <p className="text-xs text-slate-500">Cho phép chiến dịch chạy tự động khi đến thời gian áp dụng.</p>
            </div>
          </div>
        </div>

        {/* Section 2: Cấu hình giảm giá & Thời gian */}
        <div className="space-y-6 rounded-[2rem] border border-white/60 bg-white/40 p-8 shadow-sm backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-200/50 pb-4">
            <span className="material-symbols-outlined text-indigo-600">settings_suggest</span>
            <h3 className="font-headline text-lg font-bold text-slate-800">Cấu hình ưu đãi</h3>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="group">
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500 transition-colors group-focus-within:text-indigo-600">Loại giảm giá</label>
              <div className="relative">
                <select
                  className="w-full appearance-none rounded-2xl border border-white/80 bg-white/50 px-5 py-4 text-sm font-bold text-slate-800 outline-none ring-4 ring-transparent transition-all focus:border-indigo-400 focus:bg-white focus:shadow-[0_0_30px_rgba(99,102,241,0.15)] focus:ring-indigo-400/20"
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
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500 transition-colors group-focus-within:text-indigo-600">Mức giảm</label>
              <div className="relative">
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-2xl border border-white/80 bg-white/50 px-5 py-4 text-sm font-bold text-slate-800 outline-none ring-4 ring-transparent transition-all placeholder:font-normal placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:shadow-[0_0_30px_rgba(99,102,241,0.15)] focus:ring-indigo-400/20"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  placeholder={formData.discountType === "PERCENT" ? "VD: 20" : "VD: 50000"}
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  {formData.discountType === "PERCENT" ? "%" : "₫"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200/50 pt-6">
            <div className="mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-cyan-600">schedule</span>
              <h3 className="font-headline text-lg font-bold text-slate-800">Thời gian áp dụng</h3>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="group">
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500 transition-colors group-focus-within:text-cyan-600">Bắt đầu từ</label>
                <input
                  required
                  type="datetime-local"
                  className="w-full rounded-2xl border border-white/80 bg-white/50 px-5 py-4 text-sm font-bold text-slate-800 outline-none ring-4 ring-transparent transition-all focus:border-cyan-400 focus:bg-white focus:shadow-[0_0_30px_rgba(6,182,212,0.15)] focus:ring-cyan-400/20"
                  value={formData.startAt}
                  onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                />
              </div>

              <div className="group">
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500 transition-colors group-focus-within:text-cyan-600">Kết thúc lúc</label>
                <input
                  required
                  type="datetime-local"
                  className="w-full rounded-2xl border border-white/80 bg-white/50 px-5 py-4 text-sm font-bold text-slate-800 outline-none ring-4 ring-transparent transition-all focus:border-cyan-400 focus:bg-white focus:shadow-[0_0_30px_rgba(6,182,212,0.15)] focus:ring-cyan-400/20"
                  value={formData.endAt}
                  onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative rounded-[2rem] border border-white/60 bg-white/40 p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] backdrop-blur-xl">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/50 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
              <span className="material-symbols-outlined">inventory_2</span>
            </div>
            <div>
              <h2 className="font-headline text-2xl font-black text-slate-800">Sản phẩm áp dụng</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">Thêm danh sách sản phẩm hoặc biến thể để giảm giá</p>
            </div>
          </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setExportModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-100 hover:shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
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
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">upload</span>
                Nhập Excel
              </button>

              <button
                type="button"
                onClick={() => setItems([...items, { productId: 0 }])}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/30"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Thêm sản phẩm
              </button>
            </div>
          </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div 
              key={index} 
              style={{ zIndex: 100 - index }}
              className="group relative flex flex-wrap items-center gap-6 rounded-[1.5rem] border border-white bg-white/50 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md transition-all duration-500 hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.15)] hover:border-blue-200"
            >
              {/* Vibrant gradient side accent */}
              <div className="absolute bottom-0 left-0 top-0 w-1.5 rounded-l-[1.5rem] bg-gradient-to-b from-blue-400 via-indigo-500 to-purple-500 opacity-50 transition-opacity group-hover:opacity-100"></div>
              
              <div className="absolute -left-4 -top-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-slate-900 text-sm font-black text-white shadow-xl ring-4 ring-white transition-transform group-hover:scale-110">
                {index + 1}
              </div>
              
              <div className="flex-1 min-w-[280px]">
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-colors group-focus-within:text-blue-600">Chọn Sản phẩm <span className="text-rose-500">*</span></label>
                <button
                  type="button"
                  onClick={() => setPickerOpenForIndex(index)}
                  className="group flex w-full items-center justify-between rounded-xl border border-white/80 bg-white/80 px-4 py-3.5 text-sm font-semibold text-slate-800 ring-4 ring-transparent transition-all hover:border-blue-300"
                >
                  <span className={item.productId ? "text-slate-800 truncate" : "text-slate-400 truncate"}>
                    {item.productId ? products.find(p => p.id === item.productId)?.name || `Sản phẩm #${item.productId}` : "Bấm để chọn sản phẩm..."}
                  </span>
                  <span className="material-symbols-outlined text-slate-400 transition-transform group-hover:translate-x-1">arrow_forward</span>
                </button>
              </div>

              <div className="flex-1 min-w-[220px]">
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-colors group-focus-within:text-blue-600">Biến thể áp dụng</label>
                <button
                  type="button"
                  disabled={!item.productId || !(variantsCache[item.productId]?.length > 0)}
                  onClick={() => setVariantPickerOpenForIndex(index)}
                  className="group flex w-full items-center justify-between rounded-xl border border-white/80 bg-white/80 px-4 py-3.5 text-sm font-semibold text-slate-800 ring-4 ring-transparent transition-all hover:border-blue-300 disabled:bg-slate-100 disabled:text-slate-400 disabled:opacity-50"
                >
                  <span className="truncate">
                    {(!item.productId || !(variantsCache[item.productId]?.length > 0)) 
                      ? "Không có biến thể" 
                      : item.variantId 
                        ? (() => {
                            const v = variantsCache[item.productId]?.find(v => v.id === item.variantId);
                            return v ? `Màu: ${v.color || "N/A"} - Size: ${v.size || "N/A"}` : "Áp dụng toàn bộ";
                          })()
                        : "Áp dụng toàn bộ"
                    }
                  </span>
                  <span className="material-symbols-outlined text-slate-400 transition-transform group-hover:translate-x-1">arrow_forward</span>
                </button>
              </div>

              <div className="w-[140px]">
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-colors group-focus-within:text-blue-600">SL Giới hạn</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    className="w-full rounded-xl border border-white/80 bg-white/80 px-4 py-3.5 text-center font-black text-slate-800 outline-none ring-4 ring-transparent transition-all placeholder:font-medium placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:shadow-[0_0_20px_rgba(59,130,246,0.15)] focus:ring-blue-400/20"
                    value={item.promoQtyLimit || ""}
                    onChange={(e) => handleChangeItem(index, "promoQtyLimit", e.target.value)}
                    placeholder="∞"
                  />
                </div>
              </div>

              <div className="flex items-end pb-1 pl-2 border-l border-slate-200/50">
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="group/btn relative flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-all hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/30"
                  title="Xóa sản phẩm này"
                >
                  <span className="material-symbols-outlined transition-transform group-hover/btn:rotate-12 group-hover/btn:scale-110">delete</span>
                </button>
              </div>
              
              {/* Inline Errors */}
              {(overlapErrors[index] || qtyErrors[index]) && (
                <div className="w-full mt-2 animate-in slide-in-from-top-2 flex flex-col gap-2">
                  {overlapErrors[index] && (
                    <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 border border-rose-100">
                      <span className="material-symbols-outlined text-[18px]">warning</span>
                      {overlapErrors[index]}
                    </div>
                  )}
                  {qtyErrors[index] && (
                    <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-600 border border-orange-100">
                      <span className="material-symbols-outlined text-[18px]">inventory</span>
                      {qtyErrors[index]}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-slate-300/60 bg-white/30 py-16 text-slate-400 transition-colors hover:border-blue-400/50 hover:bg-white/50">
              <span className="material-symbols-outlined mb-3 text-5xl opacity-40">shopping_bag</span>
              <span className="font-headline text-lg font-bold text-slate-600">Chưa có sản phẩm nào</span>
              <p className="mt-1 text-sm text-slate-500">Bấm nút "Thêm sản phẩm" phía trên để bắt đầu cấu hình.</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 pt-6 mt-8 border-t border-slate-200/50 dark:border-slate-800/50">
        <Link
          href="/admin/sales/programs"
          className="rounded-xl px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Hủy bỏ
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] hover:shadow-blue-600/30 disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? (
            <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
          ) : (
            <span className="material-symbols-outlined text-[18px]">save</span>
          )}
          {loading ? "Đang lưu..." : "Lưu chương trình"}
        </button>
      </div>
      
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

      </form>
    </section>
  );
}
