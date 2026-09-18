"use client";

import { useState } from "react";

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
}

function formatIndian(n: number): string {
  return n.toLocaleString("en-IN");
}

/**
 * A plain controlled `<input type="number" value={n}>` bound directly to a
 * numeric value causes a well-known bug: clearing the field forces an
 * intermediate state (empty string -> Number("") -> 0) back into the value
 * prop, so the next keystroke lands after a displayed "0" instead of
 * replacing it — producing things like "010000". This component keeps a
 * local, freely-editable raw string only while the field is focused (no
 * coercion, no reformatting per keystroke) and displays Indian digit
 * grouping the rest of the time, derived at render time rather than via an
 * effect, so editing never fights the user's cursor.
 */
export function CurrencyInput({ value, onChange, min = 0 }: Props) {
  // null = not editing right now; display the formatted `value` prop.
  // string = the user is actively typing; this is the source of truth.
  const [editingText, setEditingText] = useState<string | null>(null);

  const displayValue = editingText !== null ? editingText : formatIndian(value);

  function handleFocus() {
    setEditingText(value === 0 ? "" : String(value));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Strip anything that isn't a digit (guards against pasted "₹" or
    // commas) but otherwise leave the user's raw input alone — no
    // reformatting, no forced leading/trailing characters.
    const digitsOnly = e.target.value.replace(/\D/g, "");
    setEditingText(digitsOnly);
    if (digitsOnly === "") return; // let the field stay empty; don't crash the backtest with NaN
    onChange(Number(digitsOnly));
  }

  function handleBlur() {
    const parsed = editingText === null ? value : Number(editingText);
    const safe =
      editingText === "" || editingText === null || Number.isNaN(parsed)
        ? Math.max(value, min)
        : Math.max(parsed, min);
    onChange(safe);
    setEditingText(null);
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      value={displayValue}
      onFocus={handleFocus}
      onChange={handleChange}
      onBlur={handleBlur}
      className="input"
    />
  );
}
