"use client";

import Link from "next/link";
import { BackendCategory } from "@/lib/api";

function resolveCategoryIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("điện thoại") || n.includes("phone")) return "smartphone";
  if (n.includes("laptop") || n.includes("máy tính") || n.includes("pc")) return "laptop_mac";
  if (n.includes("đồng hồ") || n.includes("watch")) return "watch";
  if (n.includes("tai nghe") || n.includes("headphone") || n.includes("earphone") || n.includes("âm thanh")) return "headphones";
  if (n.includes("loa") || n.includes("speaker")) return "speaker";
  if (n.includes("chuột") || n.includes("mouse")) return "mouse";
  if (n.includes("bàn phím") || n.includes("keyboard")) return "keyboard";
  if (n.includes("màn hình") || n.includes("monitor")) return "desktop_windows";
  if (n.includes("cáp") || n.includes("sạc") || n.includes("cable") || n.includes("pin")) return "cable";
  if (n.includes("phụ kiện") || n.includes("accessory")) return "devices_other";
  if (n.includes("bảo vệ") || n.includes("túi") || n.includes("bao da") || n.includes("ốp")) return "cases";
  if (n.includes("webcam") || n.includes("camera")) return "photo_camera";
  if (n.includes("gmail") || n.includes("mail") || n.includes("email")) return "mail";
  if (n.includes("domain") || n.includes("tên miền") || n.includes("web")) return "language";
  if (n.includes("info") || n.includes("thẻ") || n.includes("tài khoản")) return "badge";
  if (n.includes("game") || n.includes("gaming")) return "sports_esports";
  return "category";
}

export function CategoryCarousel({ categories }: { categories: BackendCategory[] }) {
  if (!categories || categories.length === 0) {
    return (
      <div className="py-6 text-center text-sm font-medium text-slate-400 dark:text-slate-500">
        Chưa có danh mục nào để hiển thị.
      </div>
    );
  }

  // Duplicate categories to create a fluid infinite marquee
  const topCategories = categories.slice(0, 10);
  const duplicatedCategories = [...topCategories, ...topCategories, ...topCategories, ...topCategories];

  return (
    <div className="group/carousel relative flex w-full overflow-hidden pb-4 pt-2">
      {/* Ambient edge fades for smooth entry/exit */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-white/90 dark:from-zinc-950/90 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-white/90 dark:from-zinc-950/90 to-transparent z-10" />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes categoryMarquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-25%); }
        }
        .animate-category-marquee {
          animation: categoryMarquee 50s linear infinite;
          width: max-content;
        }
        .group\\/carousel:hover .animate-category-marquee {
          animation-play-state: paused;
        }
      `}} />

      <div className="animate-category-marquee flex gap-3.5 sm:gap-5 pr-4">
        {duplicatedCategories.map((cat, index) => {
          const icon = resolveCategoryIcon(cat.name);
          
          return (
            <Link
              key={`${cat.id}-${index}`}
              href={`/?category=${cat.id}`}
              className="group relative flex min-w-[135px] max-w-[155px] sm:min-w-[155px] sm:max-w-[175px] flex-col items-center justify-center gap-3.5 overflow-hidden rounded-[1.75rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-900/80 p-4 sm:p-5 text-center shadow-xs dark:shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-400/50 dark:hover:border-cyan-400/50 hover:bg-gradient-to-b hover:from-white hover:to-indigo-50/40 dark:hover:from-zinc-900 dark:hover:to-cyan-950/20 hover:shadow-xl hover:shadow-indigo-500/10 backdrop-blur-xl"
            >
              {cat.imageUrl ? (
                <div className="relative flex h-14 w-14 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white shadow-xs transition-all duration-300 group-hover:shadow-md group-hover:scale-110">
                  <img src={cat.imageUrl} alt={cat.name} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-50 to-cyan-50 dark:from-indigo-950/60 dark:to-cyan-950/40 text-indigo-600 dark:text-cyan-400 border border-indigo-200/60 dark:border-indigo-500/20 shadow-xs transition-all duration-300 group-hover:scale-110 group-hover:from-indigo-600 group-hover:to-cyan-500 group-hover:text-white group-hover:shadow-md group-hover:shadow-indigo-500/30">
                  <span className="material-symbols-outlined text-[28px]">{icon}</span>
                </div>
              )}
              <span className="font-headline font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2 leading-tight">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
