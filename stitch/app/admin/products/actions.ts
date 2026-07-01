"use server";

import { revalidatePath } from "next/cache";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { getAdminSession } from "@/lib/auth-server";
import { hideProduct, restoreProduct, unhideProduct } from "@/lib/api";
import { notifyAdminWebBestEffort } from "@/lib/admin-web-notify";

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
