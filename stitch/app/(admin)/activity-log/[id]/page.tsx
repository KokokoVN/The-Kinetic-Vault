import Link from "next/link";
import { ActivityLogRestoreForms } from "@/components/activity-log-restore-forms";
import { formatWebActivityTime, getWebActivityById } from "@/lib/api";
import { getAdminSession } from "@/lib/auth-server";
import { buildRestoreButtons } from "@/lib/activity-restore-logic";

function prettyJson(raw: string | null | undefined): string {
  if (!raw?.trim()) {
    return "—";
  }
  try {
    return JSON.stringify(JSON.parse(raw) as object, null, 2);
  } catch {
    return raw;
  }
}

function logBehaviorHint(action: string | null | undefined): string | null {
  if (!action?.trim()) {
    return null;
  }
  if (action === "PRODUCT_CREATE" || action === "CATEGORY_CREATE") {
    return "Loại tạo mới: JSON lưu dữ liệu sau khi tạo (after). Có thể hoàn tác bằng nút xóa bản ghi vừa tạo.";
  }
  if (action === "PRODUCT_UPDATE" || action === "CATEGORY_UPDATE") {
    return "Loại sửa: JSON lưu dữ liệu cũ (before) và sau khi sửa (after). Reset = khôi phục before; nút “Áp dụng lại bản sau” = ghi lại trạng thái after.";
  }
  if (action === "PRODUCT_DELETE" || action === "CATEGORY_DELETE") {
    return "Loại xóa: JSON lưu snapshot trước khi xóa (before). Khôi phục = tạo lại bản ghi từ snapshot (ID mới có thể khác).";
  }
  return null;
}

function beforeAfterBlocks(detailJson: string | null | undefined): { before: string; after: string } | null {
  if (!detailJson?.trim()) {
    return null;
  }
  try {
    const o = JSON.parse(detailJson) as Record<string, unknown>;
    if (o.schemaVersion !== 2) {
      return null;
    }
    const b = o.before;
    const a = o.after;
    if (b == null && a == null) {
      return null;
    }
    return {
      before: b != null ? JSON.stringify(b, null, 2) : "—",
      after: a != null ? JSON.stringify(a, null, 2) : "—",
    };
  } catch {
    return null;
  }
}

export const dynamic = "force-dynamic";

export default async function ActivityLogDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ restoreOk?: string; restoreErr?: string }>;
}) {
  const { id } = await params;
  const sp = searchParams ? await searchParams : undefined;
  const numId = Number(id);
  const session = await getAdminSession();

  if (!Number.isFinite(numId)) {
    return <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">ID không hợp lệ.</div>;
  }

  const row = await getWebActivityById(numId, { accessToken: session.token });
  const restoreButtons =
    session.canMutateCatalog && row?.detailJson ? buildRestoreButtons(row.action ?? undefined, row.detailJson) : [];
  const behaviorHint = row ? logBehaviorHint(row.action ?? undefined) : null;

  if (!row) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
        Không tìm thấy log #{id}. Kiểm tra gateway JWT và activity-log-service.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link className="hover:text-blue-700 dark:hover:text-blue-300" href="/admin/activity-log">
          Nhật ký
        </Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="font-bold text-blue-700 dark:text-blue-300">#{row.id}</span>
      </nav>

      <header className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-xl shadow-slate-200/70 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/70 dark:shadow-none md:flex-row md:items-end">
        <div>
          <h1 className="font-headline text-3xl font-black tracking-tight text-slate-900 dark:text-white">{row.action ?? "—"}</h1>
          <p className="mt-2 font-mono text-sm text-slate-600 dark:text-slate-300">
            {row.resourceType ?? "—"} · #{row.resourceId ?? "—"} · {formatWebActivityTime(row.createdAt)}
          </p>
          {behaviorHint && (
            <p className="mt-3 max-w-2xl rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
              {behaviorHint}
            </p>
          )}
        </div>
        <Link
          href="/admin/activity-log"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Danh sách log
        </Link>
      </header>

      {sp?.restoreOk === "1" && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
          Đã thực hiện khôi phục / hoàn tác. Kiểm tra danh sách sản phẩm hoặc danh mục.
        </p>
      )}
      {sp?.restoreErr === "readonly" && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          Tài khoản không có quyền ghi catalog.
        </p>
      )}
      {sp?.restoreErr && sp.restoreErr !== "readonly" && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">
          {sp.restoreErr === "parse" || sp.restoreErr === "nodata"
            ? "Không đọc được chi tiết log để khôi phục."
            : `Không thực hiện được thao tác (mã: ${sp.restoreErr}). Có thể dữ liệu đã đổi, log cũ thiếu field, hoặc trùng tên/slug.`}
        </p>
      )}

      {restoreButtons.length > 0 && (
        <section className="rounded-2xl border border-sky-200 bg-sky-50/80 p-6 shadow-sm dark:border-sky-500/30 dark:bg-sky-500/10 dark:shadow-none">
          <h2 className="mb-2 font-headline text-lg font-bold text-slate-900 dark:text-white">Khôi phục / reset / hoàn tác</h2>
          <p className="mb-4 text-sm text-slate-700 dark:text-slate-200">
            Catalog ghi log <code className="rounded bg-white/70 px-1 dark:bg-slate-800">schemaVersion: 2</code> với <code className="rounded bg-white/70 px-1 dark:bg-slate-800">before</code> /{" "}
            <code className="rounded bg-white/70 px-1 dark:bg-slate-800">after</code> tùy thao tác. Cần quyền ghi catalog. Log cũ hoặc từ gateway có thể thiếu field, một số nút có thể không hiện hoặc thất bại.
          </p>
          <ActivityLogRestoreForms logId={row.id} buttons={restoreButtons} />
        </section>
      )}

      <div className="flex flex-col gap-6">
        <section className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 font-headline text-lg font-bold text-slate-900 dark:text-white">Thông tin</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-slate-200 py-2 dark:border-slate-800">
              <dt className="text-slate-500 dark:text-slate-400">HTTP</dt>
              <dd className="font-mono font-bold text-slate-900 dark:text-slate-100">{row.httpMethod ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-slate-200 py-2 dark:border-slate-800">
              <dt className="text-slate-500 dark:text-slate-400">Đường dẫn</dt>
              <dd className="max-w-[60%] break-all text-right font-mono text-xs text-slate-700 dark:text-slate-200">{row.requestPath ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-slate-200 py-2 dark:border-slate-800">
              <dt className="text-slate-500 dark:text-slate-400">Người thực hiện</dt>
              <dd className="text-right font-medium text-slate-900 dark:text-slate-100">{row.actorUsername ?? row.createdBy ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-slate-500 dark:text-slate-400">User ID</dt>
              <dd className="font-mono text-right text-xs text-slate-700 dark:text-slate-200">{row.actorUserId ?? "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 font-headline text-lg font-bold text-slate-900 dark:text-white">Chi tiết (JSON)</h2>
          {(() => {
            const pair = beforeAfterBlocks(row.detailJson);
            if (pair) {
              return (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Trước (before)</h3>
                    <pre className="max-h-[360px] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                      {pair.before}
                    </pre>
                  </div>
                  <div>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Sau (after)</h3>
                    <pre className="max-h-[360px] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                      {pair.after}
                    </pre>
                  </div>
                </div>
              );
            }
            return (
              <pre className="max-h-[480px] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                {prettyJson(row.detailJson)}
              </pre>
            );
          })()}
        </section>
      </div>
    </div>
  );
}
