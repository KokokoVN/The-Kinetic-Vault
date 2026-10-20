"use client";

import { useEffect, useMemo, useState } from "react";
import { getVnProvinces, getVnWards } from "@/lib/profile-api";
import type { UserAddress } from "@/lib/profile-api";

type Props = {
  initial?: Partial<UserAddress>;
  onSubmit: (payload: Partial<UserAddress>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
};

export function AddressForm({ initial, onSubmit, onCancel, loading }: Props) {
  const [recipientName, setRecipientName] = useState(initial?.recipientName ?? "");
  const [phoneNumber, setPhoneNumber] = useState(initial?.phoneNumber ?? "");

  const [provincesList, setProvincesList] = useState<any[]>([]);
  const [wardsList, setWardsList] = useState<any[]>([]);

  const [provinceCode, setProvinceCode] = useState(initial?.provinceCode ?? "");
  const [provinceName, setProvinceName] = useState(initial?.provinceName ?? "");
  const [wardCode, setWardCode] = useState(initial?.wardCode ?? "");
  const [wardName, setWardName] = useState(initial?.wardName ?? "");

  const [streetLine, setStreetLine] = useState(initial?.streetLine ?? "");
  const [fullAddress, setFullAddress] = useState(initial?.fullAddress ?? "");
  const [isDefault, setIsDefault] = useState(Boolean(initial?.isDefault));
  const [message, setMessage] = useState("");

  // Fetch provinces on mount
  useEffect(() => {
    async function loadProvinces() {
      const pList = await getVnProvinces();
      setProvincesList(pList);
      
      let matchedProv = null;
      if (initial?.provinceCode) {
        matchedProv = pList.find((p: any) => String(p.code) === String(initial.provinceCode));
      } else if (initial?.provinceName) {
        matchedProv = pList.find((p: any) => p.name === initial.provinceName);
      }
      
      const activeProv = matchedProv || pList[0];
      if (activeProv) {
        setProvinceCode(String(activeProv.code));
        setProvinceName(activeProv.name);
      }
    }
    loadProvinces();
  }, [initial]);

  // Fetch wards whenever provinceCode changes
  useEffect(() => {
    if (!provinceCode) return;
    async function loadWards() {
      const wList = await getVnWards(provinceCode);
      setWardsList(wList);
      
      let isInitialProv = false;
      if (initial?.provinceCode) {
        isInitialProv = String(initial.provinceCode) === provinceCode;
      } else if (initial?.provinceName) {
        const prov = provincesList.find((p: any) => p.name === initial.provinceName);
        isInitialProv = prov && String(prov.code) === provinceCode;
      }
      
      let matchedWard = null;
      if (isInitialProv) {
        if (initial?.wardCode) {
          matchedWard = wList.find((w: any) => String(w.code) === String(initial.wardCode));
        } else if (initial?.wardName) {
          matchedWard = wList.find((w: any) => w.name === initial.wardName);
        }
      }
      
      const activeWard = matchedWard || wList[0];
      if (activeWard) {
        setWardCode(String(activeWard.code));
        setWardName(activeWard.name);
      } else {
        setWardCode("");
        setWardName("");
      }
    }
    loadWards();
  }, [provinceCode, initial, provincesList]);

  const computedFullAddress = useMemo(
    () => fullAddress.trim() || [streetLine, wardName, provinceName].filter(Boolean).join(", "),
    [fullAddress, streetLine, wardName, provinceName],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!recipientName.trim()) return setMessage("Vui lòng nhập tên người nhận");
    if (!phoneNumber.trim()) return setMessage("Vui lòng nhập số điện thoại");
    if (!provinceName.trim()) return setMessage("Vui lòng chọn tỉnh/thành");
    if (!wardName.trim()) return setMessage("Vui lòng chọn phường/xã");
    if (!streetLine.trim() && !fullAddress.trim()) return setMessage("Vui lòng nhập địa chỉ chi tiết");

    await onSubmit({
      recipientName: recipientName.trim(),
      phoneNumber: phoneNumber.trim(),
      provinceCode,
      provinceName,
      wardCode,
      wardName,
      streetLine: streetLine.trim(),
      fullAddress: computedFullAddress,
      isDefault,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Tên người nhận</label>
          <input
            className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/90 px-4 py-3 text-sm text-zinc-100 outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 shadow-inner"
            placeholder="VD: Nguyễn Văn A"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Số điện thoại liên hệ</label>
          <input
            className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/90 px-4 py-3 text-sm text-zinc-100 outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 shadow-inner"
            placeholder="VD: 0901234567"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Tỉnh / Thành phố</label>
          <div className="relative">
            <select
              className="w-full appearance-none rounded-xl border border-zinc-700/80 bg-zinc-900/90 px-4 py-3 text-sm text-zinc-100 outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 cursor-pointer pr-10"
              value={provinceCode}
              onChange={(e) => {
                const selectedCode = e.target.value;
                setProvinceCode(selectedCode);
                const prov = provincesList.find((p: any) => String(p.code) === selectedCode);
                if (prov) {
                  setProvinceName(prov.name);
                }
              }}
            >
              <option value="" disabled className="bg-zinc-900 text-zinc-400">-- Chọn Tỉnh / Thành phố --</option>
              {provincesList.map((p) => <option key={p.code} value={p.code} className="bg-zinc-900 text-white">{p.name}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 text-lg">expand_more</span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Phường / Xã</label>
          <div className="relative">
            <select
              className="w-full appearance-none rounded-xl border border-zinc-700/80 bg-zinc-900/90 px-4 py-3 text-sm text-zinc-100 outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed pr-10"
              value={wardCode}
              disabled={!provinceCode}
              onChange={(e) => {
                const selectedCode = e.target.value;
                setWardCode(selectedCode);
                const ward = wardsList.find((w: any) => String(w.code) === selectedCode);
                if (ward) {
                  setWardName(ward.name);
                }
              }}
            >
              <option value="" disabled className="bg-zinc-900 text-zinc-400">-- Chọn Phường / Xã --</option>
              {wardsList.map((w) => <option key={w.code} value={w.code} className="bg-zinc-900 text-white">{w.name}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 text-lg">expand_more</span>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Số nhà, Tên đường</label>
        <input
          className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/90 px-4 py-3 text-sm text-zinc-100 outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 shadow-inner"
          placeholder="VD: 123 Đường Lê Lợi, Tòa nhà A..."
          value={streetLine}
          onChange={(e) => setStreetLine(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Địa chỉ chi tiết đầy đủ (Tùy chọn)</label>
        <textarea
          className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/90 px-4 py-3 text-sm text-zinc-100 outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 shadow-inner resize-none"
          rows={2}
          placeholder="Tự động ghép tên đường, phường/xã, tỉnh/thành nếu để trống"
          value={fullAddress}
          onChange={(e) => setFullAddress(e.target.value)}
        />
      </div>

      <label className="group flex w-max items-center gap-3 cursor-pointer p-2 rounded-xl transition hover:bg-white/5">
        <div className="relative flex items-center justify-center">
          <input type="checkbox" className="peer sr-only" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
          <div className="h-5 w-5 rounded-md border border-zinc-600 bg-zinc-900 transition-all peer-checked:border-cyan-400 peer-checked:bg-cyan-500"></div>
          <span className="material-symbols-outlined absolute text-zinc-950 opacity-0 transition-opacity peer-checked:opacity-100 text-sm font-black pointer-events-none">check</span>
        </div>
        <span className="text-xs font-bold text-zinc-300 group-hover:text-cyan-300">Đặt làm địa chỉ giao hàng mặc định</span>
      </label>

      {message && (
        <div className="rounded-xl bg-red-950/40 border border-red-500/40 p-3 flex items-center gap-2 text-xs font-bold text-red-300 animate-in fade-in duration-300">
          <span className="material-symbols-outlined text-base">error</span>
          <span>{message}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-3">
        <button
          type="submit"
          disabled={loading}
          className="group relative flex-1 flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:via-indigo-500 hover:to-indigo-600 disabled:opacity-50 disabled:shadow-none"
        >
          {loading ? (
            <span className="material-symbols-outlined animate-spin text-lg">sync</span>
          ) : (
            <span className="material-symbols-outlined text-lg transition-transform group-hover:scale-110">save</span>
          )}
          <span>{loading ? "Đang lưu..." : "Lưu địa chỉ"}</span>
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
        >
          Hủy bỏ
        </button>
      </div>
    </form>
  );
}

