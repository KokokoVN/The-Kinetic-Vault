"use client";
import { useState, useEffect } from "react";
import { apiUrl } from "@/lib/api";
import { getInventoryBalances, getInventoryMovements, manualStockUpdate, getProductName, type InventoryBalanceDto } from "@/lib/inventory-api";
import { InventoryExcelImport } from "@/components/inventory-excel-import";

export function InventoryDashboard({ 
  accessToken, 
  username, 
  products = [] 
}: { 
  accessToken: string | null; 
  username: string;
  products?: { id: number; name: string; sku?: string; heroImage?: string }[];
}) {
  const [activeTab, setActiveTab] = useState<"balances" | "import" | "history">("balances");
  const [balances, setBalances] = useState<InventoryBalanceDto[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [productNamesMap, setProductNamesMap] = useState<Record<number, string>>({});
  const [variantNamesMap, setVariantNamesMap] = useState<Record<number, string>>({});
  
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"INBOUND" | "OUTBOUND">("INBOUND");
  const [formData, setFormData] = useState({ productId: "", variantId: "", quantity: "", unitCost: "", note: "" });
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProductNames = async (items: any[]) => {
    const pIds = Array.from(new Set(items.map((i) => i.productId)));
    const newNames: Record<number, string> = { ...productNamesMap };
    const newVariants: Record<number, string> = { ...variantNamesMap };
    for (const id of pIds) {
      if (!newNames[id]) {
        try {
          const name = await getProductName(id, { accessToken });
          newNames[id] = name;
        } catch (e) {
          newNames[id] = `Sản phẩm #${id}`;
        }
      }
      
      try {
        const res = await fetch(apiUrl(`/catalog/products/${id}/variants`));
        if (res.ok) {
          const variants = await res.json();
          variants.forEach((v: any) => {
             let vName = "";
             if (v.color) vName += `Màu: ${v.color} `;
             if (v.size) vName += `- Size: ${v.size}`;
             newVariants[v.id] = vName.trim() || `Biến thể #${v.id}`;
          });
        }
      } catch (e) {
         // ignore
      }
    }
    setProductNamesMap(newNames);
    setVariantNamesMap(newVariants);
  };

  useEffect(() => {
    async function fetchVariants() {
      if (!formData.productId) {
        setVariants([]);
        return;
      }
      try {
        const res = await fetch(apiUrl(`/catalog/products/${formData.productId}/variants`));
        if (res.ok) {
          const data = await res.json();
          setVariants(Array.isArray(data) ? data : []);
        } else {
          setVariants([]);
        }
      } catch {
        setVariants([]);
      }
    }
    fetchVariants();
  }, [formData.productId]);

  const loadBalances = async (p: number = 0) => {
    setLoading(true);
    try {
      const data = await getInventoryBalances(p, 20, { accessToken });
      setBalances(data.content);
      setTotalPages(data.totalPages);
      setPage(data.number);
      fetchProductNames(data.content);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadMovements = async (p = 0) => {
    setLoading(true);
    try {
      const data = await getInventoryMovements(p, 20, { accessToken });
      if (data && data.content) {
        setMovements(data.content);
        setHistoryTotalPages(data.totalPages);
        setHistoryPage(data.number);
        fetchProductNames(data.content);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "balances") {
      loadBalances(page);
    } else if (activeTab === "history") {
      loadMovements(historyPage);
    }
  }, [page, historyPage, activeTab]);

  const handleAddItem = () => {
    if (!formData.productId || !formData.quantity) return;
    const pName = products.find(p => p.id.toString() === formData.productId)?.name || "";
    let vName = "";
    if (formData.variantId) {
      const v = variants.find(v => v.id.toString() === formData.variantId);
      if (v) vName = `Màu: ${v.color || "N/A"} - Size: ${v.size || "N/A"}`;
    }
    setPendingItems([...pendingItems, { ...formData, pName, vName }]);
    setFormData({ productId: "", variantId: "", quantity: "", unitCost: "", note: "" });
  };

  const handleManualSubmit = async () => {
    if (pendingItems.length === 0) {
      setErrorMsg("Vui lòng thêm ít nhất 1 sản phẩm vào danh sách.");
      return;
    }
    setSubmitLoading(true);
    setErrorMsg("");
    try {
      for (const item of pendingItems) {
        await manualStockUpdate(modalType, {
          productId: Number(item.productId),
          variantId: item.variantId ? Number(item.variantId) : undefined,
          quantity: Number(item.quantity),
          unitCost: item.unitCost ? Number(item.unitCost) : undefined,
          note: item.note
        }, { accessToken, username });
      }
      setShowModal(false);
      setPendingItems([]);
      if (activeTab === "balances") loadBalances(page);
      if (activeTab === "history") loadMovements(historyPage);
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
        <button
          className={`pb-4 text-sm font-bold transition-all ${
            activeTab === "balances"
              ? "border-b-2 border-blue-600 text-blue-700 dark:text-blue-400 dark:border-blue-500"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 dark:hover:text-slate-200"
          }`}
          onClick={() => setActiveTab("balances")}
        >
          Danh sách Tồn kho
        </button>
        <button
          className={`pb-4 text-sm font-bold transition-all ${
            activeTab === "import"
              ? "border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 dark:border-emerald-500"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 dark:hover:text-slate-200"
          }`}
          onClick={() => setActiveTab("import")}
        >
          Import Bằng Excel
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 border-b-2 px-6 pb-4 text-sm font-bold transition-all ${
            activeTab === "history"
              ? "border-purple-600 text-purple-700 dark:text-purple-400 dark:border-purple-500"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">history</span>
          Lịch sử giao dịch
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "import" && (
        <InventoryExcelImport accessToken={accessToken || ""} username={username} products={products} />
      )}

      {activeTab === "balances" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Tồn kho hiện tại</h2>
            <div className="flex gap-3">
              <button
                onClick={() => { setModalType("INBOUND"); setShowModal(true); }}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span> Nhập Kho
              </button>
              <button
                onClick={() => { setModalType("OUTBOUND"); setShowModal(true); }}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-red-500/30 transition-all hover:-translate-y-0.5 hover:bg-red-700"
              >
                <span className="material-symbols-outlined text-[18px]">remove_circle</span> Xuất Kho
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-xl shadow-blue-900/5 backdrop-blur-xl">
            {loading ? (
              <div className="p-10 text-center text-slate-500 dark:text-slate-400">
                <span className="material-symbols-outlined animate-spin text-4xl">sync</span>
                <p className="mt-2 text-sm font-bold">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="border-b border-slate-200/60 dark:border-slate-700/60 px-6 py-5">Mã / Hình ảnh</th>
                      <th className="border-b border-slate-200/60 dark:border-slate-700/60 px-6 py-5">Tên Sản phẩm</th>
                      <th className="border-b border-slate-200/60 dark:border-slate-700/60 px-6 py-5">Mã BT</th>
                      <th className="border-b border-slate-200/60 dark:border-slate-700/60 px-6 py-5">Số lượng tồn</th>
                      <th className="border-b border-slate-200/60 dark:border-slate-700/60 px-6 py-5">Cập nhật lúc</th>
                      <th className="border-b border-slate-200/60 dark:border-slate-700/60 px-6 py-5 text-right">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {balances.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-10 text-center text-slate-500 dark:text-slate-400">
                          <span className="material-symbols-outlined mx-auto text-4xl mb-3 block opacity-50">search_off</span>
                          Chưa có dữ liệu tồn kho
                        </td>
                      </tr>
                    ) : (
                      balances.map((b) => {
                        const product = products.find(p => p.id === b.productId);
                        return (
                          <tr key={b.id} className="transition-colors hover:bg-slate-50/50 dark:bg-slate-800/50 dark:hover:bg-slate-800/50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
                                  {product?.heroImage ? (
                                    <img src={product.heroImage} alt={product.name} className="h-full w-full object-cover" />
                                  ) : (
                                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 dark:text-slate-400">image</span>
                                  )}
                                </div>
                                <div>
                                  <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400">#{b.productId}</span>
                                  {product?.sku && <p className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500 dark:text-slate-400">SKU: {product.sku}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-bold text-blue-900 dark:text-blue-300 transition-colors hover:text-blue-600 dark:hover:text-blue-200 line-clamp-2">
                              {productNamesMap[b.productId] || "Đang tải..."}
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">{b.variantId ? variantNamesMap[b.variantId] || `#${b.variantId}` : "—"}</td>
                            <td className="px-6 py-4 font-black text-slate-800 dark:text-slate-100">{b.quantityOnHand}</td>
                            <td className="px-6 py-4 text-xs font-medium text-slate-400 dark:text-slate-500 dark:text-slate-400">{new Date(b.updatedAt).toLocaleString("vi-VN")}</td>
                            <td className="px-6 py-4 text-right">
                              {b.quantityOnHand <= 0 ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-900/30 px-2.5 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-200">
                                  Hết hàng
                                </span>
                              ) : b.quantityOnHand < 10 ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                                  Sắp hết
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                                  Sẵn sàng
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination footer */}
            {!loading && totalPages > 0 && (
              <div className="flex items-center justify-center gap-2 py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                <button
                  onClick={() => loadBalances(page - 1)}
                  disabled={page <= 0}
                  className={`rounded-lg border px-4 py-2 text-sm font-bold transition-colors shadow-sm ${
                    page <= 0 
                      ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 dark:text-slate-400 cursor-not-allowed' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700'
                  }`}
                >
                  Trước
                </button>
                
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 min-w-[100px] text-center">
                  Trang {page + 1} / {totalPages}
                </span>
                
                <button
                  onClick={() => loadBalances(page + 1)}
                  disabled={page >= totalPages - 1}
                  className={`rounded-lg border px-4 py-2 text-sm font-bold transition-colors shadow-sm ${
                    page >= totalPages - 1 
                      ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 dark:text-slate-400 cursor-not-allowed' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700'
                  }`}
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="rounded-[2rem] border border-slate-200/60 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-8 shadow-xl shadow-slate-200/20 dark:shadow-none backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Lịch sử xuất/nhập kho</h3>
            <button onClick={() => loadMovements(0)} className="rounded-full bg-slate-100 dark:bg-slate-800 p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
              <span className="material-symbols-outlined">refresh</span>
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-xs uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-bold">Thời gian</th>
                  <th className="px-6 py-4 font-bold">Sản phẩm</th>
                  <th className="px-6 py-4 font-bold">Loại</th>
                  <th className="px-6 py-4 font-bold">Số lượng</th>
                  <th className="px-6 py-4 font-bold">Sau giao dịch</th>
                  <th className="px-6 py-4 font-bold">Ghi chú</th>
                  <th className="px-6 py-4 font-bold">Người thực hiện</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {loading && movements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 dark:text-slate-500 dark:text-slate-400">Đang tải dữ liệu...</td>
                  </tr>
                ) : movements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 dark:text-slate-500 dark:text-slate-400">Chưa có lịch sử giao dịch nào.</td>
                  </tr>
                ) : (
                  movements.map((m: any, idx: number) => {
                    const isOutbound = m.movementType === "OUTBOUND";
                    return (
                      <tr key={idx} className="transition-colors hover:bg-slate-50/50 dark:bg-slate-800/50 dark:hover:bg-slate-800/50">
                        <td className="px-6 py-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                          {new Date(m.movementAt).toLocaleString("vi-VN")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {productNamesMap[m.productId] || `Sản phẩm #${m.productId}`}
                          </div>
                          {m.variantId && (
                            <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Biến thể: {variantNamesMap[m.variantId] || m.variantId}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            isOutbound ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          }`}>
                            <span className="material-symbols-outlined text-[12px]">{isOutbound ? "arrow_upward" : "arrow_downward"}</span>
                            {isOutbound ? "Xuất kho" : "Nhập kho"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-bold ${isOutbound ? "text-amber-600 dark:text-amber-500" : "text-blue-600 dark:text-blue-500"}`}>
                            {isOutbound ? "-" : "+"}{m.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{m.balanceAfter}</td>
                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">{m.note || m.referenceType}</td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-700 dark:text-slate-400">{m.createdBy}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Trang {historyPage + 1} / {historyTotalPages || 1}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setHistoryPage((p) => Math.max(0, p - 1))}
                disabled={historyPage === 0}
                className="flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-400 transition-all hover:bg-slate-200 disabled:opacity-50"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                onClick={() => setHistoryPage((p) => Math.min(historyTotalPages - 1, p + 1))}
                disabled={historyPage >= historyTotalPages - 1}
                className="flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-400 transition-all hover:bg-slate-200 disabled:opacity-50"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border dark:border-slate-800 p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className={`text-xl font-black ${modalType === "INBOUND" ? "text-blue-700 dark:text-blue-400" : "text-red-700 dark:text-red-400"}`}>
                {modalType === "INBOUND" ? "Nhập Kho Thủ Công" : "Xuất Kho Thủ Công"}
              </h3>
              <button onClick={() => { setShowModal(false); setPendingItems([]); }} className="text-slate-400 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {errorMsg && (
              <div className="mb-6 rounded-xl bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800">
                {errorMsg}
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleAddItem(); }} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Chọn Sản phẩm *</label>
                  <select
                    required
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 outline-none focus:border-purple-500 dark:focus:border-purple-500 focus:bg-white dark:bg-slate-900 dark:focus:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    <option value="">-- Chọn sản phẩm --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.sku ? `(SKU: ${p.sku})` : ""} - #{p.id}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500 dark:text-slate-400">Mã Biến Thể</label>
                  <select
                    value={formData.variantId}
                    onChange={(e) => setFormData({ ...formData, variantId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:bg-slate-900 dark:focus:bg-slate-900 focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                  >
                    <option value="">-- Không chọn (Mặc định) --</option>
                    {variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        Màu: {v.color || "N/A"} - Size: {v.size || "N/A"} (ID: {v.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500 dark:text-slate-400">Số Lượng *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:bg-slate-900 dark:focus:bg-slate-900 focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500 dark:text-slate-400">Đơn giá (VND)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.unitCost}
                  onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:bg-slate-900 dark:focus:bg-slate-900 focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500 dark:text-slate-400">Ghi chú</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:bg-slate-900 dark:focus:bg-slate-900 focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                  rows={2}
                />
              </div>

              <div className="pt-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                <button
                  type="submit"
                  className="w-full rounded-xl px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all"
                >
                  <span className="material-symbols-outlined text-sm align-middle mr-1">add</span>
                  Thêm vào danh sách
                </button>
              </div>
            </form>

            {pendingItems.length > 0 && (
              <div className="mt-6">
                <h4 className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Danh sách cần {modalType === "INBOUND" ? "nhập" : "xuất"}:</h4>
                <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2">
                  <ul className="space-y-2">
                    {pendingItems.map((item, idx) => (
                      <li key={idx} className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded shadow-sm text-xs border border-slate-100 dark:border-slate-700">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{item.pName} <span className="text-slate-500 dark:text-slate-400 font-normal ml-1">x{item.quantity}</span></p>
                          {item.vName && <p className="text-slate-500 dark:text-slate-400">{item.vName}</p>}
                        </div>
                        <button onClick={() => setPendingItems(pendingItems.filter((_, i) => i !== idx))} className="text-red-500 hover:bg-red-50 dark:bg-red-900/30 p-1 rounded">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleManualSubmit}
                    disabled={submitLoading}
                    className={`w-full rounded-xl px-4 py-3 text-sm font-bold text-white transition-all ${
                      modalType === "INBOUND" ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"
                    } disabled:opacity-50`}
                  >
                    {submitLoading ? "Đang xử lý..." : `Xác nhận Lệnh (${pendingItems.length} mục)`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
