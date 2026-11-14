import {mkdir,copyFile,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});
for(const f of ['index.html','app.mjs','style.css'])await copyFile('site/'+f,'dist/'+f);
await copyFile('src/inspect.mjs','dist/inspect.mjs');
console.log('Built standalone static site in dist/');
