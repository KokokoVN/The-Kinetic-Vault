import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserIdFromAccessToken } from "@/lib/auth";

export const CART_COOKIE_NAME = "cartId";

export function getResolvedApiRoot(): string {
  const raw = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8900/api").trim();
  if (/^https?:\/\//i.test(raw)) {
    return raw.replace(/\/+$/, "");
  }
  const prefix = raw.startsWith("/") ? raw : `/${raw}`;
  const origin = (process.env.API_SERVER_ORIGIN ?? "http://localhost:8900").replace(/\/+$/, "");
  return `${origin}${prefix}`.replace(/\/+$/, "");
}

/**
 * URL POST cho tư vấn chatbot (server-side).
 * Mặc định: gateway /api/chatbot/chat.
 * Nếu chưa bật gateway: đặt CHATBOT_SERVICE_URL=http://127.0.0.1:8816/chat trong .env.local
 */
export function getChatbotServicePostUrl(): string {
  const direct = process.env.CHATBOT_SERVICE_URL?.trim();
  if (direct) {
    return direct.replace(/\/+$/, "");
  }
  return `${getResolvedApiRoot()}/chatbot/chat`;
}

export function getResolvedCartServiceOrigin(): string {
  const raw = (process.env.CART_SERVICE_ORIGIN ?? "http://localhost:8821").trim();
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/+$/, "");
  return `http://${raw.replace(/^\/+/, "").replace(/\/+$/, "")}`;
}

export async function ensureCartIdCookie(): Promise<string> {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value?.trim();
  const uid = accessToken ? getUserIdFromAccessToken(accessToken) : null;

  // If logged in, pin cartId to user id so carts don't leak across accounts.
  if (uid) {
    const id = `cart:user:${uid}`;
    const existing = jar.get(CART_COOKIE_NAME)?.value?.trim();
    if (existing !== id) {
      jar.set(CART_COOKIE_NAME, id, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
    }
    return id;
  }

  const existing = jar.get(CART_COOKIE_NAME)?.value?.trim();
  if (existing) {
    return existing;
  }
  const id = `cart:${crypto.randomUUID()}`;
  jar.set(CART_COOKIE_NAME, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return id;
}

export function attachCartIdCookie(res: NextResponse, cartId: string): NextResponse {
  const id = String(cartId ?? "").trim();
  if (!id) return res;
  res.cookies.set(CART_COOKIE_NAME, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return res;
}

export function cookieHeaderForCartId(cartId: string): string {
  return `${CART_COOKIE_NAME}=${cartId}`;
}

export async function upstreamCartHeaders(cartId: string): Promise<Record<string, string>> {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value?.trim();
  const headers: Record<string, string> = {
    Cookie: cookieHeaderForCartId(cartId),
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return headers;
}

export async function fetchWithFallback(urls: string[], init: RequestInit): Promise<Response> {
  let lastResponse: Response | null = null;
  let lastError: unknown = null;
  for (const raw of urls) {
    const url = String(raw ?? "").trim();
    if (!url) continue;
    try {
      const res = await fetch(url, init);
      if (res.status < 500 && res.status !== 504) {
        return res;
      }
      lastResponse = res;
    } catch (err) {
      lastError = err;
    }
  }
  if (lastResponse) return lastResponse;
  throw (lastError instanceof Error ? lastError : new Error("UPSTREAM_UNAVAILABLE"));
}

