import Link from "next/link";
import { getAdminSession } from "@/lib/auth-server";
import { getAdminUserBrief, listAdminCarts, type AdminCart, type AdminUserBrief } from "@/lib/api";
import { CartListAutoFilterForm } from "@/components/cart-list-auto-filter-form";
import { ClearAllCartsButton } from "@/components/clear-all-carts-button";

export const dynamic = "force-dynamic";

type PageSearchParams = {
  q?: string;
  page?: string;
  pageSize?: string;
};

function normalizePageSize(raw?: string): number {
  const n = Number(raw ?? 10);
  if ([10, 20, 50].includes(n)) {
    return n;
  }
  return 10;
}

function queryString(base: { q: string; pageSize: number; page: number }): string {
  const p = new URLSearchParams();
  if (base.q.trim()) {
    p.set("q", base.q.trim());
  }
  p.set("pageSize", String(base.pageSize));
  p.set("page", String(base.page));
  return p.toString();
}

function parseUserIdFromCartId(cartId?: string | null): number | null {
  const raw = String(cartId ?? "").trim();
  const m = raw.match(/^cart:user:(\d+)$/i);
  if (!m) return null;
  const id = Number(m[1]);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function asMoneyVnd(raw?: number | string | null): string {
  const n = Number(raw ?? 0);
  if (!Number.isFinite(n)) return "—";
  return `${n.toLocaleString("vi-VN")} VND`;
}

function resolveImageUrl(raw: string): string {
  const v = raw.trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v) || v.startsWith("data:")) return v;
  const origin = (process.env.API_SERVER_ORIGIN ?? "http://localhost:8900").replace(/\/+$/, "");
  if (v.startsWith("/")) return `${origin}${v}`;
  return `${origin}/api/catalog/admin/products/images/file/${v}`;
}

function resolveCartItemImage(item: unknown): string | null {
  if (!item || typeof item !== "object") return null;
  const root = item as Record<string, unknown>;
  const variantImg = root.variantImageUrl ?? root.variant_image_url;
  if (typeof variantImg === "string" && variantImg.trim()) return resolveImageUrl(variantImg);
  const direct = root.productImageSnapshot;
  if (typeof direct === "string" && direct.trim()) return resolveImageUrl(direct);
  const product = root.product;
  if (!product || typeof product !== "object") return null;
  const p = product as Record<string, unknown>;
  const primary = p.primaryImageUrl;
  if (typeof primary === "string" && primary.trim()) return resolveImageUrl(primary);
  return null;
}

function cartMatchesQuery(cart: AdminCart, uid: number | null, user: AdminUserBrief | null | undefined, qLower: string): boolean {
  if (!qLower) return true;
  const parts: string[] = [String(cart.cartId ?? "")];
  if (uid != null) {
    parts.push(String(uid), `user #${uid}`);
  }
  if (user) {
    parts.push(String(user.userName ?? ""), String(user.email ?? ""), String(user.phoneNumber ?? ""));
  }
  const items = Array.isArray(cart.items) ? cart.items : [];
  for (const it of items) {
    parts.push(
      String(it.productNameSnapshot ?? ""),
      String(it.product?.productName ?? ""),
      String(it.productSkuSnapshot ?? ""),
      String(it.variantLabel ?? ""),
    );
  }
  return parts.some((s) => s.toLowerCase().includes(qLower));
}

