"use client";

import * as React from "react";

type KineticOption = {
  value: string;
  label: string;
  group?: string;
};

export function KineticSelect({
  name,
  value,
  options,
  placeholder,
  disabled,
  required,
}: {
  name: string;
  value?: string | null;
  options: KineticOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(String(value ?? ""));
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const hiddenRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setSelectedValue(String(value ?? ""));
  }, [value]);

  const selected = options.find((o) => o.value === selectedValue) ?? null;

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const grouped = React.useMemo(() => {
    const map = new Map<string, KineticOption[]>();
    for (const opt of options) {
      const key = opt.group?.trim() || "";
      const arr = map.get(key) ?? [];
      arr.push(opt);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [options]);

  return (
    <div ref={rootRef} className="relative">
      <input ref={hiddenRef} type="hidden" name={name} value={selectedValue} readOnly />

      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (disabled) return;
          setOpen((v) => !v);
        }}
        className={[
          "group w-full",
          "h-14 bg-surface-container-lowest flex items-center justify-between px-5 rounded-xl",
          open ? "outline outline-2 outline-secondary shadow-lg shadow-secondary/10" : "outline outline-2 outline-outline-variant/20",
          "cursor-pointer transition-all",
          "hover:bg-surface-bright",
          "disabled:cursor-not-allowed disabled:opacity-60",
        ].join(" ")}
      >
        <span className={selected ? "text-on-surface font-bold" : "text-on-surface-variant font-medium"}>
          {selected?.label ?? placeholder ?? "Chọn..."}
        </span>
        <span className={["material-symbols-outlined text-secondary transition-transform", open ? "rotate-180" : "", "group-hover:translate-y-1"].join(" ")}>
          expand_more
        </span>
      </button>

      {required ? (
        <input
          tabIndex={-1}
          aria-hidden="true"
          style={{ position: "absolute", opacity: 0, pointerEvents: "none", height: 0, width: 0 }}
          value={selectedValue}
          required
          readOnly
        />
      ) : null}

      {open ? (
        <div className="absolute left-0 top-[82px] z-50 w-full overflow-hidden rounded-xl border border-white/40 bg-white/85 shadow-2xl shadow-primary/20 backdrop-blur-[20px]">
          <div className="p-2">
            {grouped.map(([group, opts]) => (
              <div key={group || "__"} className="space-y-1">
                {group ? (
                  <div className="px-4 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{group}</p>
                  </div>
                ) : null}
                {opts.map((opt) => {
                  const isActive = opt.value === selectedValue;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={[
                        "flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors",
                        isActive ? "bg-primary/5 border-l-2 border-primary" : "hover:bg-primary/10",
                      ].join(" ")}
                      onClick={() => {
                        setOpen(false);
                        setSelectedValue(opt.value);
                      }}
                    >
                      <span className={isActive ? "text-sm font-bold text-primary" : "text-sm font-semibold text-on-surface"}>
                        {opt.label}
                      </span>
                      {isActive ? (
                        <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" } as React.CSSProperties}>
                          check
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

