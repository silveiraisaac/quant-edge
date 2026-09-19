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
