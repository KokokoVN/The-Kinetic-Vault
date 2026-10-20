"use server";

import { getAdminSession } from "@/lib/auth-server";
import { getUserIdFromAccessToken } from "@/lib/auth";
import {
  createCategory,
  updateCategory,
  getAdminCategory,
  deleteCategoryRequest,
  getCategoryDeletePreview,
  checkAdminCategoryName,
  uploadAdminCategoryImage,
  getAdminUserBrief,
} from "@/lib/api";
import { revalidatePath } from "next/cache";
import { sendNotification } from "@/lib/notification-api";

export async function checkCategoryNameAction(name: string, excludeId?: number): Promise<boolean> {
  const session = await getAdminSession();
  return checkAdminCategoryName(name, excludeId, { accessToken: session.token });
}

export async function uploadCategoryImageAction(formData: FormData): Promise<string> {
  const session = await getAdminSession();
  const uid = getUserIdFromAccessToken(session.token);
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");
  return uploadAdminCategoryImage(file, {
    accessToken: session.token,
    username: session.username,
    userId: uid,
  });
}

export async function createCategoryAction(data: {
  name: string;
  slug?: string | null;
  imageUrl?: string | null;
  hidden?: boolean;
}) {
  const session = await getAdminSession();
  const uid = getUserIdFromAccessToken(session.token);
  const result = await createCategory(
    {
      name: data.name,
      slug: data.slug ?? undefined,
      imageUrl: data.imageUrl ?? null,
      hidden: data.hidden,
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

export async function updateCategoryAction(
  id: number,
  data: {
    name: string;
    slug?: string | null;
    imageUrl?: string | null;
    hidden?: boolean;
  }
) {
  const session = await getAdminSession();
  const uid = getUserIdFromAccessToken(session.token);
  const result = await updateCategory(
    id,
    {
      name: data.name,
      slug: data.slug ?? undefined,
      imageUrl: data.imageUrl,
      hidden: data.hidden,
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

export async function toggleCategoryHiddenAction(id: number, currentHidden: boolean) {
  const session = await getAdminSession();
  const uid = getUserIdFromAccessToken(session.token);
  try {
    const existing = await getAdminCategory(id, { accessToken: session.token });
    if (!existing) {
      return { success: false, error: "Không tìm thấy danh mục" };
    }
    const result = await updateCategory(
      id,
      {
        name: existing.name,
        slug: existing.slug ?? undefined,
        imageUrl: existing.imageUrl,
        hidden: !currentHidden,
      },
      {
        accessToken: session.token,
        username: session.username,
        userId: uid,
      }
    );
    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${id}`);
    return { success: true, hidden: !currentHidden };
  } catch (err: any) {
    return { success: false, error: err.message || "Không thể đổi trạng thái danh mục" };
  }
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
