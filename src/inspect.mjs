// Offline partial SKILL.md format inspection based on the public Agent Skills
// specification. Not a full YAML parser or independent trust assessment.
const FIELDS=new Set(['name','description','license','compatibility','metadata','allowed-tools']);
const slug=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const metadataKey=/^[a-zA-Z][a-zA-Z0-9_-]{0,80}$/;
const finding=(severity,code,where,message)=>({severity,code,where,message});
const isStr=x=>typeof x==='string';
function unquote(text){
 const raw=text.trim();
 if(raw===''||raw==='|'||raw==='|-'||raw==='>'||raw==='>-')return {value:raw,unsupported:raw!==''};
 if(raw.startsWith('"')){
   try{const v=JSON.parse(raw);if(typeof v==='string')return {value:v,unsupported:false};}
   catch{}
   return {value:raw,unsupported:true};
 }
 if(raw.startsWith("'")){
   if(raw.length>=2&&raw.endsWith("'"))return {value:raw.slice(1,-1).replace(/''/g,"'"),unsupported:false};
   return {value:raw,unsupported:true};
 }
 if(/^(?:[&*\[{]|!!)/.test(raw)||raw.includes(' #'))return {value:raw,unsupported:true};
 return {value:raw,unsupported:false};
}
export function inspectSkill(source,folderName){
 if(!isStr(source)||!isStr(folderName))throw Error('SKILL.md text and folder name must be strings');
 if(source.length>1048576)throw Error('SKILL.md exceeds 1 MiB input limit');
 const findings=[],add=(...args)=>findings.push(finding(...args));
 const lines=source.replace(/\r\n?/g,'\n').replace(/^\uFEFF/,'').split('\n');
 const declared=Object.create(null);
 if(lines[0]!=='---'){
   add('error','FRONTMATTER_MISSING','line 1','SKILL.md must begin with an exact --- YAML frontmatter delimiter');
   return verdict(declared,findings,lines.length);
 }
 let close=-1;
 for(let i=1;i<Math.min(lines.length,201);i++)if(lines[i]==='---'){close=i;break;}
 if(close<0){
   add('error','FRONTMATTER_UNCLOSED','frontmatter','Closing --- delimiter not found within 200 lines');
   return verdict(declared,findings,lines.length);
 }
 let current=null,unsupported=new Set(),seen=new Set(),metadata={};
 for(let i=1;i<close;i++){
   const line=lines[i],n=i+1;
   if(!line.trim()||/^\s*#/.test(line))continue;
   if(/^[ \t]/.test(line)){
     const m=/^  ([A-Za-z][A-Za-z0-9_-]{0,80}):\s*(.*)$/.exec(line);
     if(current==='metadata'&&m){
       const key=m[1],scalar=unquote(m[2]);
       if(Object.prototype.hasOwnProperty.call(metadata,key))add('error','METADATA_DUPLICATE','line '+n,'Repeated metadata key '+key);
       if(scalar.unsupported)add('review','YAML_COMPLEX','line '+n,'YAML value needs a full parser');
       else metadata[key]=scalar.value;
     }else {
       add('review','YAML_COMPLEX','line '+n,'Nested or multiline YAML is not supported by this lightweight inspector');
       if(current)unsupported.add(current);
     }
     continue;
   }
   const m=/^([A-Za-z][A-Za-z0-9-]*):\s*(.*)$/.exec(line);
   if(!m){
     add('review','YAML_COMPLEX','line '+n,'YAML syntax not recognized by the lightweight parser');
     continue;
   }
   const key=m[1],value=unquote(m[2]);
   current=key;
   if(seen.has(key)){add('error','DUPLICATE_KEY','line '+n,'Repeated top-level key '+key);continue;}
   seen.add(key);
   if(!FIELDS.has(key))add('review','UNKNOWN_FIELD','line '+n,'Additional frontmatter field '+key+' is outside the six-field standard subset');
   if(key==='metadata'){
     if(value.value!==''&&value.value!=='{}')add('review','METADATA_INLINE','line '+n,'Inline metadata must be reviewed with a full YAML parser');
     declared.metadata=metadata;
     continue;
   }
   if(value.unsupported){add('review','YAML_COMPLEX','line '+n,'Unsupported YAML scalar or block syntax for '+key);unsupported.add(key);continue;}
   declared[key]=value.value;
 }
 if(!seen.has('name'))add('error','NAME_MISSING','frontmatter','Required name field is absent');
 else if(!unsupported.has('name')){
   if(!slug.test(declared.name)||declared.name.length>64)add('error','NAME_FORMAT','name','Use 1–64 lowercase letters, digits, single hyphen-separated segments');
   if(declared.name!==folderName)add('error','FOLDER_MISMATCH','name','name should match the parent folder name');
 }
 if(!seen.has('description'))add('error','DESCRIPTION_MISSING','frontmatter','Required description field is absent');
 else if(!unsupported.has('description')){
   if(declared.description.length<1||declared.description.length>1024)add('error','DESCRIPTION_LENGTH','description','Description must be 1–1024 characters');
   else if(declared.description.length<35)add('review','DESCRIPTION_VAGUE','description','Add concrete tasks and when to activate the skill');
 }
 if(seen.has('compatibility')&&!unsupported.has('compatibility')&&declared.compatibility.length>500)
   add('error','COMPATIBILITY_LENGTH','compatibility','Compatibility must be at most 500 characters');
 if(seen.has('allowed-tools')&&!unsupported.has('allowed-tools')){
   const tools=declared['allowed-tools'];
   if(!tools.trim())add('review','EMPTY_TOOL_DECLARATION','allowed-tools','Experimental allowed-tools field has no values');
   if(/(^|\s)\*(?=\s|$)|(?:Bash|Shell|Exec)\(\*\)|\b(?:Write|Edit|Execute)\b/i.test(tools))
     add('review','BROAD_TOOL_CLAIM','allowed-tools','Potentially broad allowed-tools claim; assess capabilities in the actual runtime');
   add('info','EXPERIMENTAL_TOOL_FIELD','allowed-tools','allowed-tools is experimental and support differs by host');
 }
 const body=lines.slice(close+1).join('\n').trim();
 if(!body)add('review','EMPTY_BODY','body','No skill instructions found after frontmatter');
 if(lines.length>500)add('review','LONG_SKILL','body','Consider splitting a long SKILL.md into references');
 if(/(?:ignore (?:all |previous |prior )?instructions|disable (?:all )?safety|send (?:your |all )?(?:api keys?|tokens?|passwords?))/i.test(body))
   add('review','HIGH_RISK_INSTRUCTION','body','Instruction text contains a suspicious request; human security review required');
 if(/\b(?:curl|wget)\b[^\n|]{0,180}\|\s*(?:sh|bash)\b/i.test(body))
   add('review','PIPE_TO_SHELL','body','Network download piped into shell needs manual security review');
 if(/https?:\/\//i.test(body))add('info','EXTERNAL_REFERENCE','body','Body contains external URLs; inspect trust and privacy impact');
 if(/(?:^|\n)\s*(?:scripts|references|assets)\//.test(body))add('info','REFERENCED_ASSETS','body','Referenced paths require separate filesystem validation');
 return verdict(declared,findings,lines.length);
}
function verdict(declared,findings,lineCount){
 const severityCount={error:0,review:0,info:0};
 for(const f of findings)severityCount[f.severity]++;
 const status=severityCount.error?'NEEDS_FIX':severityCount.review?'REVIEW_REQUIRED':'SUBSET_CHECKED';
 return {status,summary:severityCount,lineCount,declared:{...declared},findings,
   limitations:'Lightweight, partial YAML frontmatter checks only; complex YAML requires full parser and skills-ref. No malicious-code detection, runtime authorization, publisher or agent identity verification.'};
}
