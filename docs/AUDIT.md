# Starting audit

Starting HEAD: 50c642ff74dea2510667dc48a762f40e939772b9. Working tree clean on clone.
All source files, configuration, documentation and repository rules inspected.
Next 16.3.5 / React 19.2.8; App Router, browser-side engine, deterministic demo
provider, two strategies, risk exits and multiple-lot sizing. No database or auth.
No tracked tests and no test script: baseline test command failed for that reason.
Baseline typegen, TypeScript, ESLint and production build passed on Node 24.19.
Dependencies installed with pnpm; a lockfile is retained for reproducibility.

## Reproduced benchmarks before engine changes

Fixed dates 2023-09-20 through 2026-09-20, capital 1,000,000, 90% cash sizing,
one concurrent lot, 100% allocation, no risk controls, no costs:
- SMA 20/50, DEMO-NIFTY50: 8 trades; ending cash 1542508.7499999993.
- RSI 14/30/70, DEMO-MIDCAP-A: **4 trades**; ending cash 1551418.5299999998.

The requested RSI count of 11 is not reproducible with repository defaults.
Its exact original dates/parameters were not supplied; no signal logic was
changed to manufacture that count. Demo prices restart the seeded sequence
at the requested start date and omit weekends, but not exchange holidays.

## Cost conventions

Rates verified 2026-09-20 against https://zerodha.com/charges and Zerodha support
articles on STT and DP charges. Current rates apply throughout the requested
period; this is a current-cost scenario, not a historical tariff reconstruction.
One lot entry/exit is one simulated order. STT rounds to rupees per order;
contract-note aggregation, delivery netting across lots and settlement exceptions
can differ. Other components retain precision internally. DP is charged once per
symbol/date for overnight sells, including BTST. No DP on same-day round trips.
Default DP base is 13 plus GST; the female-holder discount can use custom costs.
NSE IPFT is separate. BSE special scrip-group rates require custom configuration.
Account maintenance, auction fees, assisted-order charges and income tax excluded.
Intraday mode liquidates at each session close; daily bars cannot represent broker
square-off time accurately. Delivery same-day exits are reclassified as intraday.
Entry affordability reserves the larger possible entry charge and a fixed exit
fee buffer. Slippage changes fills once; gross P&L uses those fills and net P&L
subtracts charges. Slippage impact is informational and never subtracted twice.

Sources:
- https://support.zerodha.com/category/account-opening/resident-individual/ri-charges/articles/what-do-dp-charges-mean
- https://support.zerodha.com/category/account-opening/resident-individual/ri-charges/articles/how-is-the-securities-transaction-tax-stt-calculated

## Final development audit — 2026-09-20

The complete check pipeline passed on Node 24.19.0: 99 tests passed, zero
failed/skipped, route type generation, TypeScript, ESLint with zero permitted
warnings, and Next production build. Production dependency audit reported zero
known vulnerabilities. This is a dependency advisory result, not a penetration test.

Signal prefix-invariance tests cover all eight strategies. Entries use prior-close
signals at the next open; allocation uses prior equity; existing gap exits precede
new entries. Stops precede targets in ambiguous daily candles; trailing levels
update after exit checks and cannot use the current high to justify an earlier
fill. Independent lots, gaps, final liquidation, slippage and cash reconciliation
have deterministic fixtures. No known look-ahead defect remains in this scope.

Accounting fixes include reserving entry and exit fees (including entry-based STT
liability on a severe price crash), once-per-day DP, same-day delivery fee
reclassification and session-end intraday liquidation. Flat RSI is neutral 50.
CAGR uses elapsed calendar years; undefined and numerically unstable ratios are
null rather than fabricated zero/infinity. The preserved trade/cash regressions
above pass after all changes.

Security review covered server-side input bounds, provider allowlisting, validated
OHLCV, bounded request streams, same-origin cookie mutations, verified auth
identity, owner-scoped queries, SQL RLS policies, CSV formula neutralization,
security headers and generic errors. No credentials or private keys were found
in the changed source. Source searches found only an intentional synthetic-data
comment and an input placeholder; no unresolved TODO/FIXME/HACK or debug logs.
Git diff whitespace checks passed. Repository instruction files were unchanged.

Production browser smoke checks: eight-trade SMA report and matching ending
capital, local save persisting after reload, reopening and rerunning, comparison
metrics/normalized curve, and the unconfigured real-provider state with no
synthetic fallback. Desktop 1440px and mobile 390px were inspected; mobile root
scroll width equals client width (375px), with wide tables locally scrollable.
No browser console errors were captured. CSV serialization and injection guards
pass automated tests; the in-app browser download event timed out, so receipt of
an exported file in a normal browser remains a deployment smoke-test item.

External checks not executed: authenticated Kite historical requests, real
Supabase signup/session operations, and the supplied database ownership SQL.
They require owner credentials/services. Account routes/provider adapters have
mocked boundary tests; these do not substitute for live integration tests. The
database migration and ownership test must run before cloud accounts are enabled.
No push, hosted deployment, payment integration or external account creation was
performed. See README for exact setup, supported assumptions and limitations.
