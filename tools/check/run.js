#!/usr/bin/env node
/* BONEPATH checks. There is no unit-test suite: the game is one file and the
   only honest test is to load it and play it. This does that, headless, and
   fails loudly on any page error.

     cd tools/check && npm install && node run.js            # everything
     node run.js parse boot                                  # a subset
     node run.js --file=/some/other/index.html codex

   Checks: parse (every inline script compiles), boot (field, path, ravine
   and Mire each start with no error), codex (every entry of every section
   shown in turn), path / ravine (walk ~70 hexes of each), leak (walk the
   path to hex 80 and hold heap, GPU geometry and the registries to a
   ceiling). Chromium: $CHROME_PATH, else /opt/pw-browsers, else whatever
   playwright-core installed (`npx playwright-core install chromium`). */
'use strict';
const fs=require('fs'),path=require('path');
const argv=process.argv.slice(2);
const FILE=path.resolve((argv.find(a=>a.startsWith('--file='))||'').slice(7)||path.join(__dirname,'../../index.html'));
const ALL=['parse','boot','codex','path','ravine','leak'];
const want=argv.filter(a=>!a.startsWith('--'));
const RUN=want.length?want:ALL;
for(const w of RUN)if(!ALL.includes(w)){console.error('unknown check '+w+' — one of '+ALL.join(', '));process.exit(2);}

function chromePath(){
  if(process.env.CHROME_PATH)return process.env.CHROME_PATH;
  const root='/opt/pw-browsers';
  try{for(const d of fs.readdirSync(root).filter(d=>/^chromium-\d+$/.test(d)).sort().reverse()){
    const p=path.join(root,d,'chrome-linux/chrome');if(fs.existsSync(p))return p;}}catch(e){}
  return undefined;   // playwright-core's own install
}
const ARGS=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader','--enable-precise-memory-info','--js-flags=--expose-gc'];
const URL0='file://'+FILE;
const fails=[];
const fail=(check,msg)=>{fails.push(check+': '+msg);console.log('  FAIL '+msg);};
const ok=msg=>console.log('  ok   '+msg);

let browser=null;
async function page(vw,vh){
  if(!browser){const {chromium}=require('playwright-core');
    browser=await chromium.launch({executablePath:chromePath(),args:ARGS});}
  const pg=await browser.newPage({viewport:{width:vw,height:vh}});
  const errs=[];
  pg.on('pageerror',e=>errs.push(e.message));
  pg.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,160));});
  return {pg,errs};
}
const press=(pg,id)=>pg.evaluate(I=>{const e=document.getElementById(I);if(!e)throw new Error('no #'+I);
  e.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));},id);

/* ---- parse ---- */
function checkParse(){
  const h=fs.readFileSync(FILE,'utf8');
  const re=/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g;let m,i=0,bad=0;
  while((m=re.exec(h))){i++;try{new Function(m[1]);}catch(e){bad++;fail('parse','script '+i+': '+e.message);}}
  if(!bad)ok(i+' inline scripts compile');
}

/* ---- boot every mode ---- */
async function checkBoot(){
  for(const [id,q] of [['modeField',''],['modePath','&mode=path'],['modeRavine','&mode=ravine'],['modeDefend','&mode=defend']]){
    const {pg,errs}=await page(420,320);
    await pg.goto(URL0+'?seed=7&time=noon&wx=clear'+q,{waitUntil:'load'});
    await pg.waitForTimeout(4000);
    await press(pg,id);
    await pg.waitForTimeout(5000);
    const st=await pg.evaluate(()=>window.BP?{mode:window.BP.G.mode,foes:window.BP.enemies.length}:{mode:'never started',foes:0});
    const msg=id+' mode='+st.mode+' foes='+st.foes+' errors='+errs.length;
    if(errs.length||st.mode!=='play')fail('boot',msg+' '+errs.slice(0,3).join(' | '));else ok(msg);
    await pg.close();
  }
}

/* ---- the codex: every entry ---- */
async function checkCodex(){
  const {pg,errs}=await page(844,390);
  await pg.goto(URL0+'?mode=codex',{waitUntil:'load'});
  await pg.waitForTimeout(5000);
  if(errs.length){fail('codex','boot: '+errs.slice(0,3).join(' | '));await pg.close();return;}
  const N=await pg.evaluate(()=>window.CX_N());
  let shown=0;
  for(let c=0;c<N.length;c++)for(let i=0;i<N[c];i++){
    const e0=errs.length;
    await pg.evaluate(([c,i])=>window.codexShowX(c,i),[c,i]);
    await pg.waitForTimeout(c===0?2500:1200);
    const r=await pg.evaluate(()=>({name:document.getElementById('cxName').textContent,mode:window.BP.G.mode}));
    shown++;
    if(errs.length>e0||r.mode!=='play')fail('codex',c+'.'+i+' "'+r.name+'" mode='+r.mode+' '+errs.slice(e0,e0+2).join(' | '));
  }
  if(!fails.some(f=>f.startsWith('codex')))ok(shown+' entries across '+N.length+' sections, 0 errors');
  await pg.close();
}

