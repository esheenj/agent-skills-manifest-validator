#!/usr/bin/env node
import {readFile} from 'node:fs/promises';
import {inspectSkill} from './inspect.mjs';
const [path,folder]=process.argv.slice(2);
if(!path||!folder){console.error('Usage: node src/cli.mjs path/to/SKILL.md folder-name');process.exitCode=1;}
else try{
 const source=await readFile(path,'utf8'),result=inspectSkill(source,folder);
 console.log(JSON.stringify(result,null,2));
 process.exitCode=result.status==='NEEDS_FIX'?2:result.status==='REVIEW_REQUIRED'?3:0;
}catch(err){console.error('Input error: '+err.message);process.exitCode=1;}
