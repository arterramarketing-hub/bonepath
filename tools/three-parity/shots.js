#!/usr/bin/env node
/* THREE PARITY, the pictures. One frozen frame of every kind of thing the
   game draws, read from the canvas at the game's own size, so a change of
   three.js (or of anything under the picture) can be held against the
   frames from before it.

     node shots.js --file=/path/to/index.html --out=/some/dir            # every shot
     node shots.js --file=... --out=... field-noon nave-night            # some

   then `node compare.js <dirA> <dirB> [sheetDir]`. Two runs of ONE file are
   the noise floor: take that first (see README in docs/three-r187). */
'use strict';
const fs=require('fs'),path=require('path');
const {chromium,ARGS,start,pump,snap}=require('./lib');
const arg=k=>(process.argv.find(a=>a.startsWith('--'+k+'='))||'').slice(k.length+3);
const FILE=path.resolve(arg('file')||path.join(__dirname,'../../index.html'));
const OUT=path.resolve(arg('out')||path.join(require('os').tmpdir(),'three-parity'));
fs.mkdirSync(OUT,{recursive:true});
const Q='seed=7&wx=clear&time=';
// a view: p where the pilgrim stands, eye and at as [x, height over the soil, z] ('abs': a height outright)
const CATH={p:[-2,33],eye:[-7,2.6,41],at:[0,9,14]},NAVE={p:[0,13],eye:[1.6,3.3,18.5,'abs'],at:[0,4.2,-14,'abs']},
  GRAVES={p:[-28,-9],eye:[-24.5,2.1,-6.5],at:[-33,.5,-18]},DOOR={p:[0,25],eye:[6,2.2,29],at:[0,3.5,20]};
