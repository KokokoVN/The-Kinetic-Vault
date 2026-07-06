import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth-server";
import { 
  getAdminUserProfile, 
  listAdminOrders, 
  listAdminUserDevices, 
  listAdminUserAddresses, 
  updateAdminUserRole, 
  unlockAdminUser 
} from "@/lib/api";
import { CustomerDetailTabs, ActionSubmitButton } from "@/components/customer-detail-client";
import { orderStatusTone, viAdminOrderPipelineLabel } from "@/lib/order-status";

export const dynamic = "force-dynamic";

function asDate(raw?: string | number[] | null): string {
  if (!raw) return "—";
  if (typeof raw === "string") {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? raw : d.toLocaleString("vi-VN");
  }
  if (Array.isArray(raw) && raw.length >= 3) {
    const y = Number(raw[0]);
    const m = Number(raw[1]);
    const d = Number(raw[2]);
    if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return "—";
    const hh = raw.length > 3 ? Number(raw[3]) : 0;
    const mm = raw.length > 4 ? Number(raw[4]) : 0;
    const ss = raw.length > 5 ? Number(raw[5]) : 0;
    return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y} ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  }
  return "—";
}

function resolveAvatarUrl(raw?: string | null): string | null {
  const v = String(raw ?? "").trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v) || v.startsWith("data:")) return v;
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").trim();
  let origin = (process.env.API_SERVER_ORIGIN ?? "http://localhost:8900").trim();
  if (!/^https?:\/\//i.test(origin)) {
    origin = `http://${origin.replace(/^\/+/, "")}`;
  }
  origin = origin.replace(/\/+$/, "");
  if (/^https?:\/\//i.test(apiBase)) {
    origin = apiBase.replace(/\/api\/?$/i, "").replace(/\/+$/, "");
  }
  return v.startsWith("/") ? `${origin}${v}` : `${origin}/${v}`;
}

