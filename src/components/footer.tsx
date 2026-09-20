import Link from "next/link";

const LEGAL_LINKS = [
  {href:"/about",label:"About"},
  {href:"/docs",label:"Methodology"},
  {href:"/legal/terms",label:"Terms"},
  {href:"/legal/privacy",label:"Privacy"},
  {href:"/legal/disclaimer",label:"Financial Disclaimer"},
  {href:"/legal/risk-disclosure",label:"Risk Disclosure"},
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/70">
      <div className="qe-container py-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-800">Quant Edge · An independent project by Isaac Silveira</p>
            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">Portfolio software for demonstrating quantitative strategy backtesting and performance analysis with clearly identified synthetic market data.</p>
          </div>
          <nav className="flex max-w-2xl flex-wrap gap-x-4 gap-y-3 text-xs font-semibold text-slate-600" aria-label="Project and legal links">
            {LEGAL_LINKS.map((link)=><Link key={link.href} href={link.href} className="underline-offset-4 hover:text-[var(--qe-accent-dark)] hover:underline">{link.label}</Link>)}
            <a href="https://github.com/silveiraisaac/quant-edge" target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-[var(--qe-accent-dark)] hover:underline">GitHub <span className="sr-only">(opens in a new tab)</span></a>
          </nav>
        </div>
        <div className="mt-6 flex flex-col gap-2 border-t border-slate-200 pt-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Isaac Silveira</p>
          <p>Hypothetical results are not investment advice. Past performance does not guarantee future results.</p>
        </div>
      </div>
    </footer>
  );
}
