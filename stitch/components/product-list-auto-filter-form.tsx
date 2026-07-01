"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type StatusFilter = "all" | "in_stock" | "low_stock" | "out_stock";
type SortKey = "newest" | "name_asc" | "name_desc" | "price_asc" | "price_desc" | "stock_asc" | "stock_desc";

export function ProductListAutoFilterForm(props: {
  defaultQ: string;
  defaultStatus: StatusFilter;
  defaultCategoryId: string;
  defaultSort: SortKey;
  defaultMinPrice: string;
  defaultMaxPrice: string;
  defaultMinStock: string;
  defaultMaxStock: string;
  defaultSize: number;
  defaultPage: number;
  categories: Array<{ id: number; name?: string | null }>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(props.defaultQ);
  const [status, setStatus] = useState<StatusFilter>(props.defaultStatus);
  const [categoryId, setCategoryId] = useState(props.defaultCategoryId);
  const [sort, setSort] = useState<SortKey>(props.defaultSort);
  const [minPrice, setMinPrice] = useState(props.defaultMinPrice);
  const [maxPrice, setMaxPrice] = useState(props.defaultMaxPrice);
  const [minStock, setMinStock] = useState(props.defaultMinStock);
  const [maxStock, setMaxStock] = useState(props.defaultMaxStock);
  const [size, setSize] = useState<number>(props.defaultSize);
  const [page, setPage] = useState<number>(props.defaultPage);

  const baseParams = useMemo(() => new URLSearchParams(searchParams.toString()), [searchParams]);

  useEffect(() => {
    setQ(props.defaultQ);
  }, [props.defaultQ]);

  useEffect(() => {
    setStatus(props.defaultStatus);
  }, [props.defaultStatus]);

  useEffect(() => {
    setSize(props.defaultSize);
  }, [props.defaultSize]);

  useEffect(() => {
    setPage(props.defaultPage);
  }, [props.defaultPage]);

  useEffect(() => {
    setCategoryId(props.defaultCategoryId);
  }, [props.defaultCategoryId]);

  useEffect(() => {
    setSort(props.defaultSort);
  }, [props.defaultSort]);

  useEffect(() => {
    setMinPrice(props.defaultMinPrice);
  }, [props.defaultMinPrice]);

  useEffect(() => {
    setMaxPrice(props.defaultMaxPrice);
  }, [props.defaultMaxPrice]);

  useEffect(() => {
    setMinStock(props.defaultMinStock);
  }, [props.defaultMinStock]);

  useEffect(() => {
    setMaxStock(props.defaultMaxStock);
  }, [props.defaultMaxStock]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = new URLSearchParams(baseParams.toString());
      const currentQ = (searchParams.get("q") ?? "").trim();
      const currentStatus = (searchParams.get("status") ?? "all").trim();
      const currentCategoryId = (searchParams.get("categoryId") ?? "").trim();
      const currentSort = (searchParams.get("sort") ?? "newest").trim();
      const currentMinPrice = (searchParams.get("minPrice") ?? "").trim();
      const currentMaxPrice = (searchParams.get("maxPrice") ?? "").trim();
      const currentMinStock = (searchParams.get("minStock") ?? "").trim();
      const currentMaxStock = (searchParams.get("maxStock") ?? "").trim();
      const currentSize = Number(searchParams.get("size") ?? "10");
      const filterChanged =
        currentQ !== q.trim() ||
        currentStatus !== status ||
        currentCategoryId !== categoryId.trim() ||
        currentSort !== sort ||
        currentMinPrice !== minPrice.trim() ||
        currentMaxPrice !== maxPrice.trim() ||
        currentMinStock !== minStock.trim() ||
        currentMaxStock !== maxStock.trim() ||
        (Number.isFinite(currentSize) ? currentSize : 10) !== size;

      if (q.trim()) {
        next.set("q", q.trim());
      } else {
        next.delete("q");
      }
      if (status !== "all") {
        next.set("status", status);
      } else {
        next.delete("status");
      }
      if (categoryId.trim()) {
        next.set("categoryId", categoryId.trim());
      } else {
        next.delete("categoryId");
      }
      if (sort !== "newest") {
        next.set("sort", sort);
      } else {
        next.delete("sort");
      }
      if (minPrice.trim()) next.set("minPrice", minPrice.trim());
      else next.delete("minPrice");
      if (maxPrice.trim()) next.set("maxPrice", maxPrice.trim());
      else next.delete("maxPrice");
      if (minStock.trim()) next.set("minStock", minStock.trim());
      else next.delete("minStock");
      if (maxStock.trim()) next.set("maxStock", maxStock.trim());
      else next.delete("maxStock");
      if (size !== 10) {
        next.set("size", String(size));
      } else {
        next.delete("size");
      }
      if (filterChanged) {
        next.delete("page");
      } else if (page > 1) {
        next.set("page", String(page));
      } else {
        next.delete("page");
      }
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }, 350);
    return () => clearTimeout(timer);
  }, [
    q,
    status,
    categoryId,
    sort,
    minPrice,
    maxPrice,
    minStock,
    maxStock,
    size,
    page,
    baseParams,
    pathname,
    router,
    searchParams,
  ]);

  return (
    <form
      className="flex flex-wrap items-end gap-3 md:flex-nowrap md:gap-4 md:overflow-x-hidden"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="w-full min-w-0 md:flex-[2_2_0%]">
        <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">Tìm sản phẩm</label>
        <input
          type="text"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tên sản phẩm, SKU, danh mục..."
          className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-sm outline-none focus:border-secondary"
        />
      </div>
      <div className="min-w-[160px] flex-1 md:flex-[0.9_1_0%]">
        <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">Trạng thái</label>
        <select
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-sm outline-none focus:border-secondary"
        >
          <option value="all">Tất cả</option>
          <option value="in_stock">Còn hàng</option>
          <option value="low_stock">Sắp hết hàng</option>
          <option value="out_stock">Hết hàng</option>
        </select>
      </div>
      <div className="min-w-[140px] flex-1 md:flex-[0.55_1_0%]">
        <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">Mỗi trang</label>
        <select
          name="size"
          value={String(size)}
          onChange={(e) => setSize(Number(e.target.value))}
          className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-sm outline-none focus:border-secondary"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="30">30</option>
          <option value="50">50</option>
        </select>
      </div>

      <div className="min-w-[200px] flex-1 md:flex-[1_1_0%]">
        <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">Danh mục</label>
        <select
          name="categoryId"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-sm outline-none focus:border-secondary"
        >
          <option value="">Tất cả danh mục</option>
          {props.categories
            .slice()
            .sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? ""), "vi"))
            .map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name ?? `Danh mục #${c.id}`}
              </option>
            ))}
        </select>
      </div>

      <div className="min-w-[190px] flex-1 md:flex-[0.9_1_0%]">
        <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">Sắp xếp</label>
        <select
          name="sort"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-sm outline-none focus:border-secondary"
        >
          <option value="newest">Mới nhất</option>
          <option value="name_asc">Tên A → Z</option>
          <option value="name_desc">Tên Z → A</option>
          <option value="price_asc">Giá tăng dần</option>
          <option value="price_desc">Giá giảm dần</option>
          <option value="stock_asc">Tồn tăng dần</option>
          <option value="stock_desc">Tồn giảm dần</option>
        </select>
      </div>

      <div className="min-w-[240px] flex-1 md:flex-[1_1_0%]">
        <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">Khoảng giá (VND)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            inputMode="numeric"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Từ"
            className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-sm outline-none focus:border-secondary"
          />
          <input
            inputMode="numeric"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Đến"
            className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-sm outline-none focus:border-secondary"
          />
        </div>
      </div>

      <div className="min-w-[200px] flex-1 md:flex-[0.9_1_0%]">
        <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">Khoảng tồn</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            inputMode="numeric"
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
            placeholder="Từ"
            className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-sm outline-none focus:border-secondary"
          />
          <input
            inputMode="numeric"
            value={maxStock}
            onChange={(e) => setMaxStock(e.target.value)}
            placeholder="Đến"
            className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-sm outline-none focus:border-secondary"
          />
        </div>
      </div>
    </form>
  );
}
