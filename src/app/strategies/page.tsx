import { STRATEGY_DEFINITIONS } from "@/lib/strategies";

export const metadata = {
  title: "Strategies — Quant Edge",
};

export default function StrategiesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Strategies</h1>
        <p className="mt-1 text-sm text-slate-500">
          The strategies currently available in the backtester. Each one is long-only, and every
          trade is executed at the bar <em>after</em> the signal is generated — there is no
          lookahead bias built into any of them.
        </p>
      </div>

      <div className="space-y-4">
        {STRATEGY_DEFINITIONS.map((def) => (
          <div key={def.type} className="qe-card p-5">
            <h2 className="text-sm font-semibold text-slate-900">{def.label}</h2>
            <p className="mt-1 text-sm text-slate-600">{def.shortDescription}</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{def.howItWorks}</p>
          </div>
        ))}
      </div>

      <div className="qe-card border-dashed p-5 text-sm text-slate-400">
        All strategies support the shared risk controls and costs. Strategy descriptions are research tools, not investment advice.
      </div>
    </div>
  );
}
