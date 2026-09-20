"use client";
import { BacktestResult } from "@/lib/types";
import { summaryJson, tradeCsv } from "@/lib/exports";

export function downloadFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function ResultActions({ result, onCompare, disabled }: { result: BacktestResult; onCompare: () => void; disabled: boolean }) {
  return <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-semibold text-slate-500">Report ready · {result.provenance?.barCount ?? result.equityCurve.length} observations</p><div className="flex flex-wrap gap-2"><button className="qe-btn-secondary" disabled={disabled} onClick={onCompare}>＋ Compare {disabled ? "(4 max)" : "run"}</button><button className="qe-btn-secondary" onClick={() => downloadFile("quant-edge-trades.csv",tradeCsv(result),"text/csv;charset=utf-8")}>↓ Trade CSV</button><button className="qe-btn-secondary" onClick={() => downloadFile("quant-edge-summary.json",summaryJson(result),"application/json")}>↓ Summary JSON</button></div></div>;
}
