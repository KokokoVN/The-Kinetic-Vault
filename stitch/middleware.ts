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

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminLoginPage = pathname === "/admin/login";
  const accessToken = req.cookies.get("accessToken")?.value;
  const tokenExpired = isAccessTokenExpired(accessToken);

  // Chuẩn hóa route cũ về /admin để luôn dùng layout có menu/header/footer
  // Giữ nguyên /products/:id cho khu vực user (trang chi tiết sản phẩm).
  if (pathname === "/dashboard") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
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
    // Không ép admin về /admin khi họ đang dùng cổng login user.
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
  matcher: ["/admin/:path*", "/login", "/dashboard"],
};

