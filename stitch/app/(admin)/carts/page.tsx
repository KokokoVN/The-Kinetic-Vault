import Link from "next/link";
import { getAdminSession } from "@/lib/auth-server";
import { getAdminUserBrief, listAdminCarts, type AdminCart, type AdminUserBrief } from "@/lib/api";
import { CartListAutoFilterForm } from "@/components/cart-list-auto-filter-form";
import { ClearAllCartsButton } from "@/components/clear-all-carts-button";
import { parseLabelToTiers } from "@/lib/variant-tier-utils";

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
      {/* ==================== HEADER CARD ==================== */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-zinc-950/80 p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-2xl transition-colors">
        {/* Ambient Glowing Orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-500/10 dark:bg-cyan-600/20 blur-[100px]" />
          <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-indigo-500/10 dark:bg-indigo-600/20 blur-[100px]" />
        </div>

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 dark:border-cyan-500/30 bg-blue-50/80 dark:bg-cyan-500/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-cyan-400 backdrop-blur-md">
              <span className="material-symbols-outlined text-[14px]">shopping_cart</span>
              Active Carts
            </p>
            <h1 className="mt-3 font-headline text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-xs">
              Giỏ Hàng Người Dùng
            </h1>
            <p className="mt-2 max-w-2xl text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium leading-relaxed">
              Theo dõi giỏ hàng lưu trữ theo thời gian thực trong Redis, phân tích số lượng sản phẩm dự định mua và giá trị đơn ước tính.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 px-4 py-3 shadow-sm backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <span className="material-symbols-outlined text-[20px]">category</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Tổng SP</p>
                <p className="font-headline text-xl font-black text-slate-900 dark:text-white">{totalItems.toLocaleString("vi-VN")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 px-4 py-3 shadow-sm backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400">
                <span className="material-symbols-outlined text-[20px]">payments</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Ước tính</p>
                <p className="font-headline text-xl font-black text-slate-900 dark:text-white">{asMoneyVnd(totalValue)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 px-4 py-3 shadow-sm backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Tổng giỏ</p>
                <p className="font-headline text-xl font-black text-slate-900 dark:text-white">{totalCarts}</p>
              </div>
            </div>

            {totalCarts > 0 && (
              <div className="flex items-center">
                <ClearAllCartsButton />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-6 shadow-sm dark:shadow-2xl backdrop-blur-2xl">
        <CartListAutoFilterForm q={q} pageSize={pageSize} />
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          {q ? (
            <>
              Kết quả: <span className="font-bold text-indigo-600 dark:text-indigo-400">{totalFiltered}</span> / {totalCarts} giỏ phù hợp “{q}”.
              {totalPages > 1 ? (
                <>
                  {" "}
                  · Trang <span className="font-bold text-indigo-600 dark:text-indigo-400">{page}</span>/{totalPages}
                </>
              ) : null}
            </>
          ) : (
            <>
              Đang hiển thị <span className="font-bold text-indigo-600 dark:text-indigo-400">{paged.length}</span> giỏ trên trang {page}/{totalPages} (tổng {totalFiltered} giỏ).
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
              className="group overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-900/80 backdrop-blur-xl shadow-xs open:ring-1 open:ring-indigo-500/20"
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 bg-slate-50/50 dark:bg-zinc-900/40 hover:bg-slate-100/60 dark:hover:bg-zinc-800/60 transition-colors px-4 py-4 marker:hidden sm:gap-5 sm:px-5 [&::-webkit-details-marker]:hidden">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-indigo-600 dark:text-indigo-400">{displayName}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 sm:hidden">Nhấn để xem chi tiết giỏ</p>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-right sm:gap-8">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:text-xs">Sản phẩm</p>
                    <p className="font-headline text-base font-black text-slate-900 dark:text-white sm:text-lg">{Number(cart.itemCount ?? 0).toLocaleString("vi-VN")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:text-xs">Tổng tiền</p>
                    <p className="font-headline text-base font-black text-indigo-600 dark:text-indigo-400 sm:text-lg">{asMoneyVnd(cart.total)}</p>
                  </div>
                  <span
                    className="hidden text-xs font-bold text-indigo-600 dark:text-indigo-400 underline decoration-indigo-500/40 underline-offset-2 sm:inline"
                    aria-hidden
                  >
                    Chi tiết
                  </span>
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition group-open:-rotate-180 group-open:border-indigo-500/40 group-open:text-indigo-500"
                    aria-hidden
                  >
                    ▼
                  </span>
                </div>
              </summary>

              <div className="border-t border-slate-200/80 dark:border-white/10 bg-slate-50/30 dark:bg-zinc-950/40 px-4 py-4 sm:px-5">
                <div className="space-y-1 border-b border-slate-200/80 dark:border-white/10 pb-3 text-sm">
                  <p className="text-slate-500 dark:text-slate-400">
                    Email:{" "}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {uid != null ? user?.email?.trim() || "Chưa có email" : "Không có tài khoản"}
                    </span>
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800/80 px-3 py-1 font-semibold text-slate-600 dark:text-slate-300">Cart: {cart.cartId ?? "—"}</span>
                  {uid != null ? <span className="rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1 font-semibold">UID: {uid}</span> : null}
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Chi tiết giỏ</p>
                <div className="mt-2 space-y-3">
                  {items.length > 0 ? (
                    items.map((it, itemIdx) => {
                      const variantLabel = String(it.variantLabel ?? "").trim();
                      const imageUrl = resolveCartItemImage(it);
                      return (
                        <div key={`${it.id ?? "i"}-${itemIdx}`} className="flex gap-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-900/60 p-3">
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                            {imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={imageUrl} alt={it.productNameSnapshot || it.product?.productName || "Sản phẩm"} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[11px] text-slate-400">No image</div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{it.productNameSnapshot || it.product?.productName || "—"}</p>
                            {(() => {
                              const tiers = parseLabelToTiers(variantLabel);
                              if (tiers.length > 0) {
                                return (
                                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                    {tiers.map((t, idx) => (
                                      <span
                                        key={idx}
                                        className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/5"
                                      >
                                        <span className="text-slate-400 font-medium">{t.name}:</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">{t.value}</span>
                                      </span>
                                    ))}
                                  </div>
                                );
                              }
                              return (
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                  Biến thể: <span className="font-medium text-slate-700 dark:text-slate-300">{variantLabel || "Mặc định"}</span>
                                </p>
                              );
                            })()}
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              x{Number(it.quantity ?? 0).toLocaleString("vi-VN")} · {asMoneyVnd(it.subTotal)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-sm text-slate-400">Không có dữ liệu sản phẩm</span>
                  )}
                </div>
              </div>
            </details>
          );
        })}
      </section>

      {totalCarts === 0 ? (
        <p className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">Chưa có giỏ hàng nào đang hoạt động.</p>
      ) : null}

      {totalCarts > 0 && totalFiltered === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-zinc-900/50 px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Không có giỏ phù hợp từ khóa. Thử bỏ bớt từ hoặc tìm theo email / UID / tên sản phẩm.
        </p>
      ) : null}

      {totalFiltered > 0 ? (
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl px-5 py-4 shadow-sm sm:flex-row">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Trang <span className="font-bold text-indigo-600 dark:text-indigo-400">{page}</span> / {totalPages} · {pageSize} giỏ/trang
            {q ? (
              <>
                {" "}
                · lọc: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{totalFiltered}</span> giỏ
              </>
            ) : null}
          </p>
          <div className="flex gap-2">
            <Link
              prefetch
              className={[
                "rounded-xl px-4 py-2 text-xs font-bold transition",
                page <= 1 ? "pointer-events-none bg-slate-100 dark:bg-slate-800/50 text-slate-400" : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/40",
              ].join(" ")}
              href={prevHref}
              aria-disabled={page <= 1}
            >
              Trước
            </Link>
            <Link
              prefetch
              className={[
                "rounded-xl px-4 py-2 text-xs font-bold transition",
                page >= totalPages ? "pointer-events-none bg-slate-100 dark:bg-slate-800/50 text-slate-400" : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/40",
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
