import { MonthlyReturn } from "@/lib/types";
import { monthLabel } from "@/lib/format";

export function MonthlyReturnsTable({ data }: { data: MonthlyReturn[] }) {
  if (data.length === 0) {
    return (
      <div className="qe-card p-5">
        <h2 className="text-sm font-semibold text-slate-900">Monthly Returns</h2>
        <p className="mt-3 text-sm text-slate-400">Not enough data to compute monthly returns.</p>
      </div>
    );
  }

  const years = Array.from(new Set(data.map((d) => d.year))).sort();
  const byYearMonth = new Map<string, number>();
  for (const d of data) byYearMonth.set(`${d.year}-${d.month}`, d.returnPct);

  return (
    <div className="qe-card p-5">
      <h2 className="mb-4 text-sm font-semibold text-slate-900">Monthly Returns</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] whitespace-nowrap text-xs">
          <thead>
            <tr>
              <th className="px-2 py-1.5 text-left font-medium text-slate-500">Year</th>
              {Array.from({ length: 12 }, (_, i) => (
                <th key={i} className="px-2 py-1.5 text-right font-medium text-slate-500">
                  {monthLabel(i + 1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {years.map((year) => (
              <tr key={year} className="border-t border-slate-100">
                <td className="px-2 py-1.5 font-medium text-slate-700">{year}</td>
                {Array.from({ length: 12 }, (_, i) => {
                  const month = i + 1;
                  const value = byYearMonth.get(`${year}-${month}`);
                  return (
                    <td
                      key={month}
                      className={`px-2 py-1.5 text-right tabular-nums ${
                        value === undefined
                          ? "text-slate-300"
                          : value >= 0
                            ? "text-emerald-600"
                            : "text-red-600"
                      }`}
                    >
                      {value === undefined ? "—" : `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
