import { redirect } from "next/navigation";

export default async function AdminProductIdIndexPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/products/${encodeURIComponent(String(id))}/edit`);
}
