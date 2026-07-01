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
    <div className="group/carousel relative flex w-full overflow-hidden pb-4">
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
      <div className="animate-marquee flex gap-4 pr-4">
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
              className="group relative flex min-w-[160px] max-w-[180px] flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-6 text-center transition-all hover:-translate-y-1 hover:border-primary/40 hover:bg-primary-container/20 hover:shadow-lg"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-container text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <span className="material-symbols-outlined text-3xl">{icon}</span>
              </div>
              <span className="font-semibold text-on-surface group-hover:text-primary">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
