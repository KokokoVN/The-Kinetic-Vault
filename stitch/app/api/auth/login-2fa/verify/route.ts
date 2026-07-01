import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/profile-base";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { identity, code, deviceFingerprint } = await req.json();

    if (!identity || !code) {
      return NextResponse.json({ ok: false, error: "MISSING_PARAMS", message: "Thiếu thông tin xác thực." }, { status: 400 });
    }

    const res = await fetch(`${getApiBaseUrl()}/accounts/auth/login-2fa/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity, code, deviceFingerprint }),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json({ ok: false, ...data }, { status: res.status });
    }

    const { accessToken } = data;
    if (accessToken) {
      const cookieStore = await cookies();
      cookieStore.set({
        name: "accessToken",
        value: accessToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
      return NextResponse.json({ ok: true, message: "Login successful" });
    }

    return NextResponse.json({ ok: false, message: "Invalid response from server" }, { status: 500 });
  } catch (error) {
    console.error("verifyLogin2fa error:", error);
    return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
  }
}
