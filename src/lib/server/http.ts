import { UserError } from '../validation';
export async function readJson(request:Request,limit=16000):Promise<unknown> {
  if(!request.headers.get('content-type')?.includes('application/json'))throw new UserError('Content-Type must be application/json.',415);
  const reader=request.body?.getReader();if(!reader)throw new UserError('Request body is required.');
  const chunks:Uint8Array[]=[];let size=0;
  try {for(;;){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw new UserError('Request is too large.',413);}chunks.push(value);}} finally {reader.releaseLock();}
  try {return JSON.parse(new TextDecoder().decode(Buffer.concat(chunks)));}catch{throw new UserError('Invalid JSON.');}
}
export function sameOrigin(request:Request) {
  const origin=request.headers.get('origin');
  if(!origin||origin!==new URL(request.url).origin)throw new UserError('Request origin is not allowed.',403);
}
export function errorResponse(error:unknown) {
  return Response.json({error:error instanceof UserError?error.message:'The request could not be completed. Please try again.'},{status:error instanceof UserError?error.status:500,headers:{'Cache-Control':'no-store',...(error instanceof UserError&&error.status===429?{'Retry-After':'60'}:{})}});
}
