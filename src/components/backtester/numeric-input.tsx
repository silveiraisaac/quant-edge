"use client";

import { useState } from "react";

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** How many decimal places are allowed while typing. 0 = integers only. */
  decimals?: number;
  allowNegative?: boolean;
  disabled?: boolean;
}

/**
 * Generic numeric input for percentages, periods, quantities, and other
 * non-currency numeric fields. Shares CurrencyInput's core fix — a local,
 * freely-editable raw string while focused, with no per-keystroke
 * coercion back through the numeric value prop — so clearing the field
 * and retyping never produces artifacts like "050" (the same bug that
 * affected the capital field). Unlike CurrencyInput, this never applies
 * Indian digit grouping, since periods/percentages/quantities aren't
 * currency amounts.
 */
export function NumericInput({
  value,
  onChange,
  min,
  max,
  decimals = 0,
  allowNegative = false,
  disabled = false,
}: Props) {
  // null = not editing; display the committed `value` prop.
  // string = user is actively typing; this is the source of truth.
  const [editingText, setEditingText] = useState<string | null>(null);

  const displayValue = editingText !== null ? editingText : String(value);

  function handleFocus() {
    setEditingText(value === 0 ? "" : String(value));
  }

  function sanitize(raw: string): string {
    // Build the allowed character set for this field's configuration and
    // strip anything else — but never coerce the *value*, only filter
    // characters, so partial input like "-" or "1." can exist mid-edit.
    let allowedChars = allowNegative ? raw.replace(/[^\d.-]/g, "") : raw.replace(/[^\d.]/g, "");
    if (decimals === 0) allowedChars = allowedChars.replace(/\./g, "");

    // At most one leading "-"
    const negative = allowNegative && allowedChars.startsWith("-");
    allowedChars = allowedChars.replace(/-/g, "");
    // At most one "."
    const firstDot = allowedChars.indexOf(".");
    if (firstDot !== -1) {
      allowedChars =
        allowedChars.slice(0, firstDot + 1) + allowedChars.slice(firstDot + 1).replace(/\./g, "");
    }

    return (negative ? "-" : "") + allowedChars;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const cleaned = sanitize(e.target.value);
    setEditingText(cleaned);

    // Bare sign/decimal-point ("-", ".", "-.") isn't a number yet — let the
    // user keep typing without pushing NaN into the engine's settings.
    if (cleaned === "" || cleaned === "-" || cleaned === ".") return;
    const parsed = Number(cleaned);
    if (!Number.isNaN(parsed)) onChange(parsed);
  }

  function handleBlur() {
    const parsed = editingText === null || editingText === "" ? value : Number(editingText);
    let safe = Number.isNaN(parsed) ? value : parsed;
    if (min !== undefined) safe = Math.max(safe, min);
    if (max !== undefined) safe = Math.min(safe, max);
    onChange(safe);
    setEditingText(null);
  }

  return (
    <input
      type="text"
      inputMode={decimals > 0 ? "decimal" : "numeric"}
      value={displayValue}
      onFocus={handleFocus}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
      className="input"
    />
  );
}
