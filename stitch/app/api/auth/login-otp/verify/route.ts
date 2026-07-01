import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyLoginOtp } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { identity?: string; otp?: string; deviceFingerprint?: string };
    const identity = String(body.identity ?? "").trim();
    const otp = String(body.otp ?? "").trim();
    const deviceFingerprint = String(body.deviceFingerprint ?? "").trim();
    if (!identity || !otp || !deviceFingerprint) {
      return NextResponse.json({ error: "MISSING_PARAMS", message: "Thiếu thông tin xác thực OTP." }, { status: 400 });
    }

    const res = await verifyLoginOtp({ identity, otp, deviceFingerprint });
    if (!res?.accessToken || !res?.refreshToken) {
      return NextResponse.json({ error: "INVALID_OTP", message: "OTP không hợp lệ hoặc đã hết hạn." }, { status: 400 });
    }

    const jar = await cookies();
    jar.set("accessToken", res.accessToken, { httpOnly: true, path: "/" });
    jar.set("refreshToken", res.refreshToken, { httpOnly: true, path: "/" });

    return NextResponse.json({ ok: true, userId: res.userId, username: res.username, role: res.role });
  } catch (e) {
    const message = e instanceof Error ? e.message : "OTP_VERIFY_FAILED";
    return NextResponse.json({ error: "OTP_VERIFY_FAILED", message }, { status: 500 });
  }
}
