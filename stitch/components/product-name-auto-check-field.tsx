"use client";

import { useEffect, useRef, useState } from "react";

type CheckState = "idle" | "checking" | "exists" | "available" | "error";

export function ProductNameAutoCheckField(props: { defaultValue?: string; excludeId?: number; label?: string }) {
  const [value, setValue] = useState(props.defaultValue ?? "");
  const [state, setState] = useState<CheckState>("idle");
  const [message, setMessage] = useState("");
  const seqRef = useRef(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const applyValidity = (nextState: CheckState) => {
    const el = inputRef.current;
    if (!el) return;
    if (nextState === "exists") {
      el.setCustomValidity("Tên sản phẩm đã tồn tại.");
      return;
    }
    el.setCustomValidity("");
  };

  const checkName = async (rawName: string) => {
    const name = rawName.trim();
    if (!name) {
      setState("idle");
      setMessage("");
      applyValidity("idle");
      return;
    }

    const seq = ++seqRef.current;
    setState("checking");
    setMessage("Đang kiểm tra tên sản phẩm...");
    try {
      const p = new URLSearchParams();
      p.set("name", name);
      if (props.excludeId && props.excludeId > 0) {
        p.set("excludeId", String(props.excludeId));
      }
      const url = `/api/catalog/products/check-name?${p.toString()}`;
      const res = await fetch(url, { cache: "no-store" });
      if (seq !== seqRef.current) return;
      if (!res.ok) {
        setState("error");
        setMessage("Không kiểm tra được tên lúc này, bạn có thể thử lại.");
        applyValidity("error");
        return;
      }
      const data = (await res.json().catch(() => ({ exists: false }))) as { exists?: boolean };
      const exists = Boolean(data?.exists);
      if (exists) {
        setState("exists");
        setMessage("Tên sản phẩm đã tồn tại, vui lòng chọn tên khác.");
        applyValidity("exists");
      } else {
        setState("available");
        setMessage("Tên sản phẩm có thể sử dụng.");
        applyValidity("available");
      }
    } catch {
      if (seq !== seqRef.current) return;
      setState("error");
      setMessage("Không kiểm tra được tên lúc này, bạn có thể thử lại.");
      applyValidity("error");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void checkName(value);
    }, 5000);
    return () => clearTimeout(timer);
  }, [value]);

  const statusClass =
    state === "exists"
      ? "border-rose-300 bg-rose-50/40 focus:border-rose-400 focus:ring-rose-200"
      : state === "available"
        ? "border-emerald-300 bg-emerald-50/30 focus:border-emerald-400 focus:ring-emerald-200"
        : "border-outline-variant/20 bg-surface-container-lowest focus:border-secondary focus:ring-secondary/10";

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">{props.label ?? "Tên sản phẩm"}</label>
      <input
        ref={inputRef}
        name="productName"
        className={`w-full rounded-xl border px-4 py-3.5 text-base outline-none transition-all focus:ring-2 ${statusClass}`}
        placeholder="Ví dụ: Quantum Shift X1"
        type="text"
        required
        defaultValue={props.defaultValue}
        onChange={(e) => {
          setValue(e.target.value);
          setState("idle");
          setMessage("");
          applyValidity("idle");
        }}
        onBlur={(e) => {
          void checkName(e.target.value);
        }}
      />
      {state !== "idle" && (
        <p
          className={`inline-flex min-h-6 items-center rounded-lg px-2 py-1 text-sm font-medium ${
            state === "exists"
              ? "bg-rose-50 text-rose-700"
              : state === "available"
                ? "bg-emerald-50 text-emerald-700"
                : state === "checking"
                  ? "bg-slate-100 text-on-surface-variant"
                  : "bg-amber-50 text-amber-700"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
