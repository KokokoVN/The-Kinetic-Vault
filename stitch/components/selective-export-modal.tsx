"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { apiUrl } from "@/lib/api";

export function SelectiveExportModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [selectedVariantIds, setSelectedVariantIds] = useState<number[]>([]);
  const [productVariantsMap, setProductVariantsMap] = useState<Record<number, any[]>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen && products.length === 0) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/catalog/products"));
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      toast.error("Không thể tải danh sách sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const pName = p.name || p.productName || "";
    return pName.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
           p.id.toString().includes(searchQuery);
  });

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

  const fetchVariants = async (productId: number) => {
    if (productVariantsMap[productId]) return productVariantsMap[productId];
    try {
      const res = await fetch(apiUrl(`/catalog/products/${productId}/variants`));
      if (res.ok) {
        const data = await res.json();
        setProductVariantsMap(prev => ({ ...prev, [productId]: data }));
        return data;
      }
    } catch (err) {
      console.error(err);
    }
    return [];
  };

  const toggleProductSelection = async (p: { id: number }) => {
    if (isProductFullySelected(p)) {
      setSelectedProductIds(prev => prev.filter(id => id !== p.id));
      const variants = productVariantsMap[p.id] || [];
      setSelectedVariantIds(prev => prev.filter(vId => !variants.some(v => v.id === vId)));
    } else {
      setSelectedProductIds(prev => [...new Set([...prev, p.id])]);
      const variants = productVariantsMap[p.id] ? productVariantsMap[p.id] : await fetchVariants(p.id);
      setSelectedVariantIds(prev => [...new Set([...prev, ...variants.map((v: any) => v.id)])]);
    }
  };

  const toggleVariantSelection = (productId: number, variantId: number) => {
    if (selectedVariantIds.includes(variantId)) {
      const nextVariantIds = selectedVariantIds.filter(id => id !== variantId);
      setSelectedVariantIds(nextVariantIds);
      
      // Check if there are any other variants selected for this product
      const variantsOfProduct = productVariantsMap[productId] || [];
      const hasOtherSelected = variantsOfProduct.some(v => nextVariantIds.includes(v.id));
      if (!hasOtherSelected) {
        setSelectedProductIds(prev => prev.filter(id => id !== productId));
      }
    } else {
      setSelectedVariantIds(prev => [...prev, variantId]);
      if (!selectedProductIds.includes(productId)) {
        setSelectedProductIds(prev => [...prev, productId]);
      }
    }
  };

  const handleExportSelected = async () => {
    if (selectedProductIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 sản phẩm.");
      return;
    }
    setExporting(true);
    try {
      const rows = [];
      for (const pId of selectedProductIds) {
        const p = products.find(prod => prod.id === pId);
        if (!p) continue;

        let vList = productVariantsMap[p.id] || [];
        if (!productVariantsMap[p.id]) {
          vList = await fetchVariants(p.id);
        }

        const selectedVList = vList.filter((v: any) => selectedVariantIds.includes(v.id));

        if (vList.length === 0) {
          // No variants at all
          rows.push({
            "Mã SP": p.id,
            "Tên SP": p.name || p.productName || p.sku,
            "Mã BT": "",
            "Thuộc tính BT": "Không có biến thể",
            "Giới hạn Số lượng": "",
            "Tên Chương Trình": "",
            "Mô tả": "",
            "Loại Giảm (PERCENT/AMOUNT)": "",
            "Mức Giảm": "",
            "Bắt đầu (YYYY-MM-DDTHH:mm)": "",
            "Kết thúc (YYYY-MM-DDTHH:mm)": ""
          });
        } else if (selectedVList.length > 0) {
          for (const v of selectedVList) {
            rows.push({
              "Mã SP": p.id,
              "Tên SP": p.name || p.productName || p.sku,
              "Mã BT": v.id,
              "Thuộc tính BT": `Màu: ${v.color || "N/A"} - Size: ${v.size || "N/A"}`,
              "Giới hạn Số lượng": "",
              "Tên Chương Trình": "",
              "Mô tả": "",
              "Loại Giảm (PERCENT/AMOUNT)": "",
              "Mức Giảm": "",
              "Bắt đầu (YYYY-MM-DDTHH:mm)": "",
              "Kết thúc (YYYY-MM-DDTHH:mm)": ""
            });
          }
        }
      }

      if (rows.length === 0) {
        toast.error("Không có dữ liệu hợp lệ để xuất.");
        return;
      }

      const ws = XLSX.utils.json_to_sheet(rows);
      const colWidths = [
        { wch: 15 }, // Product ID
        { wch: 50 }, // Product Name
        { wch: 15 }, // Variant ID
        { wch: 40 }, // Variant Name
        { wch: 20 }, // Giới hạn Số lượng
        { wch: 30 }, // Tên Chương Trình
        { wch: 40 }, // Mô tả
        { wch: 25 }, // Loại Giảm
        { wch: 15 }, // Mức Giảm
        { wch: 25 }, // Bắt đầu
        { wch: 25 }  // Kết thúc
      ];
      ws["!cols"] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");
      XLSX.writeFile(wb, "Sale_Program_Template.xlsx");
      toast.success("Tải template thành công!");
      onClose();
    } catch (e) {
      toast.error("Lỗi khi xuất file Excel.");
    } finally {
      setExporting(false);
    }
  };

  const handleExportBlank = () => {
    const ws = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, [["Mã SP", "Tên SP", "Mã BT", "Thuộc tính BT", "Giới hạn Số lượng", "Tên Chương Trình", "Mô tả", "Loại Giảm (PERCENT/AMOUNT)", "Mức Giảm", "Bắt đầu (YYYY-MM-DDTHH:mm)", "Kết thúc (YYYY-MM-DDTHH:mm)"]], { origin: "A1" });
    const colWidths = [ { wch: 15 }, { wch: 50 }, { wch: 15 }, { wch: 40 }, { wch: 20 }, { wch: 30 }, { wch: 40 }, { wch: 25 }, { wch: 15 }, { wch: 25 }, { wch: 25 } ];
    ws["!cols"] = colWidths;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Sale_Program_Template_Blank.xlsx");
    toast.success("Tải template rỗng thành công!");
    onClose();
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-4xl max-h-[90vh] flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <span className="material-symbols-outlined text-2xl">list_alt</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Chọn Sản phẩm xuất Template</h2>
              <p className="text-sm text-slate-500">Chỉ tải xuống file Excel cho các sản phẩm đã chọn.</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 bg-slate-50/50 flex-1 overflow-hidden flex flex-col">
          <div className="relative mb-4">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              className="w-full rounded-2xl border-2 border-slate-200 bg-white py-3 pl-12 pr-4 text-sm font-medium transition-all focus:border-blue-500 focus:outline-none"
              placeholder="Tìm kiếm theo tên sản phẩm hoặc SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {selectedProductIds.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2 max-h-24 overflow-y-auto">
              {selectedProductIds.map(pId => {
                const p = products.find(prod => prod.id === pId);
                if (!p) return null;
                const vList = productVariantsMap[p.id] || [];
                const selectedV = vList.filter(v => selectedVariantIds.includes(v.id));
                
                let text = p.name || p.productName || p.sku;
                if (vList.length > 0) {
                  if (selectedV.length === 0) {
                    text += " (Chưa chọn biến thể)";
                  } else if (selectedV.length < vList.length) {
                    text += ` (${selectedV.length} biến thể)`;
                  } else {
                    text += " (Tất cả biến thể)";
                  }
                }

                return (
                  <div key={pId} className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm">
                    <span className="truncate max-w-[200px]">{text}</span>
                    <button 
                      onClick={() => toggleProductSelection({ id: pId })} 
                      className="ml-1 flex h-4 w-4 items-center justify-center rounded-full hover:bg-blue-200 hover:text-blue-900 transition-colors"
                      title="Bỏ chọn"
                    >
                      <span className="material-symbols-outlined text-[12px] font-bold">close</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex-1 overflow-y-auto rounded-2xl border-2 border-slate-200 bg-white min-h-[300px] max-h-[500px]">
            {loading ? (
              <div className="flex h-full items-center justify-center text-slate-500">
                <span className="material-symbols-outlined animate-spin text-4xl mb-2">sync</span>
                <p className="font-bold">Đang tải sản phẩm...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
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
                          ref={(el) => { if (el) el.indeterminate = someSelected && !isAllSelected; }}
                          onChange={() => toggleProductSelection(p)}
                          className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                          {p.primaryImageUrl ? (
                            <img src={p.primaryImageUrl} alt={p.productName || "Product"} className="h-full w-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-slate-400">image</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 line-clamp-1">{p.name || p.productName || "Không có tên"}</h4>
                          <p className="text-xs text-slate-500 font-medium">SKU: {p.sku || 'N/A'} - ID: {p.id}</p>
                        </div>
                        
                        {!productVariantsMap[p.id] && (
                          <button 
                            onClick={() => fetchVariants(p.id)}
                            className="text-xs text-blue-600 font-semibold hover:underline"
                          >
                            Tải biến thể
                          </button>
                        )}
                      </div>

                      {productVariantsMap[p.id]?.length > 0 && (
                        <div className="mt-3 pl-14 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {productVariantsMap[p.id].map((v: any) => (
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
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 p-6 bg-white">
          <button
            onClick={handleExportBlank}
            className="rounded-xl px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Tải File Trống (Chỉ tiêu đề)
          </button>
          <button
            onClick={handleExportSelected}
            disabled={exporting || selectedProductIds.length === 0}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-500/40 disabled:opacity-50 disabled:pointer-events-none"
          >
            <span className="material-symbols-outlined text-[18px]">{exporting ? "sync" : "cloud_download"}</span>
            {exporting ? "Đang xuất..." : `Xuất File (${selectedProductIds.length} SP)`}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
