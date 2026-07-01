import Link from "next/link";
import { redirect } from "next/navigation";
import { unstable_rethrow } from "next/navigation";
import { requestForgotPassword } from "@/lib/api";
import { FloatingNotice } from "@/components/floating-notice";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ sent?: string; error?: string }>;
}) {
  async function forgotAction(formData: FormData) {
    "use server";
    const identity = String(formData.get("identity") ?? "").trim();
    if (!identity) {
      redirect("/forgot-password?error=1");
    }
    try {
      await requestForgotPassword(identity);
      redirect("/forgot-password?sent=1");
    } catch (e) {
      unstable_rethrow(e);
      const message = e instanceof Error ? e.message : "FORGOT_UNKNOWN";
      if (message.startsWith("FORGOT_400")) {
        redirect("/forgot-password?error=1");
      }
      redirect("/forgot-password?error=1");
    }
  }

  const sp = searchParams ? await searchParams : undefined;
  const sent = String(sp?.sent ?? "").trim() === "1";
  const hasError = String(sp?.error ?? "").trim() === "1";
  const noticeMessage = sent
    ? "Yêu cầu đã được ghi nhận. Vui lòng kiểm tra Gmail (cả mục Spam)."
    : hasError
      ? "Không gửi được yêu cầu lúc này. Vui lòng thử lại."
      : "";
  const noticeVariant: "success" | "error" = sent ? "success" : "error";

  return (
    <div className="kinetic-mesh kinetic-grid flex min-h-screen items-center justify-center px-6 py-20">
      {noticeMessage ? <FloatingNotice message={noticeMessage} variant={noticeVariant} /> : null}
      <div className="glass-panel w-full max-w-xl rounded-3xl border border-white/50 p-10 shadow-panel">
        <h1 className="font-headline text-3xl font-extrabold text-primary">Quên mật khẩu</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Nhập username/email/số điện thoại. Nếu tài khoản tồn tại, hệ thống sẽ gửi link đặt lại mật khẩu qua Gmail.
        </p>

        <form action={forgotAction} className="mt-6 space-y-4">
          <input
            name="identity"
            required
            className="w-full rounded-xl border-2 border-outline-variant/20 bg-surface-container-lowest px-4 py-3 outline-none transition-all focus:border-secondary"
            placeholder="username / email / số điện thoại"
          />
          <button type="submit" className="w-full rounded-xl bg-kinetic py-3 font-bold text-white">
            Gửi email đặt lại mật khẩu
          </button>
        </form>

        <div className="mt-6 text-sm">
          <Link href="/login" className="font-bold text-secondary hover:underline">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
