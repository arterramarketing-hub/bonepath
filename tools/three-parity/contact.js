#!/usr/bin/env node
/* THREE PARITY, the contact sheet: every picture of one shots.js directory on one page, named, to LOOK at.

     node contact.js <dir> <out.jpg> [columns=4] [name ...] */
'use strict';
const fs=require('fs'),path=require('path');
const {chromium,ARGS}=require('./lib');
const [DIR,OUT,COLS,...ONLY]=process.argv.slice(2);
if(!DIR||!OUT){console.error('usage: contact.js <dir> <out.jpg> [columns] [name ...]');process.exit(2);}
(async()=>{
  const names=fs.readdirSync(DIR).filter(f=>f.endsWith('.png')&&(!ONLY.length||ONLY.includes(f.replace(/\.png$/,'')))).sort();
  const browser=await chromium.launch({args:ARGS}),pg=await browser.newPage();
  try{const r=await pg.evaluate(async([list,cols,jpg])=>{
      const load=s=>new Promise(ok=>{const i=new Image();i.onload=()=>ok(i);i.src=s;});
      const im=[];for(const [n,u] of list)im.push([n,await load(u)]);
      const W=Math.max(...im.map(x=>x[1].width)),H=Math.max(...im.map(x=>x[1].height)),rows=Math.ceil(im.length/cols);
      const c=document.createElement('canvas');c.width=cols*(W+6)+6;c.height=rows*(H+20)+6;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.fillStyle='#111';x.fillRect(0,0,c.width,c.height);
      x.font='12px monospace';x.textBaseline='top';
      im.forEach(([n,i],k)=>{const px=6+(k%cols)*(W+6),py=6+Math.floor(k/cols)*(H+20);x.drawImage(i,px,py+14);x.fillStyle='#ddd';x.fillText(n,px,py);});
      return jpg?c.toDataURL('image/jpeg',.85):c.toDataURL('image/png');
    },[names.map(f=>[f.replace(/\.png$/,''),'data:image/png;base64,'+fs.readFileSync(path.join(DIR,f)).toString('base64')]),+COLS||4,/\.jpe?g$/.test(OUT)]);
    fs.writeFileSync(OUT,Buffer.from(r.split(',')[1],'base64'));
  }finally{await browser.close();}
})();
