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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-900 p-8 shadow-2xl shadow-purple-900/40 md:flex-row md:items-end">
        {/* Background Decorative Elements */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-[80px]"></div>
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyan-500/20 blur-[80px]"></div>

        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-fuchsia-200 backdrop-blur-md">
            <span className="material-symbols-outlined text-sm">history</span>
            Hệ thống
          </p>
          <h1 className="mt-4 font-headline text-4xl font-black tracking-tight text-white md:text-5xl">Nhật ký hoạt động</h1>
          <p className="mt-3 max-w-2xl text-slate-300 font-medium leading-relaxed">
            Theo dõi tất cả hành động từ <code className="rounded-lg bg-black/30 px-2 py-0.5 text-xs text-fuchsia-300 font-mono">GET /api/activity/recent</code> qua gateway (
            <span className="font-mono text-xs text-cyan-300">activity-log-service</span>).
          </p>
        </div>
        
        <div className="relative z-10 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl transition-all hover:bg-black/30 hover:scale-105">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/30">
              <span className="material-symbols-outlined text-2xl text-white">schedule</span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gần nhất</p>
              <p className="font-headline text-sm font-black text-white">{total > 0 ? formatWebActivityTime(logs[0]?.createdAt) : "Chưa có bản ghi"}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl transition-all hover:bg-black/30 hover:scale-105">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-blue-500/30">
              <span className="material-symbols-outlined text-2xl text-white">history_edu</span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dòng hiển thị</p>
              <p className="font-headline text-2xl font-black text-white">{total}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg shadow-xl shadow-black/5">
        <span className="material-symbols-outlined text-cyan-400 mt-0.5">tips_and_updates</span>
        <p className="text-sm font-medium text-slate-300 leading-relaxed">
          <strong className="text-white font-bold">Gợi ý:</strong> Xóa danh mục hoặc sản phẩm admin sẽ tạo log hệ thống với action <code className="rounded-md border border-white/10 bg-black/30 px-1.5 py-0.5 font-mono text-xs text-fuchsia-300">CATEGORY_DELETE</code> hoặc <code className="rounded-md border border-white/10 bg-black/30 px-1.5 py-0.5 font-mono text-xs text-fuchsia-300">PRODUCT_DELETE</code>.
        </p>
      </div>

      <ActivityLogListClient logs={logs} />

      {unauthorized && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 backdrop-blur-md">
          <span className="material-symbols-outlined text-rose-500 text-xl">gpp_bad</span>
          <p className="text-sm font-medium text-rose-200 leading-relaxed">
            Gateway trả <strong>401 Unauthorized</strong> cho <code className="rounded bg-black/30 px-1.5 py-0.5 text-rose-300">/api/activity/recent</code> — endpoint này{" "}
            <strong>bắt buộc access token còn hạn</strong>. Hãy{" "}
            <strong>đăng xuất rồi đăng nhập lại</strong> (cookie admin vẫn hiển thị khi token đã hết hạn).
          </p>
        </div>
      )}
      
      {otherFetchFailure && !unauthorized && (
        <div className="flex items-start gap-3 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5 backdrop-blur-md">
          <span className="material-symbols-outlined text-orange-500 text-xl">cloud_off</span>
          <p className="text-sm font-medium text-orange-200 leading-relaxed">
            Không lấy được dữ liệu từ gateway (lỗi mạng, HTTP lỗi hoặc phản hồi không hợp lệ). Vui lòng kiểm tra{" "}
            <code className="rounded bg-black/30 px-1.5 py-0.5 text-orange-300">NEXT_PUBLIC_API_BASE_URL</code> / <code className="rounded bg-black/30 px-1.5 py-0.5 text-orange-300">API_SERVER_ORIGIN</code> và gateway ở cổng{" "}
            <code className="rounded bg-black/30 px-1.5 py-0.5 text-orange-300">:8900</code>.
          </p>
        </div>
      )}
      
      {total === 0 && !unauthorized && !otherFetchFailure && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-white/20 bg-white/5 p-12 text-center backdrop-blur-md">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5 shadow-inner">
            <span className="material-symbols-outlined text-4xl text-slate-500">search_off</span>
          </div>
          <div>
            <h3 className="font-headline text-lg font-bold text-white mb-2">Chưa có bản ghi nào</h3>
            <p className="text-sm font-medium text-slate-400 max-w-md mx-auto">
              Nếu backend đang chạy, hãy thử tạo/sửa/xóa danh mục hoặc sản phẩm admin để phát sinh log. 
              Đảm bảo Eureka + gateway + <code className="text-cyan-400">activity-log-service</code> đang hoạt động.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
