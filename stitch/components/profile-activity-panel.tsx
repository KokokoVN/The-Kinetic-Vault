import { formatWebActivityTime } from "@/lib/api";

type ChangeLog = {
  id?: number | null;
  changedField?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  changedAt?: string | null;
  changedBy?: string | null;
};

export function ProfileActivityPanel({ logs }: { logs: ChangeLog[] }) {
  if (!logs.length) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-zinc-800 bg-zinc-900/50 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-800/80 text-zinc-400 mb-4">
          <span className="material-symbols-outlined text-4xl">history</span>
        </div>
        <h3 className="text-lg font-black text-white">Chưa có nhật ký hoạt động nào</h3>
        <p className="mt-1 text-xs text-zinc-400">Tất cả thông tin cập nhật thông tin cá nhân sẽ được lưu lại tại đây.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-4 pl-4 sm:pl-6 before:absolute before:left-2 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-indigo-500 before:to-purple-500">
      {logs.map((log) => (
        <div
          key={log.id ?? `${log.changedField}-${log.changedAt}`}
          className="group relative overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900/90 p-5 sm:p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10"
        >
          <div className="absolute -left-7 sm:-left-9 top-6 h-4 w-4 rounded-full border-2 border-cyan-400 bg-zinc-950 shadow-[0_0_10px_rgba(6,182,212,0.8)] group-hover:scale-125 transition-transform" />

          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 px-3 py-1 text-xs font-extrabold text-cyan-300">
                <span className="material-symbols-outlined text-sm">edit_note</span>
                {fieldLabel(log.changedField)}
              </span>
            </div>
            <span className="text-[11px] font-bold text-zinc-400 font-mono">
              {formatWebActivityTime(log.changedAt)}
            </span>
          </div>

          <div className="rounded-xl border border-white/5 bg-zinc-950/60 p-3.5 text-xs sm:text-sm font-medium text-zinc-300 flex flex-wrap items-center gap-2">
            <span className="text-zinc-400 font-bold">{displayValue(log.changedField, log.oldValue)}</span>
            <span className="material-symbols-outlined text-cyan-400 text-sm font-bold">arrow_forward</span>
            <span className="font-bold text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
              {displayValue(log.changedField, log.newValue)}
            </span>
          </div>

          <div className="mt-3 text-[11px] font-bold text-zinc-400 flex items-center justify-between">
            <span>Thực hiện bởi: <strong className="text-zinc-300">{log.changedBy ?? "Hệ thống"}</strong></span>
            <span className="text-zinc-400">ID: #{log.id ?? "LOG"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function fieldLabel(field?: string | null): string {
  const key = String(field ?? "").trim();
  if (!key) return "Trường dữ liệu";
  const labels: Record<string, string> = {
    firstName: "Tên",
    lastName: "Họ",
    phoneNumber: "Số điện thoại",
    gender: "Giới tính",
    birthDate: "Ngày sinh",
    avatarUrl: "Ảnh đại diện",
    email: "Gmail",
  };
  return labels[key] ?? key;
}

function displayValue(field?: string | null, value?: string | null): string {
  const v = String(value ?? "").trim();
  if (!v) return "Chưa có";
  const key = String(field ?? "").trim();
  if (key === "gender") {
    if (v.toLowerCase() === "male") return "Nam";
    if (v.toLowerCase() === "female") return "Nữ";
  }
  return v;
}

