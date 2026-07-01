import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/auth-server";
import { getAdminBrandById } from "@/lib/api";
import EditBrandForm from "./edit-brand-form";

export const dynamic = "force-dynamic";

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await params;
  const id = Number(p.id);
  if (!id) notFound();

  const session = await getAdminSession();
  const brand = await getAdminBrandById(id, { accessToken: session.token });
  if (!brand) notFound();

  const gatewayOrigin = process.env.API_SERVER_ORIGIN || "http://localhost:8900";

  return <EditBrandForm brand={brand} gatewayOrigin={gatewayOrigin} />;
}
