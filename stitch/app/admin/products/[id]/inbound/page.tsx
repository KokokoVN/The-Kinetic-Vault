import { redirect } from "next/navigation";

/** Route cũ: chuyển về chi tiết (nhập kho bằng popup trên đó). */
export default async function AdminProductInboundRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/products/${encodeURIComponent(id)}/detail#section-stock`);
}
