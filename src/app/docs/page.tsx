export const metadata = {
  title: "Docs — Quant Edge",
};

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Documentation</h1>
        <p className="mt-1 text-sm text-slate-500">
          How Quant Edge works, what it currently does and doesn&apos;t model, and how to read the
          results.
        </p>
      </div>

      <Section title="Demo mode">
        <p>
          Quant Edge is currently running entirely on <strong>synthetic, randomly generated</strong>{" "}
          price data. Every symbol is prefixed &ldquo;DEMO-&rdquo; and every results screen shows a
          demo-mode banner. Nothing shown anywhere in the app reflects real historical market
          performance. The synthetic data provider exists so the platform&apos;s architecture,
          UI, and backtest engine can be built and tested before a licensed market-data source is
          connected.
        </p>
      </Section>

      <Section title="How the backtest engine works">
        <p>
          The engine is long-only. Strategy signals are computed using only data available as of
          a given bar&apos;s close, and any resulting trade is executed at the <em>next</em>{" "}
          bar&apos;s open — this keeps the simulation free of lookahead bias. Position size is a
          configurable percentage of available capital. If a position is still open at the end of
          the selected date range, it is closed at the final bar&apos;s price so every backtest
          ends fully in cash.
        </p>
      </Section>

      <Section title="What isn't modeled yet">
        <p>
          The current results assume <strong>zero transaction costs</strong> — no brokerage,
          slippage, or taxes — and no stop-loss, target, or trailing-stop exits. The
          configuration panel shows placeholders for these under &ldquo;Risk Management&rdquo;
          and &ldquo;Costs&rdquo; so the intended structure is visible, but they do not yet affect
          results. When they&apos;re implemented, they&apos;ll be applied transparently to the
          calculation rather than estimated after the fact.
        </p>
      </Section>

      <Section title="Reading the metrics">
        <dl className="space-y-3">
          <Metric term="CAGR">
            Compound annual growth rate — the constant annual return that would take starting
            capital to ending capital over the backtest period.
          </Metric>
          <Metric term="Max Drawdown">
            The largest peak-to-trough decline in equity during the backtest, as a percentage.
          </Metric>
          <Metric term="Sharpe Ratio">
            Annualized return per unit of volatility, computed from daily equity returns with a
            risk-free rate of 0.
          </Metric>
          <Metric term="Profit Factor">Gross profit divided by gross loss across all trades.</Metric>
        </dl>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="qe-card p-5">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-slate-600">{children}</div>
    </div>
  );
}

function Metric({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-800">{term}</dt>
      <dd className="text-sm text-slate-600">{children}</dd>
    </div>
  );
}
