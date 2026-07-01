"use client";

import { executeActivityRestore } from "@/lib/activity-restore-actions";
import type { RestoreButtonSpec } from "@/lib/activity-restore-logic";

export function ActivityLogRestoreForms({
  logId,
  buttons,
}: {
  logId: number;
  buttons: RestoreButtonSpec[];
}) {
  if (buttons.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {buttons.map((b) => (
        <form key={b.intent} action={executeActivityRestore.bind(null, logId, b.intent)}>
          <button
            type="submit"
            className={
              b.variant === "primary"
                ? "rounded-xl bg-kinetic px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:brightness-110"
                : "rounded-xl border border-outline-variant/40 bg-surface-container-high px-5 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-surface-container-highest"
            }
          >
            {b.label}
          </button>
        </form>
      ))}
    </div>
  );
}