/* ---- walk the path ---- */
async function walk(check,mode,id,seed){
  const {pg,errs}=await page(400,240);
  await pg.goto(URL0+'?mode='+mode+'&seed='+seed+'&time=noon&wx=clear',{waitUntil:'load'});
  await pg.waitForTimeout(3500);
  await press(pg,id);
  await pg.waitForTimeout(1500);
  const r=await pg.evaluate(async()=>{const B=window.BP,P=B.player,PA=B.PATH,f=()=>new Promise(q=>requestAnimationFrame(q));
    let z=P.z,turns=0,hour=B.RUN.time;
    for(let i=0;i<900;i++){z-=3;P.hp=P.maxHp;
      const t=PA.tiles.find(t=>t&&!t.dead&&t.ground&&z<=t.z0&&z>=t.z1);
      const c=t&&t.cache&&!t.cache.done;
      P.x=c?t.cache.x:0;P.z=(c&&Math.abs(z-t.cache.z)<20)?t.cache.z:z;
      // keep the host off the road so the walk is not a fight
      for(const e of B.enemies)if(Math.abs(e.z-P.z)<40)e.x=Math.sign(e.x||1)*(t?B.pathEdge(t,e.z-t.zc)-1.5:18);
      await f();
      if(B.RUN.time!==hour){turns++;hour=B.RUN.time;}
    }
    return {far:PA.far,mode:B.G.mode,turns,
      kinds:PA.tiles.map(t=>t&&(t.special?t.special[0].toUpperCase():t.rav?'r':t.cath?'C':t.kind[0])).join('')};});
  const msg=mode+' seed '+seed+': '+r.far+' hexes, '+r.turns+' turns of the day, mode='+r.mode+', errors='+errs.length;
  if(errs.length||r.mode!=='play'||r.far<40)fail(check,msg+' '+errs.slice(0,3).join(' | '));else ok(msg);
  console.log('       '+r.kinds);
  await pg.close();
}

/* ---- leaks: walk to hex 80 and hold the line ---- */
async function checkLeak(){
  const {pg,errs}=await page(640,360);
  await pg.goto(URL0+'?mode=path&seed=2&time=noon&wx=clear',{waitUntil:'load'});
  await pg.waitForTimeout(3500);
  await press(pg,'modePath');
  await pg.waitForTimeout(1500);
  const snap=()=>pg.evaluate(async()=>{const B=window.BP,f=()=>new Promise(q=>requestAnimationFrame(q));
    for(let i=0;i<30;i++)await f();if(window.gc)window.gc();
    return {far:B.PATH.far,heap:Math.round(performance.memory.usedJSHeapSize/1e6),
      geoms:B._renderer.info.memory.geometries,texs:B._renderer.info.memory.textures,...B._reg()};});
  const go=goal=>pg.evaluate(async goal=>{const B=window.BP,P=B.player,PA=B.PATH,f=()=>new Promise(q=>requestAnimationFrame(q));
    let z=P.z;for(let i=0;i<20000&&PA.far<goal;i++){z-=3;P.x=0;P.z=z;P.hp=P.maxHp;P.state='free';
      for(const e of B.enemies)if(Math.abs(e.z-P.z)<60&&e.kind!=='arm')e.x=300;await f();}},goal);
  await go(40);const a=await snap();
  await go(80);const b=await snap();
  console.log('       hex '+a.far+': '+JSON.stringify(a));
  console.log('       hex '+b.far+': '+JSON.stringify(b));
  // Ceilings. What a torn-down hex leaves behind grows with distance walked;
  // what a live stretch holds does not. Measured at the time of writing:
  // heap 45–70 MB, geoCache ~550, textures ~54 over 120 hexes.
  const lim=[['heap',b.heap,140],['geoCache',b.geoCache,1000],['texs',b.texs,110]];
  for(const [k,v,m] of lim)if(v>m)fail('leak',k+' '+v+' over its ceiling of '+m);
  // Growth from hex 40 to hex 80: a leak doubles, a live stretch wobbles.
  for(const k of ['geoms','geoCache','roads','roadMeshes','obstacles','breakables','baked','terrain','garg','world']){
    const x=a[k],y=b[k];if(y>x*1.5+40)fail('leak',k+' grew '+x+' -> '+y+' between hex '+a.far+' and '+b.far);}
  if(errs.length)fail('leak','errors '+errs.slice(0,3).join(' | '));
  if(!fails.some(f=>f.startsWith('leak')))ok('heap '+b.heap+'MB, geoCache '+b.geoCache+', '+b.geoms+' geometries, '+b.texs+' textures at hex '+b.far);
  await pg.close();
}

(async()=>{
  if(!fs.existsSync(FILE)){console.error('no such file '+FILE);process.exit(2);}
  console.log('checking '+FILE);
  const t0=Date.now();
  for(const w of RUN){const t=Date.now();console.log('\n['+w+']');
    // one check dying (the page never started, say) does not stop the rest
    try{
      if(w==='parse')checkParse();
      if(w==='boot')await checkBoot();
      if(w==='codex')await checkCodex();
      if(w==='path')await walk('path','path','modePath',3);
      if(w==='ravine')await walk('ravine','ravine','modeRavine',3);
      if(w==='leak')await checkLeak();
    }catch(e){fail(w,'harness: '+String(e&&e.message||e).split('\n')[0]);}
    console.log('  ('+((Date.now()-t)/1000).toFixed(0)+'s)');
  }
  if(browser)await browser.close();
  console.log('\n'+(fails.length?fails.length+' FAILED':'all passed')+' in '+((Date.now()-t0)/1000).toFixed(0)+'s');
  for(const f of fails)console.log('  - '+f);
  process.exit(fails.length?1:0);
})();
