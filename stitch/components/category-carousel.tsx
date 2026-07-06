"use client";

import Link from "next/link";
import { BackendCategory } from "@/lib/api";

export function CategoryCarousel({ categories }: { categories: BackendCategory[] }) {
  // Duplicate categories to create an infinite scrolling effect
  // If there are too few categories, we might need to duplicate them multiple times
  // to ensure the marquee fills the screen. But duplicating once is usually enough
  // We slice to 8 items as requested, then duplicate 4 times for the infinite marquee
  const topCategories = categories.slice(0, 8);
  const duplicatedCategories = [...topCategories, ...topCategories, ...topCategories, ...topCategories];

  return (
    <div className="group/carousel relative flex w-full overflow-hidden pb-8 pt-4">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-25%); }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
          width: max-content;
        }
        .group\\/carousel:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}} />
      <div className="animate-marquee flex gap-4 md:gap-6 pr-4 md:pr-6">
        {duplicatedCategories.map((cat, index) => {
          const nameLower = cat.name.toLowerCase();
          let icon = "category";
          if (nameLower.includes("điện thoại") || nameLower.includes("phone")) icon = "smartphone";
          else if (nameLower.includes("laptop") || nameLower.includes("máy tính")) icon = "laptop_mac";
          else if (nameLower.includes("bảo vệ") || nameLower.includes("túi")) icon = "cases";
          else if (nameLower.includes("webcam") || nameLower.includes("màn hình")) icon = "videocam";
          else if (nameLower.includes("chuột") || nameLower.includes("bàn phím")) icon = "mouse";
          else if (nameLower.includes("âm thanh") || nameLower.includes("mic") || nameLower.includes("loa") || nameLower.includes("tai nghe")) icon = "headphones";
          else if (nameLower.includes("kết nối") || nameLower.includes("cáp") || nameLower.includes("sạc")) icon = "cable";
          
          return (
            <Link
              key={`${cat.id}-${index}`}
              href={`/?category=${cat.id}`}
              className="group relative flex min-w-[140px] max-w-[160px] md:min-w-[160px] md:max-w-[180px] flex-col items-center justify-center gap-4 overflow-hidden rounded-[2rem] border border-slate-200/60 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-gradient-to-b hover:from-white hover:to-indigo-50/50 dark:hover:from-slate-900 dark:hover:to-indigo-900/20 hover:shadow-xl hover:shadow-indigo-500/10 backdrop-blur-xl"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-cyan-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-500/30 group-hover:scale-110">
                <span className="material-symbols-outlined text-[32px]">{icon}</span>
              </div>
              <span className="font-headline font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
