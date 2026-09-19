import { accountConfig,requireIdentity,sessionCookie,supabaseRequest } from '@/lib/server/accounts';
import { errorResponse,readJson,sameOrigin } from '@/lib/server/http';
import { UserError,object } from '@/lib/validation';
export async function GET(request:Request) {
  try {accountConfig();try{const u=await requireIdentity(request);return Response.json({enabled:true,email:u.email},{headers:{'Cache-Control':'no-store'}});}catch(e){if(e instanceof UserError&&e.status===401)return Response.json({enabled:true,email:null},{headers:{'Cache-Control':'no-store'}});throw e;}}
  catch(e){if(e instanceof UserError&&e.status===503)return Response.json({enabled:false,email:null});return errorResponse(e);}
}
export async function POST(request:Request) {
  try {
    sameOrigin(request);const b=object(await readJson(request,4000));
    if(b.action!=='signin'&&b.action!=='signup')throw new UserError('Unknown account action.');
    if(typeof b.email!=='string'||!/^\S+@\S+\.\S+$/.test(b.email)||b.email.length>254||typeof b.password!=='string'||b.password.length<12||b.password.length>128)throw new UserError('Use a valid email and a password of 12–128 characters.');
    const response=await supabaseRequest(b.action==='signup'?'/auth/v1/signup':'/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email:b.email,password:b.password})});
    if(!response.ok)throw new UserError(response.status===429?'Too many sign-in attempts. Try again later.':'Unable to sign in or register. Check your details and email confirmation.',response.status===429?429:401);
    const data=object(await response.json());
    if(typeof data.access_token!=='string')return Response.json({message:'Check your email to confirm your account, then sign in.'});
    if(!/^[A-Za-z0-9_.-]+$/.test(data.access_token))throw new UserError('Invalid account service response.',502);
    return Response.json({message:'Signed in.'},{headers:{'Set-Cookie':sessionCookie(data.access_token,Number(data.expires_in)||3600),'Cache-Control':'no-store'}});
  }catch(e){return errorResponse(e);}
}
export async function DELETE(request:Request) {
  try{sameOrigin(request);return Response.json({message:'Signed out.'},{headers:{'Set-Cookie':sessionCookie('',0),'Cache-Control':'no-store'}});}catch(e){return errorResponse(e);}
}
