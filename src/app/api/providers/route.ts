import { getProvider } from '@/lib/data/registry';
export async function GET(request:Request) {
  const id=new URL(request.url).searchParams.get('id')??'synthetic';
  if(!['synthetic','kite'].includes(id))return Response.json({error:'Unknown provider.'},{status:400});
  try { return Response.json(await getProvider(id).listSymbols(),{headers:{'Cache-Control':'no-store'}}); }
  catch { return Response.json({error:'Provider instruments are not configured correctly.'},{status:503}); }
}
