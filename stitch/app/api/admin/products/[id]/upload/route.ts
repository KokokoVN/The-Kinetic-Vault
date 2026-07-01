import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-server";
import { getUserIdFromAccessToken } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!session.token) {
    return NextResponse.json({ error: "Yêu cầu quyền truy cập admin" }, { status: 401 });
  }

  const uid = getUserIdFromAccessToken(session.token);
  // URL endpoint upload backend của catalog service
  const targetUrl = `${
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8900/api"
  }/catalog/admin/products/${id}/images/upload`;

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${session.token}`);
  if (session.username) {
    headers.set("X-Username", session.username);
  }
  if (uid) {
    headers.set("X-User-Id", String(uid));
  }

  // Chuyển tiếp Content-Type nguyên vẹn (bắt buộc phải giữ boundary của multipart/form-data)
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }

  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: request.body,
      // @ts-ignore
      duplex: "half",
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: errText || "Lỗi tải lên từ backend catalog service" },
        { status: res.status }
      );
    }

    try {
      const data = await res.json();
      return NextResponse.json(data);
    } catch {
      return NextResponse.json({ success: true });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Lỗi kết nối từ gateway tới service" },
      { status: 500 }
    );
  }
}
