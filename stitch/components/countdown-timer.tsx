"use client";

import { useEffect, useState } from "react";

export function CountdownTimer({ endAt }: { endAt: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isEnded, setIsEnded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const targetDate = new Date(endAt).getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        setIsEnded(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return false;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
      return true;
    };

    if (calculateTime()) {
      const interval = setInterval(() => {
        if (!calculateTime()) {
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [endAt]);

  if (!mounted) return null;

  if (isEnded) return <div className="mt-4 text-sm font-bold text-red-500 uppercase tracking-widest">Đã kết thúc</div>;

  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      <div className="flex flex-col items-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF4D4D] to-[#FF8C00] text-xl font-black text-white shadow-lg shadow-red-500/30">{String(timeLeft.days).padStart(2, '0')}</span>
        <span className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Ngày</span>
      </div>
      <span className="text-2xl font-bold text-red-400 mb-6">:</span>
      <div className="flex flex-col items-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF4D4D] to-[#FF8C00] text-xl font-black text-white shadow-lg shadow-red-500/30">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Giờ</span>
      </div>
      <span className="text-2xl font-bold text-red-400 mb-6">:</span>
      <div className="flex flex-col items-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF4D4D] to-[#FF8C00] text-xl font-black text-white shadow-lg shadow-red-500/30">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Phút</span>
      </div>
      <span className="text-2xl font-bold text-red-400 mb-6">:</span>
      <div className="flex flex-col items-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF4D4D] to-[#FF8C00] text-xl font-black text-white shadow-lg shadow-red-500/30">{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Giây</span>
      </div>
    </div>
  );
}
