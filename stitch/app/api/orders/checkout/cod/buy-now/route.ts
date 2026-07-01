import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { CART_COOKIE_NAME, getResolvedApiRoot } from "@/app/api/cart/_shared";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type BuyNowItemInput = {
  productId?: number | null;
  quantity?: number | null;
  variantId?: number | null;
  variantLabel?: string | null;
};

type CodBuyNowRequest = {
  userId?: number | null;
  shippingAddress?: string | null;
  phoneNumber?: string | null;
  buyNowItem?: BuyNowItemInput | null;
};

export async function POST(req: Request) {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value?.trim() ?? "";
  const cartId = jar.get(CART_COOKIE_NAME)?.value?.trim() ?? "";
  const derivedUserId = accessToken ? getUserIdFromAccessToken(accessToken) : null;

  let body: CodBuyNowRequest | null = null;
  try {
    body = (await req.json()) as CodBuyNowRequest;
  } catch {
    body = null;
  }

  const userIdRaw = Number(body?.userId ?? derivedUserId ?? 0);
  const userId = Number.isFinite(userIdRaw) && userIdRaw > 0 ? Math.floor(userIdRaw) : null;
  if (!userId) {
    return NextResponse.json({ error: "UNAUTHORIZED", message: "Bạn cần đăng nhập để thanh toán." }, { status: 401 });
  }

  const productId = Number(body?.buyNowItem?.productId ?? 0);
  const quantity = Math.max(1, Math.floor(Number(body?.buyNowItem?.quantity ?? 0)));
  if (!Number.isFinite(productId) || productId <= 0 || !Number.isFinite(quantity) || quantity <= 0) {
    return NextResponse.json({ error: "BAD_REQUEST", message: "Thiếu thông tin mua ngay." }, { status: 400 });
  }
  const variantIdRaw = body?.buyNowItem?.variantId;
  const variantId = variantIdRaw == null ? null : Number(variantIdRaw);

  const upstreamBody = {
    userId,
    shippingAddress: typeof body?.shippingAddress === "string" ? body.shippingAddress : null,
    phoneNumber: typeof body?.phoneNumber === "string" ? body.phoneNumber : null,
    buyNowItem: {
      productId: Math.floor(productId),
      quantity,
      variantId: Number.isFinite(variantId as number) && Number(variantId) > 0 ? Number(variantId) : null,
      variantLabel: typeof body?.buyNowItem?.variantLabel === "string" ? body?.buyNowItem?.variantLabel : null,
    },
  };

  const base = getResolvedApiRoot();
  const url = `${base}/shop/orders/checkout/cod/buy-now`;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (cartId) {
      headers.Cookie = `${CART_COOKIE_NAME}=${cartId}`;
    }
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    const upstream = await fetch(url, {
      method: "POST",
      cache: "no-store",
      headers,
      body: JSON.stringify(upstreamBody),
    });
    const text = await upstream.text();
    if (!upstream.ok) {
      if (text && text.trim()) {
        return new NextResponse(text, {
          status: upstream.status,
          headers: {
            "Content-Type": upstream.headers.get("Content-Type") ?? "application/json; charset=utf-8",
            "X-Upstream-Status": String(upstream.status),
          },
        });
      }
      return NextResponse.json(
        {
          error: "UPSTREAM_ERROR",
          upstreamStatus: upstream.status,
          upstreamUrl: url,
          message: "Order checkout COD buy-now failed at upstream with empty response body.",
        },
        { status: upstream.status },
      );
    }
    return new NextResponse(text || "{}", {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "application/json; charset=utf-8",
      },
    });
  } catch {
    return NextResponse.json({ error: "NETWORK_ERROR" }, { status: 502 });
  }
}

