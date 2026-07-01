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
      <div className="rounded-3xl border border-dashed border-outline-variant/20 bg-slate-50 p-8 text-center">
        <p className="text-sm font-semibold text-slate-700">Chưa có lịch sử thay đổi</p>
        <p className="mt-1 text-xs text-slate-500">Các cập nhật thông tin cá nhân sẽ được ghi lại tại đây.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div key={log.id ?? `${log.changedField}-${log.changedAt}`} className="rounded-2xl border border-outline-variant/10 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-black text-blue-950">{fieldLabel(log.changedField)}</p>
            <p className="text-xs text-slate-500">{formatWebActivityTime(log.changedAt)}</p>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            <span className="font-semibold">{displayValue(log.changedField, log.oldValue)}</span> →{" "}
            <span className="font-semibold text-blue-900">{displayValue(log.changedField, log.newValue)}</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">Bởi: {log.changedBy ?? "—"}</p>
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
