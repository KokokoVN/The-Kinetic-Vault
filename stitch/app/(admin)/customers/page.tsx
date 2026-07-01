import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth-server";
import { listAdminUsers, updateAdminUserRole, unlockAdminUser, type AdminUserBrief } from "@/lib/api";
import { SoftNavigateForm } from "@/components/soft-navigate-form";
import { AutoSubmitSelect } from "@/components/auto-submit-select";

export const dynamic = "force-dynamic";

function formatDisplayDate(dateInput: any): string {
  if (!dateInput) return "Chưa có";
  try {
    let d: Date;
    if (Array.isArray(dateInput)) {
      const [y, m, day, h = 0, mn = 0, s = 0] = dateInput;
      d = new Date(y, m - 1, day, h, mn, s);
    } else {
      d = new Date(dateInput);
    }
    return d.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (err) {
    return String(dateInput);
  }
}

type PageSearchParams = Record<string, string | string[] | undefined>;

function asText(raw: string | string[] | undefined): string {
  return Array.isArray(raw) ? String(raw[0] ?? "") : String(raw ?? "");
}

function clamp(raw: string, fallback: number, min: number, max: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

function queryString(params: Record<string, string | number | null | undefined>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v == null) continue;
    const s = String(v).trim();
    if (!s) continue;
    p.set(k, s);
  }
  return p.toString();
}

function roleTone(roleName: string): string {
  if (roleName === "ROLE_SUPER_ADMIN") return "bg-purple-50 text-purple-700 border-purple-200";
  if (roleName === "ROLE_ADMIN") return "bg-rose-50 text-rose-700 border-rose-200";
  if (roleName === "ROLE_STAFF") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-blue-50 text-blue-700 border-blue-200";
}

function membershipTone(level: string): string {
  switch (level.toUpperCase()) {
    case "BRONZE": return "bg-orange-50 text-orange-700 border-orange-200";
    case "SILVER": return "bg-slate-100 text-slate-600 border-slate-300";
    case "GOLD": return "bg-yellow-50 text-yellow-700 border-yellow-300";
    case "PLATINUM": return "bg-teal-50 text-teal-700 border-teal-200";
    case "DIAMOND": return "bg-indigo-50 text-indigo-700 border-indigo-200";
    default: return "bg-gray-50 text-gray-600 border-gray-200";
  }
}

