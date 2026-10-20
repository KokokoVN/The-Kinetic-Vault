"use server";

import { revalidatePath } from "next/cache";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { getAdminSession } from "@/lib/auth-server";
import {
  deleteProduct,
  getAdminBackendProductById,
  hideProduct,
  restoreProduct,
  unhideProduct,
  updateProduct,
} from "@/lib/api";
import { notifyAdminWebBestEffort } from "@/lib/admin-web-notify";

export async function deleteAction(id: string) {
  const session = await getAdminSession();
  const uid = getUserIdFromAccessToken(session.token);
  if (!session.canMutateCatalog) return { error: "Bạn không có quyền thực hiện (Chỉ đọc)" };
  if (!id) return { error: "Mã sản phẩm không hợp lệ" };

  try {
    await deleteProduct(id, {
      accessToken: session.token,
      username: session.username,
      userId: uid,
    });
    revalidatePath("/admin/products");
    await notifyAdminWebBestEffort({
      accessToken: session.token,
      userId: uid,
      username: session.username ?? "admin",
      scopeLabel: "Sản phẩm",
      title: "Xóa sản phẩm",
      message: `Đã xóa sản phẩm #${id} vào thùng rác.`,
    });
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "Lỗi xóa sản phẩm" };
  }
}

export async function bulkDeleteAction(ids: string[]) {
  const session = await getAdminSession();
  const uid = getUserIdFromAccessToken(session.token);
  if (!session.canMutateCatalog) return { error: "Bạn không có quyền thực hiện (Chỉ đọc)" };
  if (!ids || ids.length === 0) return { error: "Chưa chọn sản phẩm nào" };

  let successCount = 0;
  const errors: string[] = [];

  for (const id of ids) {
    try {
      await deleteProduct(id, {
        accessToken: session.token,
        username: session.username,
        userId: uid,
      });
      successCount++;
    } catch (e: any) {
      errors.push(`#${id}: ${e.message || "Lỗi"}`);
    }
  }

  revalidatePath("/admin/products");
  await notifyAdminWebBestEffort({
    accessToken: session.token,
    userId: uid,
    username: session.username ?? "admin",
    scopeLabel: "Sản phẩm",
    title: "Xóa hàng loạt sản phẩm",
    message: `Đã xóa ${successCount}/${ids.length} sản phẩm đã chọn.`,
  });

  return { success: true, count: successCount, errors };
}

export async function bulkHideAction(ids: string[]) {
  const session = await getAdminSession();
  const uid = getUserIdFromAccessToken(session.token);
  if (!session.canMutateCatalog) return { error: "Bạn không có quyền thực hiện (Chỉ đọc)" };
  if (!ids || ids.length === 0) return { error: "Chưa chọn sản phẩm nào" };

  let count = 0;
  for (const id of ids) {
    try {
      await hideProduct(id, {
        accessToken: session.token,
        username: session.username,
        userId: uid,
      });
      count++;
    } catch {}
  }

  revalidatePath("/admin/products");
  await notifyAdminWebBestEffort({
    accessToken: session.token,
    userId: uid,
    username: session.username ?? "admin",
    scopeLabel: "Sản phẩm",
    title: "Ẩn hàng loạt sản phẩm",
    message: `Đã ẩn ${count}/${ids.length} sản phẩm khỏi storefront.`,
  });

  return { success: true, count };
}

export async function bulkUnhideAction(ids: string[]) {
  const session = await getAdminSession();
  const uid = getUserIdFromAccessToken(session.token);
  if (!session.canMutateCatalog) return { error: "Bạn không có quyền thực hiện (Chỉ đọc)" };
  if (!ids || ids.length === 0) return { error: "Chưa chọn sản phẩm nào" };

  let count = 0;
  for (const id of ids) {
    try {
      await unhideProduct(id, {
        accessToken: session.token,
        username: session.username,
        userId: uid,
      });
      count++;
    } catch {}
  }

  revalidatePath("/admin/products");
  await notifyAdminWebBestEffort({
    accessToken: session.token,
    userId: uid,
    username: session.username ?? "admin",
    scopeLabel: "Sản phẩm",
    title: "Hiện hàng loạt sản phẩm",
    message: `Đã hiển thị lại ${count}/${ids.length} sản phẩm trên storefront.`,
  });

  return { success: true, count };
}