// `pre` runs in the page once the run has begun; `post` after the frames have turned, before the picture
const SHOTS=[
  {id:'title',q:Q+'noon',stay:true},
  {id:'field-noon',q:Q+'noon',view:CATH},
  {id:'field-dusk',q:Q+'dusk',view:CATH},
  {id:'field-night',q:Q+'night',view:CATH},
  {id:'door-night',q:Q+'night',view:DOOR},
  {id:'nave-noon',q:Q+'noon',view:NAVE},
  {id:'nave-night',q:Q+'night',view:NAVE},
  {id:'graves-noon',q:Q+'noon',view:GRAVES},
  {id:'lantern-night',q:Q+'night',pre:`const l=(B.lanternLights.find(L=>Math.hypot(L.l.position.x,L.l.position.z)>30)||B.lanternLights[0]).l;const x=l.position.x,z=l.position.z,d=Math.hypot(x,z)||1;
     window.__view={p:[x+x/d*3,z+z/d*3],eye:[x+x/d*5.5,2.1,z+z/d*5.5],at:[x,1.5,z]};`},
  {id:'hero-close',q:Q+'noon',pre:`window.__view={p:[-28,-9],eye:[-26.6,1.7,-6.4],at:[-28,1.05,-9]};`},
  {id:'hero-game-cam',q:Q+'dusk',pre:`B.player.x=-20;B.player.z=30;`,frames:90},
  {id:'hero-portrait',q:Q+'noon',portrait:true},
  {id:'hollows',q:Q+'noon',pre:`B.player.x=30;B.player.z=40;for(const e of B.enemies.slice()){const r=e.rig&&e.rig.root;if(r&&r.parent)r.parent.remove(r);}B.enemies.length=0;
     for(const [k,x,z] of [['hollow',31.5,36],['thrower',28.5,36.5],['brute',30,34.5],['hollow',33,20],['hollow',27,16],['hollow',30,4],['thrower',36,-6],['hollow',24,-12],['brute',31,-20]])B.spawnFoe(k,x,z);
     window.__view={p:[30,40],eye:[30.5,2.4,43.5],at:[30,1,20]};`,frames:200},
  {id:'snow',q:'seed=7&time=noon&wx=snow',view:GRAVES},
  {id:'blizzard',q:'seed=7&time=dusk&wx=blizzard',view:CATH},
  {id:'fog',q:'seed=7&time=noon&wx=fog',view:CATH},
  {id:'rain',q:'seed=7&time=dusk&wx=rain',view:GRAVES},
  {id:'storm-night',q:'seed=7&time=night&wx=storm',view:CATH},
  {id:'summer',q:'seed=7&time=noon&wx=summer',pre:`let best=null,bn=0;const T=B.obstacles.filter(o=>o.tree&&isFinite(o.x));
     for(const t of T){const n=T.filter(u=>Math.hypot(u.x-t.x,u.z-t.z)<9).length;if(n>bn){bn=n;best=t;}}
     const d=Math.hypot(best.x,best.z),ux=best.x/d,uz=best.z/d;
     window.__view={p:[best.x-ux*9,best.z-uz*9],eye:[best.x-ux*13+uz*3,3.2,best.z-uz*13-ux*3],at:[best.x,1.6,best.z]};`},
  {id:'path-noon',q:Q+'noon&mode=path',view:{p:[0,-36],eye:[7,5,-31],at:[0,0,-52]}},
  {id:'path-night',q:Q+'night&mode=path',view:{p:[0,-64],eye:[-6,4,-62],at:[1,1,-80]}},
  {id:'ravine',q:Q+'noon&mode=ravine',view:{p:[0,-40],eye:[1.5,3,-36],at:[0,1,-60]}},
  {id:'ravine-rim',q:Q+'noon&mode=ravine',view:{p:[0,-40],eye:[14,9,-34],at:[0,-2,-58]}},
  {id:'castle',q:Q+'dusk&mode=path&castle=1',frames:60},
  {id:'mire',q:'seed=7&mode=defend',frames:60},
  {id:'mire-house',q:'seed=7&mode=defend',view:{p:[0,-14],eye:[5,2.6,-12],at:[0,2,-27]}},
  {id:'mire-hearth',q:'seed=7&mode=defend',view:{p:[0,-24],eye:[1.2,1.7,-22.5,'rel'],at:[0,1.2,-28]}},
  {id:'fps-gun',q:Q+'noon',pre:`B.player.x=-2;B.player.z=33;B.player.facing=Math.PI;for(let i=0;i<20&&B.LOADOUT.weapon!=='m4';i++)B.cycleLoadout('weapon',1);B.setPov(true);`,frames:60},
  {id:'fps-flash',q:Q+'night',pre:`B.player.x=-2;B.player.z=33;B.player.facing=Math.PI;for(let i=0;i<20&&B.LOADOUT.weapon!=='deagle';i++)B.cycleLoadout('weapon',1);B.setPov(true);`,frames:60,
     post:`B.fireGun();window.__pump(1);`},
  {id:'fps-scope',q:Q+'noon',pre:`B.player.x=-2;B.player.z=33;B.player.facing=Math.PI;for(let i=0;i<20&&B.LOADOUT.weapon!=='sniper';i++)B.cycleLoadout('weapon',1);B.setPov(true);B.FPS.adsOn=true;`,frames:90},
  {id:'slash-arc',q:Q+'night',pre:`window.__view={p:[-28,-9],eye:[-26.2,1.9,-6.4],at:[-28,1.1,-9]};`,
     post:`const P=B.player,y=B.heightAt(P.x,P.z)+1.1;B.slashArc(P.x,P.z,y,P.facing,0xe8c890,'cross',1);B.slashArc(P.x,P.z,y+.3,P.facing,0x9fd0ff,'sweep',-1);B.groundWave(P.x,P.z,P.facing,0,0);window.__pump(2);`},
  {id:'bubbles',q:Q+'dusk',pre:`B.player.x=-28;B.player.z=-9;for(let i=0;i<20&&B.LOADOUT.weapon!=='wand';i++)B.cycleLoadout('weapon',1);
     window.__view={p:[-28,-9],eye:[-25.8,1.9,-6.2],at:[-28,1.4,-9]};`,frames:30,
     post:`const P=B.player;for(let k=0;k<2;k++){P.state='cast';P.t=0;P.hitDone=false;P.sfxDone=false;P.thudDone=false;P.castN=3;P.castBig=k===1;window.__pump(34);}`},
  {id:'cut-body',q:Q+'noon',pre:`B.player.x=30;B.player.z=40;for(const e of B.enemies.slice()){const r=e.rig&&e.rig.root;if(r&&r.parent)r.parent.remove(r);}B.enemies.length=0;
     window.__e=B.spawnFoe('hollow',30,37.4);window.__view={p:[30,40],eye:[31.6,1.7,39.2],at:[30,1,37.4]};`,frames:150,
     post:`const e=window.__e;B.splitEnemy(e,0,'yoko',true);window.__pump(26);`},
  {id:'angel',q:Q+'night',pre:`B.player.x=30;B.player.z=40;B.summonAngel();`,frames:150},
  {id:'codex-hollow',q:'mode=codex',pre:`window.codexShowX(0,0);`,frames:40},
  {id:'codex-horror-6',q:'mode=codex',pre:`window.codexShowX(0,6);`,frames:40},
  {id:'codex-place',q:'mode=codex',pre:`window.codexShowX(1,1);`,frames:40},
];
const SETVIEW=`(v)=>{const B=window.BP,cam=B.camera,H=B.heightAt;const y=a=>a[3]==='abs'?a[1]:H(a[0],a[2])+a[1];
  cam.position.set(v.eye[0],y(v.eye),v.eye[2]);cam.lookAt(v.at[0],y(v.at),v.at[2]);cam.updateMatrixWorld(true);}`;
