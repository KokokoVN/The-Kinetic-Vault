"use client";

import { useState, useEffect, useMemo, useId } from "react";
import { apiUrl } from "@/lib/api";
import {
  getInventoryBalances,
  getInventoryMovements,
  manualStockUpdate,
  getProductName,
  type InventoryBalanceDto,
} from "@/lib/inventory-api";
import { parseVariantTiers, type VariantTier, type ParsedVariant } from "@/lib/variant-tier-utils";
import { InventoryExcelImport } from "@/components/inventory-excel-import";
import { StatusToast } from "@/components/status-toast";

export type ProductSummary = {
  id: number;
  name: string;
  sku?: string;
  heroImage?: string;
};

export type PendingReceiptItem = {
  productId: number;
  productName: string;
  productImage?: string;
  productSku?: string;
  variantId?: number;
  variantName?: string;
  tiers?: VariantTier[];
  currentStock?: number;
  quantity: number;
  unitCost: number;
  note: string;
};

export function InventoryDashboard({
  accessToken,
  username,
  products = [],
  initialTotalSkus = 0,
  initialLowStockCount = 0,
}: {
  accessToken: string | null;
  username: string;
  products?: ProductSummary[];
  initialTotalSkus?: number;
  initialLowStockCount?: number;
}) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"balances" | "slip" | "history" | "import">("balances");

  // Balances state
  const [balances, setBalances] = useState<InventoryBalanceDto[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(initialTotalSkus);
  const [loadingBalances, setLoadingBalances] = useState(true);

  // Filter & Search in Balances
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "AVAILABLE" | "LOW" | "OUT">("ALL");

  // History Movements state
  const [movements, setMovements] = useState<any[]>([]);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [movementFilter, setMovementFilter] = useState<"ALL" | "INBOUND" | "OUTBOUND">("ALL");

  // Name Resolution Maps & Dynamic Multi-Tier attributes
  const [productNamesMap, setProductNamesMap] = useState<Record<number, string>>({});
  const [variantNamesMap, setVariantNamesMap] = useState<Record<number, string>>({});
  const [variantTiersMap, setVariantTiersMap] = useState<Record<number, VariantTier[]>>({});

  // Toast Notification
  const [toast, setToast] = useState<{ tone: "success" | "error"; title: string; message: string } | null>(null);

  // ==========================================
  // INBOUND / OUTBOUND RECEIPT SLIP STATE
  // ==========================================
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"INBOUND" | "OUTBOUND">("INBOUND");
  const [receiptReference, setReceiptReference] = useState("");
  const [receiptSupplier, setReceiptSupplier] = useState("");
  const [pendingItems, setPendingItems] = useState<PendingReceiptItem[]>([]);
  const [isSubmittingReceipt, setIsSubmittingReceipt] = useState(false);

  // Current Item in form
  const [selectedProductId, setSelectedProductId] = useState<number | "">("");
  const [productSearchInput, setProductSearchInput] = useState("");
  const [isSearchingProduct, setIsSearchingProduct] = useState(false);
  const [currentVariants, setCurrentVariants] = useState<any[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<number | 0>(0);
  const [itemQuantity, setItemQuantity] = useState<number | "">(50);
  const [itemUnitCost, setItemUnitCost] = useState<number | "">(150000);
  const [itemNote, setItemNote] = useState("");
  const [itemError, setItemError] = useState("");

  const modalTitleId = useId();

  // Selected product object
  const activeProduct = useMemo(
    () => (selectedProductId ? products.find((p) => p.id === Number(selectedProductId)) : null),
    [products, selectedProductId]
  );

  // Selected variant object
  const activeVariant = useMemo(
    () => (selectedVariantId ? currentVariants.find((v) => v.id === selectedVariantId) : null),
    [currentVariants, selectedVariantId]
  );

  // Generate Reference code on mount or when opening modal
  useEffect(() => {
    if (!receiptReference) {
      const now = new Date();
      const code = `PNK-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${Math.floor(100 + Math.random() * 900)}`;
      setReceiptReference(code);
    }
  }, [receiptReference]);

  // Load variant details when selectedProductId changes
  useEffect(() => {
    if (!selectedProductId) {
      setCurrentVariants([]);
      setSelectedVariantId(0);
      return;
    }
    let isCancelled = false;
    async function fetchVariants() {
      setLoadingVariants(true);
      try {
        const res = await fetch(apiUrl(`/catalog/products/${selectedProductId}/variants`));
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled) {
            const list = Array.isArray(data) ? data : [];
            setCurrentVariants(list);
            if (list.length > 0 && !selectedVariantId) {
              setSelectedVariantId(list[0].id);
            }
          }
        } else {
          if (!isCancelled) setCurrentVariants([]);
        }
      } catch {
        if (!isCancelled) setCurrentVariants([]);
      } finally {
        if (!isCancelled) setLoadingVariants(false);
      }
    }
    fetchVariants();
    return () => {
      isCancelled = true;
    };
  }, [selectedProductId]);

  // Fetch product and variant names with full dynamic multi-tier support
  const fetchProductNames = async (items: any[]) => {
    const pIds = Array.from(new Set(items.map((i) => i.productId)));
    const newNames: Record<number, string> = { ...productNamesMap };
    const newVariants: Record<number, string> = { ...variantNamesMap };
    const newTiers: Record<number, VariantTier[]> = { ...variantTiersMap };

    for (const id of pIds) {
      if (!newNames[id]) {
        const pObj = products.find((p) => p.id === id);
        if (pObj) {
          newNames[id] = pObj.name;
        } else {
          try {
            const name = await getProductName(id, { accessToken });
            newNames[id] = name;
          } catch {
            newNames[id] = `Sản phẩm #${id}`;
          }
        }
      }

      try {
        const res = await fetch(apiUrl(`/catalog/products/${id}/variants`));
        if (res.ok) {
          const vList = await res.json();
          if (Array.isArray(vList)) {
            vList.forEach((v: any) => {
              const parsed = parseVariantTiers(v);
              newVariants[v.id] = parsed.fullLabel;
              newTiers[v.id] = parsed.tiers;
            });
          }
        }
      } catch {
        // ignore
      }
    }
    setProductNamesMap(newNames);
    setVariantNamesMap(newVariants);
    setVariantTiersMap(newTiers);
  };

  // Load balances with pagination
  const loadBalances = async (targetPage = 0) => {
    setLoadingBalances(true);
    try {
      const data = await getInventoryBalances(targetPage, 25, { accessToken });
      setBalances(data.content);
      setTotalPages(data.totalPages);
      setPage(data.number);
      setTotalElements(data.totalElements);
      fetchProductNames(data.content);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBalances(false);
    }
  };

  // Load movements with pagination
  const loadMovements = async (targetPage = 0) => {
    setLoadingHistory(true);
    try {
      const data = await getInventoryMovements(targetPage, 25, { accessToken });
      if (data && data.content) {
        setMovements(data.content);
        setHistoryTotalPages(data.totalPages);
        setHistoryPage(data.number);
        fetchProductNames(data.content);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === "balances") {
      loadBalances(page);
    } else if (activeTab === "history") {
      loadMovements(historyPage);
    }
  }, [page, historyPage, activeTab]);

  // Filtered Balances based on search & status filter
  const filteredBalances = useMemo(() => {
    return balances.filter((b) => {
      // Status filter
      if (statusFilter === "AVAILABLE" && b.quantityOnHand < 10) return false;
      if (statusFilter === "LOW" && (b.quantityOnHand <= 0 || b.quantityOnHand >= 10)) return false;
      if (statusFilter === "OUT" && b.quantityOnHand > 0) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const pName = (productNamesMap[b.productId] || "").toLowerCase();
        const vName = (b.variantId ? variantNamesMap[b.variantId] || "" : "").toLowerCase();
        const productObj = products.find((p) => p.id === b.productId);
        const sku = (productObj?.sku || "").toLowerCase();
        const idStr = String(b.productId);

        const match =
          pName.includes(query) ||
          vName.includes(query) ||
          sku.includes(query) ||
          idStr.includes(query);
        if (!match) return false;
      }

      return true;
    });
  }, [balances, statusFilter, searchQuery, productNamesMap, variantNamesMap, products]);

  // Filtered movements
  const filteredMovements = useMemo(() => {
    if (movementFilter === "ALL") return movements;
    return movements.filter((m) => m.movementType === movementFilter);
  }, [movements, movementFilter]);

  // Filtered products for combobox search
  const filteredProductOptions = useMemo(() => {
    if (!productSearchInput.trim()) return products.slice(0, 15);
    const q = productSearchInput.toLowerCase().trim();
    return products
      .filter((p) => p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q)) || String(p.id).includes(q))
      .slice(0, 20);
  }, [products, productSearchInput]);

  // Open Quick Inbound from Table row
  const handleQuickInboundRow = (b: InventoryBalanceDto) => {
    setSelectedProductId(b.productId);
    setSelectedVariantId(b.variantId || 0);
    setItemQuantity(50);
    setItemUnitCost(150000);
    setItemNote(`Nhập bổ sung cho mã #${b.productId}`);
    setModalMode("INBOUND");
    setModalOpen(true);
  };

  // Add Item to Slip List
  const handleAddItemToReceipt = () => {
    setItemError("");
    if (!selectedProductId) {
      setItemError("Vui lòng chọn sản phẩm cần nhập kho.");
      return;
    }
    const qty = typeof itemQuantity === "number" ? itemQuantity : parseInt(String(itemQuantity)) || 0;
    if (qty <= 0) {
      setItemError("Số lượng nhập phải lớn hơn 0.");
      return;
    }
    const cost = typeof itemUnitCost === "number" ? itemUnitCost : parseInt(String(itemUnitCost)) || 0;
    if (cost < 0) {
      setItemError("Đơn giá vốn không được âm.");
      return;
    }

    const p = products.find((prod) => prod.id === Number(selectedProductId));
    const pName = p?.name || productNamesMap[Number(selectedProductId)] || `Sản phẩm #${selectedProductId}`;
    let vName = "";
    let vTiers: VariantTier[] = [];

    if (selectedVariantId) {
      const v = currentVariants.find((varItem) => varItem.id === selectedVariantId);
      if (v) {
        const parsed = parseVariantTiers(v);
        vName = parsed.fullLabel;
        vTiers = parsed.tiers;
      } else {
        vName = variantNamesMap[selectedVariantId] || `Biến thể #${selectedVariantId}`;
        vTiers = variantTiersMap[selectedVariantId] || [];
      }
    }

    // Check if item already exists in pending list
    const existingIndex = pendingItems.findIndex(
      (item) => item.productId === Number(selectedProductId) && (item.variantId || 0) === (selectedVariantId || 0)
    );

    if (existingIndex >= 0) {
      const updated = [...pendingItems];
      updated[existingIndex].quantity += qty;
      updated[existingIndex].unitCost = cost;
      if (itemNote.trim()) updated[existingIndex].note = itemNote.trim();
      setPendingItems(updated);
    } else {
      const newItem: PendingReceiptItem = {
        productId: Number(selectedProductId),
        productName: pName,
        productImage: p?.heroImage,
        productSku: p?.sku,
        variantId: selectedVariantId ? Number(selectedVariantId) : undefined,
        variantName: vName || undefined,
        tiers: vTiers,
        quantity: qty,
        unitCost: cost,
        note: itemNote.trim() || `${receiptReference} - ${modalMode === "INBOUND" ? "Nhập kho" : "Xuất kho"}`,
      };
      setPendingItems([...pendingItems, newItem]);
    }

    // Reset item form
    setItemQuantity(50);
    setItemNote("");
  };

  // Submit Entire Receipt Batch
  const handleSubmitReceiptBatch = async () => {
    if (pendingItems.length === 0) {
      setItemError("Phiếu nhập chưa có mặt hàng nào. Vui lòng thêm ít nhất 1 sản phẩm.");
      return;
    }

    setIsSubmittingReceipt(true);
    setItemError("");

    try {
      for (const item of pendingItems) {
        await manualStockUpdate(
          modalMode,
          {
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitCost: item.unitCost,
            note: `${item.note}${receiptSupplier ? ` (NCC: ${receiptSupplier})` : ""}`,
          },
          { accessToken, username }
        );
      }

      setToast({
        tone: "success",
        title: `${modalMode === "INBOUND" ? "Nhập kho" : "Xuất kho"} thành công!`,
        message: `Đã xử lý thành công ${pendingItems.length} mặt hàng theo mã phiếu ${receiptReference}.`,
      });

      // Reset
      setPendingItems([]);
      setModalOpen(false);
      // Refresh new code
      const now = new Date();
      setReceiptReference(
        `PNK-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${Math.floor(100 + Math.random() * 900)}`
      );

      // Refresh data
      if (activeTab === "balances") loadBalances(page);
      if (activeTab === "history") loadMovements(historyPage);
    } catch (e: any) {
      setItemError(e?.message || "Đã xảy ra lỗi khi lưu phiếu kho.");
      setToast({
        tone: "error",
        title: "Thao tác thất bại",
        message: e?.message || "Không thể cập nhật kho. Vui lòng kiểm tra kết nối.",
      });
    } finally {
      setIsSubmittingReceipt(false);
    }
  };

  // Grand totals for current receipt slip
  const totalReceiptQuantity = pendingItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalReceiptValue = pendingItems.reduce((acc, item) => acc + item.quantity * item.unitCost, 0);

  // Total units currently displayed
  const totalUnitsOnPage = balances.reduce((acc, b) => acc + (b.quantityOnHand || 0), 0);

  return (
    <div className="space-y-8">
      {toast && <StatusToast tone={toast.tone} title={toast.title} message={toast.message} />}

      {/* ==================== STUDIO METRIC KPI CARDS ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total SKUs */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 p-5 shadow-sm backdrop-blur-xl transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tổng mã hàng tồn
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <span className="material-symbols-outlined text-[20px]">inventory_2</span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="font-headline text-3xl font-black text-slate-900 dark:text-white">
              {totalElements}
            </p>
            <span className="text-xs font-bold text-slate-400">mã phân loại</span>
          </div>
          <p className="mt-1 text-[11px] font-semibold text-slate-400">Bao gồm các biến thể nhiều tầng</p>
        </div>

        {/* Card 2: Units in Stock */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 p-5 shadow-sm backdrop-blur-xl transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tồn kho hiện tại
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <span className="material-symbols-outlined text-[20px]">layers</span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="font-headline text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {totalUnitsOnPage.toLocaleString("vi-VN")}
            </p>
            <span className="text-xs font-bold text-slate-400">sản phẩm (trang)</span>
          </div>
          <p className="mt-1 text-[11px] font-semibold text-slate-400">Tồn thực tế đang sẵn sàng bán</p>
        </div>

        {/* Card 3: Low stock warning */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 p-5 shadow-sm backdrop-blur-xl transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Mặt hàng cần nhập
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <span className="material-symbols-outlined text-[20px]">notification_important</span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="font-headline text-3xl font-black text-amber-600 dark:text-amber-400">
              {initialLowStockCount}
            </p>
            <span className="text-xs font-bold text-slate-400">mặt hàng</span>
          </div>
          <p className="mt-1 text-[11px] font-semibold text-slate-400">Tồn dưới 10 hoặc cạn kho</p>
        </div>

        {/* Card 4: Action / Slip Creator */}
        <div className="relative overflow-hidden rounded-3xl border border-indigo-200/70 dark:border-indigo-500/20 bg-gradient-to-br from-indigo-50/70 via-blue-50/30 to-white/90 dark:from-indigo-950/30 dark:via-zinc-900/80 dark:to-zinc-900/70 p-5 shadow-sm backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              Lập phiếu nhanh
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <span className="material-symbols-outlined text-[20px]">add_task</span>
            </span>
          </div>
          <div className="mt-3">
            <button
              onClick={() => {
                setModalMode("INBOUND");
                setModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Tạo Phiếu Nhập Kho
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] font-bold text-indigo-900/60 dark:text-indigo-400/60">
            Hỗ trợ nhập nhiều tầng & giá vốn
          </p>
        </div>
      </div>

      {/* ==================== FLOATING GLASS TABS ==================== */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 p-1.5 backdrop-blur-xl shadow-sm">
        <button
          onClick={() => setActiveTab("balances")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black transition-all ${
            activeTab === "balances"
              ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-950"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">inventory_2</span>
          Danh mục Tồn kho
          <span
            className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              activeTab === "balances"
                ? "bg-white/20 text-white dark:bg-black/20 dark:text-slate-950"
                : "bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-300"
            }`}
          >
            {totalElements}
          </span>
        </button>

        <button
          onClick={() => {
            setModalMode("INBOUND");
            setModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">post_add</span>
          Tạo Phiếu Nhập Kho
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black transition-all ${
            activeTab === "history"
              ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-950"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">history</span>
          Lịch sử Xuất / Nhập
        </button>

        <button
          onClick={() => setActiveTab("import")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black transition-all ${
            activeTab === "import"
              ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-950"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">file_upload</span>
          Nhập / Xuất Excel
        </button>
      </div>

      {/* ==================== TAB 1: DANH MỤC TỒN KHO ==================== */}
      {activeTab === "balances" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên SP, mã SKU, mã ID..."
                className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 p-1">
                <button
                  onClick={() => setStatusFilter("ALL")}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    statusFilter === "ALL"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setStatusFilter("AVAILABLE")}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    statusFilter === "AVAILABLE"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                  }`}
                >
                  Sẵn sàng
                </button>
                <button
                  onClick={() => setStatusFilter("LOW")}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    statusFilter === "LOW"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                  }`}
                >
                  Sắp hết
                </button>
                <button
                  onClick={() => setStatusFilter("OUT")}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    statusFilter === "OUT"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                  }`}
                >
                  Hết hàng
                </button>
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => {
                  setModalMode("INBOUND");
                  setModalOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                Nhập kho
              </button>

              <button
                onClick={() => {
                  setModalMode("OUTBOUND");
                  setModalOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px] text-rose-500">remove_circle</span>
                Xuất kho
              </button>

              <button
                onClick={() => loadBalances(page)}
                title="Làm mới dữ liệu"
                className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all active:scale-95"
              >
                <span className={`material-symbols-outlined text-[18px] ${loadingBalances ? "animate-spin" : ""}`}>
                  refresh
                </span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 shadow-sm backdrop-blur-2xl">
            {loadingBalances ? (
              <div className="py-20 text-center text-slate-400">
                <span className="material-symbols-outlined animate-spin text-4xl text-indigo-600 mb-3">
                  progress_activity
                </span>
                <p className="text-xs font-bold">Đang tải danh sách tồn kho...</p>
              </div>
            ) : filteredBalances.length === 0 ? (
              <div className="py-20 text-center text-slate-400">
                <span className="material-symbols-outlined text-5xl mb-2 opacity-40">inventory</span>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Không tìm thấy sản phẩm tồn kho phù hợp</p>
                <p className="text-xs text-slate-400 mt-1">Thử thay đổi từ khoá tìm kiếm hoặc bộ lọc trạng thái</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 dark:bg-white/5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-white/5">
                    <tr>
                      <th className="px-6 py-4">Mã / Hình ảnh</th>
                      <th className="px-6 py-4">Tên Sản phẩm</th>
                      <th className="px-6 py-4 min-w-[220px]">Biến thể (Nhiều tầng)</th>
                      <th className="px-6 py-4 text-center">Số lượng tồn</th>
                      <th className="px-6 py-4">Cập nhật lúc</th>
                      <th className="px-6 py-4 text-center">Trạng thái</th>
                      <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {filteredBalances.map((b) => {
                      const product = products.find((p) => p.id === b.productId);
                      const isOutOfStock = b.quantityOnHand <= 0;
                      const isLowStock = b.quantityOnHand > 0 && b.quantityOnHand < 10;
                      const tiers = b.variantId ? variantTiersMap[b.variantId] || [] : [];

                      return (
                        <tr
                          key={b.id}
                          className="group transition-colors hover:bg-slate-50/60 dark:hover:bg-white/5"
                        >
                          {/* Image & ID */}
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 group-hover:scale-105 transition-transform">
                                {product?.heroImage ? (
                                  <img
                                    src={product.heroImage}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-xl">
                                    image
                                  </span>
                                )}
                              </div>
                              <div>
                                <span className="rounded-md bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-black text-slate-500 dark:text-slate-400">
                                  #{b.productId}
                                </span>
                                {product?.sku && (
                                  <p className="mt-0.5 text-[10px] font-bold text-slate-400">
                                    SKU: {product.sku}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Product Name */}
                          <td className="px-6 py-3.5">
                            <a
                              href={`/admin/products/${b.productId}/detail`}
                              className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2"
                            >
                              {productNamesMap[b.productId] || product?.name || "Đang tải..."}
                            </a>
                          </td>

                          {/* Variant with Multi-Tier chips */}
                          <td className="px-6 py-3.5">
                            {b.variantId ? (
                              <div className="flex flex-wrap items-center gap-1.5 max-w-sm">
                                {tiers.length > 0 ? (
                                  tiers.map((t, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center gap-1 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 px-2 py-0.5 text-[10px] font-bold text-slate-800 dark:text-zinc-200 shadow-sm"
                                    >
                                      <span className="text-slate-400 font-medium">{t.name}:</span>
                                      <span className="text-indigo-600 dark:text-indigo-400 font-black">{t.value}</span>
                                    </span>
                                  ))
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                    {variantNamesMap[b.variantId] || `#${b.variantId}`}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 font-semibold italic">Tổng thể sản phẩm</span>
                            )}
                          </td>

                          {/* Stock Level */}
                          <td className="px-6 py-3.5 text-center">
                            <span
                              className={`font-headline text-base font-black ${
                                isOutOfStock
                                  ? "text-rose-600 dark:text-rose-400"
                                  : isLowStock
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-slate-900 dark:text-white"
                              }`}
                            >
                              {b.quantityOnHand}
                            </span>
                            <span className="ml-1 text-[10px] font-bold text-slate-400">cái</span>
                          </td>

                          {/* Updated At */}
                          <td className="px-6 py-3.5 text-[11px] font-medium text-slate-400">
                            {b.updatedAt ? new Date(b.updatedAt).toLocaleString("vi-VN") : "—"}
                          </td>

                          {/* Status Badge */}
                          <td className="px-6 py-3.5 text-center">
                            {isOutOfStock ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-2.5 py-0.5 text-[10px] font-black text-rose-700 dark:text-rose-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                Hết hàng
                              </span>
                            ) : isLowStock ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 px-2.5 py-0.5 text-[10px] font-black text-amber-700 dark:text-amber-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                Sắp hết
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 px-2.5 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Sẵn sàng
                              </span>
                            )}
                          </td>

                          {/* Quick Action: Nhập thêm */}
                          <td className="px-6 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleQuickInboundRow(b)}
                              className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/40 px-3 py-1.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 transition-all hover:bg-indigo-600 hover:text-white hover:border-transparent active:scale-95"
                            >
                              <span className="material-symbols-outlined text-[15px]">add_circle</span>
                              Nhập thêm
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {!loadingBalances && totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 px-6 py-4">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Hiển thị trang <strong className="text-slate-900 dark:text-white">{page + 1}</strong> / {totalPages}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadBalances(Math.max(0, page - 1))}
                    disabled={page <= 0}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-300 disabled:opacity-30 transition-all hover:bg-slate-100 dark:hover:bg-white/10"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                  </button>

                  <span className="px-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    Trang {page + 1}
                  </span>

                  <button
                    onClick={() => loadBalances(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-300 disabled:opacity-30 transition-all hover:bg-slate-100 dark:hover:bg-white/10"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 2: LỊCH SỬ GIAO DỊCH ==================== */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMovementFilter("ALL")}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  movementFilter === "ALL"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                }`}
              >
                Tất cả giao dịch
              </button>
              <button
                onClick={() => setMovementFilter("INBOUND")}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  movementFilter === "INBOUND"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                }`}
              >
                Chỉ Nhập kho
              </button>
              <button
                onClick={() => setMovementFilter("OUTBOUND")}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  movementFilter === "OUTBOUND"
                    ? "bg-rose-600 text-white"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                }`}
              >
                Chỉ Xuất kho
              </button>
            </div>

            <button
              onClick={() => loadMovements(historyPage)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
            >
              <span className={`material-symbols-outlined text-[16px] ${loadingHistory ? "animate-spin" : ""}`}>
                refresh
              </span>
              Làm mới
            </button>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 shadow-sm backdrop-blur-2xl">
            {loadingHistory ? (
              <div className="py-20 text-center text-slate-400">
                <span className="material-symbols-outlined animate-spin text-4xl text-indigo-600 mb-3">
                  progress_activity
                </span>
                <p className="text-xs font-bold">Đang tải lịch sử giao dịch...</p>
              </div>
            ) : filteredMovements.length === 0 ? (
              <div className="py-20 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">receipt_long</span>
                <p className="text-sm font-bold">Chưa có bản ghi giao dịch nào.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 dark:bg-white/5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-white/5">
                    <tr>
                      <th className="px-6 py-4">Thời gian</th>
                      <th className="px-6 py-4">Sản phẩm & Biến thể</th>
                      <th className="px-6 py-4 text-center">Loại GD</th>
                      <th className="px-6 py-4 text-center">Số lượng</th>
                      <th className="px-6 py-4 text-center">Tồn sau GD</th>
                      <th className="px-6 py-4">Ghi chú / Tham chiếu</th>
                      <th className="px-6 py-4 text-right">Người thực hiện</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {filteredMovements.map((m: any, idx: number) => {
                      const isOutbound = m.movementType === "OUTBOUND";
                      const tiers = m.variantId ? variantTiersMap[m.variantId] || [] : [];
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                          <td className="px-6 py-3.5 text-[11px] font-medium text-slate-400">
                            {new Date(m.movementAt).toLocaleString("vi-VN")}
                          </td>
                          <td className="px-6 py-3.5">
                            <p className="font-bold text-slate-900 dark:text-white">
                              {productNamesMap[m.productId] || `Sản phẩm #${m.productId}`}
                            </p>
                            {m.variantId && (
                              <div className="mt-1 flex flex-wrap items-center gap-1">
                                {tiers.length > 0 ? (
                                  tiers.map((t, i) => (
                                    <span key={i} className="inline-flex items-center gap-0.5 rounded-md bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                      <span className="text-slate-400">{t.name}:</span>
                                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">{t.value}</span>
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[11px] font-semibold text-slate-400">
                                    {variantNamesMap[m.variantId] || `Biến thể #${m.variantId}`}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                                isOutbound
                                  ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50"
                                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50"
                              }`}
                            >
                              <span className="material-symbols-outlined text-[13px]">
                                {isOutbound ? "arrow_upward" : "arrow_downward"}
                              </span>
                              {isOutbound ? "Xuất kho" : "Nhập kho"}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            <span
                              className={`font-headline text-sm font-black ${
                                isOutbound ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              {isOutbound ? "-" : "+"}
                              {m.quantity}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-center font-headline font-bold text-slate-800 dark:text-slate-200">
                            {m.balanceAfter ?? "—"}
                          </td>
                          <td className="px-6 py-3.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 max-w-xs truncate">
                            {m.note || m.referenceType || "—"}
                          </td>
                          <td className="px-6 py-3.5 text-right font-semibold text-slate-600 dark:text-slate-300">
                            {m.createdBy || "Admin"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {!loadingHistory && historyTotalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 px-6 py-4">
                <span className="text-xs font-semibold text-slate-500">
                  Trang {historyPage + 1} / {historyTotalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHistoryPage((p) => Math.max(0, p - 1))}
                    disabled={historyPage <= 0}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-slate-600 disabled:opacity-30"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                  </button>
                  <button
                    onClick={() => setHistoryPage((p) => Math.min(historyTotalPages - 1, p + 1))}
                    disabled={historyPage >= historyTotalPages - 1}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-slate-600 disabled:opacity-30"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 3: NHẬP / XUẤT EXCEL ==================== */}
      {activeTab === "import" && (
        <InventoryExcelImport
          accessToken={accessToken || ""}
          username={username}
          products={products}
        />
      )}

      {/* ========================================================================= */}
      {/* SMART STOCK-IN / OUT SLIP MODAL (MULTI-TIER VARIANTS READY)               */}
      {/* ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
            onClick={() => !isSubmittingReceipt && setModalOpen(false)}
          />

          {/* Modal Container */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalTitleId}
            className="relative z-[101] my-8 max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl transition-all animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Glow Orbs */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

            {/* Modal Header */}
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-5">
              <div className="flex items-center gap-3.5">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg ring-4 ${
                    modalMode === "INBOUND"
                      ? "bg-gradient-to-br from-indigo-500 to-blue-600 shadow-indigo-500/25 ring-indigo-50 dark:ring-indigo-950/30"
                      : "bg-gradient-to-br from-rose-500 to-amber-600 shadow-rose-500/25 ring-rose-50 dark:ring-rose-950/30"
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px]">
                    {modalMode === "INBOUND" ? "post_add" : "outbox"}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 id={modalTitleId} className="font-headline text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                      {modalMode === "INBOUND" ? "Phiếu Nhập Kho" : "Phiếu Xuất Kho"}
                    </h2>
                    <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 px-2.5 py-0.5 text-[11px] font-black text-indigo-700 dark:text-indigo-300">
                      Mã: {receiptReference}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-semibold text-slate-400">
                    {modalMode === "INBOUND" ? "Thêm hàng hoá đa tầng vào kho và tính giá vốn" : "Xuất chuyển hoặc điều chỉnh giảm số lượng tồn"}
                  </p>
                </div>
              </div>

              {/* Mode Toggle & Close */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="flex items-center rounded-xl bg-slate-100 dark:bg-white/5 p-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setModalMode("INBOUND")}
                    className={`rounded-lg px-3 py-1.5 transition-all ${
                      modalMode === "INBOUND"
                        ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    Nhập kho
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalMode("OUTBOUND")}
                    className={`rounded-lg px-3 py-1.5 transition-all ${
                      modalMode === "OUTBOUND"
                        ? "bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    Xuất kho
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={isSubmittingReceipt}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {itemError && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/80 dark:bg-rose-950/30 p-3.5 text-xs font-bold text-rose-700 dark:text-rose-400">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{itemError}</span>
              </div>
            )}

            {/* RECEIPT HEADER METADATA (SUPPLIER / REF) */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-slate-50/80 dark:bg-white/5 p-4 border border-slate-100 dark:border-white/5">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Nhà cung cấp / Nguồn hàng
                </label>
                <input
                  type="text"
                  value={receiptSupplier}
                  onChange={(e) => setReceiptSupplier(e.target.value)}
                  placeholder="Ví dụ: Công ty May Hải Âu, Tổng kho HCM..."
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Mã số phiếu / Chứng từ tham chiếu
                </label>
                <input
                  type="text"
                  value={receiptReference}
                  onChange={(e) => setReceiptReference(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* ADD ITEM SECTION */}
            <div className="mt-6 rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                Thêm sản phẩm vào phiếu
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Combobox */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Chọn sản phẩm <span className="text-rose-500">*</span>
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Gõ để tìm kiếm sản phẩm hoặc chọn bên dưới..."
                      value={activeProduct ? activeProduct.name : productSearchInput}
                      onChange={(e) => {
                        setProductSearchInput(e.target.value);
                        setSelectedProductId("");
                        setIsSearchingProduct(true);
                      }}
                      onFocus={() => setIsSearchingProduct(true)}
                      className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-800 py-3 pl-3.5 pr-10 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
                    />

                    {activeProduct ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProductId("");
                          setProductSearchInput("");
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    ) : (
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">
                        search
                      </span>
                    )}

                    {/* Dropdown Options */}
                    {isSearchingProduct && !activeProduct && (
                      <div className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-56 overflow-y-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-2xl p-1.5 space-y-1">
                        {filteredProductOptions.length === 0 ? (
                          <p className="p-3 text-center text-xs text-slate-400">Không tìm thấy sản phẩm</p>
                        ) : (
                          filteredProductOptions.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedProductId(p.id);
                                setIsSearchingProduct(false);
                              }}
                              className="w-full flex items-center gap-3 rounded-xl p-2 text-left hover:bg-indigo-50 dark:hover:bg-white/5 transition-colors"
                            >
                              <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10">
                                {p.heroImage ? (
                                  <img src={p.heroImage} alt={p.name} className="h-full w-full object-cover" />
                                ) : (
                                  <span className="material-symbols-outlined text-slate-400 text-lg flex items-center justify-center h-full">
                                    image
                                  </span>
                                )}
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                                <p className="text-[10px] font-semibold text-slate-400">
                                  #{p.id} {p.sku ? `· SKU: ${p.sku}` : ""}
                                </p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Multi-tier Variant Selector */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Biến thể nhiều tầng áp dụng
                    </label>
                    {activeVariant && (
                      <span className="text-[10px] font-bold text-slate-400">
                        Tồn hiện tại: <strong className="text-indigo-600 dark:text-indigo-400">{activeVariant.availability ?? 0} sp</strong>
                      </span>
                    )}
                  </div>

                  {loadingVariants ? (
                    <div className="flex items-center gap-2 py-3 text-xs text-slate-400">
                      <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                      <span>Đang tải các tầng biến thể...</span>
                    </div>
                  ) : currentVariants.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/5 p-3 text-xs text-slate-400 font-medium">
                      Sản phẩm không có biến thể phân loại (nhập theo mã gốc).
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-1.5 max-h-32 overflow-y-auto p-1">
                        <button
                          type="button"
                          onClick={() => setSelectedVariantId(0)}
                          className={`rounded-xl px-2.5 py-1.5 text-[11px] font-bold transition-all ${
                            selectedVariantId === 0
                              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm"
                              : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                          }`}
                        >
                          Chung (toàn SP)
                        </button>

                        {currentVariants.map((v) => {
                          const parsed = parseVariantTiers(v);
                          const isSelected = selectedVariantId === v.id;
                          return (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => setSelectedVariantId(v.id)}
                              className={`flex items-center gap-1 rounded-xl border px-2.5 py-1 text-[11px] transition-all ${
                                isSelected
                                  ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 font-bold shadow-sm"
                                  : "border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300"
                              }`}
                            >
                              {parsed.tiers.length > 0 ? (
                                parsed.tiers.map((t, idx) => (
                                  <span key={idx} className="inline-flex items-center gap-0.5 text-[10px]">
                                    <span className="text-slate-400 font-medium">{t.name}:</span>
                                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{t.value}</span>
                                    {idx < parsed.tiers.length - 1 && <span className="text-slate-300 mx-0.5">·</span>}
                                  </span>
                                ))
                              ) : (
                                <span>{parsed.fullLabel}</span>
                              )}
                              <span className="text-[10px] text-slate-400 ml-1">({v.availability ?? 0})</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Active variant tier breakdown card */}
                      {activeVariant && (
                        <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20 px-3 py-2 flex items-center justify-between">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mr-1">Tầng:</span>
                            {parseVariantTiers(activeVariant).tiers.map((t, idx) => (
                              <span key={idx} className="rounded-lg bg-white dark:bg-zinc-800 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                                {t.name}: <strong>{t.value}</strong>
                              </span>
                            ))}
                          </div>
                          <span className="text-[11px] font-semibold text-slate-500">Tồn: <strong>{activeVariant.availability ?? 0}</strong> sp</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity, Cost & Quick Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {/* Quantity */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Số lượng <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setItemQuantity((prev) => Math.max(1, (Number(prev) || 0) - 10))}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300"
                    >
                      <span className="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(e.target.value === "" ? "" : Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-800 py-2.5 text-sm font-black text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setItemQuantity((prev) => (Number(prev) || 0) + 10)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>
                  {/* Presets */}
                  <div className="flex items-center gap-1 mt-1.5">
                    {[10, 50, 100, 500].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setItemQuantity((prev) => (Number(prev) || 0) + preset)}
                        className="rounded-lg bg-slate-100 dark:bg-white/5 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        +{preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Unit Cost */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Đơn giá vốn (VND)
                    </label>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(itemUnitCost) || 0)}
                    </span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={itemUnitCost}
                    onChange={(e) => setItemUnitCost(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="VD: 150000"
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                  <p className="mt-1 text-[10px] text-slate-400">Đơn giá nhập phục vụ tính giá vốn</p>
                </div>

                {/* Note & Add Button */}
                <div className="flex flex-col justify-between">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Ghi chú dòng hàng
                    </label>
                    <input
                      type="text"
                      value={itemNote}
                      onChange={(e) => setItemNote(e.target.value)}
                      placeholder="Lô hàng, chứng từ..."
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItemToReceipt}
                    className="mt-2.5 flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 py-2.5 text-xs font-black shadow-md hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Thêm vào phiếu
                  </button>
                </div>
              </div>
            </div>

            {/* PENDING LINE ITEMS TABLE */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Danh sách mặt hàng trong phiếu ({pendingItems.length})
                </h4>
                {pendingItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPendingItems([])}
                    className="text-[11px] font-bold text-rose-500 hover:underline"
                  >
                    Xoá tất cả
                  </button>
                )}
              </div>

              {pendingItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-8 text-center text-slate-400">
                  <span className="material-symbols-outlined text-3xl mb-1 opacity-50">shopping_bag</span>
                  <p className="text-xs font-bold">Chưa có sản phẩm nào trong phiếu</p>
                  <p className="text-[11px]">Chọn sản phẩm và bấm "Thêm vào phiếu" ở phía trên.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-white/5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Sản phẩm</th>
                        <th className="px-4 py-3">Phân loại biến thể (Nhiều tầng)</th>
                        <th className="px-4 py-3 text-center">Số lượng</th>
                        <th className="px-4 py-3 text-right">Đơn giá</th>
                        <th className="px-4 py-3 text-right">Thành tiền</th>
                        <th className="px-4 py-3 text-center">Xoá</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {pendingItems.map((item, idx) => {
                        const lineTotal = item.quantity * item.unitCost;
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
                            <td className="px-4 py-3">
                              <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{item.productName}</p>
                              <span className="text-[10px] font-semibold text-slate-400">
                                #{item.productId} {item.productSku ? `· SKU: ${item.productSku}` : ""}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {item.tiers && item.tiers.length > 0 ? (
                                <div className="flex flex-wrap items-center gap-1 max-w-xs">
                                  {item.tiers.map((t, tIdx) => (
                                    <span key={tIdx} className="inline-flex items-center gap-0.5 rounded-md bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 px-1.5 py-0.5 text-[10px] font-bold">
                                      <span className="text-slate-400 font-medium">{t.name}:</span>
                                      <span className="text-indigo-600 dark:text-indigo-400 font-black">{t.value}</span>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="font-semibold text-slate-600 dark:text-slate-300">
                                  {item.variantName || "Mặc định"}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center font-black text-slate-900 dark:text-white">
                              +{item.quantity}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-slate-500">
                              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.unitCost)}
                            </td>
                            <td className="px-4 py-3 text-right font-black text-indigo-600 dark:text-indigo-400">
                              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(lineTotal)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => setPendingItems(pendingItems.filter((_, i) => i !== idx))}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* RECEIPT TOTALS BAR & CONFIRMATION */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 p-5 text-white shadow-xl">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                  Tổng hợp phiếu nhập kho
                </p>
                <div className="mt-1 flex items-baseline gap-4">
                  <span className="text-sm font-medium text-slate-300">
                    Tổng số lượng: <strong className="text-white text-base">{totalReceiptQuantity}</strong> sp
                  </span>
                  <span className="text-sm font-medium text-slate-300">
                    Tổng giá trị vốn:{" "}
                    <strong className="text-emerald-400 font-headline text-lg">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalReceiptValue)}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={isSubmittingReceipt}
                  className="w-full sm:w-auto rounded-xl px-5 py-3 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Đóng
                </button>

                <button
                  type="button"
                  onClick={handleSubmitReceiptBatch}
                  disabled={isSubmittingReceipt || pendingItems.length === 0}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-3 text-xs font-black text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {isSubmittingReceipt ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                      <span>Đang lưu phiếu kho...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                      <span>Xác nhận hoàn tất ({pendingItems.length} mục)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