function isLocked(user: AdminUserBrief): boolean {
  if (!user.lockoutEndTime) return false;
  let lockEndMs = 0;
  if (Array.isArray(user.lockoutEndTime)) {
    const [y, m, d, h = 0, mn = 0, s = 0] = user.lockoutEndTime;
    lockEndMs = new Date(y, m - 1, d, h, mn, s).getTime();
  } else {
    lockEndMs = new Date(user.lockoutEndTime).getTime();
  }
  return lockEndMs > Date.now();
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams?: Promise<PageSearchParams>;
}) {
  const session = await getAdminSession();
  if (!session.token) redirect("/login?error=expired");

  const sp = (await searchParams) ?? {};
  const q = asText(sp.q).trim();
  const filterRole = asText(sp.role).trim();
  const filterStatus = asText(sp.status).trim();
  const success = asText(sp.success).trim();
  const error = asText(sp.error).trim();
  const pageSize = clamp(asText(sp.pageSize), 20, 5, 100);
  const page = clamp(asText(sp.page), 1, 1, 10_000);

  const users = await listAdminUsers({ accessToken: session.token });
  
  let adminsCount = 0;
  let staffCount = 0;
  let lockedCount = 0;

  const rows = users.filter((u) => {
    const rName = String(u.role?.roleName ?? "ROLE_USER").toUpperCase();
    if (rName === "ROLE_ADMIN") adminsCount++;
    if (rName === "ROLE_STAFF") staffCount++;
    if (isLocked(u)) lockedCount++;

    if (q) {
      const haystack = [u.userName, u.email, u.phoneNumber, String(u.id ?? ""), rName]
        .map((x) => String(x ?? "").toLowerCase())
        .join(" ");
      if (!haystack.includes(q.toLowerCase())) return false;
    }
    
    if (filterRole && filterRole !== "ALL") {
      if (rName !== filterRole) return false;
    }

    if (filterStatus && filterStatus !== "ALL") {
      const locked = isLocked(u);
      if (filterStatus === "LOCKED" && !locked) return false;
      if (filterStatus === "ACTIVE" && (!u.activated || locked)) return false;
      if (filterStatus === "INACTIVE" && (u.activated)) return false;
    }

    return true;
  });

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  async function updateRoleAction(formData: FormData) {
    "use server";
    const session2 = await getAdminSession();
    if (!session2.token) redirect("/login?error=expired");
    const userId = Number(formData.get("userId"));
    const roleName = String(formData.get("roleName") ?? "").trim().toUpperCase();
    const q2 = String(formData.get("q") ?? "").trim();
    const role2 = String(formData.get("role") ?? "").trim();
    const status2 = String(formData.get("status") ?? "").trim();
    const page2 = clamp(String(formData.get("page") ?? "1"), 1, 1, 10_000);
    const pageSize2 = clamp(String(formData.get("pageSize") ?? "20"), 20, 5, 100);
    if (!Number.isFinite(userId) || userId <= 0 || !roleName) {
      redirect(`/admin/customers?${queryString({ q: q2, role: role2, status: status2, page: page2, pageSize: pageSize2, error: "validation" })}`);
    }

    const allUsers = await listAdminUsers({ accessToken: session2.token });
    const targetUser = allUsers.find(u => u.id === userId);
    if (targetUser && targetUser.userName === session2.username) {
      redirect(`/admin/customers?${queryString({ q: q2, role: role2, status: status2, page: page2, pageSize: pageSize2, error: "self_role" })}`);
    }

    const updated = await updateAdminUserRole(
      userId,
      { roleName, performedBy: session2.username ?? "admin" },
      { accessToken: session2.token },
    );
    if (!updated) {
      redirect(`/admin/customers?${queryString({ q: q2, role: role2, status: status2, page: page2, pageSize: pageSize2, error: "update" })}`);
    }
    revalidatePath("/admin/customers");
    redirect(`/admin/customers?${queryString({ q: q2, role: role2, status: status2, page: page2, pageSize: pageSize2, success: "role" })}`);
  }

  async function unlockAction(formData: FormData) {
    "use server";
    const session2 = await getAdminSession();
    if (!session2.token) redirect("/login?error=expired");
    const userId = Number(formData.get("userId"));
    const q2 = String(formData.get("q") ?? "").trim();
    const role2 = String(formData.get("role") ?? "").trim();
    const status2 = String(formData.get("status") ?? "").trim();
    const page2 = clamp(String(formData.get("page") ?? "1"), 1, 1, 10_000);
    const pageSize2 = clamp(String(formData.get("pageSize") ?? "20"), 20, 5, 100);
    
    if (!Number.isFinite(userId) || userId <= 0) {
       redirect(`/admin/customers?${queryString({ q: q2, role: role2, status: status2, page: page2, pageSize: pageSize2, error: "validation" })}`);
    }
    
    const unlocked = await unlockAdminUser(userId, { accessToken: session2.token });
    if (!unlocked) {
      redirect(`/admin/customers?${queryString({ q: q2, role: role2, status: status2, page: page2, pageSize: pageSize2, error: "unlock" })}`);
    }
    revalidatePath("/admin/customers");
    redirect(`/admin/customers?${queryString({ q: q2, role: role2, status: status2, page: page2, pageSize: pageSize2, success: "unlock" })}`);
  }

  const prevHref = `/admin/customers?${queryString({ q, role: filterRole, status: filterStatus, pageSize, page: Math.max(1, safePage - 1) })}`;
  const nextHref = `/admin/customers?${queryString({ q, role: filterRole, status: filterStatus, pageSize, page: Math.min(totalPages, safePage + 1) })}`;

  return (
    <div className="space-y-8 pb-12">
      <section className="relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-indigo-900 via-blue-900 to-sky-900 p-8 shadow-2xl shadow-blue-900/20 text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] backdrop-blur-md">
              <span className="material-symbols-outlined text-sm">group</span>
              Users Database
            </p>
            <h1 className="mt-4 font-headline text-4xl font-black tracking-tight text-white drop-shadow-sm">Quản lý khách hàng</h1>
            <p className="mt-2 max-w-2xl text-blue-100/80">
              Quản lý toàn bộ thông tin tài khoản, phân quyền, cấp bậc thành viên và trạng thái truy cập của người dùng trên hệ thống.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 backdrop-blur-md">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-200">Tổng tài khoản</p>
              <p className="font-headline text-3xl font-black">{users.length.toLocaleString("vi-VN")}</p>
            </div>
            <div className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 backdrop-blur-md">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-200">Quản trị viên</p>
              <p className="font-headline text-3xl font-black">{adminsCount.toLocaleString("vi-VN")}</p>
            </div>
             <div className="flex flex-col gap-1 rounded-2xl border border-rose-500/30 bg-rose-500/20 px-5 py-3 backdrop-blur-md">
              <p className="text-xs font-bold uppercase tracking-wider text-rose-200">Bị khóa</p>
              <p className="font-headline text-3xl font-black text-rose-100">{lockedCount.toLocaleString("vi-VN")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-outline-variant/20 bg-white p-6 shadow-sm">
        {success === "role" && (
          <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
            Đã cập nhật quyền người dùng thành công.
          </p>
        )}
        {success === "unlock" && (
          <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">lock_open</span>
            Đã mở khóa tài khoản thành công.
          </p>
        )}
        {error && (
          <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-600">error</span>
            {error === "self_role" ? "Bạn không thể tự thay đổi quyền của chính mình." : `Thao tác thất bại. Vui lòng thử lại. Lỗi: ${error}`}
          </p>
        )}

        <SoftNavigateForm actionPath="/admin/customers" className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-5">
            <label className="block text-xs font-bold uppercase tracking-[0.15em] text-slate-500 mb-2">Tìm kiếm</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                name="q"
                defaultValue={q}
                placeholder="Tên, email, số điện thoại, ID..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-[0.15em] text-slate-500 mb-2">Phân quyền</label>
            <select
              name="role"
              defaultValue={filterRole}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="ALL">Tất cả role</option>
              <option value="ROLE_USER">Khách hàng</option>
              <option value="ROLE_STAFF">Nhân viên</option>
              <option value="ROLE_ADMIN">Quản trị viên</option>
              <option value="ROLE_SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-[0.15em] text-slate-500 mb-2">Trạng thái</label>
            <select
              name="status"
              defaultValue={filterStatus}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="ALL">Tất cả</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Chưa kích hoạt</option>
              <option value="LOCKED">Bị khóa</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-[0.15em] text-slate-500 mb-2">Số lượng</label>
            <select
              name="pageSize"
              defaultValue={String(pageSize)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={String(n)}>
                  {n} dòng
                </option>
              ))}
            </select>
          </div>
          
          <input type="hidden" name="page" value="1" />
          <div className="flex items-end gap-2 md:col-span-1">
            <button type="submit" className="h-11 w-full flex items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-700 hover:shadow-blue-600/40 active:scale-95">
              Lọc
            </button>
          </div>
        </SoftNavigateForm>
      </section>

      <section className="overflow-hidden rounded-3xl border border-outline-variant/20 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Khách hàng</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Liên hệ</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Thành viên</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Chi tiêu</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageRows.map((u: AdminUserBrief, idx) => {
                const roleName = String(u.role?.roleName ?? "ROLE_USER").toUpperCase();
                const locked = isLocked(u);
                const memberLevel = u.membershipLevel ?? "NEW";
                
                return (
                  <tr key={String(u.id ?? `row-${idx}`)} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 shadow-sm border border-blue-200/50">
                          <span className="font-headline text-xl font-bold uppercase">
                            {u.userName ? u.userName.charAt(0) : "?"}
                          </span>
                        </div>
                        <div>
                          <Link href={`/admin/customers/${encodeURIComponent(String(u.id ?? ""))}`} className="font-bold text-slate-900 hover:text-blue-600 transition-colors">
                            {u.userName ?? "—"}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="font-mono text-xs text-slate-400">#{u.id ?? "—"}</span>
                             <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${roleTone(roleName)}`}>
                               {roleName.replace("ROLE_", "")}
                             </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-700 font-medium">{u.email ?? "—"}</span>
                        <span className="text-slate-500">{u.phoneNumber ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-sm ${membershipTone(memberLevel)}`}>
                        {memberLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        {locked ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200 w-max">
                            <span className="material-symbols-outlined text-[14px]">lock</span>
                            Bị khóa
                          </span>
                        ) : u.activated ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 w-max">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Kích hoạt
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 border border-slate-200 w-max">
                            <span className="material-symbols-outlined text-[14px]">pending</span>
                            Chờ kích hoạt
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">
                          Đăng nhập: {u.lastLoginAt ? formatDisplayDate(u.lastLoginAt) : "Chưa có"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">
                        {Number(u.totalSpent ?? 0).toLocaleString("vi-VN")} ₫
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {u.completedOrdersCount ?? 0} đơn
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2 items-center">
                        {locked && (
                          <form action={unlockAction}>
                            <input type="hidden" name="userId" value={String(u.id ?? "")} />
                            <input type="hidden" name="q" value={q} />
                            <input type="hidden" name="role" value={filterRole} />
                            <input type="hidden" name="status" value={filterStatus} />
                            <input type="hidden" name="page" value={String(safePage)} />
                            <input type="hidden" name="pageSize" value={String(pageSize)} />
                            <button type="submit" className="h-9 w-9 rounded-xl flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors group-hover:shadow-sm" title="Mở khóa tài khoản">
                              <span className="material-symbols-outlined text-lg">lock_open</span>
                            </button>
                          </form>
                        )}
                        <form action={updateRoleAction} className="flex items-center gap-2">
                          <input type="hidden" name="userId" value={String(u.id ?? "")} />
                          <input type="hidden" name="q" value={q} />
                          <input type="hidden" name="role" value={filterRole} />
                          <input type="hidden" name="status" value={filterStatus} />
                          <input type="hidden" name="page" value={String(safePage)} />
                          <input type="hidden" name="pageSize" value={String(pageSize)} />
                          <div className="relative">
                            <AutoSubmitSelect
                              name="roleName"
                              defaultValue={roleName}
                              disabled={u.userName === session.username}
                              className={`h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 pr-8 text-xs font-bold outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 appearance-none text-slate-600 ${u.userName === session.username ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              <option value="ROLE_USER">USER</option>
                              <option value="ROLE_STAFF">STAFF</option>
                              <option value="ROLE_ADMIN">ADMIN</option>
                              <option value="ROLE_SUPER_ADMIN">SUPER_ADMIN</option>
                            </AutoSubmitSelect>
                            <span className={`material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-sm ${u.userName === session.username ? "text-slate-300" : "text-slate-400"}`}>expand_more</span>
                          </div>
                        </form>
                        <Link
                          href={`/admin/customers/${encodeURIComponent(String(u.id ?? ""))}`}
                          className="h-9 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-blue-600 shadow-sm transition-colors inline-flex items-center justify-center whitespace-nowrap"
                        >
                          Chi tiết
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {pageRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
            </div>
            <p className="text-lg font-bold text-slate-700">Không tìm thấy khách hàng nào</p>
            <p className="text-sm text-slate-500 mt-1 max-w-md">Vui lòng điều chỉnh lại bộ lọc tìm kiếm hoặc từ khóa để xem kết quả.</p>
          </div>
        ) : null}
      </section>

      <section className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-outline-variant/20 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 pl-2">
          Hiển thị trang <span className="font-bold text-slate-900">{safePage}</span> / <span className="font-bold text-slate-900">{totalPages}</span> · Tổng <span className="font-bold text-blue-600">{total.toLocaleString("vi-VN")}</span> tài khoản
        </p>
        <div className="flex gap-2">
          <Link
            href={prevHref}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${safePage <= 1 ? "pointer-events-none bg-slate-50 text-slate-300" : "bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95"}`}
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            Trang trước
          </Link>
          <Link
            href={nextHref}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${safePage >= totalPages ? "pointer-events-none bg-slate-50 text-slate-300" : "bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95"}`}
          >
            Trang sau
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
