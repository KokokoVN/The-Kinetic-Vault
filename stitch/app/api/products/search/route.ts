import { NextRequest, NextResponse } from "next/server";
import { searchProductsForUi, listPublicCategories } from "@/lib/api";
import { listActivePrograms } from "@/lib/sale-api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();
    const status = (searchParams.get("status") ?? "all") as "all" | "in_stock" | "low_stock" | "out_stock";
    const category = searchParams.get("category")?.trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const size = Math.min(50, Math.max(1, parseInt(searchParams.get("size") || "12", 10) || 12));

    const [searchRes, activeSalePrograms, categories] = await Promise.all([
      searchProductsForUi({ q, status, page, size }),
      listActivePrograms().catch(() => []),
      listPublicCategories().catch(() => []),
    ]);

    // Attach active sale program promotions if applicable
    const items = searchRes.items.map((p) => {
      let salePrice = p.minPrice ?? p.rawPrice ?? 0;
      let originalPriceValue = salePrice;
      let saleBadge: string | null = null;
      let finalMinPrice = p.minPrice;
      let finalMaxPrice = p.maxPrice;

      activeSalePrograms.forEach((program: any) => {
        const hasProduct = program.items?.some(
          (item: any) => item.productId === Number(p.id) && (item.promoQtyLimit == null || item.promoQtyLimit > 0)
        );
        if (hasProduct) {
          let currentDiscountValue = 0;
          let currentBadge = "";

          if (program.discountType === "PERCENT") {
            currentDiscountValue = (p.rawPrice * program.discountValue) / 100;
            currentBadge = `-${program.discountValue}%`;
          } else if (program.discountType === "FIXED_AMOUNT") {
            currentDiscountValue = program.discountValue;
            currentBadge = `-${Math.round(program.discountValue / 1000)}k`;
          } else if (program.discountType === "SAME_PRICE") {
            currentDiscountValue = Math.max(0, p.rawPrice - program.discountValue);
            currentBadge = "Đồng giá";
          }

          if (currentDiscountValue > 0) {
            salePrice = Math.max(0, p.rawPrice - currentDiscountValue);
            saleBadge = currentBadge;
            if (p.hasVariantPriceRange && p.minPrice && p.maxPrice) {
              finalMinPrice = Math.max(0, p.minPrice - currentDiscountValue);
              finalMaxPrice = Math.max(0, p.maxPrice - currentDiscountValue);
            }
          }
        }
      });

      return {
        ...p,
        salePrice: saleBadge ? salePrice : undefined,
        originalPriceValue: saleBadge ? originalPriceValue : undefined,
        saleBadge: saleBadge || undefined,
        minPrice: finalMinPrice,
        maxPrice: finalMaxPrice,
      };
    });

    return NextResponse.json({
      items,
      page: searchRes.page,
      size: searchRes.size,
      totalItems: searchRes.totalItems,
      totalPages: searchRes.totalPages,
    });
  } catch (err: any) {
    console.error("Lỗi API search products:", err);
    return NextResponse.json(
      { items: [], page: 1, size: 12, totalItems: 0, totalPages: 1, error: err.message },
      { status: 500 }
    );
  }
}
