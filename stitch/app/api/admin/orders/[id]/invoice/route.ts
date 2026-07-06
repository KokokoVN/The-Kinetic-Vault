import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-server";
import { apiUrl } from "@/lib/api";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getAdminSession();
  
  if (!session.token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const url = apiUrl(`/shop/orders/${id}/invoice`);
  
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return new NextResponse("Lỗi khi tải hóa đơn", { status: res.status });
    }

    const blob = await res.blob();
    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    headers.set("Content-Disposition", `attachment; filename="Invoice_${id}.pdf"`);

    return new NextResponse(blob, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Lỗi xuất hóa đơn:", error);
    return new NextResponse("Lỗi kết nối tới backend", { status: 500 });
  }
}
