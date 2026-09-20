# Quant Edge

Indian cash-equity strategy backtesting and performance analysis, built on the
existing Next.js 16 / React 19 / TypeScript application. Long-only research;
no live order execution. The navy/teal interface and prior sizing/risk architecture
are retained.

**Backtested performance does not guarantee future results. Demo/synthetic
results are not historical market performance.**

## Setup

Use Node.js 24 LTS and pnpm 11.25.0. From the repository root:

```sh
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install --frozen-lockfile
pnpm dev
```

If Corepack is absent, install pnpm using the official package registry:
`npm install -g pnpm@11.25.0`. Demo operation needs no environment variables.
Copy `.env.example` to `.env.local` only when configuring external services.
Never commit credentials. No secrets use `NEXT_PUBLIC_`.

```sh
pnpm test        # deterministic financial, adapter, API and authorization tests
pnpm typecheck   # Next route type generation plus strict TypeScript
pnpm lint
pnpm build
pnpm start
pnpm check       # all of the above verification, fails at the first failed check
```

Tests use Node's test runner plus the existing TypeScript compiler for module
loading; no trading data or external service credentials are needed.

## Architecture

`DataProvider → historicalData (validation + provenance) → BacktestEngine →
PerformanceCalculator → validated Next API → existing React reports`.

Backtests execute on the server. Providers and account modules import
`server-only`. `types.ts` remains the shared domain contract. Signal calculations
are separate from execution, cost presets from charge arithmetic, and analytics
from trading decisions. The eight strategy definitions drive the selector and
strategy documentation. Settings receive runtime validation before retrieval.
Charts plot actual net equity and derived drawdown; monthly returns use month ends.

See the in-app `/docs` page and `src/lib/documentation.ts` for full calculation
methodology. `docs/AUDIT.md` records the starting checkpoint and benchmark caveat.

## Market data

The `synthetic` provider is deterministic and prominently labelled. Its seeded
sequence restarts at the requested start date; it omits weekends but not exchange
holidays. Demo Nifty instruments are simulations, not tradable index cash shares.

The `kite` adapter uses the official licensed historical API, daily candles only:

```dotenv
KITE_API_KEY=
KITE_ACCESS_TOKEN=
KITE_INSTRUMENTS_JSON=[]
```

1. Obtain a Kite Connect subscription/access permitted for historical data.
2. Complete the provider's official authentication flow and securely supply the
   current access token. Token acquisition/renewal is operator-managed; this app
   never accepts broker credentials in the browser.
3. Download/use the official instrument master under your licence. Configure
   an array shaped like `[{"symbol":"YOUR_SYMBOL","name":"Your instrument",
   "exchange":"NSE","token":123}]`, replacing the illustrative token with the
   verified current **cash-equity** token. `BSE` is supported only for configured
   instruments permitted by the provider. Do not configure derivatives/indices
   as cash equities. No exchange website scraping is used.
4. Restart/redeploy and select REAL HISTORICAL DATA. Confirm the report's actual
   available dates and provenance. Invalid OHLC, duplicate/unordered dates,
   missing fields and out-of-range candles fail visibly. Missing sessions are not
   manufactured. Empty/failed real requests never use demo data.

The adapter requests disjoint 365-day chunks with timeouts and paced requests.
Reports record a SHA-256 fingerprint, retrieval time and provider adjustment
policy. Data may be revised upstream; exact later reproduction requires the same
licensed dataset. No candle datasets are persisted per report or shipped here.
Corporate actions/dividends are not independently adjusted; assess provider
adjustments before interpreting equity research results.