export async function quickUpdateProductAction(
  id: string,
  data: {
    productName: string;
    price: number;
    sku?: string;
    categoryId?: number;
    brandId?: number;
    discription?: string;
  },
) {
  const session = await getAdminSession();
  const uid = getUserIdFromAccessToken(session.token);
  if (!session.canMutateCatalog) return { error: "Bạn không có quyền thực hiện (Chỉ đọc)" };
  if (!id) return { error: "Mã sản phẩm không hợp lệ" };

  try {
    const existing = await getAdminBackendProductById(id, { accessToken: session.token });
    const finalDescription = data.discription ?? existing?.discription ?? " ";
    const finalCategoryId = data.categoryId ?? (existing?.categoryId != null ? Number(existing.categoryId) : 1);
    const finalBrandId = data.brandId !== undefined ? data.brandId : (existing?.brandId != null ? Number(existing.brandId) : undefined);

    await updateProduct(
      id,
      {
        productName: data.productName.trim(),
        discription: finalDescription,
        categoryId: finalCategoryId,
        price: data.price,
        sku: data.sku?.trim() || undefined,
        brandId: finalBrandId,
      },
      {
        accessToken: session.token,
        username: session.username,
        userId: uid,
      },
    );

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${encodeURIComponent(id)}/edit`);
    revalidatePath(`/admin/products/${encodeURIComponent(id)}/detail`);

    await notifyAdminWebBestEffort({
      accessToken: session.token,
      userId: uid,
      username: session.username ?? "admin",
      scopeLabel: "Sản phẩm",
      title: "Cập nhật nhanh sản phẩm",
      message: `Đã cập nhật sản phẩm #${id} (${data.productName}, ${data.price.toLocaleString("vi-VN")} ₫).`,
    });

    return { success: true };
  } catch (e: any) {
    const msg = e?.message || "";
    if (msg.includes("DUPLICATE_SKU") || msg.includes("duplicate")) {
      return { error: "Mã SKU này đã tồn tại ở sản phẩm khác!" };
    }
    return { error: msg || "Cập nhật thất bại" };
  }
}

export async function restoreAction(id: string) {
  const session = await getAdminSession();
  const uid = getUserIdFromAccessToken(session.token);
  if (!id) return { error: "Mã sản phẩm không hợp lệ" };

  try {
    await restoreProduct(id, {
      accessToken: session.token,
      username: session.username,
      userId: uid,
    });
    revalidatePath("/admin/products");
    await notifyAdminWebBestEffort({
      accessToken: session.token,
      userId: uid,
      username: session.username ?? "admin",
      scopeLabel: "Sản phẩm",
      title: "Khôi phục sản phẩm",
      message: `Đã khôi phục sản phẩm #${id}.`,
    });
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "Lỗi khôi phục sản phẩm" };
  }
}

export async function hideAction(id: string) {
  const session = await getAdminSession();
  const uid = getUserIdFromAccessToken(session.token);
  if (!id) return { error: "Mã sản phẩm không hợp lệ" };

  try {
    await hideProduct(id, {
      accessToken: session.token,
      username: session.username,
      userId: uid,
    });
    revalidatePath("/admin/products");
    await notifyAdminWebBestEffort({
      accessToken: session.token,
      userId: uid,
      username: session.username ?? "admin",
      scopeLabel: "Sản phẩm",
      title: "Ẩn sản phẩm",
      message: `Đã ẩn sản phẩm #${id} khỏi storefront.`,
    });
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "Lỗi ẩn sản phẩm" };
  }
}

export async function unhideAction(id: string) {
  const session = await getAdminSession();
  const uid = getUserIdFromAccessToken(session.token);
  if (!id) return { error: "Mã sản phẩm không hợp lệ" };

  try {
    await unhideProduct(id, {
      accessToken: session.token,
      username: session.username,
      userId: uid,
    });
    revalidatePath("/admin/products");
    await notifyAdminWebBestEffort({
      accessToken: session.token,
      userId: uid,
      username: session.username ?? "admin",
      scopeLabel: "Sản phẩm",
      title: "Hiện sản phẩm",
      message: `Đã hiện lại sản phẩm #${id} trên storefront.`,
    });
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "Lỗi hiện sản phẩm" };
  }
}
