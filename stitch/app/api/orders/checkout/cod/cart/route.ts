import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { CART_COOKIE_NAME, getResolvedApiRoot } from "@/app/api/cart/_shared";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SelectedCartItem = {
  productId?: number | null;
  variantId?: number | null;
  quantity?: number | null;
  variantLabel?: string | null;
  subTotal?: number | null;
};

type CodCartCheckoutRequest = {
  userId?: number | null;
  shippingAddress?: string | null;
  phoneNumber?: string | null;
  selectedCartItems?: SelectedCartItem[] | null;
};

function normalizeSelectedItems(raw: unknown): Array<{ productId: number; variantId: number | null; quantity: number; variantLabel: string | null; subTotal: number | null }> {
  const list = Array.isArray(raw) ? raw : [];
  const out: Array<{ productId: number; variantId: number | null; quantity: number; variantLabel: string | null; subTotal: number | null }> = [];
  for (const it of list) {
    if (!it || typeof it !== "object") continue;
    const obj = it as Record<string, unknown>;
    const productId = Number(obj.productId ?? 0);
    if (!Number.isFinite(productId) || productId <= 0) continue;
    const variantRaw = obj.variantId;
    const variantId = variantRaw == null ? null : Number(variantRaw);
    const quantityRaw = Number(obj.quantity ?? 1);
    const quantity = Number.isFinite(quantityRaw) && quantityRaw > 0 ? Math.floor(quantityRaw) : 1;
    const subTotalRaw = Number(obj.subTotal ?? NaN);
    const subTotal = Number.isFinite(subTotalRaw) && subTotalRaw > 0 ? subTotalRaw : null;
    out.push({
      productId: Math.floor(productId),
      variantId: Number.isFinite(variantId as number) && Number(variantId) > 0 ? Number(variantId) : null,
      quantity,
      variantLabel: typeof obj.variantLabel === "string" ? obj.variantLabel : null,
      subTotal,
    });
  }
  return out;
}

export async function POST(req: Request) {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value?.trim() ?? "";
  const cartId = jar.get(CART_COOKIE_NAME)?.value?.trim() ?? "";
  const derivedUserId = accessToken ? getUserIdFromAccessToken(accessToken) : null;

  if (!cartId) {
    return NextResponse.json({ error: "BAD_REQUEST", message: "Thiếu cartId." }, { status: 400 });
  }

  let body: CodCartCheckoutRequest | null = null;
  try {
    body = (await req.json()) as CodCartCheckoutRequest;
  } catch {
    body = null;
  }

  const userIdRaw = Number(body?.userId ?? derivedUserId ?? 0);
  const userId = Number.isFinite(userIdRaw) && userIdRaw > 0 ? Math.floor(userIdRaw) : null;
  if (!userId) {
    return NextResponse.json({ error: "UNAUTHORIZED", message: "Bạn cần đăng nhập để thanh toán." }, { status: 401 });
  }
  const selectedCartItems = normalizeSelectedItems(body?.selectedCartItems);
  if (!selectedCartItems.length) {
    return NextResponse.json({ error: "BAD_REQUEST", message: "Thiếu sản phẩm đã chọn từ giỏ hàng." }, { status: 400 });
  }

  const upstreamBody = {
    userId,
    shippingAddress: typeof body?.shippingAddress === "string" ? body.shippingAddress : null,
    phoneNumber: typeof body?.phoneNumber === "string" ? body.phoneNumber : null,
    selectedCartItems,
  };
  const base = getResolvedApiRoot();
  const url = `${base}/shop/orders/checkout/cod/cart`;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Cookie: `${CART_COOKIE_NAME}=${cartId}`,
    };
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
          message: "Order checkout COD failed at upstream with empty response body.",
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

