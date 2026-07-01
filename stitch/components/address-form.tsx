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
      
      // Determine if we are loading the initial ward for the initial province
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-black bg-gradient-to-r from-blue-900 to-indigo-700 bg-clip-text text-transparent">
          {initial ? "Cập nhật địa chỉ" : "Thêm địa chỉ giao hàng"}
        </h2>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Vui lòng điền đầy đủ thông tin để việc giao hàng diễn ra thuận lợi nhất.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">Người nhận</label>
          <input className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-5 py-3.5 font-medium text-slate-900 transition-all hover:border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10" placeholder="Tên người nhận" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">Số điện thoại</label>
          <input className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-5 py-3.5 font-medium text-slate-900 transition-all hover:border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10" placeholder="Số điện thoại liên lạc" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">Tỉnh / Thành phố</label>
          <div className="relative">
            <select
              className="w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-5 py-3.5 font-medium text-slate-900 transition-all hover:border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer"
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
              <option value="" disabled>-- Chọn Tỉnh / Thành phố --</option>
              {provincesList.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">Phường / Xã</label>
          <div className="relative">
            <select
              className="w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-5 py-3.5 font-medium text-slate-900 transition-all hover:border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
              <option value="" disabled>-- Chọn Phường / Xã --</option>
              {wardsList.map((w) => <option key={w.code} value={w.code}>{w.name}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">Số nhà, Tên đường</label>
        <input className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-5 py-3.5 font-medium text-slate-900 transition-all hover:border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10" placeholder="VD: 123 Đường Lê Lợi, Tòa nhà A..." value={streetLine} onChange={(e) => setStreetLine(e.target.value)} />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">Địa chỉ đầy đủ (Tùy chọn)</label>
        <textarea className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-5 py-3.5 font-medium text-slate-900 transition-all hover:border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 resize-none" rows={2} placeholder="Sẽ tự động tạo nếu để trống" value={fullAddress} onChange={(e) => setFullAddress(e.target.value)} />
      </div>

      <label className="group flex w-max items-center gap-3 cursor-pointer p-2 rounded-xl transition hover:bg-slate-50">
        <div className="relative flex items-center justify-center">
          <input type="checkbox" className="peer sr-only" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
          <div className="h-6 w-6 rounded-lg border-2 border-slate-300 bg-white transition-all peer-checked:border-blue-600 peer-checked:bg-blue-600"></div>
          <span className="material-symbols-outlined absolute text-white opacity-0 transition-opacity peer-checked:opacity-100 text-[16px] pointer-events-none">check</span>
        </div>
        <span className="text-sm font-bold text-slate-700 group-hover:text-blue-900">Đặt làm địa chỉ mặc định</span>
      </label>

      {message && (
        <div className="rounded-2xl bg-rose-50 p-4 border border-rose-100 flex items-start gap-3 text-rose-700 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <span className="material-symbols-outlined text-rose-500 shrink-0">error</span>
          <p className="text-sm font-bold mt-0.5">{message}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" disabled={loading} className="flex-1 min-w-[200px] rounded-2xl bg-blue-600 px-6 py-4 text-sm font-extrabold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2">
          {loading ? (
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined">save</span>
          )}
          {loading ? "Đang lưu..." : "Lưu địa chỉ"}
        </button>
        <button type="button" onClick={onCancel} disabled={loading} className="flex-1 min-w-[140px] rounded-2xl border-2 border-slate-200 bg-white px-6 py-4 text-sm font-extrabold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 flex items-center justify-center gap-2">
          Hủy bỏ
        </button>
      </div>
    </form>
  );
}