(async()=>{
  const want=process.argv.slice(2).filter(a=>!a.startsWith('--')),list=want.length?SHOTS.filter(s=>want.includes(s.id)):SHOTS;
  const report={};let prior={};try{prior=JSON.parse(fs.readFileSync(path.join(OUT,'report.json'),'utf8'));}catch(e){}
  const browser=await chromium.launch({args:ARGS});
  try{for(const s of list){
    const t0=Date.now(),{pg,errs,warns,bootMs}=await start(browser,FILE,s.q,{stay:s.stay});
    try{
      await pg.evaluate(()=>{try{localStorage.clear();}catch(e){}});
      if(s.view)await pg.evaluate(v=>{window.__view=v;},s.view);
      if(s.pre)await pg.evaluate('(()=>{const B=window.BP;'+s.pre+'})()');
      const v=await pg.evaluate(()=>{const v=window.__view,B=window.BP;if(v&&v.p){B.player.x=v.p[0];B.player.z=v.p[1];B.player.hp=B.player.maxHp;}return v||null;});
      await pg.evaluate(()=>window.__seed(4242));
      await pump(pg,s.frames||45);
      if(v&&v.p)await pg.evaluate(v=>{const B=window.BP;B.player.hp=B.player.maxHp;},v);
      if(s.post)await pg.evaluate('(()=>{const B=window.BP;'+s.post+'})()');
      let r;
      if(s.portrait){
        await pg.evaluate(()=>window.BP.setPaused(true));await pump(pg,12);
        r=await pg.evaluate(()=>({png:document.getElementById('heroView').toDataURL('image/png')}));
      }else{
        if(v&&v.eye)await pg.evaluate('('+SETVIEW+')('+JSON.stringify(v)+')');
        r=await snap(pg);
      }
      fs.writeFileSync(path.join(OUT,s.id+'.png'),Buffer.from(r.png.split(',')[1],'base64'));delete r.png;
      const mode=await pg.evaluate(()=>window.BP.G.mode),miss=await pg.evaluate(()=>window.__miss);
      report[s.id]=Object.assign(r,{mode,errors:errs.slice(0,6),warnings:[...new Set(warns)].slice(0,8),misses:[...new Set(miss)],bootMs});
      console.log(s.id.padEnd(16),'calls',r.calls,'tris',r.tris,'progs',r.programs,'errs',errs.length,'warns',warns.length,'miss',miss.length,(Date.now()-t0)+'ms');
      if(errs.length)console.log('   ERR',errs.slice(0,3).join(' | '));
      if(warns.length)console.log('   WARN',[...new Set(warns)].slice(0,3).join(' | '));
      if(miss.length)console.log('   MISS',[...new Set(miss)].join(' | '));
    }catch(e){console.log(s.id,'FAILED',e.message.slice(0,400));report[s.id]={failed:e.message.slice(0,400),errors:errs.slice(0,6)};}
    await pg.close();
  }}finally{await browser.close();}
  fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(Object.assign(prior,report),null,1));
})();
