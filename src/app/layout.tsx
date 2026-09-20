import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";

const themeScript = `(function(){try{var value=localStorage.getItem('quant-edge-theme');document.documentElement.dataset.theme=value==='light'?'light':'dark'}catch(_){document.documentElement.dataset.theme='dark'}})()`;

export const metadata: Metadata = {
  title: "Quant Edge — Quantitative Strategy Research",
  description:
    "Quant Edge: a strategy backtesting platform for Indian equity markets. Currently running in demo mode on synthetic data.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" data-theme="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className="flex min-h-full flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-slate-200/80 bg-white/70">
          <div className="qe-container flex flex-col gap-2 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>Quant Edge · Long-only Indian cash-equity research</p>
            <p>Backtested performance does not guarantee future results.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
