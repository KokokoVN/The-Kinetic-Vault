import { NextResponse } from "next/server";
import {
  attachCartIdCookie,
  ensureCartIdCookie,
  fetchWithFallback,
  getResolvedApiRoot,
  getResolvedCartServiceOrigin,
  upstreamCartHeaders,
} from "@/app/api/cart/_shared";

export async function GET() {
  const base = getResolvedApiRoot();
  const direct = getResolvedCartServiceOrigin();
  const cartId = await ensureCartIdCookie();

  try {
    const headers = await upstreamCartHeaders(cartId);
    const primary = await fetch(`${direct}/cart/items`, {
      method: "GET",
      cache: "no-store",
      headers,
    });
    const res =
      primary.ok || (primary.status !== 401 && primary.status !== 404)
        ? primary
        : await fetchWithFallback(
            [`${base}/shop/cart/items`],
            {
              method: "GET",
              cache: "no-store",
              headers,
            },
          );

    const text = await res.text();
    const out = new NextResponse(text || "{}", {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "application/json; charset=utf-8",
      },
    });
    return attachCartIdCookie(out, cartId);
  } catch {
    return attachCartIdCookie(NextResponse.json({ error: "NETWORK_ERROR" }, { status: 502 }), cartId);
  }
}

