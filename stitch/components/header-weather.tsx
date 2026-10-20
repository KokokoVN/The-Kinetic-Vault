"use client";

import { useEffect, useState, useRef } from "react";

interface WeatherCurrent {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: number;
  precipitation: number;
}

interface DailyForecast {
  date: string;
  dayName: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  rainChance: number;
}

interface WeatherData {
  city: string;
  region: string;
  current: WeatherCurrent;
  daily: DailyForecast[];
  updatedAt: number;
}

interface CityPreset {
  name: string;
  displayName: string;
  lat: number;
  lon: number;
}

const PRESET_CITIES: CityPreset[] = [
  { name: "Hà Nội", displayName: "Hà Nội (Thủ đô)", lat: 21.0285, lon: 105.8542 },
  { name: "TP. Hồ Chí Minh", displayName: "TP. Hồ Chí Minh", lat: 10.8231, lon: 106.6297 },
  { name: "Đà Nẵng", displayName: "Đà Nẵng", lat: 16.0544, lon: 108.2022 },
  { name: "Hải Phòng", displayName: "Hải Phòng", lat: 20.8449, lon: 106.6881 },
  { name: "Cần Thơ", displayName: "Cần Thơ", lat: 10.0452, lon: 105.7469 },
  { name: "Nha Trang", displayName: "Nha Trang (Khánh Hòa)", lat: 12.2388, lon: 109.1967 },
  { name: "Đà Lạt", displayName: "Đà Lạt (Lâm Đồng)", lat: 11.9404, lon: 108.4583 },
  { name: "Huế", displayName: "Thừa Thiên Huế", lat: 16.4637, lon: 107.5909 },
  { name: "Vũng Tàu", displayName: "Bà Rịa - Vũng Tàu", lat: 10.346, lon: 107.0843 },
  { name: "Hạ Long", displayName: "Hạ Long (Quảng Ninh)", lat: 20.9505, lon: 107.0734 },
  { name: "Quy Nhơn", displayName: "Quy Nhơn (Bình Định)", lat: 13.783, lon: 109.2197 },
  { name: "Buôn Ma Thuột", displayName: "Buôn Ma Thuột (Đắk Lắk)", lat: 12.6667, lon: 108.05 },
  { name: "Phú Quốc", displayName: "Phú Quốc (Kiên Giang)", lat: 10.2899, lon: 103.984 },
];

function getWeatherMeta(code: number, isDay = 1) {
  // WMO Weather interpretation codes (http://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM)
  if (code === 0) {
    return {
      label: isDay ? "Nắng đẹp, quang đãng" : "Đêm quang mây",
      icon: isDay ? "wb_sunny" : "bedtime",
      color: isDay ? "text-amber-500 dark:text-amber-400" : "text-indigo-400",
      badgeBg: "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20",
      advice: "Thời tiết lý tưởng cho các hoạt động ngoài trời và giao nhận hàng!",
    };
  }
  if (code === 1 || code === 2) {
    return {
      label: isDay ? "Trời có mây rải rác" : "Đêm ít mây",
      icon: isDay ? "partly_cloudy_day" : "nights_stay",
      color: "text-amber-400 dark:text-sky-300",
      badgeBg: "from-sky-500/10 to-indigo-500/10 text-sky-600 dark:text-sky-300 border-sky-500/20",
      advice: "Thời tiết dịu mát, rất thuận tiện để đi lại và nhận hàng.",
    };
  }
  if (code === 3) {
    return {
      label: "Nhiều mây, âm u",
      icon: "cloud",
      color: "text-slate-400 dark:text-slate-300",
      badgeBg: "from-slate-500/10 to-zinc-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
      advice: "Trời mát, thích hợp đặt giao hàng hỏa tốc trong ngày.",
    };
  }
  if (code === 45 || code === 48) {
    return {
      label: "Sương mù tầm nhìn giảm",
      icon: "foggy",
      color: "text-blue-300 dark:text-slate-300",
      badgeBg: "from-slate-500/10 to-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/20",
      advice: "Độ ẩm cao có sương mù, tài xế giao hàng cần di chuyển cẩn thận.",
    };
  }
  if (code >= 51 && code <= 57) {
    return {
      label: "Mưa phùn hạt nhỏ",
      icon: "grain",
      color: "text-cyan-500 dark:text-cyan-400",
      badgeBg: "from-cyan-500/10 to-blue-500/10 text-cyan-600 dark:text-cyan-300 border-cyan-500/20",
      advice: "Trời có mưa nhỏ lất phất, nên mang theo ô hoặc áo mưa tiện lợi.",
    };
  }
  if (code >= 61 && code <= 67) {
    return {
      label: "Mưa rào",
      icon: "rainy",
      color: "text-blue-500 dark:text-blue-400",
      badgeBg: "from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-300 border-blue-500/20",
      advice: "Trời đang có mưa, kiện hàng sẽ được đóng gói chống nước kỹ càng.",
    };
  }
  if (code >= 80 && code <= 82) {
    return {
      label: "Mưa rào từng cơn",
      icon: "water_drop",
      color: "text-blue-500 dark:text-sky-400",
      badgeBg: "from-blue-500/10 to-sky-500/10 text-blue-600 dark:text-sky-300 border-blue-500/20",
      advice: "Mưa rào ngắt quãng, ưu tiên đặt đơn giao hàng tận nơi tránh mưa.",
    };
  }
  if (code >= 95) {
    return {
      label: "Dông bão, có sấm chớp",
      icon: "thunderstorm",
      color: "text-violet-500 dark:text-amber-400",
      badgeBg: "from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20",
      advice: "Thời tiết dông bão phức tạp, đơn hàng có thể giao chậm hơn thông thường.",
    };
  }
  return {
    label: "Mát mẻ",
    icon: "filter_drama",
    color: "text-sky-500 dark:text-sky-400",
    badgeBg: "from-sky-500/10 to-indigo-500/10 text-sky-600 dark:text-sky-300 border-sky-500/20",
    advice: "Thời tiết dễ chịu, chúc bạn một ngày mua sắm vui vẻ!",
  };
}

