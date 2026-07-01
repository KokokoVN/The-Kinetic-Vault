import { getAdminSession } from "@/lib/auth-server";
import { formatWebActivityTime, listWebActivityRecent } from "@/lib/api";
import { ActivityLogListClient } from "@/components/activity-log-list-client";

export default async function ActivityLogPage() {
  const session = await getAdminSession();
  const { logs, unauthorized, otherFetchFailure } = await listWebActivityRecent(150, {
    accessToken: session.token,
  });
  const total = logs.length;

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-6 overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-xl shadow-slate-200/70 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/70 dark:shadow-none md:flex-row md:items-end">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
            <span className="material-symbols-outlined text-sm">history</span>
            Hệ thống
          </p>
          <h1 className="mt-3 font-headline text-4xl font-black tracking-tight text-slate-900 dark:text-white">Nhật ký hoạt động</h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
            Dữ liệu từ <code className="rounded bg-slate-100 px-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">GET /api/activity/recent</code> qua gateway (
            <span className="font-mono text-xs text-blue-800 dark:text-blue-300">activity-log-service</span>).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 backdrop-blur-sm shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:shadow-none">
            <span className="material-symbols-outlined text-xl text-amber-700 dark:text-amber-300">schedule</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">Gần nhất</p>
              <p className="font-headline text-sm font-black text-amber-950 dark:text-amber-100">{total > 0 ? formatWebActivityTime(logs[0]?.createdAt) : "Chưa có bản ghi"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-5 py-3 backdrop-blur-sm shadow-sm dark:border-slate-700 dark:bg-slate-800/80 dark:shadow-none">
            <span className="material-symbols-outlined text-2xl text-blue-700 dark:text-blue-300">history</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Dòng hiển thị</p>
              <p className="font-headline text-2xl font-black text-slate-900 dark:text-white">{total}</p>
            </div>
          </div>
        </div>
      </section>

      <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        <strong className="text-slate-900 dark:text-white">Gợi ý:</strong> Xóa danh mục / sản phẩm admin sẽ tạo log <code className="rounded border border-slate-200 bg-white px-1 font-mono text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">CATEGORY_DELETE</code>, <code className="rounded border border-slate-200 bg-white px-1 font-mono text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">PRODUCT_DELETE</code>.
      </p>

      <ActivityLogListClient logs={logs} />

      {unauthorized && (
        <p className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100">
          Gateway trả <strong>401 Unauthorized</strong> cho <code className="rounded bg-white/80 px-1 dark:bg-slate-800">/api/activity/recent</code> — endpoint này{" "}
          <strong>bắt buộc access token còn hạn</strong>, khác với một số route public. Hãy{" "}
          <strong>đăng xuất rồi đăng nhập lại</strong> (cookie admin vẫn hiển thị khi token đã hết hạn).
        </p>
      )}
      {otherFetchFailure && !unauthorized && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-950 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">
          Không lấy được dữ liệu từ gateway (lỗi mạng, HTTP lỗi hoặc phản hồi không phải JSON mảng). Kiểm tra{" "}
          <code className="rounded bg-white/80 px-1 dark:bg-slate-800">NEXT_PUBLIC_API_BASE_URL</code> / <code className="rounded bg-white/80 px-1 dark:bg-slate-800">API_SERVER_ORIGIN</code> và gateway{" "}
          <code className="rounded bg-white/80 px-1 dark:bg-slate-800">:8900</code>.
        </p>
      )}
      {total === 0 && !unauthorized && !otherFetchFailure && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          Chưa có bản ghi nào trong cơ sở nhật ký. Nếu backend đang chạy, thử tạo/sửa/xóa danh mục hoặc sản phẩm admin để phát sinh log. Cần Eureka + gateway +{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-500/20">activity-log-service</code> (vd. script <code className="rounded bg-amber-100 px-1 dark:bg-amber-500/20">chay-toi-thieu.bat</code>).
        </p>
      )}
    </div>
  );
}
