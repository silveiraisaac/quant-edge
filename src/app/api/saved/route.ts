import { requireIdentity,supabaseRequest } from '@/lib/server/accounts';
import { readJson,errorResponse,sameOrigin } from '@/lib/server/http';
import { UserError,object,validateSettings } from '@/lib/validation';
import { runBacktest } from '@/lib/backtest/run-backtest';
export async function GET(request:Request) {
  try {const u=await requireIdentity(request);const response=await supabaseRequest(`/rest/v1/backtest_runs?user_id=eq.${u.id}&select=id,name,settings,summary,provenance,is_synthetic,created_at&order=created_at.desc&limit=100`,{},u.token);if(!response.ok)throw new UserError('Saved history could not be loaded. Check database setup.',503);return Response.json(await response.json(),{headers:{'Cache-Control':'no-store'}});}catch(e){return errorResponse(e);}
}
export async function POST(request:Request) {
  try {
    sameOrigin(request);const u=await requireIdentity(request);const b=object(await readJson(request));
    if(typeof b.name!=='string'||!b.name.trim()||b.name.length>100)throw new UserError('Name must contain 1–100 characters.');
    const settings=validateSettings(b.settings),r=await runBacktest(settings);
    // Compute report server-side. Neither identity nor reported performance is accepted from clients.
    const response=await supabaseRequest('/rest/v1/backtest_runs',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({user_id:u.id,name:b.name.trim(),settings:r.settings,summary:r.summary,provenance:r.provenance,is_synthetic:r.isSynthetic})},u.token);
    if(!response.ok)throw new UserError('Save failed. Check your session and database setup.',503);
    return Response.json(await response.json(),{status:201,headers:{'Cache-Control':'no-store'}});
  }catch(e){return errorResponse(e);}
}
export async function DELETE(request:Request) {
  try {sameOrigin(request);const u=await requireIdentity(request);const id=new URL(request.url).searchParams.get('id');if(!id||!/^[0-9a-f-]{36}$/i.test(id))throw new UserError('Invalid saved item.');const response=await supabaseRequest(`/rest/v1/backtest_runs?id=eq.${id}&user_id=eq.${u.id}`,{method:'DELETE'},u.token);if(!response.ok)throw new UserError('Delete failed.',503);return Response.json({deleted:true});}catch(e){return errorResponse(e);}
}
