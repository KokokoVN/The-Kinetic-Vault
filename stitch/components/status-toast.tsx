"use client";

import { FloatingNotice } from "./floating-notice";

export type Tone = "success" | "error" | "warning" | "info";

export type StatusToastProps = {
  tone: Tone;
  title?: string;
  message: string;
  duration?: number;
};

/**
 * StatusToast - Unified with FloatingNotice (login-style top-right notification).
 */
export function StatusToast({
  tone,
  title,
  message,
  duration = 4500,
}: StatusToastProps) {
  return (
    <FloatingNotice
      message={message}
      variant={tone}
      title={title}
      duration={duration}
    />
  );
}
