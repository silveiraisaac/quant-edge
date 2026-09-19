import { BacktestSettings, PositionSizingMode } from "@/lib/types";
import { ConfigSection, Field } from "./config-section";
import { NumericInput } from "./numeric-input";

interface Props {
  settings: BacktestSettings;
  onChange: (settings: BacktestSettings) => void;
}

const MODE_LABELS: Record<PositionSizingMode, string> = {
  CAPITAL_PERCENT: "Capital %",
  FIXED_QUANTITY: "Fixed Quantity",
  RISK_PERCENT: "Risk %",
};

export function PositionSizingSection({ settings, onChange }: Props) {
  const sizing = settings.positionSizing;
  const riskSizingBlocked = sizing.mode === "RISK_PERCENT" && !settings.riskManagement.stopLossEnabled;

  function updateSizing(patch: Partial<BacktestSettings["positionSizing"]>) {
    onChange({ ...settings, positionSizing: { ...sizing, ...patch } });
  }

  return (
    <ConfigSection title="Position Sizing">
      <Field label="Sizing method">
        <select
          value={sizing.mode}
          onChange={(e) => updateSizing({ mode: e.target.value as PositionSizingMode })}
          className="input"
        >
          {(Object.keys(MODE_LABELS) as PositionSizingMode[]).map((mode) => (
            <option key={mode} value={mode}>
              {MODE_LABELS[mode]}
            </option>
          ))}
        </select>
      </Field>

      {sizing.mode === "CAPITAL_PERCENT" && (
        <Field label="Capital % per trade">
          <NumericInput
            min={1}
            max={100}
            value={sizing.capitalPercent}
            onChange={(v) => updateSizing({ capitalPercent: v })}
          />
        </Field>
      )}

      {sizing.mode === "FIXED_QUANTITY" && (
        <Field label="Fixed quantity (units)">
          <NumericInput
            min={1}
            value={sizing.fixedQuantity}
            onChange={(v) => updateSizing({ fixedQuantity: Math.floor(v) })}
          />
        </Field>
      )}

      {sizing.mode === "RISK_PERCENT" && (
        <>
          <Field label="Risk % of capital per trade">
            <NumericInput
              min={0.1}
              max={100}
              decimals={2}
              value={sizing.riskPercent}
              onChange={(v) => updateSizing({ riskPercent: v })}
            />
          </Field>
          {riskSizingBlocked && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Risk % sizing requires an active Stop Loss — enable it under Risk Management below,
              or this sizing mode won&apos;t be able to open any positions.
            </p>
          )}
        </>
      )}

      <p className="text-xs text-slate-400">
        {sizing.mode === "CAPITAL_PERCENT" &&
          "Position value = available cash × this percentage."}
        {sizing.mode === "FIXED_QUANTITY" &&
          "Every entry attempts this exact quantity, reduced automatically if capital or allocation limits don't allow the full amount."}
        {sizing.mode === "RISK_PERCENT" &&
          "Quantity is sized so that a stop-loss hit would lose no more than this % of capital — risk per share is entry price minus the initial stop-loss price."}
      </p>
    </ConfigSection>
  );
}
