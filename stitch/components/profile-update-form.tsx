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
    <form onSubmit={submitAction} className="space-y-5 rounded-3xl border border-outline-variant/10 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Update profile</p>
          <h2 className="mt-1 text-xl font-black text-blue-950">Cập nhật thông tin</h2>
        </div>
        <span className="material-symbols-outlined text-3xl text-blue-600">edit</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="firstName" label="Tên" value={form.firstName} onChange={(v) => onChange("firstName", v)} onBlur={() => onBlur("firstName")} error={errors.firstName} />
        <Field name="lastName" label="Họ" value={form.lastName} onChange={(v) => onChange("lastName", v)} onBlur={() => onBlur("lastName")} error={errors.lastName} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="phoneNumber" label="Số điện thoại" value={form.phoneNumber} onChange={(v) => onChange("phoneNumber", v)} onBlur={() => onBlur("phoneNumber")} error={errors.phoneNumber} />
        <Field name="birthDate" label="Ngày sinh" value={form.birthDate} onChange={(v) => onChange("birthDate", v)} onBlur={() => onBlur("birthDate")} type="date" error={errors.birthDate} />
      </div>
      <div>
        <label className="mb-2 block text-sm font-bold text-blue-900" htmlFor="gender">Giới tính</label>
        <select id="gender" name="gender" value={form.gender} onChange={(e) => onChange("gender", e.target.value)} className="w-full rounded-2xl border border-outline-variant/20 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20">
          <option value="">—</option>
          <option value="male">Nam</option>
          <option value="female">Nữ</option>
          <option value="other">Khác</option>
        </select>
      </div>

      <button type="submit" className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/10 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60" disabled={!isValid}>
        Lưu thay đổi
      </button>
    </form>
  );
}

function Field({ name, label, value, onChange, onBlur, type = "text", error }: { name: string; label: string; value: string; onChange: (value: string) => void; onBlur: () => void; type?: string; error?: string }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-blue-900" htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 ${error ? "border-rose-400 bg-rose-50 focus:border-rose-500 focus:ring-rose-200" : "border-outline-variant/20 bg-slate-50 focus:border-primary focus:bg-white focus:ring-primary/20"}`}
      />
      {error ? <p className="mt-1 text-xs font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}
