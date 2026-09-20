import { MonthlyReturn } from "@/lib/types";
import { monthLabel } from "@/lib/format";

function cellStyle(value: number) {
  const strength = Math.min(Math.abs(value) / 8, 1);
  return value >= 0
    ? { backgroundColor: `color-mix(in srgb, var(--qe-positive) ${8 + strength * 22}%, transparent)`, color: "var(--qe-positive)" }
    : { backgroundColor: `color-mix(in srgb, var(--qe-negative) ${8 + strength * 22}%, transparent)`, color: "var(--qe-negative)" };
}

export function MonthlyReturnsTable({ data }: { data: MonthlyReturn[] }) {
  if (!data.length) return <section className="qe-card p-5 sm:p-6"><p className="qe-eyebrow">Period analysis</p><h2 className="qe-title mt-1 text-lg">Monthly returns</h2><div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-600"><strong>Monthly returns are unavailable.</strong> The selected report does not contain enough month-end observations.</div></section>;

  const years = Array.from(new Set(data.map((item) => item.year))).sort();
  const byYearMonth = new Map(data.map((item) => [`${item.year}-${item.month}`, item.returnPct]));
  const annual = new Map(years.map((year) => [year, data.filter((item) => item.year === year).reduce((growth, item) => growth * (1 + item.returnPct / 100), 1) * 100 - 100]));
  return (
    <section className="qe-card overflow-hidden" aria-labelledby="monthly-title">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6"><div><p className="qe-eyebrow">Period analysis</p><h2 id="monthly-title" className="qe-title mt-1 text-lg">Monthly return heatmap</h2><p className="mt-1 text-xs text-slate-500">Compounded net portfolio returns. Missing months remain blank.</p></div><div className="flex items-center gap-2 text-[10px] text-slate-500"><span>Loss</span><span className="h-3 w-7 rounded bg-red-200"/><span className="h-3 w-7 rounded bg-slate-100"/><span className="h-3 w-7 rounded bg-emerald-200"/><span>Gain</span></div></div>
      <div className="qe-scrollbar overflow-x-auto p-4 sm:p-5"><table className="w-full min-w-[780px] border-separate border-spacing-1 text-xs"><thead><tr><th className="px-2 py-2 text-left font-semibold text-slate-500">Year</th>{Array.from({length:12},(_,index)=><th key={index} className="px-1 py-2 text-center font-semibold text-slate-500">{monthLabel(index+1)}</th>)}<th className="px-2 py-2 text-center font-bold text-slate-700">Annual</th></tr></thead><tbody>{years.map((year)=><tr key={year}><th className="px-2 py-2 text-left font-bold text-slate-700">{year}</th>{Array.from({length:12},(_,index)=>{const value=byYearMonth.get(`${year}-${index+1}`);return <td key={index} className="h-9 min-w-12 rounded-md text-center font-semibold tabular-nums" style={value === undefined ? {backgroundColor:"var(--qe-surface-secondary)",color:"var(--qe-text-faint)"} : cellStyle(value)} aria-label={`${monthLabel(index+1)} ${year}: ${value === undefined ? "no data" : `${value.toFixed(2)} percent`}`}>{value === undefined ? "—" : `${value > 0 ? "+" : ""}${value.toFixed(1)}`}</td>})}<td className="h-9 rounded-md border border-slate-200 text-center font-bold tabular-nums" style={cellStyle(annual.get(year) ?? 0)}>{(annual.get(year) ?? 0) > 0 ? "+" : ""}{annual.get(year)?.toFixed(1)}</td></tr>)}</tbody></table></div>
    </section>
  );
}
