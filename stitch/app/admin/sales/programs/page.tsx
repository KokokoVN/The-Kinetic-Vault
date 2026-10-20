import Link from "next/link";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth-server";
import { listAdminSalePrograms, deleteAdminSaleProgram } from "@/lib/sale-api";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { ClientConfirmSubmitButton } from "@/components/client-confirm-submit-button";

export const dynamic = "force-dynamic";

export default async function AdminProgramsPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; success?: string; q?: string; status?: string; page?: string }>;
}) {
  const sp = searchParams ? await searchParams : undefined;
  const session = await getAdminSession();
  const userId = getUserIdFromAccessToken(session.token);
  const canWrite = session.canMutateCatalog !== false;

  const allPrograms = await listAdminSalePrograms({ accessToken: session.token });

  const now = new Date();
  const activeCount = allPrograms.filter(p => p.active && new Date(p.startAt) <= now && new Date(p.endAt) >= now).length;
  const upcomingCount = allPrograms.filter(p => p.active && new Date(p.startAt) > now).length;
  const expiredCount = allPrograms.filter(p => new Date(p.endAt) < now || !p.active).length;

  let programs = allPrograms;

  // Filter by status tab
  const statusFilter = sp?.status || "all";
  if (statusFilter === "active") {
    programs = programs.filter(p => p.active && new Date(p.startAt) <= now && new Date(p.endAt) >= now);
  } else if (statusFilter === "upcoming") {
    programs = programs.filter(p => p.active && new Date(p.startAt) > now);
  } else if (statusFilter === "ended") {
    programs = programs.filter(p => new Date(p.endAt) < now || !p.active);
  }

  // Filter by query
  const q = sp?.q?.trim().toLowerCase() || "";
  if (q) {
    programs = programs.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    );
  }

  const pageParam = parseInt(sp?.page || "1", 10);
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const pageSize = 10;
  const totalItems = programs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPrograms = programs.slice(startIndex, endIndex);

  async function deleteAction(formData: FormData) {
    "use server";
    const session2 = await getAdminSession();
    const uid = getUserIdFromAccessToken(session2.token);
    const id = Number(formData.get("id"));
    if (id > 0) {
      try {
        await deleteAdminSaleProgram(id, { accessToken: session2.token, username: session2.username, userId: uid });
        revalidatePath("/admin/sales/programs");
      } catch (e) {
        console.error("Lỗi xóa sale program", e);
      }
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white/95 p-8 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <span className="material-symbols-outlined text-[16px]">campaign</span>
              Trung Tâm Khuyến Mãi
            </div>
            <h1 className="mt-3 font-headline text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Chiến Dịch Khuyến Mãi
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
              Tạo và quản lý các đợt flash sale, ưu đãi giảm giá theo biến thể nhiều tầng hoặc áp dụng trên toàn bộ sản phẩm.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {canWrite && (
              <Link
                href="/admin/sales/programs/new"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:scale-[1.02] hover:shadow-indigo-500/35 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Tạo chiến dịch mới
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 4 KPI Metrics Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Tổng chiến dịch",
            value: allPrograms.length,
            icon: "loyalty",
            color: "text-indigo-600 dark:text-indigo-400",
            bg: "bg-indigo-50 dark:bg-indigo-950/60",
          },
          {
            label: "Đang diễn ra",
            value: activeCount,
            icon: "play_circle",
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-950/60",
            pulse: true,
          },
          {
            label: "Sắp diễn ra",
            value: upcomingCount,
            icon: "schedule",
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-950/60",
          },
          {
            label: "Đã kết thúc / Tạm ngưng",
            value: expiredCount,
            icon: "history",
            color: "text-slate-600 dark:text-slate-400",
            bg: "bg-slate-100 dark:bg-slate-800",
          },
        ].map((kpi, idx) => (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-xl transition-all hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/95"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">{kpi.label}</span>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.bg} ${kpi.color}`}>
                <span className="material-symbols-outlined text-[20px]">{kpi.icon}</span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-headline text-3xl font-black text-slate-900 dark:text-white">{kpi.value}</span>
              {kpi.pulse && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: `Tất cả (${allPrograms.length})` },
            { id: "active", label: `Đang chạy (${activeCount})` },
            { id: "upcoming", label: `Sắp diễn ra (${upcomingCount})` },
            { id: "ended", label: `Đã kết thúc (${expiredCount})` },
          ].map((tab) => {
            const isCurrent = statusFilter === tab.id;
            const queryParams = new URLSearchParams();
            if (tab.id !== "all") queryParams.set("status", tab.id);
            if (sp?.q) queryParams.set("q", sp.q);
            const href = `/admin/sales/programs${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

            return (
              <Link
                key={tab.id}
                href={href}
                className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
                  isCurrent
                    ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Search */}
        <form method="GET" action="/admin/sales/programs" className="flex items-center gap-2 w-full lg:w-auto">
          {statusFilter !== "all" && <input type="hidden" name="status" value={statusFilter} />}
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">search</span>
            <input
              type="text"
              name="q"
              defaultValue={sp?.q}
              placeholder="Tìm kiếm theo tên chiến dịch..."
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-11 pr-4 text-sm font-semibold text-slate-900 dark:text-slate-100 shadow-xs outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>
          <button
            type="submit"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Tìm
          </button>
        </form>
      </div>

      {/* Programs Table */}
      <section className="overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-400 w-16">
                  STT
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                  Tên chương trình
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                  Mức giảm
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                  Thời gian áp dụng
                </th>
                <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-400">
                  Sản phẩm
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-400">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {currentPrograms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-sm font-semibold text-slate-400">
                    Chưa có chương trình sale nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                currentPrograms.map((p, idx) => {
                  const startAt = new Date(p.startAt);
                  const endAt = new Date(p.endAt);
                  const isExpired = endAt < now;
                  const isUpcoming = startAt > now;
                  const isActive = p.active && !isExpired && !isUpcoming;

                  return (
                    <tr 
                      key={p.id} 
                      className="group transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-6 py-4 text-right font-mono text-xs text-slate-400">
                        {startIndex + idx + 1}
                      </td>
                      <td className="px-6 py-4">
                        <Link 
                          href={`/admin/sales/programs/${p.id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400 line-clamp-1 transition-colors"
                        >
                          {p.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">{p.description || "—"}</p>
                      </td>
                      <td className="px-6 py-4">
                        {p.discountType === "PERCENT" ? (
                          <span className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-3 py-1 text-xs font-black text-white shadow-xs">
                            <span className="material-symbols-outlined text-[14px]">bolt</span>
                            Giảm {p.discountValue}%
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1 text-xs font-black text-white shadow-xs">
                            <span className="material-symbols-outlined text-[14px]">sell</span>
                            Đồng giá {p.discountValue.toLocaleString("vi-VN")}đ
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 font-normal">Từ:</span> {startAt.toLocaleString("vi-VN")}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-slate-400 font-normal">
                          <span>Đến:</span> <span className="font-semibold text-slate-600 dark:text-slate-300">{endAt.toLocaleString("vi-VN")}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-lg bg-indigo-50 px-2 text-xs font-black text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          {p.items?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Đang chạy
                          </span>
                        ) : isUpcoming && p.active ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                            Sắp diễn ra
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                            {isExpired ? "Đã kết thúc" : "Tạm ngưng"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/sales/programs/${p.id}`}
                            title="Xem chi tiết"
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 dark:hover:text-indigo-300 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </Link>
                          {canWrite && (
                            <>
                              <Link
                                href={`/admin/sales/programs/${p.id}/edit`}
                                title="Chỉnh sửa"
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950 dark:hover:text-emerald-400 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </Link>
                              <form action={deleteAction}>
                                <input type="hidden" name="id" value={p.id} />
                                <ClientConfirmSubmitButton
                                  title="Xóa chương trình"
                                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400 transition-colors"
                                  confirmMessage={`Xóa chương trình "${p.name}"? Hành động không thể hoàn tác.`}
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </ClientConfirmSubmitButton>
                              </form>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 border-t border-slate-100 bg-slate-50/50 py-4 dark:border-slate-800 dark:bg-slate-900/50">
            {currentPage > 1 && (
              <Link
                href={`/admin/sales/programs?page=${currentPage - 1}${statusFilter !== "all" ? `&status=${statusFilter}` : ""}${sp?.q ? `&q=${encodeURIComponent(sp.q)}` : ""}`}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Trang trước
              </Link>
            )}
            <span className="text-xs font-bold text-slate-500">
              Trang {currentPage} / {totalPages}
            </span>
            {currentPage < totalPages && (
              <Link
                href={`/admin/sales/programs?page=${currentPage + 1}${statusFilter !== "all" ? `&status=${statusFilter}` : ""}${sp?.q ? `&q=${encodeURIComponent(sp.q)}` : ""}`}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Trang sau
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
