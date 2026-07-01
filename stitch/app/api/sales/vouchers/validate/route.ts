import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { apiUrl } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const c = await cookies();
    const token = c.get("accessToken")?.value;
    const userId = getUserIdFromAccessToken(token);

    if (!userId) {
      return NextResponse.json(
        { valid: false, message: "Bạn cần đăng nhập để áp dụng voucher." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { code, orderAmount } = body;

    const res = await fetch(apiUrl("/sales/vouchers/validate"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, userId: Number(userId), orderAmount }),
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { valid: false, message: "Lỗi kết nối kiểm tra voucher." },
      { status: 500 }
    );
  }
}
