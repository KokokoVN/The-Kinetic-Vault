import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  canAccessAdminArea,
  canMutateCatalog,
  getRoleFromAccessToken,
  isAccessTokenExpired,
} from "@/lib/auth";

function requiresCatalogWrite(pathname: string): boolean {
  if (pathname === "/admin/categories/new") {
    return true;
  }
  if (/\/admin\/categories\/[^/]+\/edit$/.test(pathname)) {
    return true;
  }
  if (pathname === "/admin/products/new") {
    return true;
  }
  if (/\/admin\/products\/[^/]+\/edit$/.test(pathname)) {
    return true;
  }
  if (/\/admin\/products\/[^/]+\/delete$/.test(pathname)) {
    return true;
  }
  return false;
}

// ==================== EDGE RATE LIMITER ====================
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const CLEANUP_INTERVAL = 60 * 1000;
let lastCleanup = Date.now();

function getClientIp(req: NextRequest): string {
  const cfIp = req.headers.get("cf-connecting-ip");
  const realIp = req.headers.get("x-real-ip");
  const forwarded = req.headers.get("x-forwarded-for");
  if (cfIp) return cfIp.trim();
  if (realIp) return realIp.trim();
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  return "127.0.0.1";
}

function checkEdgeRateLimit(
  key: string,
  limit: number,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetSec: number } {
  const now = Date.now();
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    lastCleanup = now;
    for (const [k, v] of rateLimitMap.entries()) {
      if (now > v.resetAt) rateLimitMap.delete(k);
    }
  }

  const record = rateLimitMap.get(key);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetSec: Math.ceil(windowMs / 1000) };
  }

  if (record.count >= limit) {
    const resetSec = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return { allowed: false, remaining: 0, resetSec };
  }

  record.count += 1;
  const resetSec = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
  return { allowed: true, remaining: limit - record.count, resetSec };
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const clientIp = getClientIp(req);

  // ── Edge Rate Limiting for /api/** ──
  if (pathname.startsWith("/api/")) {
    if (pathname.includes("/images/file/") || /\.(webp|jpg|jpeg|png|svg|gif|avif)$/i.test(pathname)) {
      return NextResponse.next();
    }
    const isAuthRoute =
      pathname.startsWith("/api/auth/") ||
      pathname.startsWith("/api/accounts/registration/") ||
      pathname.startsWith("/api/registration/");
    const isPaymentRoute =
      pathname.startsWith("/api/payments/") ||
      pathname.startsWith("/api/orders/checkout/");

    let limit = 200; // general API limit per minute
    let category = "api";
    if (isAuthRoute) {
      limit = 20; // auth & OTP sensitive limit
      category = "auth";
    } else if (isPaymentRoute) {
      limit = 40; // payment / checkout limit
      category = "payment";
    }

    const key = `${category}:${clientIp}`;
    const { allowed, remaining, resetSec } = checkEdgeRateLimit(key, limit);

    if (!allowed) {
      return new NextResponse(
        JSON.stringify({
          error: "Too Many Requests",
          message: `Bạn đã gửi quá nhiều yêu cầu đến hệ thống (${limit} req/phút). Vui lòng thử lại sau ${resetSec} giây.`,
          status: 429,
          tier: category,
          retryAfterSeconds: resetSec,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Retry-After": String(resetSec),
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(resetSec),
          },
        }
      );
    }

    // Gắn headers thông báo hạn mức vào response
    const res = NextResponse.next();
    res.headers.set("X-RateLimit-Limit", String(limit));
    res.headers.set("X-RateLimit-Remaining", String(remaining));
    return res;
  }

  const isAdminLoginPage = pathname === "/admin/login";
  const isShowcasePage = pathname.startsWith("/admin/showcase");
  const isBrandPage = pathname.startsWith("/admin/brands");
  const accessToken = req.cookies.get("accessToken")?.value;
  const tokenExpired = isAccessTokenExpired(accessToken);

  // Chuẩn hóa route cũ về /admin để luôn dùng layout có menu/header/footer
  // Giữ nguyên /products/:id cho khu vực user (trang chi tiết sản phẩm).
  if (pathname === "/dashboard") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  if (isShowcasePage || (isBrandPage && (!accessToken || tokenExpired))) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-is-showcase", "1");
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (pathname.startsWith("/admin") && !isAdminLoginPage) {

    if (!accessToken || tokenExpired) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("error", tokenExpired ? "expired" : "401");
      const res = NextResponse.redirect(url);
      // Xóa token hết hạn để tránh vòng lặp redirect /admin/login <-> /admin
      res.cookies.delete("accessToken");
      res.cookies.delete("refreshToken");
      return res;
    }
    const role = getRoleFromAccessToken(accessToken);
    if (!canAccessAdminArea(role)) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("error", "forbidden");
      if (role) {
        url.searchParams.set("role", role);
      }
      return NextResponse.redirect(url);
    }
    if (requiresCatalogWrite(pathname) && !canMutateCatalog(role)) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/products";
      url.searchParams.set("error", "readonly");
      return NextResponse.redirect(url);
    }
  }

  if (pathname === "/login" && accessToken) {
    if (tokenExpired) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "expired");
      const res = NextResponse.redirect(url);
      res.cookies.delete("accessToken");
      res.cookies.delete("refreshToken");
      return res;
    }
    const role = getRoleFromAccessToken(accessToken);
    const next = (req.nextUrl.searchParams.get("next") ?? "").trim();
    const safeNext = next.startsWith("/") && !next.startsWith("//") && !next.toLowerCase().startsWith("/admin") ? next : "";
    if (safeNext) {
      const url = req.nextUrl.clone();
      url.pathname = safeNext;
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  if (isAdminLoginPage && accessToken) {
    if (tokenExpired) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("error", "expired");
      const res = NextResponse.redirect(url);
      res.cookies.delete("accessToken");
      res.cookies.delete("refreshToken");
      return res;
    }
    const role = getRoleFromAccessToken(accessToken);
    if (canAccessAdminArea(role)) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/dashboard", "/api/:path*"],
};
