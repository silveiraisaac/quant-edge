"use client";
import { useEffect, useState } from "react";
import { BacktestResult, BacktestSettings } from "@/lib/types";
import { LOCAL_KEY, parseLocalSaves, SavedRun } from "@/lib/saved";
import { getEntitlements } from "@/lib/entitlements";
import { formatDate, formatPct } from "@/lib/format";
import { getStrategyDefinition } from "@/lib/strategies";

export function SavedWorkspace({ result, onOpen }: { result: BacktestResult | null; onOpen: (settings: BacktestSettings) => void }) {
  const [rows, setRows] = useState<SavedRun[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [account, setAccount] = useState<{enabled:boolean;email:string|null}>({enabled:false,email:null});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [cloud, setCloud] = useState(false);

  async function load(useCloud: boolean) {
    if (useCloud) { const response = await fetch("/api/saved"); const data = await response.json(); if (!response.ok) throw new Error(data.error); setRows(data); }
    else setRows(parseLocalSaves(localStorage.getItem(LOCAL_KEY)));
  }
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => { if (active) setRows(parseLocalSaves(localStorage.getItem(LOCAL_KEY))); }).catch((reason: Error) => { if (active) setMessage(reason.message); });
    fetch("/api/account").then((response) => response.json()).then((value) => { if (active) setAccount(value); }).catch(() => {});
    return () => { active = false; };
  }, []);
  async function action(callback: () => Promise<void>) { if (busy) return; setBusy(true); setMessage(""); try { await callback(); } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Operation failed."); } finally { setBusy(false); } }
  async function save() {
    if (!result) return;
    const label = name.trim() || `${getStrategyDefinition(result.settings.strategy.type).label} · ${result.settings.symbol}`;
    if (cloud) { const response = await fetch("/api/saved", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:label,settings:result.settings})}); const data=await response.json(); if(!response.ok) throw new Error(data.error); }
    else { const current=parseLocalSaves(localStorage.getItem(LOCAL_KEY)); if(current.length>=getEntitlements("FREE").maxSavedBacktests) throw new Error("Browser storage is limited to 100 reports. Delete older items first."); const saved:SavedRun={id:crypto.randomUUID(),name:label,settings:result.settings,summary:result.summary,provenance:result.provenance,is_synthetic:result.isSynthetic,created_at:new Date().toISOString()}; localStorage.setItem(LOCAL_KEY,JSON.stringify([saved,...current])); }
    await load(cloud); setName(""); setMessage(cloud ? "Configuration rerun and saved to your account." : "Saved on this browser.");
  }
  async function auth(kind: "signin" | "signup") { const response=await fetch("/api/account",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:kind,email,password})}); const data=await response.json(); setPassword(""); if(!response.ok) throw new Error(data.error); setMessage(data.message); const status=await fetch("/api/account"); setAccount(await status.json()); }
  async function remove(row: SavedRun) { if(cloud){const response=await fetch(`/api/saved?id=${encodeURIComponent(row.id)}`,{method:"DELETE"});if(!response.ok)throw new Error("Delete failed.");}else localStorage.setItem(LOCAL_KEY,JSON.stringify(parseLocalSaves(localStorage.getItem(LOCAL_KEY)).filter((saved)=>saved.id!==row.id)));await load(cloud); }

  return <section className="qe-card overflow-hidden" aria-labelledby="saved-title">
    <div className="grid lg:grid-cols-[.82fr_1.18fr]">
      <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
        <p className="qe-eyebrow">Research continuity</p><h2 id="saved-title" className="qe-title mt-1 text-lg">Saved runs & history</h2><p className="mt-2 text-xs leading-5 text-slate-500">Browser saves stay on this device and are visible to anyone using this profile. Cloud storage appears only when Supabase is configured.</p>
        <div className="mt-5 space-y-3">
          <label className="block text-xs font-semibold text-slate-600">Save location<select className="input mt-1.5" value={cloud?"cloud":"local"} disabled={busy} onChange={(event)=>action(async()=>{const next=event.target.value==="cloud";await load(next);setCloud(next);})}><option value="local">This browser</option>{account.email&&<option value="cloud">My cloud account</option>}</select></label>
          <label className="block text-xs font-semibold text-slate-600">Configuration name<input className="input mt-1.5" value={name} maxLength={100} onChange={(event)=>setName(event.target.value)} placeholder="e.g. Nifty trend study"/></label>
          <button className="qe-btn-primary w-full" disabled={busy||!result} onClick={()=>action(save)}>{busy?"Working…":"Save current result"}</button>
          {!result && <p className="text-[11px] leading-4 text-slate-500">Run a backtest before saving. Only settings, summary, and provenance are stored; candle datasets are not.</p>}
        </div>
        <div className="mt-5 border-t border-slate-100 pt-4">{account.enabled ? <details><summary className="text-xs font-bold text-slate-700">{account.email?`Signed in as ${account.email}`:"Cloud account"}</summary>{account.email?<button className="qe-btn-secondary mt-3" disabled={busy} onClick={()=>action(async()=>{await fetch("/api/account",{method:"DELETE"});setAccount({enabled:true,email:null});setCloud(false);await load(false);})}>Sign out</button>:<div className="mt-3 space-y-2"><label className="block text-xs">Email<input type="email" className="input mt-1" value={email} autoComplete="email" onChange={(event)=>setEmail(event.target.value)}/></label><label className="block text-xs">Password (12+ characters)<input type="password" className="input mt-1" value={password} autoComplete="current-password" onChange={(event)=>setPassword(event.target.value)}/></label><div className="flex flex-wrap gap-2"><button className="qe-btn-secondary" disabled={busy} onClick={()=>action(()=>auth("signin"))}>Sign in</button><button className="qe-btn-secondary" disabled={busy} onClick={()=>action(()=>auth("signup"))}>Create account</button></div></div>}</details> : <div className="flex items-center gap-2 text-xs text-slate-500"><span className="h-2 w-2 rounded-full bg-slate-300"/>Cloud accounts are not configured</div>}</div>
        {message && <p className="mt-4 rounded-lg bg-slate-100 p-3 text-xs text-slate-700" role="status">{message}</p>}
      </div>
      <div className="min-w-0 p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><div><h3 className="text-sm font-bold text-slate-800">{cloud?"Cloud history":"Browser history"}</h3><p className="mt-1 text-xs text-slate-500">Reopen settings, then rerun against the current provider dataset.</p></div><span className="qe-pill">{rows.length} saved</span></div>
        {!rows.length ? <div className="qe-empty min-h-52"><p className="font-semibold text-slate-700">Your backtests will appear here</p><p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Complete a report, give it a useful name, and save it for later comparison or reruns.</p><a href="#builder" className="mt-4 text-xs font-bold text-[var(--qe-accent-dark)] underline underline-offset-4">Create a backtest</a></div> : <ul className="qe-scrollbar max-h-[30rem] space-y-3 overflow-auto pr-1">{rows.map((row)=>{const definition=getStrategyDefinition(row.settings.strategy.type);return <li key={row.id} className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-slate-800">{row.name}</p><p className="mt-1 text-xs text-slate-500">{definition.label} · {row.settings.symbol}</p></div><span className={row.is_synthetic?"qe-pill qe-pill-demo":"qe-pill qe-pill-live"}>{row.is_synthetic?"DEMO":"REAL"}</span></div><dl className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4"><div><dt className="text-slate-400">Period</dt><dd className="mt-1 font-semibold">{row.settings.startDate.slice(0,4)}–{row.settings.endDate.slice(0,4)}</dd></div><div><dt className="text-slate-400">Return</dt><dd className={`qe-figure mt-1 font-bold ${row.summary.totalReturnPct>=0?"qe-positive":"qe-negative"}`}>{formatPct(row.summary.totalReturnPct)}</dd></div><div><dt className="text-slate-400">Drawdown</dt><dd className="qe-figure mt-1 font-bold qe-negative">{formatPct(row.summary.maxDrawdownPct)}</dd></div><div><dt className="text-slate-400">Saved</dt><dd className="mt-1 font-semibold">{formatDate(row.created_at.slice(0,10))}</dd></div></dl><div className="mt-4 flex gap-2"><button className="qe-btn-secondary" disabled={busy} onClick={()=>{onOpen(row.settings);setMessage("Configuration opened. Run it to retrieve current data and generate a new report.");}}>Reopen settings</button><button className="qe-btn-secondary text-red-700" disabled={busy} onClick={()=>action(()=>remove(row))}>Delete</button></div></li>})}</ul>}
      </div>
    </div>
  </section>;
}