function formatCityShort(name: string): string {
  if (!name) return "Việt Nam";
  const trimmed = name.trim();
  if (/Hồ Chí Minh/i.test(trimmed)) return "TP.HCM";
  if (/Hà Nội/i.test(trimmed)) return "Hà Nội";
  if (/Đà Nẵng/i.test(trimmed)) return "Đà Nẵng";
  if (/Hải Phòng/i.test(trimmed)) return "Hải Phòng";
  if (/Cần Thơ/i.test(trimmed)) return "Cần Thơ";
  if (/Nha Trang/i.test(trimmed)) return "Nha Trang";
  if (/Đà Lạt/i.test(trimmed)) return "Đà Lạt";
  if (/Huế/i.test(trimmed)) return "Huế";
  if (/Vũng Tàu/i.test(trimmed)) return "Vũng Tàu";
  if (/Quy Nhơn/i.test(trimmed)) return "Quy Nhơn";
  if (/Buôn Ma Thuột/i.test(trimmed)) return "Buôn Ma Thuột";
  if (/Phú Quốc/i.test(trimmed)) return "Phú Quốc";
  if (/Hạ Long/i.test(trimmed)) return "Hạ Long";
  return trimmed.replace(/^(Thành phố|Tỉnh)\s+/i, "");
}

const STORAGE_KEY = "tkv_header_weather_cache";
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 mins

