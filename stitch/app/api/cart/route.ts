import { NextResponse } from "next/server";
import {
  attachCartIdCookie,
  ensureCartIdCookie,
  fetchWithFallback,
  getResolvedApiRoot,
  getResolvedCartServiceOrigin,
  upstreamCartHeaders,
} from "@/app/api/cart/_shared";

function upstreamUrl(req: Request): string {
  const base = getResolvedApiRoot();
  const u = new URL(req.url);
  const qs = u.searchParams.toString();
  return `${base}/shop/cart${qs ? `?${qs}` : ""}`;
}

async function proxyCartMutation(req: Request, method: "POST" | "PUT" | "DELETE") {
  const cartId = await ensureCartIdCookie();
  const url = upstreamUrl(req);
  const direct = getResolvedCartServiceOrigin();
  const u = new URL(req.url);
  const qs = u.searchParams.toString();
  const directUrl = `${direct}/cart${qs ? `?${qs}` : ""}`;
  try {
    const headers = await upstreamCartHeaders(cartId);
    const res = await fetchWithFallback(
      [directUrl, url],
      {
        method,
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

export async function GET(req: Request) {
  const cartId = await ensureCartIdCookie();
  const url = upstreamUrl(req);
  const direct = getResolvedCartServiceOrigin();
  const u = new URL(req.url);
  const qs = u.searchParams.toString();
  const directUrl = `${direct}/cart${qs ? `?${qs}` : ""}`;
  try {
    const headers = await upstreamCartHeaders(cartId);
    const primary = await fetch(directUrl, {
      method: "GET",
      cache: "no-store",
      headers,
    });
    const res =
      primary.ok || (primary.status !== 401 && primary.status !== 404)
        ? primary
        : await fetchWithFallback(
            [url],
            {
              method: "GET",
              cache: "no-store",
              headers,
            },
          );
    const text = await res.text();
    const out = new NextResponse(text || "[]", {
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

export async function POST(req: Request) {
  return proxyCartMutation(req, "POST");
}

export async function PUT(req: Request) {
  return proxyCartMutation(req, "PUT");
}

export async function DELETE(req: Request) {
  return proxyCartMutation(req, "DELETE");
}

