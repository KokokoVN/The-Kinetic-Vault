"use client";

import Link from "next/link";

const BRANDS = [
  { name: "Apple", tag: "Flagship Authorised", icon: "laptop_mac" },
  { name: "Samsung", tag: "Galaxy AI Partner", icon: "smartphone" },
  { name: "Sony", tag: "Hi-Res Audio Pro", icon: "headphones" },
  { name: "Asus ROG", tag: "Republic of Gamers", icon: "sports_esports" },
  { name: "Dell", tag: "UltraSharp Display", icon: "desktop_windows" },
  { name: "Marshall", tag: "Iconic Sound", icon: "speaker" },
  { name: "Bose", tag: "QuietComfort Noise Cancelling", icon: "volume_up" },
  { name: "Garmin", tag: "Premium Multisport GPS", icon: "watch" },
  { name: "Logitech", tag: "Master Series & Ergonomics", icon: "mouse" },
  { name: "Keychron", tag: "Custom Mechanical Keyboards", icon: "keyboard" },
  { name: "Anker", tag: "GaNPrime Fast Charging", icon: "bolt" },
  { name: "JBL", tag: "Pro Sound & Bass", icon: "music_note" },
];

export function StorefrontBrandMarquee() {
  const duplicated = [...BRANDS, ...BRANDS, ...BRANDS];

  return (
    <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-10 my-4 overflow-hidden">
      <div className="mx-auto max-w-screen-2xl">
        {/* Section title */}
        <div className="mb-6 flex flex-col items-center justify-center gap-1.5 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-white/5 px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
            <span className="material-symbols-outlined text-xs">verified</span>
            Đối Tác Chính Hãng
          </span>
          <h3 className="font-headline text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Thương Hiệu Công Nghệ Hàng Đầu
          </h3>
        </div>

        {/* Marquee Container */}
        <div className="group/brand relative flex w-full overflow-hidden py-3">
          {/* Ambient Edge Fades */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-slate-50 dark:from-[#0a0710] to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-slate-50 dark:from-[#0a0710] to-transparent z-10" />

          <style dangerouslySetInnerHTML={{__html: `
            @keyframes brandMarquee {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-33.333%); }
            }
            .animate-brand-marquee {
              animation: brandMarquee 45s linear infinite;
              width: max-content;
            }
            .group\\/brand:hover .animate-brand-marquee {
              animation-play-state: paused;
            }
          `}} />

          <div className="animate-brand-marquee flex gap-4 pr-4">
            {duplicated.map((b, idx) => (
              <Link
                key={`${b.name}-${idx}`}
                href={`/?q=${encodeURIComponent(b.name)}#san-pham-noi-bat`}
                className="group relative flex min-w-[200px] items-center gap-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-900/80 p-3.5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/50 dark:hover:border-cyan-400/50 hover:shadow-lg hover:shadow-indigo-500/10 backdrop-blur-xl"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                  <span className="material-symbols-outlined text-lg">{b.icon}</span>
                </span>
                <div className="min-w-0">
                  <div className="font-headline font-black text-xs sm:text-sm text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors">
                    {b.name}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-medium">
                    {b.tag}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
