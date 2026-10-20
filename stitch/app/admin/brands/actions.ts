"use server";

import { getAdminSession } from "@/lib/auth-server";
import { getUserIdFromAccessToken } from "@/lib/auth";
import {
  createAdminBrand,
  updateAdminBrand,
  deleteAdminBrand,
  restoreAdminBrand,
  checkAdminBrandName,
  checkAdminBrandSlug,
  uploadAdminBrandLogo,
} from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function checkBrandNameAction(name: string, excludeId?: number): Promise<boolean> {
  const session = await getAdminSession();
  return checkAdminBrandName(name, { accessToken: session.token, excludeId });
}

export async function checkBrandSlugAction(slug: string, excludeId?: number): Promise<boolean> {
  const session = await getAdminSession();
  return checkAdminBrandSlug(slug, { accessToken: session.token, excludeId });
}

export async function uploadBrandLogoAction(formData: FormData): Promise<string> {
  const session = await getAdminSession();
  const uid = getUserIdFromAccessToken(session.token);
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");
  return uploadAdminBrandLogo(file, {
    accessToken: session.token,
    username: session.username,
    userId: uid,
  });
}

export async function createBrandAction(data: {
  name: string;
  slug?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  country?: string | null;
  hidden?: boolean;
}) {
  const session = await getAdminSession();
  const uid = getUserIdFromAccessToken(session.token);
  const result = await createAdminBrand(data, {
    accessToken: session.token,
    username: session.username,
    userId: uid,
  });
  revalidatePath("/admin/brands");
  return result;
}

export async function updateBrandAction(
  id: number,
  data: {
    name: string;
    slug?: string | null;
    description?: string | null;
    logoUrl?: string | null;
    website?: string | null;
    country?: string | null;
    hidden?: boolean;
  },
) {
  const session = await getAdminSession();
  const uid = getUserIdFromAccessToken(session.token);
  await updateAdminBrand(id, data, {
    accessToken: session.token,
    username: session.username,
    userId: uid,
  });
  revalidatePath("/admin/brands");
  revalidatePath(`/admin/brands/${id}`);
}

export async function deleteBrandAction(id: number) {
  const session = await getAdminSession();
  const uid = getUserIdFromAccessToken(session.token);
  await deleteAdminBrand(id, {
    accessToken: session.token,
    username: session.username,
    userId: uid,
  });
  revalidatePath("/admin/brands");
}

export async function restoreBrandAction(id: number) {
  const session = await getAdminSession();
  const uid = getUserIdFromAccessToken(session.token);
  const result = await restoreAdminBrand(id, {
    accessToken: session.token,
    username: session.username,
    userId: uid,
  });
  revalidatePath("/admin/brands");
  return result;
}
