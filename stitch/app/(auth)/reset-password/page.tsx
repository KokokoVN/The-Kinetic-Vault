import Link from "next/link";
import { redirect } from "next/navigation";
import { unstable_rethrow } from "next/navigation";
import { resetPasswordByToken } from "@/lib/api";
import { FloatingNotice } from "@/components/floating-notice";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string; error?: string }>;
}) {
  const sp = searchParams ? await searchParams : undefined;
  const token = String(sp?.token ?? "").trim();
  const hasError = String(sp?.error ?? "").trim() === "1";

  async function resetAction(formData: FormData) {
    "use server";
    const formToken = String(formData.get("token") ?? "").trim();
    const newPassword = String(formData.get("newPassword") ?? "").trim();
    const confirmPassword = String(formData.get("confirmPassword") ?? "").trim();
    if (!formToken || newPassword.length < 8 || newPassword !== confirmPassword) {
      redirect(`/reset-password?token=${encodeURIComponent(formToken)}&error=1`);
    }
    try {
      await resetPasswordByToken(formToken, newPassword);
      redirect("/login?reset=1");
    } catch (e) {
      unstable_rethrow(e);
      redirect(`/reset-password?token=${encodeURIComponent(formToken)}&error=1`);
    }
  }

  if (!token) {
    return (
      <div className="kinetic-mesh kinetic-grid flex min-h-screen items-center justify-center px-6 py-20">
        <FloatingNotice message="Liên kết đặt lại mật khẩu không hợp lệ." variant="error" />
        <div className="glass-panel w-full max-w-xl rounded-3xl border border-white/50 p-10 shadow-panel">
          <div className="mt-4">
            <Link href="/forgot-password" className="font-bold text-secondary hover:underline">
              Gửi lại yêu cầu quên mật khẩu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="kinetic-mesh kinetic-grid flex min-h-screen items-center justify-center px-6 py-20">
      {hasError ? (
        <FloatingNotice message="Không thể đặt lại mật khẩu. Token có thể hết hạn hoặc mật khẩu chưa hợp lệ." variant="error" />
      ) : null}
      <div className="glass-panel w-full max-w-xl rounded-3xl border border-white/50 p-10 shadow-panel">
        <h1 className="font-headline text-3xl font-extrabold text-primary">Đặt lại mật khẩu</h1>
        <p className="mt-2 text-sm text-on-surface-variant">Nhập mật khẩu mới (ít nhất 8 ký tự).</p>

        <form action={resetAction} className="mt-6 space-y-4">
          <input type="hidden" name="token" value={token} />
          <input
            name="newPassword"
            type="password"
            required
            className="w-full rounded-xl border-2 border-outline-variant/20 bg-surface-container-lowest px-4 py-3 outline-none transition-all focus:border-secondary"
            placeholder="Mật khẩu mới"
          />
          <input
            name="confirmPassword"
            type="password"
            required
            className="w-full rounded-xl border-2 border-outline-variant/20 bg-surface-container-lowest px-4 py-3 outline-none transition-all focus:border-secondary"
            placeholder="Nhập lại mật khẩu mới"
          />
          <button type="submit" className="w-full rounded-xl bg-kinetic py-3 font-bold text-white">
            Cập nhật mật khẩu
          </button>
        </form>
      </div>
    </div>
  );
}