export default async function AdminCartsPage({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const sp = searchParams ? await searchParams : undefined;
  const q = String(sp?.q ?? "").trim();
  const qLower = q.toLowerCase();
  const pageSize = normalizePageSize(sp?.pageSize);
  const pageRaw = Number(sp?.page ?? 1);
  const requestedPage = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;

  const session = await getAdminSession();
  const carts = await listAdminCarts({ accessToken: session.token });

  const userIds = Array.from(new Set(carts.map((c) => parseUserIdFromCartId(c.cartId)).filter((id): id is number => id != null)));
  const userLookup = new Map<number, Awaited<ReturnType<typeof getAdminUserBrief>>>();
  await Promise.all(
    userIds.map(async (id) => {
      const profile = await getAdminUserBrief(id, { accessToken: session.token });
      userLookup.set(id, profile);
    }),
  );

  const totalCarts = carts.length;
  const totalItems = carts.reduce((sum, c) => sum + Number(c.itemCount ?? 0), 0);
  const totalValue = carts.reduce((sum, c) => sum + Number(c.total ?? 0), 0);
  const userCartCount = userIds.length;

  const filtered = carts.filter((c) => {
    const uid = parseUserIdFromCartId(c.cartId);
    const user = uid != null ? userLookup.get(uid) : null;
    return cartMatchesQuery(c, uid, user, qLower);
  });

  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  const prevHref = `/admin/carts?${queryString({ q, pageSize, page: Math.max(1, page - 1) })}`;
  const nextHref = `/admin/carts?${queryString({ q, pageSize, page: Math.min(totalPages, page + 1) })}`;

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-6 overflow-hidden rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl shadow-blue-900/5 backdrop-blur-xl md:flex-row md:items-end">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            <span className="material-symbols-outlined text-sm">shopping_cart</span>
            Giỏ hàng
          </p>
          <h1 className="mt-3 font-headline text-4xl font-black tracking-tight text-blue-900">Giỏ hàng người dùng</h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            Theo dõi giỏ đang lưu trong Redis. Nhấn một dòng để xem chi tiết từng mặt hàng.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50/80 px-4 py-3 backdrop-blur-sm shadow-sm">
            <span className="material-symbols-outlined text-xl text-sky-700">category</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-sky-800">Tổng SP</p>
              <p className="font-headline text-xl font-black text-sky-900">{totalItems.toLocaleString("vi-VN")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50/80 px-4 py-3 backdrop-blur-sm shadow-sm">
            <span className="material-symbols-outlined text-xl text-violet-700">payments</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-violet-800">Ước tính</p>
              <p className="font-headline text-xl font-black text-violet-900">{asMoneyVnd(totalValue)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 backdrop-blur-sm shadow-sm">
            <span className="material-symbols-outlined text-xl text-emerald-700">group</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">User có giỏ</p>
              <p className="font-headline text-xl font-black text-emerald-900">{userCartCount.toLocaleString("vi-VN")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/60 px-5 py-3 backdrop-blur-sm shadow-sm">
            <span className="material-symbols-outlined text-2xl text-blue-700">shopping_cart</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Tổng giỏ</p>
              <p className="font-headline text-2xl font-black text-blue-900">{totalCarts}</p>
            </div>
          </div>
          {totalCarts > 0 && (
            <div className="flex items-center ml-2">
              <ClearAllCartsButton />
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-5 shadow-sm">
        <CartListAutoFilterForm q={q} pageSize={pageSize} />
        <p className="mt-3 text-xs text-on-surface-variant">
          {q ? (
            <>
              Kết quả: <span className="font-bold text-blue-900">{totalFiltered}</span> / {totalCarts} giỏ phù hợp “{q}”.
              {totalPages > 1 ? (
                <>
                  {" "}
                  · Trang <span className="font-bold text-blue-900">{page}</span>/{totalPages}
                </>
              ) : null}
            </>
          ) : (
            <>
              Đang hiển thị <span className="font-bold text-blue-900">{paged.length}</span> giỏ trên trang {page}/{totalPages} (tổng {totalFiltered} giỏ).
            </>
          )}
        </p>
      </section>

      <section className="flex flex-col gap-3">
        {paged.map((cart: AdminCart, idx) => {
          const items = Array.isArray(cart.items) ? cart.items : [];
          const uid = parseUserIdFromCartId(cart.cartId);
          const user = uid != null ? userLookup.get(uid) : null;
          const displayName = uid != null ? user?.userName?.trim() || `User #${uid}` : "Khách vãng lai";
          return (
            <details
              key={`${cart.cartId ?? "cart"}-${start + idx}`}
              className="group overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container-lowest shadow-sm open:ring-1 open:ring-primary/15"
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 bg-gradient-to-r from-slate-50 to-blue-50 px-4 py-4 marker:hidden sm:gap-5 sm:px-5 [&::-webkit-details-marker]:hidden">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-blue-900">{displayName}</p>
                  <p className="mt-0.5 text-[11px] text-on-surface-variant sm:hidden">Nhấn để xem chi tiết giỏ</p>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-right sm:gap-8">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant sm:text-xs">Sản phẩm</p>
                    <p className="font-headline text-base font-black text-blue-800 sm:text-lg">{Number(cart.itemCount ?? 0).toLocaleString("vi-VN")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant sm:text-xs">Tổng tiền</p>
                    <p className="font-headline text-base font-black text-primary sm:text-lg">{asMoneyVnd(cart.total)}</p>
                  </div>
                  <span
                    className="hidden text-xs font-semibold text-primary underline decoration-primary/40 underline-offset-2 sm:inline"
                    aria-hidden
                  >
                    Chi tiết
                  </span>
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition group-open:-rotate-180 group-open:border-primary/30 group-open:text-primary"
                    aria-hidden
                  >
                    ▼
                  </span>
                </div>
              </summary>

              <div className="border-t border-outline-variant/10 bg-white px-4 py-4 sm:px-5">
                <div className="space-y-1 border-b border-slate-100 pb-3 text-sm">
                  <p className="text-on-surface-variant">
                    Email:{" "}
                    <span className="font-semibold text-slate-800">
                      {uid != null ? user?.email?.trim() || "Chưa có email" : "Không có tài khoản"}
                    </span>
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">Cart: {cart.cartId ?? "—"}</span>
                  {uid != null ? <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-800">UID: {uid}</span> : null}
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-blue-900/80">Chi tiết giỏ</p>
                <div className="mt-2 space-y-3">
                  {items.length > 0 ? (
                    items.map((it, itemIdx) => {
                      const variantLabel = String(it.variantLabel ?? "").trim();
                      const imageUrl = resolveCartItemImage(it);
                      return (
                        <div key={`${it.id ?? "i"}-${itemIdx}`} className="flex gap-3 rounded-xl border border-outline-variant/10 bg-surface p-3">
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                            {imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={imageUrl} alt={it.productNameSnapshot || it.product?.productName || "Sản phẩm"} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[11px] text-slate-500">No image</div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-on-surface">{it.productNameSnapshot || it.product?.productName || "—"}</p>
                            <p className="mt-1 text-xs text-on-surface-variant">
                              Biến thể: <span className="font-medium text-slate-700">{variantLabel || "Mặc định"}</span>
                            </p>
                            <p className="mt-1 text-xs text-on-surface-variant">
                              x{Number(it.quantity ?? 0).toLocaleString("vi-VN")} · {asMoneyVnd(it.subTotal)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-sm text-on-surface-variant">Không có dữ liệu sản phẩm</span>
                  )}
                </div>
              </div>
            </details>
          );
        })}
      </section>

      {totalCarts === 0 ? (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Chưa có giỏ hàng nào đang hoạt động.</p>
      ) : null}

      {totalCarts > 0 && totalFiltered === 0 ? (
        <p className="rounded-xl border border-dashed border-outline-variant/30 bg-white/60 px-4 py-6 text-center text-sm text-on-surface-variant">
          Không có giỏ phù hợp từ khóa. Thử bỏ bớt từ hoặc tìm theo email / UID / tên sản phẩm.
        </p>
      ) : null}

      {totalFiltered > 0 ? (
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-outline-variant/10 bg-surface-container-lowest px-5 py-4 shadow-sm sm:flex-row">
          <p className="text-xs text-on-surface-variant">
            Trang <span className="font-bold text-blue-900">{page}</span> / {totalPages} · {pageSize} giỏ/trang
            {q ? (
              <>
                {" "}
                · lọc: <span className="font-semibold text-blue-900">{totalFiltered}</span> giỏ
              </>
            ) : null}
          </p>
          <div className="flex gap-2">
            <Link
              prefetch
              className={[
                "rounded-xl px-4 py-2 text-xs font-bold",
                page <= 1 ? "pointer-events-none bg-slate-100 text-slate-400" : "bg-surface-container-high text-blue-900 hover:bg-surface-bright",
              ].join(" ")}
              href={prevHref}
              aria-disabled={page <= 1}
            >
              Trước
            </Link>
            <Link
              prefetch
              className={[
                "rounded-xl px-4 py-2 text-xs font-bold",
                page >= totalPages ? "pointer-events-none bg-slate-100 text-slate-400" : "bg-surface-container-high text-blue-900 hover:bg-surface-bright",
              ].join(" ")}
              href={nextHref}
              aria-disabled={page >= totalPages}
            >
              Sau
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
