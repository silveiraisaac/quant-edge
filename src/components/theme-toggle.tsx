"use client";

import { useSyncExternalStore } from "react";

type Theme = "dark" | "light";
const THEME_EVENT = "quant-edge-theme-change";
const getTheme = (): Theme => document.documentElement.dataset.theme === "light" ? "light" : "dark";
const subscribe = (listener: () => void) => {
  window.addEventListener(THEME_EVENT, listener);
  return () => window.removeEventListener(THEME_EVENT, listener);
};

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "dark");

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("quant-edge-theme", next);
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
      aria-pressed={theme === "light"}
      className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-slate-200 transition hover:bg-white/10 hover:text-white"
      title={theme === "light" ? "Use dark theme" : "Use light theme"}
    >
      <svg className="qe-theme-moon h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M20.2 15.1A8.4 8.4 0 0 1 8.9 3.8 8.5 8.5 0 1 0 20.2 15Z" /></svg>
      <svg className="qe-theme-sun h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
    </button>
  );
}
