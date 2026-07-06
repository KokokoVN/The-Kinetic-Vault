"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  q: string;
  pageSize: number;
};

function clampPageSize(n: number): number {
  if ([10, 20, 50].includes(n)) {
    return n;
  }
  return 10;
}

export function CartListAutoFilterForm({ q, pageSize }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const debounceRef = useRef<number | null>(null);

  const [localQ, setLocalQ] = useState(q);
  const [localPageSize, setLocalPageSize] = useState<number>(clampPageSize(pageSize));

  useEffect(() => setLocalQ(q), [q]);
  useEffect(() => setLocalPageSize(clampPageSize(pageSize)), [pageSize]);

  const baseParams = useMemo(() => {
    const p = new URLSearchParams(sp?.toString() ?? "");
    return p;
  }, [sp]);

  function pushNow(next: { q?: string; pageSize?: number }) {
    const p = new URLSearchParams(baseParams.toString());
    const q2 = (next.q ?? localQ).trim();
    const pageSize2 = clampPageSize(next.pageSize ?? localPageSize);

    if (q2) p.set("q", q2);
    else p.delete("q");
    p.set("pageSize", String(pageSize2));
    p.set("page", "1");
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  }

  function scheduleSearch(nextQ: string) {
    if (debounceRef.current != null) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => pushNow({ q: nextQ }), 350);
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end">
      <div className="min-w-[200px] flex-1">
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400" htmlFor="cart-q">
          Tìm kiếm
        </label>
        <input
          id="cart-q"
          name="q"
          value={localQ}
          onChange={(e) => {
            const v = e.target.value;
            setLocalQ(v);
            scheduleSearch(v);
          }}
          placeholder="User, email, UID, mã giỏ, tên sản phẩm…"
          className="w-full rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-md px-4 py-2.5 text-sm outline-none ring-purple-500/0 transition focus:ring-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400" htmlFor="cart-pageSize">
          Số giỏ / trang
        </label>
        <select
          id="cart-pageSize"
          name="pageSize"
          value={String(localPageSize)}
          onChange={(e) => {
            const next = clampPageSize(Number(e.target.value));
            setLocalPageSize(next);
            pushNow({ pageSize: next });
          }}
          className="rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-md px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>
      <p className="text-xs text-slate-400 md:pb-1">Tự lọc sau khi dừng nhập khoảng 0.35s.</p>
    </div>
  );
}
