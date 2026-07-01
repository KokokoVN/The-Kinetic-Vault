import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { login } from "@/lib/api";

type Body = {
  username?: string;
  password?: string;
  context?: "user" | "admin";
  deviceFingerprint?: string;
};

export async function POST(req: Request) {
  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, message: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");
  const deviceFingerprint = String(body.deviceFingerprint ?? "").trim();
  if (!username || !password) {
    return NextResponse.json({ ok: false, message: "Thiếu tài khoản hoặc mật khẩu." }, { status: 400 });
  }

  try {
    const res = await login(username, password, deviceFingerprint || undefined);
    const jar = await cookies();
    jar.set("accessToken", res.accessToken, { httpOnly: true, path: "/" });
    jar.set("refreshToken", res.refreshToken, { httpOnly: true, path: "/" });
    const target =
      body.context === "admin" && res.role === "ROLE_ADMIN"
        ? "/admin/dashboard"
        : "/";
    return NextResponse.json({ ok: true, target });
  } catch (e) {
    const message = e instanceof Error ? e.message : "LOGIN_UNKNOWN";
    if (message.startsWith("LOGIN_428")) {
      return NextResponse.json({ ok: false, pending: true });
    }
    if (message.startsWith("LOGIN_401")) {
      return NextResponse.json({ ok: false, message: "Thông tin đăng nhập không còn hợp lệ." });
    }
    if (message.startsWith("LOGIN_403")) {
      return NextResponse.json({ ok: false, message: "Tài khoản chưa kích hoạt." });
    }
    return NextResponse.json({ ok: false, message: "Không thể hoàn tất đăng nhập tự động." });
  }
}
