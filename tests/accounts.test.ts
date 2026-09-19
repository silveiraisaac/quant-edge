import { test } from 'node:test';
import assert from 'node:assert/strict';
import { requireIdentity,sessionCookie,sessionToken } from '../src/lib/server/accounts';
import { sameOrigin,readJson } from '../src/lib/server/http';
import { parseLocalSaves } from '../src/lib/saved';
test('missing and invalid session cookies rejected',()=>{assert.throws(()=>sessionToken(new Request('http://localhost')));assert.throws(()=>sessionToken(new Request('http://localhost',{headers:{cookie:'qe_session=bad%0Dtoken'}})));});
test('session cookie is HTTP-only and SameSite strict',()=>{assert.match(sessionCookie('test',3600),/HttpOnly; SameSite=Strict/);});
test('cross-origin and missing-origin mutations rejected',()=>{assert.throws(()=>sameOrigin(new Request('https://qe.example',{headers:{origin:'https://evil.example'}})));assert.throws(()=>sameOrigin(new Request('https://qe.example')));sameOrigin(new Request('https://qe.example',{headers:{origin:'https://qe.example'}}));});
test('bounded JSON reader rejects oversized and malformed data',async()=>{await assert.rejects(()=>readJson(new Request('https://qe.example',{method:'POST',headers:{'content-type':'application/json'},body:'x'.repeat(100)}),20));await assert.rejects(()=>readJson(new Request('https://qe.example',{method:'POST',headers:{'content-type':'application/json'},body:'not JSON'})));});
test('identity is verified by auth service, never trusted from caller user ID',async()=>{
 const old=fetch,url=process.env.SUPABASE_URL,key=process.env.SUPABASE_ANON_KEY;process.env.SUPABASE_URL='https://fixture.supabase.co';process.env.SUPABASE_ANON_KEY='public-fixture-key';
 globalThis.fetch=async(input,init)=>{assert.equal(String(input),'https://fixture.supabase.co/auth/v1/user');assert.equal(new Headers(init?.headers).get('authorization'),'Bearer opaque-fixture');return Response.json({id:'00000000-0000-4000-8000-000000000001',email:'a@example.invalid'});};
 try{const u=await requireIdentity(new Request('https://qe.example?user_id=forged',{headers:{cookie:'qe_session=opaque-fixture'}}));assert.equal(u.id,'00000000-0000-4000-8000-000000000001');}finally{globalThis.fetch=old;if(url)process.env.SUPABASE_URL=url;else delete process.env.SUPABASE_URL;if(key)process.env.SUPABASE_ANON_KEY=key;else delete process.env.SUPABASE_ANON_KEY;}
});
test('malformed local history fails instead of silently discarding user data',()=>{assert.throws(()=>parseLocalSaves('bad'));assert.throws(()=>parseLocalSaves('{}'));assert.deepEqual(parseLocalSaves(null),[]);});