function fieldLabel(field?: string | null): string {
  const f = String(field ?? "").trim().toLowerCase();
  if (f === "firstname") return "Tên";
  if (f === "lastname") return "Họ";
  if (f === "phonenumber") return "Số điện thoại";
  if (f === "email") return "Email";
  if (f === "gender") return "Giới tính";
  if (f === "birthdate") return "Ngày sinh";
  if (f === "avatarurl") return "Ảnh đại diện";
  return field ?? "—";
}

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  const p = await params;
  const id = Number(p.id);
  if (!session.token || !Number.isFinite(id) || id <= 0) notFound();

  // Fetch in parallel
  const [user, ordersResponse, devices, addresses] = await Promise.all([
    getAdminUserProfile(id, { accessToken: session.token }),
    listAdminOrders({ userId: id, accessToken: session.token }),
    listAdminUserDevices(id, { accessToken: session.token }),
    listAdminUserAddresses(id, { accessToken: session.token }),
  ]);

  if (!user) notFound();

  const orders = Array.isArray(ordersResponse) ? ordersResponse : [];
  const computedCompletedOrders = orders.filter(o => o.status === 'DELIVERED').length;
  const computedTotalSpent = orders.filter(o => o.status === 'DELIVERED').reduce((sum, o) => sum + Number(o.total ?? 0), 0);
  
  const address = user.userDetails?.address;
  const avatarUrl = resolveAvatarUrl(user.userDetails?.avatarUrl ?? null);
  const changeLogs = Array.isArray(user.userDetails?.changeLogs) ? user.userDetails!.changeLogs! : [];
  const roleName = user.role?.roleName ?? "ROLE_USER";
  const fullName = [user.userDetails?.firstName, user.userDetails?.lastName].filter(Boolean).join(" ").trim() || "—";

  const isLocked = !user.activated;

  // Server actions
  async function unlockAction() {
    "use server";
    const session = await getAdminSession();
    if (!session.token) return;
    await unlockAdminUser(id, { accessToken: session.token });
    revalidatePath(`/admin/customers/${id}`);
  }

  async function updateRoleAction(formData: FormData) {
    "use server";
    const session = await getAdminSession();
    if (!session.token) return;
    const role = formData.get("roleName")?.toString();
    if (role && (role === "ROLE_USER" || role === "ROLE_ADMIN" || role === "ROLE_SUPER_ADMIN")) {
      await updateAdminUserRole(id, { roleName: role, performedBy: session.username ?? "admin" }, { accessToken: session.token });
      revalidatePath(`/admin/customers/${id}`);
    }
  }

  const overviewContent = (
    <div key="overview" className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 space-y-6">
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-6 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-full ring-4 ring-slate-100">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
                  <span className="material-symbols-outlined text-4xl">person</span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{fullName}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user.email ?? "—"}</p>
              <div className="mt-2 flex gap-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${isLocked ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {isLocked ? "Đã khóa" : "Hoạt động"}
                </span>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                  {roleName.replace("ROLE_", "")}
                </span>
              </div>
            </div>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4"><dt className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">ID</dt><dd className="text-sm font-semibold text-slate-900 dark:text-white">#{user.id ?? "—"}</dd></div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4"><dt className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Username</dt><dd className="text-sm font-semibold text-slate-900 dark:text-white">{user.userName ?? "—"}</dd></div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4"><dt className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Số điện thoại</dt><dd className="text-sm font-semibold text-slate-900 dark:text-white">{user.phoneNumber ?? "—"}</dd></div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4"><dt className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Ngày sinh</dt><dd className="text-sm font-semibold text-slate-900 dark:text-white">{asDate(user.userDetails?.birthDate ?? null)}</dd></div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4"><dt className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Giới tính</dt><dd className="text-sm font-semibold text-slate-900 dark:text-white">{user.userDetails?.gender ?? "—"}</dd></div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4"><dt className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Cập nhật lúc</dt><dd className="text-sm font-semibold text-slate-900 dark:text-white">{asDate(user.updatedAt ?? null)}</dd></div>
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-6 shadow-sm backdrop-blur-md">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Lịch sử thay đổi hồ sơ</h3>
          {changeLogs.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có lịch sử thay đổi.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Thời gian</th>
                    <th className="px-4 py-3 font-medium">Trường</th>
                    <th className="px-4 py-3 font-medium">Cũ</th>
                    <th className="px-4 py-3 font-medium">Mới</th>
                    <th className="px-4 py-3 font-medium">Người sửa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {changeLogs.map((log, idx) => (
                    <tr key={String(log?.id ?? `log-${idx}`)}>
                      <td className="px-4 py-3">{asDate(log?.changedAt ?? null)}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{fieldLabel(log?.changedField)}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{log?.oldValue ?? "—"}</td>
                      <td className="px-4 py-3 text-emerald-600 font-medium">{log?.newValue ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{log?.changedBy ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-6 shadow-sm backdrop-blur-md">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Hành động</h3>
          <div className="space-y-4">
            {isLocked && (
              <form action={unlockAction}>
                <ActionSubmitButton pendingText="Đang mở khóa..." className="h-10 w-full rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-700 hover:shadow-emerald-600/40 active:scale-95 disabled:pointer-events-none disabled:opacity-50">
                  Mở khóa tài khoản
                </ActionSubmitButton>
              </form>
            )}
            
            <form action={updateRoleAction} className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <label htmlFor="roleName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Đổi quyền</label>
              <select name="roleName" id="roleName" defaultValue={roleName} className="block w-full rounded-lg border-slate-300 dark:border-slate-700 text-sm focus:border-blue-500 focus:ring-blue-500 h-10 px-3 border outline-none">
                <option value="ROLE_USER">USER</option>
                <option value="ROLE_ADMIN">ADMIN</option>
                <option value="ROLE_SUPER_ADMIN">SUPER_ADMIN</option>
              </select>
              <ActionSubmitButton pendingText="Đang cập nhật...">Cập nhật quyền</ActionSubmitButton>
            </form>
          </div>
        </section>
        
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-6 shadow-sm backdrop-blur-md">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Thống kê</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 text-center border border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Chi Tiêu</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {computedTotalSpent.toLocaleString('vi-VN')} đ
              </p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                {computedCompletedOrders} đơn hoàn tất
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 text-center border border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Đơn Hàng</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {orders.length}
              </p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                tổng số đơn
              </p>
            </div>
          </div>
          
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between items-center"><span className="text-slate-500 dark:text-slate-400">Số thiết bị đăng nhập</span><span className="font-bold text-slate-900 dark:text-white">{devices.length}</span></li>
            <li className="flex justify-between items-center"><span className="text-slate-500 dark:text-slate-400">Số địa chỉ đã lưu</span><span className="font-bold text-slate-900 dark:text-white">{addresses.length}</span></li>
          </ul>
        </section>
      </div>
    </div>
  );

  const ordersContent = (
    <div key="orders" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Lịch sử mua hàng</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Danh sách các đơn hàng gần đây của khách hàng.</p>
      </div>
      {orders.length === 0 ? (
        <div className="p-8 text-center text-slate-500 dark:text-slate-400">Không có đơn hàng nào.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-medium">Mã đơn</th>
                <th className="px-6 py-4 font-medium">Ngày đặt</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium">Tổng tiền</th>
                <th className="px-6 py-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {orders.map((o: any) => (
                <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400">
                    <Link href={`/admin/orders/${o.id}`}>{o.orderNumber || `#${o.id}`}</Link>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{asDate(o.createdAt)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] shadow-sm ${orderStatusTone(o.status)} dark:bg-opacity-20 dark:border dark:border-opacity-30`}>
                      {viAdminOrderPipelineLabel(o.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{(o.total ?? o.totalAmount ?? 0).toLocaleString('vi-VN')} đ</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/orders/${o.id}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const addressesContent = (
    <div key="addresses" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {addresses.length === 0 ? (
        <div className="col-span-full rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed p-8 text-center text-slate-500 dark:text-slate-400">
          Chưa có địa chỉ nào được lưu.
        </div>
      ) : (
        addresses.map((addr) => (
          <div key={addr.id} className={`rounded-2xl border p-5 transition-shadow hover:shadow-md ${addr.isDefault ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`material-symbols-outlined ${addr.isDefault ? 'text-blue-500' : 'text-slate-400'}`}>
                {addr.isDefault ? 'home' : 'location_on'}
              </span>
              <h4 className="font-bold text-slate-900 dark:text-white">{addr.isDefault ? 'Địa chỉ mặc định' : 'Địa chỉ phụ'}</h4>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {addr.fullAddress || [addr.streetLine, addr.wardName, addr.districtName, addr.provinceName].filter(Boolean).join(", ")}
            </p>
          </div>
        ))
      )}
    </div>
  );

  const devicesContent = (
    <div key="devices" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Thiết bị đăng nhập</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Các thiết bị đã từng sử dụng tài khoản này.</p>
      </div>
      {devices.length === 0 ? (
        <div className="p-8 text-center text-slate-500 dark:text-slate-400">Chưa có thiết bị nào.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Thiết bị</th>
                <th className="px-6 py-4 font-medium">IP</th>
                <th className="px-6 py-4 font-medium">Vị trí</th>
                <th className="px-6 py-4 font-medium">Lần cuối truy cập</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {devices.map((device) => (
                <tr key={device.id} className="hover:bg-slate-50 dark:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400">devices</span>
                    {device.deviceLabel || "Không rõ"}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono">{device.lastLoginIp || "—"}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{device.lastLoginLocation || "—"}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{asDate(device.lastSeenAt)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                      ${(device as any).isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                      {(device as any).isActive ? 'Đang hoạt động' : 'Đã đăng xuất'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Chi tiết khách hàng</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Quản lý thông tin, đơn hàng, bảo mật của khách hàng.</p>
        </div>
        <Link 
          href="/admin/customers" 
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-900 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 dark:bg-slate-800/50 transition-all"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Quay lại danh sách
        </Link>
      </div>

      <CustomerDetailTabs 
        overviewContent={overviewContent}
        ordersContent={ordersContent}
        addressesContent={addressesContent}
        devicesContent={devicesContent}
      />
    </div>
  );
}
