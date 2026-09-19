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
          bar&apos;s open — this keeps the simulation free of lookahead bias. If a position is
          still open at the end of the selected date range, it is closed at the final bar&apos;s
          price so every backtest ends fully in cash.
        </p>
      </Section>

      <Section title="Position sizing">
        <p>Three sizing modes decide how many units each trade buys:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Capital %</strong> — position value = available cash × this percentage;
            quantity is the whole number of units that value can buy. This is the original,
            default sizing behavior.
          </li>
          <li>
            <strong>Fixed Quantity</strong> — every entry attempts the exact number of units
            specified, automatically reduced if capital or allocation limits don&apos;t allow the
            full amount.
          </li>
          <li>
            <strong>Risk %</strong> — sizes the position so a stop-loss hit would lose no more
            than this percentage of available cash. Risk per share = entry price − the
            position&apos;s <em>initial</em> stop-loss price (never the trailing stop, which
            moves after entry and isn&apos;t known at sizing time). This mode requires an active
            Stop Loss; without one there&apos;s no risk-per-share to size against, so the trade
            is skipped rather than guessed at.
          </li>
        </ul>
        <p>
          Whatever quantity a sizing mode requests is then capped by two further constraints —
          available cash and the max capital allocation limit (below) — and the most restrictive
          of the three always wins. If even one unit can&apos;t be afforded, the trade is safely
          skipped: no fractional shares, no negative cash, no forced entry.
        </p>
      </Section>

      <Section title="Portfolio constraints">
        <p>
          <strong>Max concurrent positions</strong> caps how many lots can be open at once. At
          the default of 1, the engine behaves exactly as it always has — one position at a time.
          Raising it allows the strategy to pyramid into the same instrument: a new entry signal
          can open an additional lot (with its own entry price, stop, target, and trailing stop)
          while an earlier one is still open, up to the configured limit. A strategy exit signal
          closes every open lot at once, since the strategy&apos;s own signal doesn&apos;t
          distinguish between them.
        </p>
        <p>
          <strong>Max capital allocation</strong> caps the total cost basis (the cash actually
          spent opening positions, not their fluctuating current value) tied up in open positions
          at once, as a percentage of portfolio equity. At 100% it never restricts anything; at,
          say, 50%, once half of equity is committed to open lots, no new position can be opened
          until existing ones free up capacity by closing.
        </p>
      </Section>

      <Section title="Risk management: stop loss, target, and trailing stop">
        <p>
          Stop loss, target, and trailing stop are real, optional exit controls, each disabled by
          default. Percentages are relative to entry price. Stop/target checks use the
          bar&apos;s own low/high, not just its close, so a level touched intrabar exits at that
          level — unless the market gapped past it, in which case the trade exits at the
          available open instead of the unreachable stop/target price.
        </p>
        <p>
          If a single bar touches both the stop and the target, there is no way to know from
          OHLC data which happened first — Quant Edge conservatively assumes the stop was hit
          first. The trailing stop only ever moves in the trade&apos;s favor: each bar&apos;s
          exit is decided using the trailing level as it stood coming into that bar, and only
          afterward is the level raised using that bar&apos;s high, so it can never benefit from
          information the position didn&apos;t yet have.
        </p>
      </Section>

      <Section title="What isn't modeled yet">
        <p>
          The current results assume <strong>zero transaction costs</strong> — no brokerage,
          slippage, or taxes. The configuration panel shows a placeholder for a max drawdown
          limit under &ldquo;Risk Management&rdquo;, and placeholders under &ldquo;Costs&rdquo;,
          so the intended structure is visible, but they do not yet affect results. Multi-symbol
          portfolios, short selling, leverage, and options are also not implemented. When
          transaction costs are implemented, they&apos;ll be applied transparently to the
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
