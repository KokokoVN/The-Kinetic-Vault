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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      {/* HEADER SECTION */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-zinc-950/80 p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-2xl transition-colors">
        {/* Background Decorative Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-fuchsia-500/10 dark:bg-fuchsia-600/20 blur-[100px]" />
          <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-cyan-500/10 dark:bg-cyan-600/20 blur-[100px]" />
        </div>

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-200/80 dark:border-fuchsia-500/30 bg-fuchsia-50/80 dark:bg-fuchsia-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-[0.2em] text-fuchsia-700 dark:text-fuchsia-300 backdrop-blur-md shadow-sm">
              <span className="material-symbols-outlined text-sm">history</span>
              Hệ thống
            </div>
            <h1 className="mt-4 font-headline text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">Nhật ký hoạt động</h1>
            <p className="mt-2.5 max-w-2xl text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              Theo dõi tất cả hành động từ <code className="rounded-lg bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 text-xs text-fuchsia-700 dark:text-fuchsia-300 font-mono">GET /api/activity/recent</code> qua gateway (
              <span className="font-mono text-xs text-cyan-600 dark:text-cyan-400">activity-log-service</span>).
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 p-4 shadow-sm backdrop-blur-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <span className="material-symbols-outlined text-2xl">schedule</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Gần nhất</p>
                <p className="font-headline text-sm font-black text-slate-900 dark:text-white">{total > 0 ? formatWebActivityTime(logs[0]?.createdAt) : "Chưa có bản ghi"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 p-4 shadow-sm backdrop-blur-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <span className="material-symbols-outlined text-2xl">history_edu</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Dòng hiển thị</p>
                <p className="font-headline text-2xl font-black text-slate-900 dark:text-white">{total}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/50 p-4 shadow-sm backdrop-blur-md">
        <span className="material-symbols-outlined text-cyan-600 dark:text-cyan-400 mt-0.5">tips_and_updates</span>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
          <strong className="text-slate-900 dark:text-white font-bold">Gợi ý:</strong> Xóa danh mục hoặc sản phẩm admin sẽ tạo log hệ thống với action <code className="rounded-md border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-fuchsia-700 dark:text-fuchsia-300">CATEGORY_DELETE</code> hoặc <code className="rounded-md border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-fuchsia-700 dark:text-fuchsia-300">PRODUCT_DELETE</code>.
        </p>
      </div>

      <ActivityLogListClient logs={logs} />

      {unauthorized && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 backdrop-blur-md">
          <span className="material-symbols-outlined text-rose-500 text-xl">gpp_bad</span>
          <p className="text-sm font-medium text-rose-800 dark:text-rose-200 leading-relaxed">
            Gateway trả <strong>401 Unauthorized</strong> cho <code className="rounded bg-black/10 dark:bg-black/30 px-1.5 py-0.5 text-rose-800 dark:text-rose-300">/api/activity/recent</code> — endpoint này{" "}
            <strong>bắt buộc access token còn hạn</strong>. Hãy{" "}
            <strong>đăng xuất rồi đăng nhập lại</strong> (cookie admin vẫn hiển thị khi token đã hết hạn).
          </p>
        </div>
      )}
      
      {otherFetchFailure && !unauthorized && (
        <div className="flex items-start gap-3 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5 backdrop-blur-md">
          <span className="material-symbols-outlined text-orange-500 text-xl">cloud_off</span>
          <p className="text-sm font-medium text-orange-800 dark:text-orange-200 leading-relaxed">
            Không lấy được dữ liệu từ gateway (lỗi mạng, HTTP lỗi hoặc phản hồi không hợp lệ). Vui lòng kiểm tra{" "}
            <code className="rounded bg-black/10 dark:bg-black/30 px-1.5 py-0.5 text-orange-800 dark:text-orange-300">NEXT_PUBLIC_API_BASE_URL</code> / <code className="rounded bg-black/10 dark:bg-black/30 px-1.5 py-0.5 text-orange-800 dark:text-orange-300">API_SERVER_ORIGIN</code> và gateway ở cổng{" "}
            <code className="rounded bg-black/10 dark:bg-black/30 px-1.5 py-0.5 text-orange-800 dark:text-orange-300">:8900</code>.
          </p>
        </div>
      )}
      
      {total === 0 && !unauthorized && !otherFetchFailure && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-200 dark:border-white/20 bg-white/50 dark:bg-zinc-900/50 p-12 text-center backdrop-blur-md">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 shadow-inner">
            <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-500">search_off</span>
          </div>
          <div>
            <h3 className="font-headline text-lg font-bold text-slate-900 dark:text-white mb-2">Chưa có bản ghi nào</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Nếu backend đang chạy, hãy thử tạo/sửa/xóa danh mục hoặc sản phẩm admin để phát sinh log. 
              Đảm bảo Eureka + gateway + <code className="text-cyan-600 dark:text-cyan-400">activity-log-service</code> đang hoạt động.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