export function HeaderWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>("Hà Nội");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Load weather for coordinates
  const fetchWeather = async (lat: number, lon: number, cityName?: string, regionName?: string) => {
    try {
      setLoading(true);
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch weather");
      const data = await res.json();

      const current: WeatherCurrent = {
        temperature: Math.round(data.current?.temperature_2m ?? 0),
        apparentTemperature: Math.round(data.current?.apparent_temperature ?? 0),
        humidity: Math.round(data.current?.relative_humidity_2m ?? 0),
        windSpeed: Math.round(data.current?.wind_speed_10m ?? 0),
        weatherCode: data.current?.weather_code ?? 0,
        isDay: data.current?.is_day ?? 1,
        precipitation: data.current?.precipitation ?? 0,
      };

      // Daily 5-day forecast
      const dailyDates: string[] = data.daily?.time || [];
      const dailyCodes: number[] = data.daily?.weather_code || [];
      const dailyMax: number[] = data.daily?.temperature_2m_max || [];
      const dailyMin: number[] = data.daily?.temperature_2m_min || [];
      const dailyRain: number[] = data.daily?.precipitation_probability_max || [];

      const daily: DailyForecast[] = dailyDates.slice(0, 5).map((dStr, idx) => {
        const d = new Date(dStr);
        const dayName = idx === 0 ? "Hôm nay" : idx === 1 ? "Ngày mai" : d.toLocaleDateString("vi-VN", { weekday: "short" });
        return {
          date: dStr,
          dayName,
          weatherCode: dailyCodes[idx] ?? 0,
          tempMax: Math.round(dailyMax[idx] ?? 0),
          tempMin: Math.round(dailyMin[idx] ?? 0),
          rainChance: Math.round(dailyRain[idx] ?? 0),
        };
      });

      const weatherData: WeatherData = {
        city: cityName || "Vùng của bạn",
        region: regionName || "Việt Nam",
        current,
        daily,
        updatedAt: Date.now(),
      };

      setWeather(weatherData);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(weatherData));
      } catch {
        // ignore quota errors
      }
    } catch (err) {
      console.warn("Weather load error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Detect location via GPS or fallback
  const detectLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      // Fallback to default Hà Nội
      fetchWeather(21.0285, 105.8542, "Hà Nội", "Thủ đô");
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        let detectedCity = "Vị trí của bạn";
        let detectedRegion = "Việt Nam";

        try {
          const revRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=vi`
          );
          if (revRes.ok) {
            const rev = await revRes.json();
            detectedCity = rev.city || rev.locality || rev.principalSubdivision || "Vị trí của bạn";
            detectedRegion = rev.principalSubdivision || rev.countryName || "Việt Nam";
          }
        } catch {
          // keep fallback names
        }

        setSelectedCity(detectedCity);
        await fetchWeather(lat, lon, detectedCity, detectedRegion);
        setLocating(false);
      },
      (err) => {
        console.info("Geolocation declined/unavailable, using Hà Nội fallback:", err.message);
        // Fallback to Hà Nội
        const defaultCity = PRESET_CITIES[0];
        setSelectedCity(defaultCity.name);
        fetchWeather(defaultCity.lat, defaultCity.lon, defaultCity.name, "Việt Nam");
        setLocating(false);
      },
      { timeout: 6000, maximumAge: 300000 }
    );
  };

  // Initial load: check cache first, then detect
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed: WeatherData = JSON.parse(cached);
        if (Date.now() - parsed.updatedAt < CACHE_TTL_MS) {
          setWeather(parsed);
          setSelectedCity(parsed.city);
          setLoading(false);
          return;
        }
      }
    } catch {
      // ignore
    }
    detectLocation();
  }, []);

  const handleCitySelect = (cityName: string) => {
    const found = PRESET_CITIES.find((c) => c.name === cityName);
    if (found) {
      setSelectedCity(found.name);
      fetchWeather(found.lat, found.lon, found.name, "Việt Nam");
    }
  };

  const currentMeta = weather ? getWeatherMeta(weather.current.weatherCode, weather.current.isDay) : null;
  const shortCity = weather ? formatCityShort(weather.city) : "Thời tiết";

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Header Weather Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group flex shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl border px-3.5 py-2 text-xs font-semibold shadow-xs backdrop-blur-xl transition-all duration-300 select-none ${
          isOpen
            ? "border-sky-500/60 bg-sky-50/70 dark:bg-sky-500/10 text-sky-600 dark:text-sky-300 shadow-[0_0_16px_rgba(14,165,233,0.25)]"
            : "border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] text-slate-700 dark:text-zinc-200 hover:border-sky-500/40 hover:shadow-[0_0_16px_rgba(14,165,233,0.15)]"
        }`}
        title="Khí tượng thời gian thực - Bấm xem chi tiết & radar 5 ngày"
      >
        {loading ? (
          <>
            <span className="material-symbols-outlined text-[17px] text-sky-500 animate-spin">
              progress_activity
            </span>
            <span className="text-[11.5px] font-medium text-slate-400">Thời tiết...</span>
          </>
        ) : weather && currentMeta ? (
          <>
            <span
              className={`material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:scale-115 drop-shadow-xs ${currentMeta.color}`}
            >
              {currentMeta.icon}
            </span>
            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white tabular-nums">
              {weather.current.temperature}°C
            </span>
            <span className="text-slate-300 dark:text-zinc-600 font-light">·</span>
            <span className="text-[11.5px] font-medium text-slate-600 dark:text-zinc-300">
              {shortCity}
            </span>
            <span
              className={`material-symbols-outlined text-[15px] text-slate-400 dark:text-zinc-500 transition-transform duration-300 ${
                isOpen ? "rotate-180 text-sky-500 dark:text-sky-400" : "group-hover:translate-y-0.5"
              }`}
            >
              expand_more
            </span>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[17px] text-amber-500">wb_sunny</span>
            <span className="text-[11.5px] font-medium">Thời tiết</span>
          </>
        )}
      </button>

      {/* Weather Forecast Popover Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 top-full mt-2.5 w-[330px] sm:w-[380px] rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#0c101d]/95 backdrop-blur-2xl p-4 sm:p-5 shadow-2xl shadow-indigo-950/20 dark:shadow-black/70 z-50 animate-in fade-in zoom-in-95 duration-200"
          role="dialog"
          aria-label="Chi tiết dự báo thời tiết"
        >
          {/* Header Row: Region title + GPS auto-detect button */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  {weather?.city || selectedCity}
                  <span className="text-[10px] font-normal text-slate-400 dark:text-zinc-400">
                    ({weather?.region || "VN"})
                  </span>
                </h4>
              </div>
            </div>

            <button
              type="button"
              onClick={detectLocation}
              disabled={locating}
              className="flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-zinc-200 transition-colors disabled:opacity-60"
              title="Định vị vị trí hiện tại của bạn"
            >
              <span
                className={`material-symbols-outlined text-[14px] ${locating ? "animate-spin text-blue-500" : ""}`}
              >
                {locating ? "progress_activity" : "my_location"}
              </span>
              <span>{locating ? "Đang tìm..." : "Định vị GPS"}</span>
            </button>
          </div>

          {/* Quick Region Selector Dropdown */}
          <div className="mt-3">
            <label className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 mb-1 block">
              Chọn tỉnh / thành phố theo dõi:
            </label>
            <select
              value={selectedCity}
              onChange={(e) => handleCitySelect(e.target.value)}
              className="w-full rounded-xl border border-slate-200/90 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {PRESET_CITIES.map((c) => (
                <option key={c.name} value={c.name} className="bg-white dark:bg-[#0c101d] text-slate-800 dark:text-zinc-200">
                  {c.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Current Weather Highlight Card */}
          {weather && currentMeta && (
            <div className="mt-3 rounded-2xl bg-gradient-to-br from-indigo-500/[0.07] via-sky-500/[0.04] to-transparent border border-indigo-500/15 p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                      {weather.current.temperature}°C
                    </span>
                    <span className="text-xs text-slate-500 dark:text-zinc-400">
                      (Cảm nhận {weather.current.apparentTemperature}°C)
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold bg-gradient-to-r ${currentMeta.badgeBg}`}
                    >
                      <span className="material-symbols-outlined text-[13px]">{currentMeta.icon}</span>
                      {currentMeta.label}
                    </span>
                  </div>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/70 dark:bg-white/5 shadow-inner border border-slate-200/40 dark:border-white/10">
                  <span className={`material-symbols-outlined text-[36px] ${currentMeta.color}`}>
                    {currentMeta.icon}
                  </span>
                </div>
              </div>

              {/* 3 Metrics: Humidity, Wind, Rain */}
              <div className="mt-3 grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-200/60 dark:border-white/10">
                <div className="text-center rounded-xl bg-white/50 dark:bg-white/5 py-1.5">
                  <div className="flex items-center justify-center gap-0.5 text-sky-500 text-[10px] font-medium">
                    <span className="material-symbols-outlined text-[12px]">humidity_percentage</span>
                    Độ ẩm
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                    {weather.current.humidity}%
                  </div>
                </div>

                <div className="text-center rounded-xl bg-white/50 dark:bg-white/5 py-1.5">
                  <div className="flex items-center justify-center gap-0.5 text-teal-500 text-[10px] font-medium">
                    <span className="material-symbols-outlined text-[12px]">air</span>
                    Gió
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                    {weather.current.windSpeed} km/h
                  </div>
                </div>

                <div className="text-center rounded-xl bg-white/50 dark:bg-white/5 py-1.5">
                  <div className="flex items-center justify-center gap-0.5 text-blue-500 text-[10px] font-medium">
                    <span className="material-symbols-outlined text-[12px]">rainy</span>
                    Lượng mưa
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                    {weather.current.precipitation} mm
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5-Day Forecast Strips */}
          {weather?.daily && weather.daily.length > 0 && (
            <div className="mt-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5 flex items-center justify-between">
                <span>Dự báo 5 ngày tới</span>
                <span className="material-symbols-outlined text-[14px]">calendar_month</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {weather.daily.map((d, i) => {
                  const meta = getWeatherMeta(d.weatherCode, 1);
                  return (
                    <div
                      key={d.date}
                      className={`flex flex-col items-center rounded-xl py-2 px-1 text-center transition-all ${
                        i === 0
                          ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-bold"
                          : "bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/10"
                      }`}
                    >
                      <span className="text-[10px] whitespace-nowrap">{d.dayName}</span>
                      <span className={`material-symbols-outlined text-[18px] my-1 ${meta.color}`}>
                        {meta.icon}
                      </span>
                      <span className="text-[11px] font-black text-slate-900 dark:text-white">
                        {d.tempMax}°
                      </span>
                      <span className="text-[9px] text-slate-400 dark:text-zinc-400">
                        {d.tempMin}°
                      </span>
                      {d.rainChance > 0 && (
                        <span className="mt-0.5 text-[8px] font-semibold text-sky-500 flex items-center gap-0.5">
                          💧{d.rainChance}%
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Shopping & Delivery Advice */}
          {currentMeta && (
            <div className="mt-3 rounded-xl bg-amber-500/[0.08] dark:bg-amber-400/[0.06] border border-amber-500/20 p-2.5 flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] text-amber-500 shrink-0 mt-0.5">
                lightbulb
              </span>
              <p className="text-[11px] text-amber-900 dark:text-amber-200/90 leading-tight">
                {currentMeta.advice}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
