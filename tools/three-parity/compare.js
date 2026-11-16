#!/usr/bin/env node
/* THREE PARITY, the numbers. Holds two directories of shots.js pictures
   against each other, pixel for pixel:

     node compare.js <dirA> <dirB>                 # the table
     node compare.js <dirA> <dirB> <sheetDir>      # and a sheet a shot: A | B | the difference x8
     node compare.js <dirA> <dirB> <sheetDir> --jpg --k=1   # small sheets, for keeping in the repository

   differ  how many pixels are not the same
   mean  the mean absolute difference per channel, of 255
   p99   the 99th percentile of a pixel's largest channel difference
   max   the largest
   >8    the share of pixels off by more than 8 in some channel
   The grade quantizes brightness to 63 steps on a dither, so one unit of
   difference before it is four after it: read `mean` against the floor
   two runs of ONE file give, not against zero. Decoding is done by the
   browser (no image library to install). */
'use strict';
const fs=require('fs'),path=require('path');
const {chromium,ARGS}=require('./lib');
const [A,B,SHEETS]=process.argv.slice(2).filter(a=>!a.startsWith('--'));
if(!A||!B){console.error('usage: compare.js <dirA> <dirB> [sheetDir]');process.exit(2);}
const JPG=process.argv.includes('--jpg'),K=+((process.argv.find(a=>a.startsWith('--k='))||'').slice(4))||2;   // (--jpg --k=1: small sheets, for keeping)
(async()=>{
  const names=fs.readdirSync(A).filter(f=>f.endsWith('.png')&&fs.existsSync(path.join(B,f))).sort();
  if(SHEETS)fs.mkdirSync(SHEETS,{recursive:true});
  const browser=await chromium.launch({args:ARGS}),pg=await browser.newPage(),rows=[];
  let rA={},rB={};try{rA=JSON.parse(fs.readFileSync(path.join(A,'report.json'),'utf8'));rB=JSON.parse(fs.readFileSync(path.join(B,'report.json'),'utf8'));}catch(e){}
  try{for(const f of names){
    const u=d=>'data:image/png;base64,'+fs.readFileSync(path.join(d,f)).toString('base64');
    const r=await pg.evaluate(async([a,b,sheet,jpg,K])=>{
      const load=s=>new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=s;});
      const ia=await load(a),ib=await load(b),w=ia.width,h=ia.height;
      if(ib.width!==w||ib.height!==h)return {size:[w,h,ib.width,ib.height]};
      const px=i=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.drawImage(i,0,0);return x.getImageData(0,0,w,h).data;};
      const da=px(ia),db=px(ib),hist=new Uint32Array(256);let sum=0,max=0,big=0,sa=0,sb=0,differ=0;
      const dc=document.createElement('canvas');dc.width=w;dc.height=h;const dx=dc.getContext('2d'),di=dx.createImageData(w,h);
      for(let i=0;i<da.length;i+=4){let m=0;
        for(let k=0;k<3;k++){const d=Math.abs(da[i+k]-db[i+k]);sum+=d;if(d>m)m=d;di.data[i+k]=Math.min(255,d*8);sa+=da[i+k];sb+=db[i+k];}
        di.data[i+3]=255;hist[m]++;if(m)differ++;if(m>max)max=m;if(m>8)big++;}
      const n=w*h;let acc=0,p99=0;for(let v=0;v<256;v++){acc+=hist[v];if(acc>=n*.99){p99=v;break;}}
      let png=null;
      if(sheet){dx.putImageData(di,0,0);const S=document.createElement('canvas');S.width=w*K*3+16;S.height=h*K;const sx=S.getContext('2d');sx.imageSmoothingEnabled=false;
        sx.fillStyle='#000';sx.fillRect(0,0,S.width,S.height);sx.drawImage(ia,0,0,w*K,h*K);sx.drawImage(ib,w*K+8,0,w*K,h*K);sx.drawImage(dc,w*K*2+16,0,w*K,h*K);
        png=jpg?S.toDataURL('image/jpeg',.82):S.toDataURL('image/png');}
      return {w,h,differ,mean:sum/(n*3),max,p99,big:big/n,bright:(sb-sa)/(n*3),png};
    },[u(A),u(B),!!SHEETS,JPG,K]);
    const id=f.replace(/\.png$/,'');
    if(r.size){console.log(id.padEnd(16),'SIZES DIFFER',r.size.join(' '));continue;}
    if(r.png)fs.writeFileSync(path.join(SHEETS,id+(JPG?'.jpg':'.png')),Buffer.from(r.png.split(',')[1],'base64'));delete r.png;
    const a=rA[id]||{},b=rB[id]||{};
    rows.push(Object.assign({id},r,{callsA:a.calls,callsB:b.calls,trisA:a.tris,trisB:b.tris,progsA:a.programs,progsB:b.programs}));
    console.log(id.padEnd(16),'differ',String(r.differ).padStart(6),'mean',r.mean.toFixed(3).padStart(7),'p99',String(r.p99).padStart(3),'max',String(r.max).padStart(3),'>8',(r.big*100).toFixed(2).padStart(6)+'%',
      'bright',(r.bright>=0?'+':'')+r.bright.toFixed(3),' calls',a.calls,'->',b.calls,' tris',a.tris,'->',b.tris,' progs',a.programs,'->',b.programs);
  }}finally{await browser.close();}
  if(SHEETS)fs.writeFileSync(path.join(SHEETS,'parity.json'),JSON.stringify(rows,null,1));
})();
