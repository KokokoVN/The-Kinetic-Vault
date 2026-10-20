"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { formatWebActivityTime } from "@/lib/api";
import { type NotificationMessage } from "@/lib/notification-api";

/**
 * Sanitize HTML tối thiểu để tránh XSS khi render notification body.
 * Loại bỏ: <script>, <iframe>, event handlers (on*), javascript: URLs.
 * Cho phép: các tag HTML cơ bản (p, br, strong, em, ul, li, a...).
 */
function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return "Không có nội dung.";
  let s = String(input);
  // Loại bỏ script, style, iframe, object, embed, form
  s = s.replace(/<\s*\/?\s*(script|style|iframe|object|embed|form|input|button|link|meta)\b[^>]*>/gi, "");
  // Loại bỏ event handlers
  s = s.replace(/\s*on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  // Loại bỏ javascript: URLs
  s = s.replace(/(href|src|action|formaction)\s*=\s*("javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]+)/gi, "$1=\"#\"");
  // Loại bỏ data: URLs không an toàn (chỉ cho phép data:image)
  s = s.replace(/(href|src)\s*=\s*("data:(?!image\/)[^"]*"|'data:(?!image\/)[^']*')/gi, "$1=\"#\"");
  return s;
}

function getNotificationCategory(subject?: string | null): "order" | "sale" | "system" {
  const s = String(subject ?? "").toLowerCase();
  if (s.includes("đơn hàng") || s.includes("order") || s.includes("vận chuyển") || s.includes("giao hàng") || s.includes("thanh toán")) {
    return "order";
  }
  if (s.includes("khuyến mãi") || s.includes("sale") || s.includes("voucher") || s.includes("giảm giá") || s.includes("ưu đãi")) {
    return "sale";
  }
  return "system";
}

function categoryBadge(type: "order" | "sale" | "system") {
  if (type === "order") {
    return {
      label: "Đơn Hàng",
      icon: "local_shipping",
      style: "bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60",
      iconBg: "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
    };
  }
  if (type === "sale") {
    return {
      label: "Khuyến Mãi",
      icon: "local_offer",
      style: "bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60",
      iconBg: "bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400",
    };
  }
  return {
    label: "Hệ Thống",
    icon: "shield_lock",
    style: "bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/60",
    iconBg: "bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400",
  };
}

export function UserNotificationsPanel({ items: initialItems }: { items: NotificationMessage[] }) {
  const [items, setItems] = useState<NotificationMessage[]>(initialItems);
  const [activeTab, setActiveTab] = useState<"all" | "order" | "sale" | "system">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<NotificationMessage | null>(null);

  // Unread Count
  const unreadCount = useMemo(() => {
    return items.filter((i) => String(i.status ?? "").toUpperCase() !== "READ").length;
  }, [items]);

  // Filtered Notifications List
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const cat = getNotificationCategory(item.subject);
      if (activeTab !== "all" && cat !== activeTab) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const subjectMatch = String(item.subject ?? "").toLowerCase().includes(q);
        const bodyMatch = String(item.body ?? "").toLowerCase().includes(q);
        return subjectMatch || bodyMatch;
      }
      return true;
    });
  }, [items, activeTab, searchQuery]);

  const markAllAsRead = () => {
    setItems((prev) =>
      prev.map((i) => ({ ...i, status: "READ" }))
    );
  };

  const handleSelectNotification = (n: NotificationMessage) => {
    setSelectedItem(n);
    // Mark item as read locally
    if (String(n.status ?? "").toUpperCase() !== "READ") {
      setItems((prev) =>
        prev.map((i) => (i.id === n.id ? { ...i, status: "READ" } : i))
      );
    }
  };

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/70 p-12 sm:p-20 text-center backdrop-blur-xl shadow-xl">
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 dark:bg-slate-800/60 text-slate-400 border border-slate-200/80 dark:border-slate-700/60">
          <span className="material-symbols-outlined text-[44px]">notifications_active</span>
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Hộp Thư Chưa Có Thông Báo</h3>
        <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          Khi hệ thống gửi thông báo về cập nhật đơn hàng hoặc mã khuyến mãi, chúng sẽ xuất hiện đầy đủ tại đây.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="rounded-[2rem] bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Left Status Counter */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <span className="material-symbols-outlined text-[20px]">inbox</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Hộp Thư Thông Báo
                {unreadCount > 0 && (
                  <span className="bg-cyan-500 text-slate-950 text-[11px] font-black px-2 py-0.5 rounded-full animate-pulse">
                    {unreadCount} chưa đọc
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tổng cộng {items.length} thông báo</p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 px-3.5 py-2 rounded-xl border border-cyan-200 dark:border-cyan-800/60 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">done_all</span>
                Đánh dấu tất cả đã đọc
              </button>
            )}
            
            <Link
              href="/notifications"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700/60 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Làm mới
            </Link>
          </div>

        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
          
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {[
              { id: "all", label: "Tất Cả", icon: "dataset" },
              { id: "order", label: "Đơn Hàng", icon: "local_shipping" },
              { id: "sale", label: "Khuyến Mãi", icon: "local_offer" },
              { id: "system", label: "Hệ Thống", icon: "shield_lock" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-md shadow-blue-600/20"
                    : "bg-slate-100/70 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-900"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm thông báo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400"
            />
          </div>

        </div>
      </div>

      {/* Notifications List */}
      {!filteredItems.length ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 p-10 text-center">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Không tìm thấy thông báo phù hợp trong mục này.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((n, idx) => {
            const read = String(n.status ?? "").toUpperCase() === "READ";
            const category = getNotificationCategory(n.subject);
            const badge = categoryBadge(category);
            const bodyText = n.body ?? "";

            return (
              <div
                key={n.id}
                onClick={() => handleSelectNotification(n)}
                className={`group relative flex items-center justify-between gap-4 p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                  read 
                    ? "bg-white/70 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700" 
                    : "bg-white dark:bg-slate-900/90 border-cyan-500/40 ring-1 ring-cyan-500/20 hover:border-cyan-500 dark:hover:border-cyan-400 shadow-md shadow-cyan-500/5"
                }`}
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                {/* Left accent indicator line for unread */}
                {!read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-blue-500" />
                )}

                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {/* Category Icon */}
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${badge.iconBg} border border-slate-200/50 dark:border-white/10`}>
                    <span className="material-symbols-outlined text-[22px]">{badge.icon}</span>
                  </div>

                  {/* Content snippet */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge.style}`}>
                        {badge.label}
                      </span>
                      {!read && (
                        <span className="bg-cyan-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                          MỚI
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-medium ml-auto">
                        {formatWebActivityTime(n.createdAt)}
                      </span>
                    </div>

                    <h4 className={`text-base font-extrabold tracking-tight ${read ? "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white" : "text-slate-900 dark:text-white"} transition-colors line-clamp-1`}>
                      {n.subject ?? "(Không có tiêu đề)"}
                    </h4>
                    
                    {bodyText && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {bodyText.replace(/<[^>]*>/g, '')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Arrow Action Icon */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-all">
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reader Modal Popup */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800">
                  Chi Tiết Thông Báo
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white pt-2 leading-snug">
                  {selectedItem.subject ?? "Thông Báo"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Thời gian: {formatWebActivityTime(selectedItem.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body Content - Sanitize HTML to prevent XSS */}
            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-h-96 overflow-y-auto space-y-3 pr-2">
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedItem.body) }}
              />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
              <Link
                href={`/notifications/${encodeURIComponent(String(selectedItem.id))}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                Mở trang liên kết riêng
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </Link>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2 text-xs font-bold text-white transition-all shadow-md shadow-blue-600/20"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
