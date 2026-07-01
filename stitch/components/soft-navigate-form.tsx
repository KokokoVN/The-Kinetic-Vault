"use client";

import { useRouter } from "next/navigation";

type Props = React.FormHTMLAttributes<HTMLFormElement> & {
  actionPath: string;
  replace?: boolean;
};

function normalizeActionPath(path: string): string {
  const v = String(path ?? "").trim();
  if (!v) return "/";
  return v.startsWith("/") ? v : `/${v}`;
}

export function SoftNavigateForm({ actionPath, replace = true, onSubmit, children, ...rest }: Props) {
  const router = useRouter();
  const base = normalizeActionPath(actionPath);

  return (
    <form
      {...rest}
      action={base}
      method="GET"
      onSubmit={(e) => {
        onSubmit?.(e);
        if (e.defaultPrevented) return;
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        const qp = new URLSearchParams();
        for (const [k, v] of fd.entries()) {
          const key = String(k ?? "").trim();
          if (!key) continue;
          const value = String(v ?? "").trim();
          if (!value) continue;
          qp.set(key, value);
        }
        const href = qp.toString() ? `${base}?${qp.toString()}` : base;
        if (replace) router.replace(href);
        else router.push(href);
      }}
    >
      {children}
    </form>
  );
}

