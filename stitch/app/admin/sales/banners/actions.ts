"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth-server";
import { getUserIdFromAccessToken } from "@/lib/auth";
import {
  createAdminBanner,
  updateAdminBanner,
  deleteAdminBanner,
  type PromoBannerRequest,
} from "@/lib/sale-api";

export async function toggleBannerActiveAction(id: number, currentActive: boolean) {
  const session = await getAdminSession();
  const uid = getUserIdFromAccessToken(session.token);

  try {
    await updateAdminBanner(
      id,
      {
        active: !currentActive,
      } as any,
      {
        accessToken: session.token,
        username: session.username,
        userId: uid,
      }
    );
    revalidatePath("/admin/sales/banners");
    return { success: true, active: !currentActive };
  } catch (err: any) {
    return { success: false, error: err.message || "Không thể cập nhật trạng thái banner" };
  }
}

export async function quickUpdateBannerAction(
  id: number,
  data: {
    title?: string;
    imageUrl?: string;
    linkUrl?: string;
    position?: number;
    active?: boolean;
    startAt?: string;
    endAt?: string;
  }
) {
  const session = await getAdminSession();
  const uid = getUserIdFromAccessToken(session.token);

  try {
    const payload: PromoBannerRequest = {
      title: data.title || "",
      imageUrl: data.imageUrl || "",
      linkUrl: data.linkUrl || "",
      position: Number(data.position || 0),
      active: data.active ?? true,
      startAt: data.startAt ? new Date(data.startAt).toISOString() : undefined,
      endAt: data.endAt ? new Date(data.endAt).toISOString() : undefined,
    };

    await updateAdminBanner(id, payload, {
      accessToken: session.token,
      username: session.username,
      userId: uid,
    });
    revalidatePath("/admin/sales/banners");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Cập nhật banner thất bại" };
  }
}

export async function deleteBannerAction(id: number) {
  const session = await getAdminSession();
  const uid = getUserIdFromAccessToken(session.token);

  try {
    await deleteAdminBanner(id, {
      accessToken: session.token,
      username: session.username,
      userId: uid,
    });
    revalidatePath("/admin/sales/banners");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Xóa banner thất bại" };
  }
}
