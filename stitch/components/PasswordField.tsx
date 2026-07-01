"use client";

import { useState } from "react";

type Props = {
  name?: string;
};

export function PasswordField({ name = "password" }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="group relative">
      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline transition-colors group-focus-within:text-secondary">
        key
      </span>
      <input
        name={name}
        className="w-full rounded-xl border-2 border-outline-variant/20 bg-surface-container-lowest py-4 pl-12 pr-12 outline-none transition-all focus:border-secondary"
        placeholder="••••••••"
        type={visible ? "text" : "password"}
        required
      />
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 text-outline transition-colors hover:text-on-surface"
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
      >
        <span className="material-symbols-outlined">{visible ? "visibility_off" : "visibility"}</span>
      </button>
    </div>
  );
}
