"use client";

import * as React from "react";

type ActionButton = {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary";
};

function ButtonRow({ buttons }: { buttons: ActionButton[] }) {
  return (
    <div className="w-full space-y-3.5">
      {buttons.map((b, idx) => {
        const cls =
          b.variant === "secondary"
            ? "flex h-12 w-full items-center justify-center rounded-2xl bg-surface-container-high px-6 text-base font-semibold leading-none text-primary transition-colors hover:bg-surface-container-highest active:scale-[0.98]"
            : "flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-container px-6 text-base font-bold leading-none text-on-primary shadow-lg shadow-primary/20 transition-all duration-300 hover:brightness-110 active:scale-[0.98]";

        if (b.href) {
          return (
            <a key={`${b.label}-${idx}`} href={b.href} className={cls}>
              {b.label}
            </a>
          );
        }
        return (
          <button key={`${b.label}-${idx}`} type="button" onClick={b.onClick} className={cls}>
            {b.label}
          </button>
        );
      })}
    </div>
  );
}

export type ActionResultModalProps = {
  open: boolean;
  variant: "success" | "error";
  title: string;
  message: string;
  /** Mặc định đóng modal khi click overlay. */
  closeOnOverlayClick?: boolean;
  /** Transaction ID / mã tham chiếu (tuỳ chọn). */
  metaText?: string;
  /** Nút hành động. Nếu không truyền sẽ có nút "Đóng". */
  buttons?: ActionButton[];
  onClose: () => void;
};

export function ActionResultModal({
  open,
  variant,
  title,
  message,
  closeOnOverlayClick = true,
  metaText,
  buttons,
  onClose,
}: ActionResultModalProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const isSuccess = variant === "success";
  const icon = isSuccess ? "check_circle" : "error";
  const glowClass = isSuccess ? "bg-secondary-container" : "bg-error-container";
  const ringClass = isSuccess ? "border-secondary-container" : "border-error-container";
  const iconClass = isSuccess ? "text-secondary" : "text-error";
  const dotClass = isSuccess ? "bg-secondary" : "bg-error";
  const footerIcon = isSuccess ? "verified_user" : "report";

  const actionButtons: ActionButton[] =
    buttons && buttons.length > 0
      ? buttons
      : [
          {
            label: "Đóng",
            onClick: onClose,
            variant: "secondary",
          },
        ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/35 backdrop-blur-sm p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={() => {
        if (closeOnOverlayClick) onClose();
      }}
    >
      <div
        className="relative flex w-full max-w-xl flex-col items-center overflow-hidden rounded-[1.75rem] bg-surface-container-lowest p-8 text-center shadow-[0_48px_80px_-12px_rgba(0,49,128,0.18)] sm:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative mb-9">
          <div className={`absolute inset-0 ${glowClass} scale-150 rounded-full blur-3xl opacity-40`} />
          <div
            className={`relative flex h-28 w-28 items-center justify-center rounded-full bg-surface-container-lowest shadow-inner border-4 ${ringClass}`}
          >
            <span
              className={`material-symbols-outlined ${iconClass} text-6xl`}
              style={{ fontVariationSettings: "'FILL' 1" } as React.CSSProperties}
            >
              {icon}
            </span>
          </div>
          <div className={`absolute -top-2 -right-2 h-4 w-4 rounded-full border-2 border-white ${dotClass}`} />
          <div className={`absolute bottom-4 -left-6 h-2 w-2 rounded-full ${dotClass} opacity-40`} />
        </div>

        <h2 className="mb-3 font-headline text-4xl font-black tracking-tight text-primary">{title}</h2>
        <p className="mb-10 px-2 text-base leading-relaxed text-on-surface-variant sm:px-4 sm:text-lg">{message}</p>

        <ButtonRow buttons={actionButtons} />

        {(metaText && metaText.trim()) ? (
          <div className="mt-8 w-full border-t border-outline-variant/10 pt-6">
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
              <span className="material-symbols-outlined text-[14px]">{footerIcon}</span>
              {metaText}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function SuccessModal(props: Omit<ActionResultModalProps, "variant">) {
  return <ActionResultModal {...props} variant="success" />;
}

export function ErrorModal(props: Omit<ActionResultModalProps, "variant">) {
  return <ActionResultModal {...props} variant="error" />;
}

