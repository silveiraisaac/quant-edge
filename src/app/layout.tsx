import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Quant Edge — Strategy Backtester",
  description:
    "Quant Edge: a strategy backtesting platform for Indian equity markets. Currently running in demo mode on synthetic data.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-slate-100">
        <Header />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
