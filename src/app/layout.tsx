import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const themeScript = `(function(){try{var value=localStorage.getItem('quant-edge-theme');document.documentElement.dataset.theme=value==='light'?'light':'dark'}catch(_){document.documentElement.dataset.theme='dark'}})()`;

export const metadata: Metadata = {
  metadataBase: new URL("https://quant-edge-gray.vercel.app"),
  title: {default:"Quant Edge — Quantitative Strategy Backtesting",template:"%s | Quant Edge"},
  description: "An independent quantitative strategy backtesting and performance-analysis project built by Isaac Silveira using clearly identified synthetic demonstration data.",
  applicationName: "Quant Edge",
  authors: [{name:"Isaac Silveira",url:"https://github.com/silveiraisaac"}],
  creator: "Isaac Silveira",
  category: "Quantitative Finance / Software Engineering",
  keywords: ["quantitative finance","backtesting","financial software","performance analytics","portfolio project"],
  alternates: {canonical:"/"},
  openGraph: {
    type:"website",
    url:"/",
    siteName:"Quant Edge",
    title:"Quant Edge — Quantitative Strategy Backtesting",
    description:"An independent quantitative strategy backtesting and performance-analysis project built by Isaac Silveira.",
  },
  twitter: {
    card:"summary",
    title:"Quant Edge — Quantitative Strategy Backtesting",
    description:"An independent quantitative strategy backtesting and performance-analysis project built by Isaac Silveira.",
  },
  robots: {index:true,follow:true},
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" data-theme="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className="flex min-h-full flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
