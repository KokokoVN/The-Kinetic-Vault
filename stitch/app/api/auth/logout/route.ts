import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CART_COOKIE_NAME } from "@/app/api/cart/_shared";

export async function POST() {
  const jar = await cookies();
  jar.delete("accessToken");
  jar.delete("refreshToken");
  jar.delete(CART_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
