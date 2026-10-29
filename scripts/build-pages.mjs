import {spawnSync} from 'node:child_process';
import {copyFileSync,cpSync,mkdirSync,writeFileSync} from 'node:fs';
const result=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build','--config','vite.pages.config.ts'],{stdio:'inherit'});
if(result.status!==0)process.exit(result.status||1);
mkdirSync('pages-assets',{recursive:true});
cpSync('site-pages/pages-assets','pages-assets',{recursive:true});
copyFileSync('site-pages/web/index.html','index.html');
writeFileSync('.nojekyll','');
