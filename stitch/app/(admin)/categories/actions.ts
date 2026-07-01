"use server";

import { getAdminSession } from "@/lib/auth-server";
import { getUserIdFromAccessToken } from "@/lib/auth";
import {
  createCategory,
  updateCategory,
  deleteCategoryRequest,
  getCategoryDeletePreview,
  checkAdminCategoryName,
  getAdminUserBrief,
} from "@/lib/api";
import { revalidatePath } from "next/cache";
import { sendNotification } from "@/lib/notification-api";

export async function checkCategoryNameAction(name: string, excludeId?: number): Promise<boolean> {
  const session = await getAdminSession();
  return checkAdminCategoryName(name, excludeId, { accessToken: session.token });
}

export async function createCategoryAction(data: { name: string; slug?: string | null }) {
  const session = await getAdminSession();
  const uid = getUserIdFromAccessToken(session.token);
  const result = await createCategory(
    {
      name: data.name,
      slug: data.slug ?? undefined,
    },
    {
      accessToken: session.token,
      username: session.username,
      userId: uid,
    }
  );
  
  await notifyCategoryAction(
    session.token,
    uid,
    session.username ?? "admin",
    "Thêm danh mục",
    `Admin vừa tạo danh mục #${result.id}: ${result.name}.`,
  );
  
  revalidatePath("/admin/categories");
  return result;
}

export async function updateCategoryAction(id: number, data: { name: string; slug?: string | null }) {
  const session = await getAdminSession();
  const uid = getUserIdFromAccessToken(session.token);
  const result = await updateCategory(
    id,
    {
      name: data.name,
      slug: data.slug ?? undefined,
    },
    {
      accessToken: session.token,
      username: session.username,
      userId: uid,
    }
  );
  
  await notifyCategoryAction(
    session.token,
    uid,
    session.username ?? "admin",
    "Cập nhật danh mục",
    `Admin vừa cập nhật danh mục #${id}: ${result?.name ?? data.name}.`,
  );
  
  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${id}`);
  return result;
}

export async function getCategoryPreviewAction(id: number) {
  const session = await getAdminSession();
  return getCategoryDeletePreview(id, { accessToken: session.token });
}

export async function deleteCategoryAction(id: number, confirmWithProducts: boolean = false) {
  const session = await getAdminSession();
  const uid = getUserIdFromAccessToken(session.token);
  
  const result = await deleteCategoryRequest(id, confirmWithProducts, {
    accessToken: session.token,
    username: session.username,
    userId: uid,
  });
  
  if (result.ok) {
    await notifyCategoryAction(
      session.token,
      uid,
      session.username ?? "admin",
      "Xóa danh mục",
      `Admin vừa xóa danh mục #${id}.`,
    );
    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${id}`);
    return { success: true };
  } else {
    return { success: false, conflict: result.conflict };
  }
}

async function notifyCategoryAction(
  accessToken: string | null | undefined,
  userId: string | null,
  username: string,
  title: string,
  message: string,
) {
  try {
    if (!accessToken) return;
    const uid = Number(userId);
    const actor = Number.isFinite(uid) && uid > 0 ? await getAdminUserBrief(uid, { accessToken }) : null;
    const recipient = String(actor?.email ?? `${username}@gmail.com`).trim();
    if (!recipient) return;
    await sendNotification({
      channel: "WEB",
      recipient,
      subject: `[Danh mục] ${title}`,
      body: message,
      html: false,
    });
  } catch {
    // best-effort
  }
}
