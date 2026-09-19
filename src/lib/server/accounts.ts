import 'server-only';
import { UserError, object } from '../validation';
export function accountConfig() {
  const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_ANON_KEY;
  if(!url||!key)throw new UserError('Cloud accounts require SUPABASE_URL and SUPABASE_ANON_KEY. Browser-local saves remain available.',503);
  if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url))throw new UserError('Cloud account URL configuration is invalid.',503);
  return {url,key};
}
export function sessionToken(request:Request) {
  const raw=request.headers.get('cookie')?.split(';').map(c=>c.trim()).find(c=>c.startsWith('qe_session='))?.slice(11);
  if(!raw||raw.length>8000||!/^[A-Za-z0-9_.-]+$/.test(raw))throw new UserError('Sign in to access cloud saves.',401);
  return raw;
}
export async function supabaseRequest(path:string,init:RequestInit={},token?:string) {
  const {url,key}=accountConfig();
  const headers=new Headers(init.headers);headers.set('apikey',key);if(token)headers.set('Authorization',`Bearer ${token}`);headers.set('Content-Type','application/json');
  try {return await fetch(url+path,{...init,headers,cache:'no-store',signal:AbortSignal.timeout(15000),redirect:'error'});} catch {throw new UserError('Cloud service is unavailable. Try again later.',503);}
}
export async function requireIdentity(request:Request) {
  const token=sessionToken(request),response=await supabaseRequest('/auth/v1/user',{},token);
  if(!response.ok)throw new UserError('Your session expired. Please sign in again.',401);
  const user=object(await response.json());
  if(typeof user.id!=='string'||!/^[0-9a-f-]{36}$/i.test(user.id))throw new UserError('Unable to verify account.',401);
  return {id:user.id,email:typeof user.email==='string'?user.email:'',token};
}
export function sessionCookie(token:string,maxAge:number) {
  return `qe_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${Math.max(0,Math.min(maxAge,3600))}${process.env.NODE_ENV==='production'?'; Secure':''}`;
}
