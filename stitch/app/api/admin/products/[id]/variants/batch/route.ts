import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-server";
import { getUserIdFromAccessToken } from "@/lib/auth";
import {
  addAdminProductVariant,
  listAdminProductVariants,
  updateAdminProductVariant,
  uploadAdminProductImageAndGetVariantUrl,
} from "@/lib/api";

type VariantBatchItem = {
  id?: number | null;
  existingVariantId?: number | null;
  size: string;
  color: string;
  variantName?: string | null;
  attributesJson?: string | null;
  sku?: string | null;
  price: number;
  originalPrice?: number | null;
  availability?: number | null;
  variantImageUrl?: string | null;
  tier1Value?: string;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId) || numId <= 0) {
    return NextResponse.json({ error: "ID sản phẩm không hợp lệ" }, { status: 400 });
  }

  const session = await getAdminSession();
  if (!session.token || !session.canMutateCatalog) {
    return NextResponse.json({ error: "Yêu cầu quyền truy cập admin" }, { status: 401 });
  }

  const uid = getUserIdFromAccessToken(session.token);
  const options = {
    accessToken: session.token,
    username: session.username,
    userId: uid,
  };

  try {
    const contentType = request.headers.get("content-type") || "";
    let variants: VariantBatchItem[] = [];
    const tierImagesMap = new Map<string, File>();

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const rawJson = String(formData.get("variantsJson") || "[]");
      variants = JSON.parse(rawJson);

      // Collect any tier1 image files
      for (const [key, value] of formData.entries()) {
        if (key.startsWith("tier1Image_") && value instanceof File && value.size > 0) {
          const tierVal = key.replace("tier1Image_", "");
          tierImagesMap.set(tierVal, value);
        }
      }
    } else {
      const body = await request.json();
      variants = Array.isArray(body.variants) ? body.variants : [];
    }

    if (!variants.length) {
      return NextResponse.json({ success: true, count: 0 });
    }

    // Upload tier images first and cache their URLs
    const uploadedTierImageUrls = new Map<string, string>();
    for (const [tierVal, file] of tierImagesMap.entries()) {
      try {
        const url = await uploadAdminProductImageAndGetVariantUrl(numId, file, options);
        uploadedTierImageUrls.set(tierVal, url);
      } catch (uploadErr) {
        console.warn(`[BatchVariants] Upload image failed for tier "${tierVal}":`, uploadErr);
      }
    }

    const existingVariants = await listAdminProductVariants(numId, { accessToken: session.token });
    const existingMap = new Map<string, (typeof existingVariants)[0]>();
    const usedExistingIds = new Set<number>();

    for (const ev of existingVariants) {
      const k = `${String(ev.size ?? "").trim().toLowerCase()}::${String(ev.color ?? "").trim().toLowerCase()}`;
      existingMap.set(k, ev);
    }

    let addedCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    for (const v of variants) {
      const size = String(v.size || "-").trim();
      const color = String(v.color || "-").trim();
      if (!size || !color || !Number.isFinite(v.price) || v.price <= 0) {
        continue;
      }

      // If tier image was uploaded, assign it
      let variantImageUrl = v.variantImageUrl || null;
      if (v.tier1Value && uploadedTierImageUrls.has(v.tier1Value)) {
        variantImageUrl = uploadedTierImageUrls.get(v.tier1Value)!;
      }

      // 1. Check explicit existing variant ID
      const explicitId = v.existingVariantId || v.id;
      let existing = explicitId ? existingVariants.find((ev) => ev.id === explicitId) : undefined;

      // 2. Check exact (size::color) match
      if (!existing) {
        const key = `${size.toLowerCase()}::${color.toLowerCase()}`;
        const found = existingMap.get(key);
        if (found && !usedExistingIds.has(found.id)) {
          existing = found;
        }
      }

      // 3. Check prefix match for tier expansion (e.g. existing size was "128GB" and expanded size is "128GB - 12 tháng")
      if (!existing) {
        const colorLower = color.toLowerCase();
        const found = existingVariants.find((ev) => {
          if (usedExistingIds.has(ev.id)) return false;
          const evColor = String(ev.color ?? "").trim().toLowerCase();
          const evSize = String(ev.size ?? "").trim().toLowerCase();
          if (evColor !== colorLower) return false;
          return size.toLowerCase().startsWith(evSize + " - ");
        });
        if (found) {
          existing = found;
        }
      }

      if (existing) {
        usedExistingIds.add(existing.id);
      }

      try {
        if (existing) {
          await updateAdminProductVariant(
            numId,
            existing.id,
            {
              size,
              color,
              variantImageUrl: variantImageUrl ?? existing.variantImageUrl,
              variantName: v.variantName ?? existing.variantName,
              attributesJson: v.attributesJson ?? existing.attributesJson,
              sku: v.sku ?? existing.sku,
              price: v.price,
              originalPrice: v.originalPrice !== undefined ? v.originalPrice : existing.originalPrice != null ? Number(existing.originalPrice) : undefined,
              availability: v.availability !== undefined && v.availability !== null ? v.availability : existing.availability ?? 0,
              performedBy: session.username ?? undefined,
            },
            options
          );
          updatedCount++;
        } else {
          await addAdminProductVariant(
            numId,
            {
              size,
              color,
              variantImageUrl,
              variantName: v.variantName,
              attributesJson: v.attributesJson,
              sku: v.sku,
              price: v.price,
              originalPrice: v.originalPrice ?? undefined,
              availability: v.availability ?? 0,
              performedBy: session.username ?? undefined,
            },
            options
          );
          addedCount++;
        }
      } catch (err: any) {
        errors.push(`[${color}/${size}]: ${err.message || "Lỗi xử lý biến thể"}`);
      }
    }

    return NextResponse.json({
      success: true,
      added: addedCount,
      updated: updatedCount,
      total: variants.length,
      errors: errors.length ? errors : undefined,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Lỗi khi lưu các biến thể đa tầng" },
      { status: 500 }
    );
  }
}
