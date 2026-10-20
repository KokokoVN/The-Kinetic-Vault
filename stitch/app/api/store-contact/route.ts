import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-server";
import { getStoreContact, updateStoreContact, DEFAULT_STORE_CONTACT } from "@/lib/api";

export async function GET() {
  try {
    const contact = await getStoreContact();
    return NextResponse.json(contact);
  } catch (err: any) {
    console.error("GET /api/store-contact error:", err);
    return NextResponse.json(DEFAULT_STORE_CONTACT);
  }
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session.token) {
    return NextResponse.json({ message: "Chưa đăng nhập hoặc không có quyền Admin" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updated = await updateStoreContact(body, {
      accessToken: session.token,
      username: session.username,
      role: "ROLE_ADMIN",
    });
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PUT /api/store-contact error:", err);
    return NextResponse.json(
      { message: err.message || "Cập nhật thông tin cửa hàng thất bại" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return PUT(req);
}
