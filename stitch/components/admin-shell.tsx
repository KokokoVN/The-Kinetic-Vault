"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoutButton } from "@/components/logout-button";
import { HeaderDateTime } from "@/components/header-date-time";
import { ThemeToggle } from "@/components/theme-toggle";

const menu = [
  { href: "/admin/dashboard", icon: "dashboard", label: "Tổng quan" },
  { href: "/admin/categories", icon: "category", label: "Danh mục" },
  { href: "/admin/brands", icon: "stars", label: "Thương hiệu" },
  { href: "/admin/products", icon: "inventory_2", label: "Sản phẩm" },
  { href: "/admin/inventory", icon: "warehouse", label: "Kho hàng" },
  { href: "/admin/orders", icon: "shopping_cart", label: "Đơn hàng" },
  { href: "/admin/carts", icon: "shopping_bag", label: "Giỏ hàng" },
  { href: "/admin/customers", icon: "group", label: "Khách hàng" },
  { href: "/admin/sales", icon: "local_offer", label: "Khuyến mãi" },
  { href: "/admin/activity-log", icon: "history", label: "Nhật ký" },
  { href: "/admin/notifications", icon: "mail", label: "Hộp thư" },
  { href: "/admin/reports", icon: "monitoring", label: "Báo cáo" },
];

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: string;
  label: string;
  active?: boolean;
}) {
  const className = [
    "flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300",
    active
      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/20 translate-x-2"
      : "text-slate-400 hover:bg-slate-800/50 hover:text-white hover:translate-x-1",
  ].join(" ");

  if (href === "#") {
    return (
      <span className={`${className} cursor-not-allowed opacity-40`} aria-disabled="true" title="Sắp có">
        <span className={`material-symbols-outlined text-[20px] ${active ? "material-filled" : ""}`}>{icon}</span>
        <span>{label}</span>
      </span>
    );
  }

  return (
    <Link href={href} prefetch className={className} scroll>
      <span className={`material-symbols-outlined text-[20px] ${active ? "material-filled" : ""}`}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

const titleMap: Record<string, string> = {
  "/admin/dashboard": "tổng quan",
  "/admin/categories": "danh mục",
  "/admin/brands": "thương hiệu",
  "/admin/products": "sản phẩm",
  "/admin/inventory": "kho hàng",
  "/admin/orders": "đơn hàng",
  "/admin/carts": "giỏ hàng",
  "/admin/customers": "khách hàng",
  "/admin/sales": "khuyến mãi",
  "/admin/activity-log": "nhật ký",
  "/admin/reports": "báo cáo",
};

function pageTitleFromPath(pathname: string): string {
  const key = Object.keys(titleMap).find((k) => pathname.startsWith(k));
  const t = key ? titleMap[key] : "quản trị";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function roleLabel(role: string | null | undefined): string {
  if (!role) {
    return "—";
  }
  if (role === "ROLE_ADMIN") {
    return "Quản trị";
  }
  if (role === "ROLE_STAFF") {
    return "Nhân viên";
  }
  if (role === "ROLE_USER") {
    return "Người dùng";
  }
  return role.replace(/^ROLE_/, "");
}

export function AdminShell({
  children,
  userRole,
  username,
  canMutateCatalog,
}: {
  children: React.ReactNode;
  userRole?: string | null;
  username?: string | null;
  canMutateCatalog?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [telegramToken, setTelegramToken] = useState<string | null>(null);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);

  const generateTelegramToken = async () => {
    try {
      setIsGeneratingToken(true);
      const res = await fetch("/api/telegram/generate-token", {
        method: "POST",
        headers: {
          // Assuming userRole and username are mapped to backend logic via JWT in the actual system,
          // so the gateway handles passing headers to the service. For now we call the gateway endpoint.
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setTelegramToken(data.token);
      } else {
        alert("Có lỗi xảy ra khi tạo mã liên kết.");
      }
    } catch (e) {
      alert("Lỗi kết nối.");
    } finally {
      setIsGeneratingToken(false);
    }
  };

  useEffect(() => {
    router.prefetch("/admin/dashboard");
    router.prefetch("/admin/categories");
    router.prefetch("/admin/categories/new");
    router.prefetch("/admin/brands");
    router.prefetch("/admin/products");
    router.prefetch("/admin/inventory");
    router.prefetch("/admin/orders");
    router.prefetch("/admin/carts");
    router.prefetch("/admin/customers");
    router.prefetch("/admin/sales");
    router.prefetch("/admin/activity-log");
    router.prefetch("/admin/reports");
  }, [router]);

  const title = pageTitleFromPath(pathname);
  const today = new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 selection:bg-blue-200 dark:selection:bg-blue-900 transition-colors">
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[280px] flex-col bg-slate-950 p-6 shadow-2xl lg:flex border-r border-slate-800">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
            <span className="material-symbols-outlined text-[28px] material-filled">bolt</span>
          </div>
          <div>
            <h1 className="font-headline text-2xl font-black tracking-tight text-white drop-shadow-md">TKV Admin</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400">Control Panel</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar pr-2">
          {menu.map((item) => (
            <NavItem
              key={item.label}
              {...item}
              active={item.href !== "#" && pathname.startsWith(item.href)}
            />
          ))}
        </nav>

        <div className="mt-8 space-y-4 border-t border-slate-800 pt-6">
          {telegramToken ? (
            <div className="rounded-2xl bg-indigo-500/10 px-4 py-3 border border-indigo-500/30 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1">Mã liên kết Bot</p>
              <p className="text-lg font-black text-white tracking-widest">{telegramToken}</p>
              <p className="text-[10px] text-slate-400 mt-2">Nhắn /login {telegramToken} cho Bot</p>
            </div>
          ) : (
            <button
              onClick={generateTelegramToken}
              disabled={isGeneratingToken}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white px-4 py-3 text-sm font-bold transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              {isGeneratingToken ? "Đang tạo mã..." : "Liên kết Telegram"}
            </button>
          )}

          <div className="rounded-2xl bg-slate-900 px-4 py-3.5 border border-slate-800">
            <p className="font-bold text-white truncate">{username ?? "—"}</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-400">
              {roleLabel(userRole)} {canMutateCatalog === false ? "· Read-only" : ""}
            </p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <main className="min-h-screen lg:ml-[280px]">
        <header className="sticky top-0 z-30 border-b border-slate-200/50 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl transition-colors">
          <div className="mx-auto flex h-20 items-center justify-between gap-6 px-6 lg:px-10">
            <div className="flex min-w-0 flex-1 items-center gap-6">
              <div className="hidden lg:block">
                <HeaderDateTime />
              </div>
              <div className="relative hidden w-full max-w-xl lg:block">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  search
                </span>
                <input
                  className="w-full rounded-2xl bg-slate-100/50 dark:bg-slate-900/50 py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none ring-1 ring-slate-200/50 dark:ring-slate-800 transition-all placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:shadow-lg focus:shadow-blue-100 dark:focus:shadow-blue-900/20"
                  placeholder={`Tìm kiếm trong ${title.toLowerCase()}...`}
                  type="text"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-5">
              <Link
                href="/admin/products/new"
                className="hidden items-center gap-2 rounded-2xl bg-slate-900 dark:bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/20 dark:hover:shadow-blue-900/40 lg:flex"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Sản phẩm
              </Link>
              <Link
                href="/admin/categories/new"
                className="hidden items-center gap-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2.5 text-sm font-bold transition-all hover:bg-slate-200 dark:hover:bg-slate-700 lg:flex"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Danh mục
              </Link>
              
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block" />

              <ThemeToggle />

              <Link href="/admin/notifications" prefetch className="relative flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-cyan-400" title="Thông báo web">
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
              </Link>

              <div className="hidden items-center gap-3 pl-2 sm:flex">
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 dark:text-white">{username ?? "—"}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    {roleLabel(userRole)}
                  </p>
                </div>
                <img
                  alt="Avatar"
                  className="h-11 w-11 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEUxy_z2AwNNOnsXRXB8cN_P-NkUKif0AVfSIoSQ5-WWsrS99mlDI1hGjXAlrvHnzDTIiUavZfdAKjVXUWzAxNBMYiZFZ_Egy4yDVDk-RAq3te4jB9hxkfch_MnbhYbkRAG1uDfEmPAQwVYg4Ff0ZRF_PWDyngeheGilmJNXJEj99-Lvrf7Dc8MK4zJPnAwMvKydattavrfdm1lSoPmnDFC1rzW0P8WorQrzs6Fys_3szRCl98ydLLdvbjbasWSn5ceSOWGLAhugnu"
                />
              </div>
            </div>
          </div>
          
          <div className="mx-auto flex items-center gap-2 px-6 pb-4 lg:hidden">
            <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto no-scrollbar">
              {[menu[0], menu[2], menu[3], menu[5]].map((item) => {
                const tabActive = item.href !== "#" && pathname.startsWith(item.href);
                const tabClass = [
                  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-all",
                  tabActive ? "bg-slate-900 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                ].join(" ");
                if (item.href === "#") return null;
                return (
                  <Link key={item.href} href={item.href} prefetch className={tabClass} scroll>
                    <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
            <LogoutButton variant="mobileBar" />
          </div>
        </header>

        <div className="p-6 lg:p-10">{children}</div>

        <footer className="mx-auto flex flex-col items-center justify-between gap-4 px-6 py-10 text-sm font-medium text-slate-400 dark:text-slate-500 sm:flex-row lg:px-10">
          <div className="flex items-center gap-2">
            <span className="font-headline font-black text-slate-900 dark:text-white">The Kinetic Vault Admin</span>
            <span>© 2026. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a className="transition-colors hover:text-blue-600" href="#">Bảo mật</a>
            <a className="transition-colors hover:text-blue-600" href="#">Điều khoản</a>
            <a className="transition-colors hover:text-blue-600" href="#">Hỗ trợ</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
