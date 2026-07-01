import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LoginDeviceApprovalPage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string; error?: string; approved?: string }>;
}) {
  const sp = searchParams ? await searchParams : undefined;
  const token = String(sp?.token ?? "").trim();
  const hasError = String(sp?.error ?? "").trim() === "invalid";
  const approved = String(sp?.approved ?? "").trim() === "1";
  if (token) {
    redirect(`/api/auth/device-approval?approveOnly=1&token=${encodeURIComponent(token)}`);
  }

  return (
    <div className="kinetic-mesh kinetic-grid flex min-h-screen items-center justify-center px-6 py-20">
      <div className="glass-panel w-full max-w-xl rounded-3xl border border-white/50 p-10 shadow-panel">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-kinetic">
            <span className="material-symbols-outlined material-filled text-white">{hasError ? "error" : "mail"}</span>
          </div>
          <h1 className="font-headline text-3xl font-extrabold text-primary">Phê duyệt thiết bị</h1>
        </div>
        {hasError ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            Liên kết phê duyệt không hợp lệ hoặc đã hết hạn.
          </p>
        ) : approved ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Thiết bị đã được phê duyệt thành công. Bạn có thể quay lại tab chờ để vào thẳng hệ thống.
          </p>
        ) : (
          <p className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
            Đang xử lý phê duyệt thiết bị, vui lòng chờ trong giây lát...
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/login" className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition-all hover:brightness-110">
            Đi tới đăng nhập
          </Link>
          <Link href="/" className="rounded-xl border border-outline-variant/40 px-5 py-3 text-sm font-bold text-on-surface transition-all hover:bg-surface-container">
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