Official references: [historical API](https://kite.trade/docs/connect/v3/historical/),
[instrument master](https://kite.trade/docs/connect/v3/market-quotes/).
Verify that your licence permits your deployment and users; a personal API
subscription does not grant public redistribution rights.

## Costs and execution

Presets: Zero Costs, Zerodha Equity Intraday, Zerodha Equity Delivery, Custom.
Verified 20 September 2026, resident individual cash-equity assumptions:

| Component | Intraday | Delivery |
| --- | --- | --- |
| Brokerage / executed order | min(0.03%, ₹20) | zero |
| STT | 0.025%, sell side | 0.1%, both sides |
| NSE exchange | 0.00307%, both sides | same |
| BSE standard group | 0.00375%, both sides | same |
| SEBI | ₹10/crore | same |
| Stamp duty | 0.003%, buy side | 0.015%, buy side |
| GST | 18% of taxable service charges | same |
| DP base | none | ₹13 per stock/selling day plus GST |

NSE IPFT is ₹0.01/crore plus GST, tracked separately. DP discounts/special BSE
groups can use custom costs. Current tariffs apply to all historical dates.
One simulated lot execution is one order. STT rounds to the nearest rupee per
order; daily contract-note aggregation/netting may differ. Intraday STT uses the
round-trip average-price turnover described by Zerodha. DP excludes same-day
round trips; delivery positions sold the same day are reclassified as intraday.
Special settlement/auction scenarios and minimum contract-note fees are omitted.

Sources: [official rates](https://zerodha.com/charges),
[STT basis and rounding](https://support.zerodha.com/category/account-opening/resident-individual/ri-charges/articles/how-is-the-securities-transaction-tax-stt-calculated),
[DP per stock/day](https://support.zerodha.com/category/account-opening/resident-individual/ri-charges/articles/what-do-dp-charges-mean).

Charges debit actual cash. Integer sizing covers the buy plus entry charges and
reserves fixed/known exit liabilities. Long entry slippage raises the fill and
exit slippage lowers it. Gross P&L uses slipped fills; net P&L deducts statutory
and broker charges once. Informational slippage impact is not deducted again.

Signals at close execute next open. Stops/targets use OHLC with stop-first
ambiguity handling and gap fills at open. Trailing-stop updates apply next bar.
Multiple same-symbol lots retain independent risk levels. The start-of-bar lot
count and prior-close equity govern entry capacity. Final close liquidates open
positions; intraday mode liquidates each daily close. Risk % is a stop-distance
sizing model, not a guaranteed maximum loss: gaps and charges can exceed it.

## Strategies and analytics

SMA crossover, EMA crossover, Wilder RSI mean reversion, RSI momentum, prior-bar
Donchian breakout, rate-of-change momentum, Bollinger lower-band recovery and
MACD signal crossover. Parameter relationships are validated and indicators
have explicit warmups. Flat RSI is neutral 50 (corrected from the original 100).

Metrics cover capital, gross/net return, calendar CAGR, net trade statistics,
profit factor, expectancy, risk/reward, sample annualized volatility, Sharpe,
Sortino, drawdown dates/recovery, streaks, holding days, session exposure,
turnover and separate cost/slippage totals. Sharpe uses daily excess portfolio
returns and sample deviation; Sortino uses negative excess-return squared
deviation across **all** periods. Annualization is 252 daily sessions. N/A denotes
undefined ratios. Exposure counts sessions with any lot held, not intraday time.

Up to four runs can be compared. Equity overlays normalize to each run's initial
capital; missing dates stay gaps. Different datasets/ranges are flagged, without
declaring a best strategy. CSV and summary JSON export actual current results.

## Persistence and accounts

Browser-local history stores named settings and summaries, up to 100 entries.
It is device/profile storage, not private account storage; shared devices expose
these saves. Reopen restores settings for a new run. No candle archives are saved.

Optional production storage uses **Supabase PostgreSQL + Auth**, accessed through
its authenticated REST query layer, with no additional ORM/server connection pool:

```dotenv
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=
```

1. Create the project and apply `supabase/migrations/202609200001_backtest_runs.sql`
   in the SQL editor (or through your migration tooling).
2. Run `supabase/tests/ownership.sql` administratively against a test project;
   it rolls back its fixtures. Live SQL isolation tests require a configured DB
   and were not run in the credential-free development environment.
3. Enable email/password Auth, require email confirmation, configure your site
   URL, SMTP and provider abuse protections. Set the variables above on the server.
4. Use the existing **anon** key, never a `service_role`/admin key. Owner RLS is
   part of the security boundary. Auth users own rows by `auth.uid()`; anonymous
   users have no table privileges, and changing row ownership is not supported.
5. Test two different users: user A must not read/delete/insert B's rows.

API identity is obtained from the auth service, never client user IDs. Cloud saves
rerun settings on the server rather than accepting submitted performance. Access
tokens stay in HTTP-only, SameSite=Strict cookies (Secure in production); mutation
routes enforce same origin. Sessions last at most one hour; sign in again after
expiry. Automatic refresh, self-service password recovery and payment handling
are not included. Supabase account administration can handle recovery until that
UI is added. No external account or service was created during development.

## Production deployment

1. Review and import the local commits (or clone the delivered Git bundle).
   No GitHub push is performed by this work.
2. Install Node 24 / pnpm 11.25.0 and run `pnpm install --frozen-lockfile`.
3. Configure optional provider/account variables. For cloud accounts apply and
   test the migration before enabling them. Leave missing integrations disabled.
4. Run `pnpm check` and `pnpm audit --prod`; investigate failures before release.
5. Deploy to a **Node-capable Next.js host**, not static export. Use
   `pnpm build` and `pnpm start`; set production HTTPS and a suitable PORT.
   Production secure cookies require HTTPS for cloud sign-in.
6. Configure trusted proxy/origin handling, TLS/HSTS and gateway/WAF quotas.
   The app's 60 backtests/minute, two concurrent jobs and 20 auth attempts/minute
   are **per process**, not distributed abuse prevention. Multi-instance or public
   deployments need shared/gateway rate limits and licence-appropriate access.
7. Smoke-test demo, real credentials, provider failures, two-account ownership,
   saving/reopening/deleting, comparison and CSV download. Verify mobile layout.
8. Configure logs/monitoring without request bodies, passwords or provider tokens;
   provision database backups and establish credential rotation with the providers.

Input is capped at 16 KB, data at 4,000 daily bars/ten years, lots at 20 and
comparison at four. Computation runs server-side. Security headers block framing
and object embeds; CSP allows inline Next/React bootstrap code and styles.
Cookie auth mutations require same-origin requests. CSV text cells neutralize
formula prefixes. Error responses do not expose stack traces. Demo data has no
secrets or copyrighted historical dataset.

## Future monetization boundary

`src/lib/entitlements.ts` defines Free/Pro feature and resource policies. Both
currently expose all implemented features. No payment checkout, paid subscription
or artificial paywall is enabled. The `BillingProvider` interface is the boundary
for a future verified webhook/checkout adapter. Before enforcing paid plans, add
authoritative server-side membership storage, provider credentials, signature
verification, idempotent webhook processing and entitlement enforcement for each
server operation. Never accept plan claims from the browser.

## Known limitations and regressions

Daily long-only, one instrument/run; no shorting, leverage, partial fills, liquidity
constraints, price bands, settlement-delay cash blocking, dividends, independent
split adjustment, or survivorship-free universe construction. Current instrument
selection can introduce survivorship bias. BSE special groups, exact intraday
square-off, delivery netting, contract-note rounding and historical tariff changes
are not fully reconstructed. These are research estimates, not broker contract notes.

Fixed benchmark window: **2023-09-20–2026-09-20**, capital ₹10,00,000, 90% sizing,
one lot, 100% allocation, disabled risk controls, zero costs:

- SMA 20/50, DEMO-NIFTY50: **8 trades, ₹15,42,508.75**.
- RSI 14/30/70, DEMO-MIDCAP-A: **4 trades, ₹15,51,418.53**.

The request's RSI figure of 11 was not reproducible on the original checkpoint
using its defaults. This discrepancy predates all changes; no calculation was
altered to force it. Both verified zero-cost results remain unchanged.
