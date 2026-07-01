"use server";

import { getUserIdFromAccessToken } from "@/lib/auth";
import {
  createCategory,
  createProduct,
  deleteCategoryRequest,
  deleteProduct,
  getWebActivityById,
  restoreCategory,
  updateCategory,
  updateProduct,
} from "@/lib/api";
import { getAdminSession } from "@/lib/auth-server";
import {
  normalizeCategoryLog,
  normalizeProductLog,
  snapshotToCategoryInput,
  snapshotToProductInput,
  type RestoreIntent,
} from "@/lib/activity-restore-logic";
import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

function adminOpts(session: Awaited<ReturnType<typeof getAdminSession>>) {
  return {
    accessToken: session.token,
    username: session.username,
    userId: getUserIdFromAccessToken(session.token),
  };
}

export async function executeActivityRestore(logId: number, intent: RestoreIntent) {
  const session = await getAdminSession();
  if (!session.canMutateCatalog) {
    redirect(`/admin/activity-log/${logId}?restoreErr=readonly`);
  }

  const row = await getWebActivityById(logId, { accessToken: session.token });
  if (!row?.detailJson?.trim()) {
    redirect(`/admin/activity-log/${logId}?restoreErr=nodata`);
  }

  let detail: Record<string, unknown>;
  try {
    detail = JSON.parse(row.detailJson) as Record<string, unknown>;
  } catch {
    redirect(`/admin/activity-log/${logId}?restoreErr=parse`);
  }

  const action = row.action ?? "";
  const opts = adminOpts(session);

  try {
    switch (intent) {
      case "product_undo_create": {
        if (action !== "PRODUCT_CREATE") {
          redirect(`/admin/activity-log/${logId}?restoreErr=action`);
        }
        const { productId, after } = normalizeProductLog(action, detail);
        const pid = productId ?? (after?.productId != null ? String(after.productId) : null);
        if (!pid) {
          redirect(`/admin/activity-log/${logId}?restoreErr=id`);
        }
        await deleteProduct(pid, opts);
        break;
      }
      case "product_revert_update": {
        if (action !== "PRODUCT_UPDATE") {
          redirect(`/admin/activity-log/${logId}?restoreErr=action`);
        }
        const { productId, before } = normalizeProductLog(action, detail);
        if (!productId || !before) {
          redirect(`/admin/activity-log/${logId}?restoreErr=before`);
        }
        const input = snapshotToProductInput(before);
        if (input.categoryId < 1) {
          redirect(`/admin/activity-log/${logId}?restoreErr=category`);
        }
        await updateProduct(productId, input, opts);
        break;
      }
      case "product_reapply_update": {
        if (action !== "PRODUCT_UPDATE") {
          redirect(`/admin/activity-log/${logId}?restoreErr=action`);
        }
        const { productId, after } = normalizeProductLog(action, detail);
        if (!productId || !after) {
          redirect(`/admin/activity-log/${logId}?restoreErr=after`);
        }
        const input = snapshotToProductInput(after);
        if (input.categoryId < 1) {
          redirect(`/admin/activity-log/${logId}?restoreErr=category`);
        }
        await updateProduct(productId, input, opts);
        break;
      }
      case "product_restore_delete": {
        if (action !== "PRODUCT_DELETE") {
          redirect(`/admin/activity-log/${logId}?restoreErr=action`);
        }
        const { before } = normalizeProductLog(action, detail);
        if (!before) {
          redirect(`/admin/activity-log/${logId}?restoreErr=before`);
        }
        const input = snapshotToProductInput(before);
        if (!input.productName || input.categoryId < 1) {
          redirect(`/admin/activity-log/${logId}?restoreErr=name`);
        }
        await createProduct(input, opts);
        break;
      }
      case "category_undo_create": {
        if (action !== "CATEGORY_CREATE") {
          redirect(`/admin/activity-log/${logId}?restoreErr=action`);
        }
        const { categoryId, after } = normalizeCategoryLog(action, detail);
        const cid = Number(categoryId ?? after?.categoryId);
        if (!Number.isFinite(cid) || cid < 1) {
          redirect(`/admin/activity-log/${logId}?restoreErr=id`);
        }
        const del = await deleteCategoryRequest(cid, false, opts);
        if (del.ok) {
          break;
        }
        if (del.conflict?.error === "REQUIRES_CONFIRMATION") {
          const c2 = await deleteCategoryRequest(cid, true, opts);
          if (!c2.ok) {
            redirect(`/admin/activity-log/${logId}?restoreErr=delete`);
          }
          break;
        }
        if (del.conflict?.error === "HAS_CHILD_CATEGORIES") {
          redirect(`/admin/activity-log/${logId}?restoreErr=child`);
        }
        redirect(`/admin/activity-log/${logId}?restoreErr=delete`);
      }
      case "category_revert_update": {
        if (action !== "CATEGORY_UPDATE") {
          redirect(`/admin/activity-log/${logId}?restoreErr=action`);
        }
        const { categoryId, before } = normalizeCategoryLog(action, detail);
        const cid = Number(categoryId);
        if (!Number.isFinite(cid) || cid < 1 || !before) {
          redirect(`/admin/activity-log/${logId}?restoreErr=before`);
        }
        const inp = snapshotToCategoryInput(before);
        if (!inp.name) {
          redirect(`/admin/activity-log/${logId}?restoreErr=name`);
        }
        await updateCategory(cid, inp, opts);
        break;
      }
      case "category_reapply_update": {
        if (action !== "CATEGORY_UPDATE") {
          redirect(`/admin/activity-log/${logId}?restoreErr=action`);
        }
        const { categoryId, after } = normalizeCategoryLog(action, detail);
        const cid = Number(categoryId);
        if (!Number.isFinite(cid) || cid < 1 || !after) {
          redirect(`/admin/activity-log/${logId}?restoreErr=after`);
        }
        const inpAfter = snapshotToCategoryInput(after);
        if (!inpAfter.name) {
          redirect(`/admin/activity-log/${logId}?restoreErr=name`);
        }
        await updateCategory(cid, inpAfter, opts);
        break;
      }
      case "category_restore_delete": {
        if (action !== "CATEGORY_DELETE") {
          redirect(`/admin/activity-log/${logId}?restoreErr=action`);
        }
        const { categoryId, before } = normalizeCategoryLog(action, detail);
        const cid = Number(categoryId ?? before?.categoryId);
        if (Number.isFinite(cid) && cid >= 1) {
          try {
            await restoreCategory(cid, opts);
            break;
          } catch (e) {
            const msg = e instanceof Error ? e.message : "";
            if (
              msg.startsWith("DUPLICATE_NAME:") ||
              msg.startsWith("DUPLICATE_SLUG:") ||
              msg.startsWith("CONFLICT:")
            ) {
              redirect(`/admin/activity-log/${logId}?restoreErr=conflict`);
            }
          }
        }
        if (!before) {
          redirect(`/admin/activity-log/${logId}?restoreErr=before`);
        }
        const inp = snapshotToCategoryInput(before);
        if (!inp.name) {
          redirect(`/admin/activity-log/${logId}?restoreErr=name`);
        }
        await createCategory(inp, opts);
        break;
      }
      default:
        redirect(`/admin/activity-log/${logId}?restoreErr=unknown`);
    }
  } catch (e) {
    unstable_rethrow(e);
    redirect(`/admin/activity-log/${logId}?restoreErr=api`);
  }

  revalidatePath("/admin/activity-log");
  revalidatePath("/admin/products");
  revalidatePath("/admin/categories");
  redirect(`/admin/activity-log/${logId}?restoreOk=1`);
}
