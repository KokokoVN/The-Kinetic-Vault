import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-server";
import { apiUrl } from "@/lib/api";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  
  if (!session.token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const qs = searchParams.toString();
  const url = apiUrl(`/shop/orders/export${qs ? '?' + qs : ''}`);
  
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return new NextResponse("Lỗi khi xuất danh sách", { status: res.status });
    }

    const blob = await res.blob();
    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    headers.set("Content-Disposition", `attachment; filename="Orders_Export.pdf"`);

    return new NextResponse(blob, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Lỗi xuất file:", error);
    return new NextResponse("Lỗi kết nối tới backend", { status: 500 });
  }
}
