import Link from "next/link";
import { notFound } from "next/navigation";
import { SaleProgramForm } from "@/components/sale-program-form";
import { getAdminSession } from "@/lib/auth-server";
import { getAdminProductsForUi } from "@/lib/api";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { getAdminSaleProgram } from "@/lib/sale-api";

export default async function EditSaleProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  const userId = getUserIdFromAccessToken(session.token);
  const { id } = await params;
  
  const programId = Number(id);
  if (isNaN(programId)) return notFound();

  const program = await getAdminSaleProgram(programId, { accessToken: session.token });
  if (!program) return notFound();

  const products = await getAdminProductsForUi({ accessToken: session.token, username: session.username, userId });

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/sales/programs/${programId}`}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-xs hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Chiến Dịch #{programId}
            </span>
          </div>
          <h1 className="font-headline text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Cập Nhật Chương Trình Sale
          </h1>
          <p className="mt-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">
            Chỉnh sửa thông tin, thời gian áp dụng, sản phẩm và biến thể khuyến mãi.
          </p>
        </div>
      </div>

      <SaleProgramForm 
        initialData={program}
        accessToken={session.token} 
        username={session.username!} 
        userId={String(userId)} 
        products={products.map(p => ({ id: Number(p.id), name: p.name, sku: p.sku }))}
      />
    </div>
  );
}
