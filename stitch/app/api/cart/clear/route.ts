import { NextResponse } from "next/server";
import {
  attachCartIdCookie,
  ensureCartIdCookie,
  fetchWithFallback,
  getResolvedApiRoot,
  getResolvedCartServiceOrigin,
  upstreamCartHeaders,
} from "@/app/api/cart/_shared";

export async function DELETE() {
  const base = getResolvedApiRoot();
  const direct = getResolvedCartServiceOrigin();
  const cartId = await ensureCartIdCookie();
  try {
    const headers = await upstreamCartHeaders(cartId);
    const res = await fetchWithFallback(
      [`${direct}/cart/clear`, `${base}/shop/cart/clear`],
      {
        method: "DELETE",
        cache: "no-store",
        headers,
      },
    );
    return attachCartIdCookie(new NextResponse(null, { status: res.status }), cartId);
  } catch {
    return attachCartIdCookie(NextResponse.json({ error: "NETWORK_ERROR" }, { status: 502 }), cartId);
  }
}

