"use server";

import { getAdminSession } from "@/lib/auth-server";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { createAdminBrand, checkAdminBrandName, uploadAdminBrandLogo } from "@/lib/api";

export async function checkBrandNameAction(name: string): Promise<boolean> {
  const session = await getAdminSession();
  return checkAdminBrandName(name, { accessToken: session.token });
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

export async function createBrandAction(data: { name: string; description?: string | null; logoUrl?: string | null }) {
  const session = await getAdminSession();
  const uid = getUserIdFromAccessToken(session.token);
  const result = await createAdminBrand(data, {
    accessToken: session.token,
    username: session.username,
    userId: uid,
  });
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/admin/brands");
  return result;
}

export async function updateBrandAction(id: number, data: { name: string; description?: string | null; logoUrl?: string | null }) {
  const session = await getAdminSession();
  const uid = getUserIdFromAccessToken(session.token);
  // We need to import updateAdminBrand
  const { updateAdminBrand } = await import("@/lib/api");
  const result = await updateAdminBrand(id, data, {
    accessToken: session.token,
    username: session.username,
    userId: uid,
  });
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/admin/brands");
  return result;
}

export async function deleteBrandAction(id: number) {
  const session = await getAdminSession();
  const uid = getUserIdFromAccessToken(session.token);
  const { deleteAdminBrand } = await import("@/lib/api");
  await deleteAdminBrand(id, {
    accessToken: session.token,
    username: session.username,
    userId: uid,
  });
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/admin/brands");
}
