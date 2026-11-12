// shared by the bakelight scripts: start the real game headless and begin a run
const {chromium}=require('playwright');
const path=require('path'),fs=require('fs');
const FILE=path.resolve(__dirname,'../../index.html');
const INJECT=fs.readFileSync(path.join(__dirname,'bake.inject.js'),'utf8');
const ARGS=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader','--mute-audio','--enable-precise-memory-info'];
const press=(pg,id)=>pg.evaluate(I=>document.getElementById(I).dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})),id);
async function start(browser,query,vw=844,vh=390){
  const pg=await browser.newPage({viewport:{width:vw,height:vh}});
  const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200));});
  await pg.goto('file://'+FILE+'?'+query,{waitUntil:'load'});
  await pg.waitForTimeout(4000);
  await press(pg,/mode=(path|ravine)/.test(query)?'modePath':/mode=defend/.test(query)?'modeDefend':'modeField');
  if(await pg.evaluate(()=>window.BP.G.mode==='title'))await press(pg,'menuGo');
  await pg.waitForTimeout(4000);
  await pg.evaluate(INJECT);
  return {pg,errs};
}
module.exports={chromium,ARGS,start,FILE};
