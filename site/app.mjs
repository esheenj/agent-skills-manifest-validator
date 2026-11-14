import {inspectSkill} from './inspect.mjs';
const $=id=>document.getElementById(id);
const sample=`---
name: incident-review
description: Guides engineers through incident evidence triage, timeline reconstruction, and review preparation. Use when investigating fictional system incidents.
license: MIT
compatibility: Works offline with plain Markdown and no external services
metadata:
  author: Esheen Labs
  version: "1.0"
allowed-tools: Read Grep
---
# Incident review

Use fictional event logs. Summarize the sequence and identify gaps.
Never change production systems or treat self-reported events as authenticated evidence.
`;
let result=null;
const reset=()=>{$('folder').value='incident-review';$('source').value=sample;$('summary').textContent='Example loaded. Run the format inspection.';};
function inspect(){
 try{
  result=inspectSkill($('source').value,$('folder').value.trim());
  const m=result.summary;
  for(const [id,value] of Object.entries({errors:m.error,reviews:m.review,notes:m.info}))$(id).textContent=String(value);
  $('status').textContent=result.status.replaceAll('_',' ');
  $('status').className='badge '+(result.status==='NEEDS_FIX'?'error':result.status==='REVIEW_REQUIRED'?'review':'pass');
  $('summary').textContent=result.limitations;
  const list=$('findings');list.replaceChildren();
  if(result.findings.length===0){const li=document.createElement('li');li.textContent='No issues found within supported subset. Full YAML and security validation are still separate.';list.append(li);}
  for(const f of result.findings){
   const li=document.createElement('li'),level=document.createElement('span'),detail=document.createElement('div'),head=document.createElement('strong'),p=document.createElement('p');
   level.className='level '+f.severity;level.textContent=f.severity.toUpperCase();
   head.textContent=f.code+' · '+f.where;p.textContent=f.message;detail.append(head,p);li.append(level,detail);list.append(li);
  }
  $('export').disabled=false;
 }catch(err){result=null;$('status').textContent='INPUT ERROR';$('status').className='badge error';$('summary').textContent=err.message;$('findings').replaceChildren();$('export').disabled=true;for(const id of ['errors','reviews','notes'])$(id).textContent='—';}
}
function exportReport(){
 if(!result)return;
 const blob=new Blob([JSON.stringify(result,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='agent-skills-inspection.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$('example').addEventListener('click',reset);$('inspect').addEventListener('click',inspect);$('export').addEventListener('click',exportReport);reset();
