"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

export type ProfileUpdateAction = (formData: FormData) => void | Promise<void>;

export function ProfileUpdateForm({
  action,
  initial,
}: {
  action: ProfileUpdateAction;
  initial: {
    firstName?: string | null;
    lastName?: string | null;
    phoneNumber?: string | null;
    gender?: string | null;
    birthDate?: string | null;
  };
}) {
  const [form, setForm] = useState({
    firstName: initial.firstName ?? "",
    lastName: initial.lastName ?? "",
    phoneNumber: initial.phoneNumber ?? "",
    gender: initial.gender ?? "",
    birthDate: initial.birthDate ?? "",
  });
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; phoneNumber?: string; birthDate?: string }>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setForm({
      firstName: initial.firstName ?? "",
      lastName: initial.lastName ?? "",
      phoneNumber: initial.phoneNumber ?? "",
      gender: initial.gender ?? "",
      birthDate: initial.birthDate ?? "",
    });
  }, [initial.firstName, initial.lastName, initial.phoneNumber, initial.gender, initial.birthDate]);

  const isValid = useMemo(() => Object.values(errors).every((v) => !v), [errors]);

  function validate(next = form) {
    const nextErrors: typeof errors = {};
    const namePattern = /^[A-Za-zÀ-ỹ\s'-]+$/u;
    if (!next.firstName.trim() || !namePattern.test(next.firstName.trim())) nextErrors.firstName = "Tên chỉ được chứa chữ, không chứa số/ký tự đặc biệt";
    if (!next.lastName.trim() || !namePattern.test(next.lastName.trim())) nextErrors.lastName = "Họ chỉ được chứa chữ, không chứa số/ký tự đặc biệt";
    const phoneDigits = next.phoneNumber.replace(/\D/g, "");
    if (!phoneDigits || phoneDigits.length > 10) nextErrors.phoneNumber = "Số điện thoại tối đa 10 số";
    if (next.birthDate) {
      const dob = new Date(next.birthDate);
      if (Number.isNaN(dob.getTime())) {
        nextErrors.birthDate = "Ngày sinh không hợp lệ";
      } else {
        const ageMs = Date.now() - dob.getTime();
        const age = new Date(ageMs).getUTCFullYear() - 1970;
        if (age < 18) nextErrors.birthDate = "Bạn phải đủ 18 tuổi";
      }
    }
    setErrors(nextErrors);
    return nextErrors;
  }

  function onBlur(field: keyof typeof form) {
    setTouched((t) => ({ ...t, [field]: true }));
    validate(form);
  }

  function onChange(field: keyof typeof form, value: string) {
    const next = { ...form, [field]: value };
    setForm(next);
    if (touched[field]) validate(next);
  }

  async function submitAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(form);
    if (Object.values(nextErrors).some(Boolean)) return;

    const formData = new FormData();
    formData.set("firstName", form.firstName.trim());
    formData.set("lastName", form.lastName.trim());
    formData.set("phoneNumber", form.phoneNumber.trim());
    formData.set("gender", form.gender.trim());
    formData.set("birthDate", form.birthDate.trim());
    await action(formData);
  }

  return (
    <form onSubmit={submitAction} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="firstName" label="Tên" value={form.firstName} onChange={(v) => onChange("firstName", v)} onBlur={() => onBlur("firstName")} error={errors.firstName} placeholder="Nhập tên..." />
        <Field name="lastName" label="Họ" value={form.lastName} onChange={(v) => onChange("lastName", v)} onBlur={() => onBlur("lastName")} error={errors.lastName} placeholder="Nhập họ..." />
      </div>
      
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="phoneNumber" label="Số điện thoại" value={form.phoneNumber} onChange={(v) => onChange("phoneNumber", v)} onBlur={() => onBlur("phoneNumber")} error={errors.phoneNumber} placeholder="0901234567" />
        <Field name="birthDate" label="Ngày sinh" value={form.birthDate} onChange={(v) => onChange("birthDate", v)} onBlur={() => onBlur("birthDate")} type="date" error={errors.birthDate} />
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-300" htmlFor="gender">Giới tính</label>
        <select
          id="gender"
          name="gender"
          value={form.gender}
          onChange={(e) => onChange("gender", e.target.value)}
          className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/90 px-4 py-3 text-sm text-zinc-100 outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
        >
          <option value="" className="bg-zinc-900 text-zinc-400">— Chọn giới tính —</option>
          <option value="male" className="bg-zinc-900 text-white">Nam</option>
          <option value="female" className="bg-zinc-900 text-white">Nữ</option>
          <option value="other" className="bg-zinc-900 text-white">Khác</option>
        </select>
      </div>

      <div className="pt-3">
        <button
          type="submit"
          disabled={!isValid}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:via-indigo-500 hover:to-indigo-600 disabled:opacity-50 disabled:shadow-none"
        >
          <span>Lưu thông tin thay đổi</span>
          <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">
            save
          </span>
        </button>
      </div>
    </form>
  );
}

function Field({ name, label, value, onChange, onBlur, type = "text", error, placeholder }: { name: string; label: string; value: string; onChange: (value: string) => void; onBlur: () => void; type?: string; error?: string; placeholder?: string }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-300" htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`w-full rounded-xl border px-4 py-3 text-sm text-zinc-100 outline-none transition-all shadow-inner ${
          error
            ? "border-red-500/80 bg-red-950/20 text-red-200 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
            : "border-zinc-700/80 bg-zinc-900/90 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
        }`}
      />
      {error ? <p className="mt-1.5 text-xs font-semibold text-red-400 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{error}</p> : null}
    </div>
  );
}

