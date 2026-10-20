"use client";

import Link from "next/link";

export function StorefrontEcosystemBento() {
  return (
    <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 my-6">
      <div className="mx-auto max-w-screen-2xl">
        {/* Section Header */}
        <div className="mb-10 flex flex-col items-center justify-center gap-2 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-400 border border-cyan-500/25 shadow-sm">
            <span className="material-symbols-outlined text-xs">hub</span>
            Tech Ecosystems
          </span>
          <h3 className="font-headline text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Trải Nghiệm Hệ Sinh Thái <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">Đỉnh Cao</span>
          </h3>
          <p className="max-w-xl text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Tối ưu hóa năng suất làm việc và giải trí với các thiết bị kết nối liền mạch, chuẩn công nghệ tương lai.
          </p>
        </div>

        {/* 3-Card Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          
          {/* Card 1: Apple Silicon Flagship Studio */}
          <Link
            href="/?q=Apple#san-pham-noi-bat"
            className="group relative flex flex-col justify-between overflow-hidden rounded-[2.25rem] border border-slate-200/80 dark:border-white/10 bg-gradient-to-br from-slate-900 via-indigo-950 to-zinc-950 p-7 text-white shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-indigo-400/50"
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-indigo-500/25 blur-[60px] group-hover:scale-125 transition-transform duration-500" />
            
            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-200 backdrop-blur-md">
                <span className="material-symbols-outlined text-xs text-indigo-400">devices</span>
                Apple Silicon
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md group-hover:rotate-12 transition-transform">
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </span>
            </div>

            <div className="relative z-10 my-8">
              <h4 className="font-headline text-2xl font-black text-white group-hover:text-cyan-300 transition-colors">
                Hệ Sinh Thái Apple Pro
              </h4>
              <p className="mt-2 text-xs sm:text-sm text-slate-300/90 leading-relaxed">
                iPhone 16 Pro Max, MacBook Pro M3 và Apple Watch Ultra 2 đồng bộ dữ liệu tức thì, liền mạch từng giây.
              </p>
            </div>

            <div className="relative z-10 flex items-center justify-between text-xs font-bold text-cyan-300 border-t border-white/10 pt-3">
              <span>Bảo hành chính hãng 1 đổi 1</span>
              <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Khám phá ngay <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </span>
            </div>
          </Link>

          {/* Card 2: Samsung Galaxy AI Experience */}
          <Link
            href="/?q=Samsung#san-pham-noi-bat"
            className="group relative flex flex-col justify-between overflow-hidden rounded-[2.25rem] border border-cyan-500/30 bg-gradient-to-br from-cyan-950/90 via-slate-900 to-zinc-950 p-7 text-white shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-cyan-400/50"
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-cyan-400/25 blur-[60px] group-hover:scale-125 transition-transform duration-500" />
            
            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-500/20 px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-200 backdrop-blur-md">
                <span className="material-symbols-outlined text-xs text-cyan-400">auto_awesome</span>
                Galaxy AI
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md group-hover:rotate-12 transition-transform">
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </span>
            </div>

            <div className="relative z-10 my-8">
              <h4 className="font-headline text-2xl font-black text-white group-hover:text-cyan-300 transition-colors">
                Trí Tuệ Nhân Tạo Galaxy AI
              </h4>
              <p className="mt-2 text-xs sm:text-sm text-cyan-100/90 leading-relaxed">
                Samsung Galaxy S24 Ultra và Z Fold6 với các tính năng dịch trực tiếp, khoanh tròn tìm kiếm và chỉnh ảnh AI chuyên nghiệp.
              </p>
            </div>

            <div className="relative z-10 flex items-center justify-between text-xs font-bold text-cyan-300 border-t border-white/10 pt-3">
              <span>Trợ giá thu cũ 3 Triệu</span>
              <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Trải nghiệm AI <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </span>
            </div>
          </Link>

          {/* Card 3: Cyber Gaming & High-Res Audio */}
          <Link
            href="/?q=Gaming#san-pham-noi-bat"
            className="group relative flex flex-col justify-between overflow-hidden rounded-[2.25rem] border border-rose-500/30 bg-gradient-to-br from-rose-950/80 via-purple-950/60 to-zinc-950 p-7 text-white shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-rose-400/50"
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-rose-500/25 blur-[60px] group-hover:scale-125 transition-transform duration-500" />
            
            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/40 bg-rose-500/20 px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-rose-200 backdrop-blur-md">
                <span className="material-symbols-outlined text-xs text-rose-400">sports_esports</span>
                Cyber Studio
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md group-hover:rotate-12 transition-transform">
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </span>
            </div>

            <div className="relative z-10 my-8">
              <h4 className="font-headline text-2xl font-black text-white group-hover:text-rose-300 transition-colors">
                Gaming Gear & Hi-Fi Audio
              </h4>
              <p className="mt-2 text-xs sm:text-sm text-rose-100/90 leading-relaxed">
                Asus ROG Zephyrus G16, bàn phím cơ Custom Keychron Q1 và loa huyền thoại Marshall Stanmore III bùng nổ mọi giác quan.
              </p>
            </div>

            <div className="relative z-10 flex items-center justify-between text-xs font-bold text-rose-300 border-t border-white/10 pt-3">
              <span>Độc quyền âm thanh & gear</span>
              <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Sắm combo <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </span>
            </div>
          </Link>

        </div>
      </div>
    </section>
  );
}
