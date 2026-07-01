"use client";

type Props = {
  d1?: string;
  d2?: string;
  d3?: string;
  d4?: string;
};

function onlyDigit(value: string): string {
  return value.replace(/\D/g, "").slice(0, 1);
}

export function PhoneLast4Inputs({ d1 = "", d2 = "", d3 = "", d4 = "" }: Props) {
  const handleInput = (idx: number, e: React.FormEvent<HTMLInputElement>) => {
    const current = e.currentTarget;
    current.value = onlyDigit(current.value);
    if (!current.value) return;
    const container = current.closest("[data-phone-last4]");
    if (!container) return;
    const next = container.querySelector<HTMLInputElement>(`input[data-digit-index="${idx + 1}"]`);
    next?.focus();
    next?.select();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const current = e.currentTarget;
    const container = current.closest("[data-phone-last4]");
    if (!container) return;

    if (e.key === "Backspace" && !current.value && idx > 1) {
      const prev = container.querySelector<HTMLInputElement>(`input[data-digit-index="${idx - 1}"]`);
      prev?.focus();
      prev?.select();
      return;
    }
    if (e.key === "ArrowLeft" && idx > 1) {
      e.preventDefault();
      const prev = container.querySelector<HTMLInputElement>(`input[data-digit-index="${idx - 1}"]`);
      prev?.focus();
      return;
    }
    if (e.key === "ArrowRight" && idx < 4) {
      e.preventDefault();
      const next = container.querySelector<HTMLInputElement>(`input[data-digit-index="${idx + 1}"]`);
      next?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;
    e.preventDefault();
    const container = e.currentTarget;
    for (let i = 0; i < 4; i += 1) {
      const input = container.querySelector<HTMLInputElement>(`input[data-digit-index="${i + 1}"]`);
      if (input) {
        input.value = pasted[i] ?? "";
      }
    }
    const focusIndex = Math.min(pasted.length + 1, 4);
    container.querySelector<HTMLInputElement>(`input[data-digit-index="${focusIndex}"]`)?.focus();
  };

  return (
    <div data-phone-last4 className="flex items-center justify-center gap-3" onPaste={handlePaste}>
      <input
        name="d1"
        defaultValue={d1}
        data-digit-index="1"
        maxLength={1}
        inputMode="numeric"
        pattern="[0-9]"
        required
        onInput={(e) => handleInput(1, e)}
        onKeyDown={(e) => handleKeyDown(1, e)}
        className="h-14 w-12 rounded-xl border border-outline-variant/20 bg-surface-container-low text-center text-xl font-black text-primary outline-none focus:border-secondary"
      />
      <input
        name="d2"
        defaultValue={d2}
        data-digit-index="2"
        maxLength={1}
        inputMode="numeric"
        pattern="[0-9]"
        required
        onInput={(e) => handleInput(2, e)}
        onKeyDown={(e) => handleKeyDown(2, e)}
        className="h-14 w-12 rounded-xl border border-outline-variant/20 bg-surface-container-low text-center text-xl font-black text-primary outline-none focus:border-secondary"
      />
      <input
        name="d3"
        defaultValue={d3}
        data-digit-index="3"
        maxLength={1}
        inputMode="numeric"
        pattern="[0-9]"
        required
        onInput={(e) => handleInput(3, e)}
        onKeyDown={(e) => handleKeyDown(3, e)}
        className="h-14 w-12 rounded-xl border border-outline-variant/20 bg-surface-container-low text-center text-xl font-black text-primary outline-none focus:border-secondary"
      />
      <input
        name="d4"
        defaultValue={d4}
        data-digit-index="4"
        maxLength={1}
        inputMode="numeric"
        pattern="[0-9]"
        required
        onInput={(e) => handleInput(4, e)}
        onKeyDown={(e) => handleKeyDown(4, e)}
        className="h-14 w-12 rounded-xl border border-outline-variant/20 bg-surface-container-low text-center text-xl font-black text-primary outline-none focus:border-secondary"
      />
    </div>
  );
}
