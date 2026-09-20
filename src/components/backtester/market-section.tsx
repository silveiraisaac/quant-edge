import { BacktestSettings, SymbolInfo } from "@/lib/types";

import { ConfigSection, Field } from "./config-section";



interface Props {

  symbols: SymbolInfo[];

  settings: BacktestSettings;

  onChange: (settings: BacktestSettings) => void;

}



export function MarketSection({ symbols, settings, onChange }: Props) {

  return (

    <ConfigSection title="">

      <Field label="Data source"><select className="input" value={settings.providerId} onChange={e => onChange({...settings, providerId:e.target.value, symbol:e.target.value==='synthetic'?'DEMO-NIFTY50':'', exchange:'NSE'})}><option value="synthetic">DEMO / SYNTHETIC</option><option value="kite">REAL HISTORICAL DATA — Kite Connect</option></select></Field>

      <Field label="Symbol / Instrument">

        <select

          value={settings.symbol}

          onChange={(e) => onChange({ ...settings, symbol: e.target.value })}

          className="input"

        >

          <option value="">Select an instrument</option>

          {symbols.filter(s => !s.exchange || s.exchange === (settings.exchange ?? "NSE")).map((s) => (

            <option key={s.symbol} value={s.symbol}>

              {s.name}

            </option>

          ))}

        </select>

      </Field>



      {settings.providerId === "kite" && !symbols.length && <p role="status" className="text-xs text-amber-800">No real instruments are configured. The operator must configure Kite credentials and licensed instruments. See Docs.</p>}
      <Field label="Exchange">

        <select value={settings.exchange ?? 'NSE'} className="input" onChange={e => onChange({...settings,exchange:e.target.value as 'NSE'|'BSE',symbol:settings.providerId==='synthetic'?settings.symbol:''})}>

          <option value="NSE">NSE {settings.providerId==='synthetic'?'(cost assumption only)':''}</option><option value="BSE">BSE — standard cash group</option>

        </select>

      </Field>



      <div className="grid grid-cols-2 gap-3">

        <Field label="Start date">

          <input

            type="date"

            value={settings.startDate}

            onChange={(e) => onChange({ ...settings, startDate: e.target.value })}

            className="input"

          />

        </Field>

        <Field label="End date">

          <input

            type="date"

            value={settings.endDate}

            onChange={(e) => onChange({ ...settings, endDate: e.target.value })}

            className="input"

          />

        </Field>

      </div>

    </ConfigSection>

  );

}
