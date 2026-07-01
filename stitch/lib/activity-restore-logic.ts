/** Phân tích detailJson nhật ký (schema v1 / v2) — dùng trên server + client. */

export type RestoreIntent =
  | "product_undo_create"
  | "product_revert_update"
  | "product_reapply_update"
  | "product_restore_delete"
  | "category_undo_create"
  | "category_revert_update"
  | "category_reapply_update"
  | "category_restore_delete";

export type RestoreButtonSpec = { intent: RestoreIntent; label: string; variant: "primary" | "secondary" };

function asRecord(v: unknown): Record<string, unknown> | null {
  return v != null && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

export function snapshotToProductInput(snap: Record<string, unknown>): {
  productName: string;
  discription: string;
  categoryId: number;
  price: number;
} {
  const priceRaw = snap.price;
  const price =
    typeof priceRaw === "number"
      ? priceRaw
      : typeof priceRaw === "string"
        ? Number(priceRaw.replace(/,/g, "")) || 0
        : Number(priceRaw ?? 0);
  const categoryIdRaw = Number(snap.categoryId);
  const categoryId = Number.isFinite(categoryIdRaw) ? Math.floor(categoryIdRaw) : 0;
  return {
    productName: String(snap.productName ?? "").trim(),
    discription: String(snap.discription ?? ""),
    categoryId,
    price: Number.isFinite(price) ? price : 0,
  };
}

export function snapshotToCategoryInput(snap: Record<string, unknown>): { name: string; slug?: string } {
  const name = String(snap.name ?? "").trim();
  const slugRaw = snap.slug;
  const slug = slugRaw != null && String(slugRaw).trim() !== "" ? String(slugRaw).trim() : undefined;
  return { name, slug };
}

/** Chuẩn hóa productId / before / after từ log. */
export function normalizeProductLog(
  action: string,
  detail: Record<string, unknown>,
): { productId: string | null; before: Record<string, unknown> | null; after: Record<string, unknown> | null } {
  const v = detail.schemaVersion;
  if (v === 2) {
    const pid = detail.productId != null ? String(detail.productId) : null;
    return {
      productId: pid,
      before: asRecord(detail.before),
      after: asRecord(detail.after),
    };
  }
  if (action === "PRODUCT_UPDATE") {
    const before = asRecord(detail.before);
    const pid = detail.productId != null ? String(detail.productId) : null;
    const after: Record<string, unknown> = {
      productName: detail.productName,
      discription: detail.discription ?? "",
      category: detail.category ?? "",
      categoryId: detail.categoryId,
      price: detail.price,
      availability: detail.availability,
    };
    return { productId: pid, before, after: before ? after : null };
  }
  if (action === "PRODUCT_CREATE") {
    const pid = detail.productId != null ? String(detail.productId) : null;
    const after = asRecord(detail.after) ?? (detail as Record<string, unknown>);
    return { productId: pid, before: null, after };
  }
  if (action === "PRODUCT_DELETE") {
    const inner = asRecord(detail.before);
    if (inner) {
      const pid = inner.productId != null ? String(inner.productId) : detail.productId != null ? String(detail.productId) : null;
      return { productId: pid, before: inner, after: null };
    }
    return {
      productId: detail.productId != null ? String(detail.productId) : null,
      before: {
        productId: detail.productId,
        productName: detail.productName,
        discription: "",
        category: detail.category,
        categoryId: detail.categoryId,
        sku: detail.sku,
        price: null,
        availability: 0,
      } as Record<string, unknown>,
      after: null,
    };
  }
  return { productId: null, before: null, after: null };
}

export function normalizeCategoryLog(
  action: string,
  detail: Record<string, unknown>,
): { categoryId: string | null; before: Record<string, unknown> | null; after: Record<string, unknown> | null } {
  const v = detail.schemaVersion;
  if (v === 2) {
    const cid = detail.categoryId != null ? String(detail.categoryId) : null;
    return {
      categoryId: cid,
      before: asRecord(detail.before),
      after: asRecord(detail.after),
    };
  }
  if (action === "CATEGORY_UPDATE") {
    const cid = detail.categoryId != null ? String(detail.categoryId) : null;
    const after = {
      name: detail.name,
      slug: detail.slug,
    } as Record<string, unknown>;
    const before = asRecord(detail.before);
    return { categoryId: cid, before, after: before ? after : null };
  }
  if (action === "CATEGORY_CREATE") {
    const after =
      asRecord(detail.after) ??
      ({
        categoryId: detail.categoryId,
        name: detail.name,
        slug: detail.slug,
      } as Record<string, unknown>);
    const cid =
      detail.categoryId != null
        ? String(detail.categoryId)
        : after.categoryId != null
          ? String(after.categoryId)
          : null;
    return { categoryId: cid, before: null, after };
  }
  if (action === "CATEGORY_DELETE") {
    const inner = asRecord(detail.before);
    if (inner) {
      const cid = inner.categoryId != null ? String(inner.categoryId) : detail.categoryId != null ? String(detail.categoryId) : null;
      return { categoryId: cid, before: inner, after: null };
    }
    return {
      categoryId: detail.categoryId != null ? String(detail.categoryId) : null,
      before: {
        categoryId: detail.categoryId,
        name: detail.categoryName ?? detail.name,
        slug: detail.slug,
      } as Record<string, unknown>,
      after: null,
    };
  }
  return { categoryId: null, before: null, after: null };
}

export function buildRestoreButtons(action: string | null | undefined, detailJson: string | null | undefined): RestoreButtonSpec[] {
  if (!action?.trim() || !detailJson?.trim()) {
    return [];
  }
  let detail: Record<string, unknown>;
  try {
    detail = JSON.parse(detailJson) as Record<string, unknown>;
  } catch {
    return [];
  }

  const out: RestoreButtonSpec[] = [];

  if (action.startsWith("PRODUCT_")) {
    const { productId, before, after } = normalizeProductLog(action, detail);
    if (action === "PRODUCT_CREATE" && productId) {
      out.push({
        intent: "product_undo_create",
        label: "Hoàn tác tạo mới (xóa bản ghi vừa tạo)",
        variant: "secondary",
      });
    }
    if (action === "PRODUCT_UPDATE" && productId && before) {
      out.push({
        intent: "product_revert_update",
        label: "Reset — khôi phục dữ liệu cũ (trước khi sửa)",
        variant: "primary",
      });
    }
    if (action === "PRODUCT_UPDATE" && productId && after) {
      out.push({
        intent: "product_reapply_update",
        label: "Áp dụng lại bản sau (sau khi sửa)",
        variant: "secondary",
      });
    }
    if (action === "PRODUCT_DELETE" && before) {
      out.push({
        intent: "product_restore_delete",
        label: "Khôi phục sản phẩm đã xóa (tạo lại từ snapshot)",
        variant: "primary",
      });
    }
    return out;
  }

  if (action.startsWith("CATEGORY_")) {
    const { categoryId, before, after } = normalizeCategoryLog(action, detail);
    if (action === "CATEGORY_CREATE" && categoryId) {
      out.push({
        intent: "category_undo_create",
        label: "Hoàn tác tạo mới (xóa danh mục vừa tạo)",
        variant: "secondary",
      });
    }
    if (action === "CATEGORY_UPDATE" && categoryId && before) {
      out.push({
        intent: "category_revert_update",
        label: "Reset — khôi phục dữ liệu cũ (trước khi sửa)",
        variant: "primary",
      });
    }
    if (action === "CATEGORY_UPDATE" && categoryId && after) {
      out.push({
        intent: "category_reapply_update",
        label: "Áp dụng lại bản sau (sau khi sửa)",
        variant: "secondary",
      });
    }
    if (action === "CATEGORY_DELETE" && before) {
      out.push({
        intent: "category_restore_delete",
        label: "Khôi phục danh mục đã xóa (tạo lại từ snapshot)",
        variant: "primary",
      });
    }
    return out;
  }

  return out;
}
