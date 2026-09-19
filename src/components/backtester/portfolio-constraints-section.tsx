import { BacktestSettings } from "@/lib/types";
import { ConfigSection, Field } from "./config-section";
import { NumericInput } from "./numeric-input";

interface Props {
  settings: BacktestSettings;
  onChange: (settings: BacktestSettings) => void;
}

export function PortfolioConstraintsSection({ settings, onChange }: Props) {
  const portfolio = settings.portfolio;

  function updatePortfolio(patch: Partial<BacktestSettings["portfolio"]>) {
    onChange({ ...settings, portfolio: { ...portfolio, ...patch } });
  }

  return (
    <ConfigSection title="Portfolio Constraints">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Max concurrent positions">
          <NumericInput
            min={1}
            max={20}
            value={portfolio.maxConcurrentPositions}
            onChange={(v) => updatePortfolio({ maxConcurrentPositions: Math.floor(v) })}
          />
        </Field>
        <Field label="Max capital allocation (%)">
          <NumericInput
            min={1}
            max={100}
            value={portfolio.maxCapitalAllocationPct}
            onChange={(v) => updatePortfolio({ maxCapitalAllocationPct: v })}
          />
        </Field>
      </div>
      <p className="text-xs text-slate-400">
        Max concurrent positions = 1 means the engine only ever holds a single open lot, exactly
        as before this control existed. Max capital allocation caps the total cost basis of open
        positions as a % of portfolio equity — 100% is unrestricted.
      </p>
    </ConfigSection>
  );
}
