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
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/sales/programs"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/60 dark:bg-slate-900/60 shadow-sm border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl transition-transform hover:scale-105 hover:bg-white dark:hover:bg-slate-800"
        >
          <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">arrow_back</span>
        </Link>
        <div>
          <h1 className="font-headline text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-900 to-indigo-700 dark:from-purple-400 dark:to-indigo-400">
            Cập nhật chương trình Sale
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Chỉnh sửa thông tin chương trình giảm giá hiện tại.
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
