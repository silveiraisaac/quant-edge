'use client';
import { useEffect,useState } from 'react';
import { BacktestResult,BacktestSettings } from '@/lib/types';
import { SavedRun,LOCAL_KEY,parseLocalSaves } from '@/lib/saved';
import { formatCurrency } from '@/lib/format';
export function SavedWorkspace({result,onOpen}:{result:BacktestResult|null;onOpen:(s:BacktestSettings)=>void}) {
  const [rows,setRows]=useState<SavedRun[]>([]),[name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState('');
  const [account,setAccount]=useState<{enabled:boolean;email:string|null}>({enabled:false,email:null});
  const [message,setMessage]=useState(''),[busy,setBusy]=useState(false),[cloud,setCloud]=useState(false);
  async function load(useCloud:boolean) {
    if(useCloud){const r=await fetch('/api/saved');const data=await r.json();if(!r.ok)throw new Error(data.error);setRows(data);}
    else setRows(parseLocalSaves(localStorage.getItem(LOCAL_KEY)));
  }
  useEffect(()=>{
    let active=true;
    Promise.resolve().then(()=>{if(active)setRows(parseLocalSaves(localStorage.getItem(LOCAL_KEY)));}).catch(e=>{if(active)setMessage(e.message);});
    fetch('/api/account').then(r=>r.json()).then(a=>{if(active)setAccount(a);}).catch(()=>{});
    return ()=>{active=false;};
  },[]);
  async function action(fn:()=>Promise<void>) {if(busy)return;setBusy(true);setMessage('');try{await fn();}catch(e){setMessage(e instanceof Error?e.message:'Operation failed.');}finally{setBusy(false);}}
  async function save() {
    if(!result)return;
    const label=name.trim()||`${result.settings.strategy.type} · ${result.settings.symbol}`;
    if(cloud){const response=await fetch('/api/saved',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:label,settings:result.settings})});const data=await response.json();if(!response.ok)throw new Error(data.error);}
    else {
      const current=parseLocalSaves(localStorage.getItem(LOCAL_KEY));if(current.length>=100)throw new Error('Browser storage is limited to 100 reports. Delete older items first.');
      const saved:SavedRun={id:crypto.randomUUID(),name:label,settings:result.settings,summary:result.summary,provenance:result.provenance,is_synthetic:result.isSynthetic,created_at:new Date().toISOString()};
      localStorage.setItem(LOCAL_KEY,JSON.stringify([saved,...current]));
    }
    await load(cloud);setMessage(cloud?'Configuration rerun and saved to your account.':'Saved on this browser.');
  }
  async function auth(kind:'signin'|'signup') {
    const r=await fetch('/api/account',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:kind,email,password})});const data=await r.json();setPassword('');if(!r.ok)throw new Error(data.error);setMessage(data.message);const status=await fetch('/api/account');setAccount(await status.json());
  }
  const button='rounded border border-slate-300 px-3 py-2 text-xs hover:bg-slate-50 disabled:opacity-50';
  return <section className="qe-card space-y-3 p-5" aria-label="Saved workspace"><h2 className="text-sm font-semibold">Saved configurations & history</h2>
    <p className="text-xs text-slate-600">Browser saves belong to this device/browser profile and are visible to anyone using it. Cloud saves require an account. Candle datasets are not stored with reports.</p>
    {account.enabled?<details><summary className="cursor-pointer text-xs">{account.email?`Signed in as ${account.email}`:'Cloud account'}</summary>{account.email?<button className={button} disabled={busy} onClick={()=>action(async()=>{await fetch('/api/account',{method:'DELETE'});setAccount({enabled:true,email:null});setCloud(false);await load(false);})}>Sign out</button>:<div className="mt-3 space-y-2"><label className="block text-xs">Email<input type="email" className="input" value={email} autoComplete="email" onChange={e=>setEmail(e.target.value)}/></label><label className="block text-xs">Password (12+ characters)<input type="password" className="input" value={password} autoComplete="current-password" onChange={e=>setPassword(e.target.value)}/></label><div className="flex gap-2"><button className={button} disabled={busy} onClick={()=>action(()=>auth('signin'))}>Sign in</button><button className={button} disabled={busy} onClick={()=>action(()=>auth('signup'))}>Create account</button></div></div>}</details>:<p className="text-xs text-slate-500">Cloud accounts are not configured. Browser saves are available.</p>}
    <label className="block text-xs">Save location<select className="input" value={cloud?'cloud':'local'} disabled={busy} onChange={e=>action(async()=>{const next=e.target.value==='cloud';await load(next);setCloud(next);})}><option value="local">This browser</option>{account.email&&<option value="cloud">My cloud account</option>}</select></label>
    <label className="block text-xs">Configuration name<input className="input mt-1" value={name} maxLength={100} onChange={e=>setName(e.target.value)} placeholder="e.g. Nifty trend study"/></label>
    <button className={button} disabled={busy||!result} onClick={()=>action(save)}>{busy?'Working…':'Save current result'}</button>
    <p className="text-xs text-slate-700" role="status">{message}</p>
    {!rows.length?<p className="text-xs text-slate-500">No saved configurations in this location.</p>:<ul className="max-h-80 space-y-2 overflow-auto">{rows.map(row=><li key={row.id} className="rounded border border-slate-100 p-3 text-xs"><p className="font-medium">{row.name}</p><p className="mt-1 text-slate-500">{row.is_synthetic?'DEMO':'REAL'} · {row.settings.startDate} — {row.settings.endDate} · Ending {formatCurrency(row.summary.endingCapital)}</p><div className="mt-2 flex gap-2"><button className={button} disabled={busy} onClick={()=>{onOpen(row.settings);setMessage('Configuration opened. Run it to retrieve data and generate a new report.');}}>Reopen</button><button className={button} disabled={busy} onClick={()=>action(async()=>{if(cloud){const r=await fetch(`/api/saved?id=${encodeURIComponent(row.id)}`,{method:'DELETE'});if(!r.ok)throw new Error('Delete failed.');}else localStorage.setItem(LOCAL_KEY,JSON.stringify(parseLocalSaves(localStorage.getItem(LOCAL_KEY)).filter(r=>r.id!==row.id)));await load(cloud);})}>Delete</button></div></li>)}</ul>}
  </section>;
}
