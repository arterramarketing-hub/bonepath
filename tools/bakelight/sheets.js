#!/usr/bin/env node
/* side-by-side sheets from the raw shots: one PNG per view, a row per hour, OFF | AO | AO+SUN.
     node sheets.js [rawDir] [outDir] */
const {chromium,ARGS}=require('./lib');
const fs=require('fs'),path=require('path');
const RAW=process.argv[2]||require('path').join(require('os').tmpdir(),'bakelight-raw');
const OUT=process.argv[3]||path.resolve(__dirname,'../../docs/bakelight');
const COLS=(process.env.BL_COLS||'off,ao,sun').split(','),LABEL={off:'OFF (the game today)',ao:'BAKED: sky occlusion',sun:'BAKED: occlusion + key-light shadow'};
(async()=>{
  const files=fs.readdirSync(RAW).filter(f=>/_off\.png$/.test(f));
  const views={};for(const f of files){const m=f.match(/^(\w+)-(\w+)_(.+)_off\.png$/);if(!m)continue;(views[m[3]]=views[m[3]]||[]).push({mode:m[1],hour:m[2],base:f.replace(/_off\.png$/,'')});}
  const order={noon:0,dusk:1,night:2};
  const b=await chromium.launch({args:ARGS});
  try{for(const [id,rows] of Object.entries(views)){
    rows.sort((x,y)=>order[x.hour]-order[y.hour]);
    const W=560,H=Math.round(W*390/844);
    const html='<body style="margin:0;background:#111;font:13px monospace;color:#ddd"><div id=s style="display:inline-block;padding:8px">'+
      '<div style="display:flex">'+COLS.map(c=>'<div style="width:'+W+'px;margin:2px;text-align:center">'+LABEL[c]+'</div>').join('')+'</div>'+
      rows.map(r=>'<div style="display:flex;position:relative">'+COLS.map(c=>'<img style="width:'+W+'px;height:'+H+'px;margin:2px;image-rendering:pixelated" src="data:image/png;base64,'+fs.readFileSync(path.join(RAW,r.base+'_'+c+'.png')).toString('base64')+'">').join('')+
        '<div style="position:absolute;left:8px;top:6px;background:#000a;padding:1px 5px">'+id+' — '+r.hour+'</div></div>').join('')+'</div></body>';
    const pg=await b.newPage({viewport:{width:COLS.length*(W+4)+40,height:rows.length*(H+4)+60}});
    await pg.setContent(html);await pg.waitForTimeout(300);
    await (await pg.$('#s')).screenshot({path:path.join(OUT,'sheet_'+id+'.png')});await pg.close();
    console.log('sheet_'+id+'.png',rows.map(r=>r.hour).join(','));
  }}finally{await b.close();}
})();
