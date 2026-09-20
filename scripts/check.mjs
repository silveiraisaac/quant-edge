import { spawnSync } from 'node:child_process';
const commands=[
  ['--import','./tests/register.mjs','--test','tests/*.test.ts'],
  ['node_modules/next/dist/bin/next','typegen'],
  ['node_modules/typescript/bin/tsc','--noEmit'],
  ['node_modules/eslint/bin/eslint.js','--max-warnings','0'],
  ['node_modules/next/dist/bin/next','build'],
];
for(const args of commands){
  const result=spawnSync(process.execPath,args,{stdio:'inherit',env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'}});
  if(result.status!==0)process.exit(result.status??1);
}
