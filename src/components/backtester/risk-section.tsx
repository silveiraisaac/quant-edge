import { BacktestSettings, RiskManagementConfig } from "@/lib/types";
import { ConfigSection, Field } from "./config-section";
import { NumericInput } from "./numeric-input";

interface Props {
  settings: BacktestSettings;
  onChange: (settings: BacktestSettings) => void;
}

export function RiskManagementSection({ settings, onChange }: Props) {
  const risk = settings.riskManagement;

  function updateRisk(patch: Partial<RiskManagementConfig>) {
    onChange({ ...settings, riskManagement: { ...risk, ...patch } });
  }

  return (
    <ConfigSection title="">
      <RiskControlRow
        label="Stop Loss"
        enabled={risk.stopLossEnabled}
        onToggle={(enabled) => updateRisk({ stopLossEnabled: enabled })}
        value={risk.stopLossPct}
        onValueChange={(v) => updateRisk({ stopLossPct: v })}
        helpText="Long positions exit if price falls this % below entry."
      />
      <RiskControlRow
        label="Target"
        enabled={risk.targetEnabled}
        onToggle={(enabled) => updateRisk({ targetEnabled: enabled })}
        value={risk.targetPct}
        onValueChange={(v) => updateRisk({ targetPct: v })}
        helpText="Long positions exit if price rises this % above entry."
      />
      <RiskControlRow
        label="Trailing Stop"
        enabled={risk.trailingStopEnabled}
        onToggle={(enabled) => updateRisk({ trailingStopEnabled: enabled })}
        value={risk.trailingStopPct}
        onValueChange={(v) => updateRisk({ trailingStopPct: v })}
        helpText="Stop trails this % below the highest price reached since entry — never moves down."
      />

      <p className="text-xs text-slate-400">
        When stop loss, target, and trailing stop are all disabled, backtests run exactly as
        before this feature — exits are driven only by the strategy&apos;s own signals.
      </p>
    </ConfigSection>
  );
}

function RiskControlRow({
  label,
  enabled,
  onToggle,
  value,
  onValueChange,
  helpText,
}: {
  label: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  value: number;
  onValueChange: (v: number) => void;
  helpText: string;
}) {
  return (
    <div className="grid grid-cols-2 items-end gap-3">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-[var(--qe-accent-dark)] focus:ring-[var(--qe-accent)]"
        />
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </label>
      <Field label={`${label} (%)`}>
        <NumericInput
          value={value}
          onChange={onValueChange}
          min={0.1}
          max={90}
          decimals={2}
          disabled={!enabled}
        />
      </Field>
      <p className="col-span-2 -mt-2 text-xs text-slate-400">{helpText}</p>
    </div>
  );
}
