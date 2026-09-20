# Quant Edge

Quant Edge is an independent quantitative strategy backtesting and performance-analysis project built by **Isaac Silveira**. It demonstrates systematic strategy evaluation, causal execution modelling, risk controls, Indian cash-equity transaction-cost assumptions, performance analytics and production-minded financial software engineering.

**Live project:** [https://quant-edge-gray.vercel.app/](https://quant-edge-gray.vercel.app/)

> **Demo data disclosure:** Quant Edge v1.0 uses deterministic synthetic market data. Results are hypothetical and do not represent actual historical NSE or BSE market performance. Quant Edge does not provide investment advice, recommendations, brokerage, live trading or money management.

## Quant Edge v1.0 — Portfolio Release

The portfolio release lets a visitor:

- Configure a strategy, starting capital, position sizing and portfolio constraints.
- Apply stop-loss, profit-target and trailing-stop controls.
- Run deterministic daily-bar simulations with signals executed at the next open.
- Inspect net performance, risk, drawdowns, monthly returns, costs and trades.
- Compare up to four completed runs.
- Save summaries locally in the browser and export trade CSV or summary JSON.
- Review complete methodology, limitations, provenance and risk disclosures in the interface.

This is a portfolio project rather than a commercial SaaS or real-money trading product.

## Portfolio Highlights

- Deterministic backtesting engine with causal, no-look-ahead signal execution
- Conservative stop-loss, target, gap and trailing-stop mechanics
- Capital percentage, fixed quantity and fixed-stop risk-based position sizing
- Concurrent-lot and portfolio allocation constraints
- Indian transaction-cost modelling with component-level auditability
- Net-equity analytics, drawdown analysis and monthly returns
- Strategy comparison, saved-run workflows and hardened CSV/JSON exports
- Data-provider abstraction, runtime validation and reproducible provenance hashes
- Responsive dark/light fintech interface
- 99 automated financial, strategy, execution, API, adapter and authorization tests

## Strategies

Quant Edge implements eight verified long-only strategy models:

1. SMA Crossover
2. RSI Mean Reversion
3. EMA Crossover
4. RSI Momentum
5. Donchian Breakout
6. Rate-of-Change Momentum
7. Bollinger Mean Reversion
8. MACD Trend

Indicator warmups and parameter relationships are validated. Signals use information available through the current close and execute at the next bar open. The final open position is liquidated at the last close for reporting.

## Risk and execution modelling

The engine supports configurable capital; capital-percentage, fixed-quantity and risk-percentage sizing; maximum concurrent positions and allocation limits; fixed stops; profit targets; and trailing stops. It handles same-bar stop/target ambiguity conservatively, fills gaps at the available open, keeps protective levels per lot, and accounts explicitly for cash, invested value and marked-to-market equity.

Risk-percentage sizing uses the configured fixed-stop distance. Gaps, slippage and charges can cause losses beyond that nominal risk budget.

## Indian transaction-cost assumptions

Presets include Zero Costs, Zerodha Equity Intraday, Zerodha Equity Delivery and Custom Costs. The model separates brokerage, STT, exchange charges, SEBI charges, IPFT, stamp duty, GST, DP charges and slippage.

Current published rates are applied as modelling assumptions over the selected range. They are not guaranteed broker invoices, personalised tax calculations or reconstructed historical tariff schedules. Contract-note aggregation, broker-specific exceptions and special settlement cases may differ.

Reference: [Zerodha charges](https://zerodha.com/charges).

## Performance analytics

Reports include starting and ending capital, gross/net P&L, total return, calendar CAGR, volatility, Sharpe and Sortino ratios, maximum drawdown and recovery, monthly returns, win/loss statistics, profit factor, risk/reward, expectancy, holding period, exposure, turnover, costs and slippage impact.

Undefined ratios are displayed as `N/A`. Risk metrics use supplied daily observations and 252-session annualisation; missing sessions are never invented.

## Architecture

```text
DataProvider
  → HistoricalDataService (normalisation, validation, provenance)
  → BacktestEngine (signals, execution, positions and cash)
  → PerformanceCalculator
  → validated Next.js API
  → React reports, comparison, saves and exports
```

Backtests run on the server. Provider and optional account modules are server-only. Shared TypeScript contracts isolate the engine from data-source implementations. Signal logic, execution, costs and analytics remain separate and testable.

The stack is Next.js 16, React 19, TypeScript 5, Tailwind CSS 4 and Recharts 3. Node’s test runner drives the regression suite. Optional cloud saves use Supabase Auth and PostgreSQL row-level security when configured.

## Demo dataset and provenance

The default provider generates deterministic seeded synthetic OHLCV candles. The same inputs reproduce the same dataset and result. The sequence restarts at the selected start date, skips weekends and does not apply an NSE/BSE holiday calendar.

Every report identifies synthetic data and records provider, instrument, requested/available dates, timeframe, bar count, retrieval time, adjustment policy, engine/cost versions and a SHA-256 dataset fingerprint. Synthetic instrument names are demonstrations rather than tradable securities or indices.

The repository contains an isolated Kite historical-data adapter from earlier engineering work, but the v1.0 portfolio release intentionally does not configure a brokerage connection or present real market data. Failed real-provider calls never fall back silently to demo data.

## Persistence and privacy

Browser-local history stores named settings, summaries and provenance for up to 100 runs. It does not store candle archives. Local records are visible to anyone using the same browser profile.

Optional Supabase email/password accounts can provide owner-scoped cloud saves when the operator configures `SUPABASE_URL`, `SUPABASE_ANON_KEY`, Auth and the included migration. Access tokens stay in HTTP-only, SameSite=Strict cookies and expire after at most one hour. The default portfolio experience does not require an account.

No product analytics or advertising SDK is included. The in-app Privacy Policy describes browser, server, hosting and optional cloud processing.

## Known limitations

- Synthetic demonstration data rather than actual NSE/BSE history
- Daily bars, long-only positions and one instrument per backtest
- No live data, brokerage connection or trade execution
- No leverage, short selling, options or multi-instrument portfolio backtesting
- Simplified fills, liquidity, market impact and order acceptance
- No independent split, dividend, merger or demerger adjustment pipeline
- No exchange-holiday filtering for the synthetic generator
- Cost and slippage values are modelling assumptions
- No guarantee that hypothetical results resemble historical or future live performance

Detailed execution and metric definitions are available at `/docs`; Terms, Privacy, Financial Disclaimer and Risk Disclosure are linked from the application footer.

## Local development

Requirements: Node.js 24 or newer and pnpm 11.25.0.

```sh
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install --frozen-lockfile
pnpm dev
```

Demo operation requires no environment variables. Copy `.env.example` to `.env.local` only when deliberately configuring an external service. Never commit credentials, and never expose them through `NEXT_PUBLIC_` variables.

## Validation

```sh
pnpm test        # 99 deterministic regression and boundary tests
pnpm typecheck   # Next.js route generation plus strict TypeScript
pnpm lint        # ESLint
pnpm build       # production build
pnpm check       # complete validation sequence
```

The financial baselines cover deterministic demo outcomes, costs, cash reconciliation, causal execution, indicators, strategies, drawdowns, risk metrics, comparison and exports. Adapter and API tests verify invalid-data rejection, secret boundaries, authorization, ownership and error handling.

## Project status

**Quant Edge v1.0 is a portfolio project.** The release is complete as a public demonstration of software engineering and quantitative-finance work. Market-data licensing, real brokerage connectivity, live execution, payments and subscriptions are intentionally outside its scope.

© 2026 Isaac Silveira
