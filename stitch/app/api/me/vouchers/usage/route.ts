import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { apiUrl } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const c = await cookies();
    const token = c.get("accessToken")?.value;
    const userId = getUserIdFromAccessToken(token);

    if (!userId) {
      return NextResponse.json({}, { status: 401 });
    }

    const res = await fetch(apiUrl(`/sales/vouchers/my-usage?userId=${userId}`), {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({}, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({}, { status: 500 });
  }
}
