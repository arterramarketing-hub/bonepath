#!/usr/bin/env node
/* Photographs the hero in the REAL game, and plays it for twenty seconds.

     node shoot.js --mode=none    --out=DIR     today's knight          (before_*.png)
     node shoot.js --mode=inject  --out=DIR     the untouched index.html, the new parts swapped onto the live rig at runtime
     node shoot.js --mode=patched --out=DIR     an in-memory copy of index.html with the block inlined (the rehearsal)
     ... --wx=snow                              the same, in a blizzard, after a roll (snow_ prefix)

   index.html on disk is only ever read. Shots: turnarounds and poses up
   close (648 lines, the game's own `?res`), the pause-screen portrait, and
   the real camera at the real 216 lines. Writes <tag>_report.json. */
'use strict';
const fs=require('fs'),path=require('path'),L=require('./lib');
const arg=(k,d)=>{const a=process.argv.find(a=>a.startsWith('--'+k+'='));return a?a.slice(k.length+3):d;};
const MODE=arg('mode','none'),WX=arg('wx',''),OUT=path.resolve(arg('out',path.join(__dirname,'out')));
const TAG=(WX?'snow_':'')+arg('tag',MODE==='none'?'before':MODE==='inject'?'inject':'after');
fs.mkdirSync(OUT,{recursive:true});
const save=(name,url)=>fs.writeFileSync(path.join(OUT,TAG+'_'+name+'.png'),Buffer.from(url.split(',')[1],'base64'));
const DEC=fs.readFileSync(path.join(__dirname,'decode.js'),'utf8'),BLK=fs.readFileSync(path.join(__dirname,'knight.block.json'),'utf8');

/* page side: the camera, the waiting, and (inject mode) what rebuild() would have done */
function helpers(){
  const B=window.BP,T=window.THREE,P=B.player;
  window.__grab=()=>{B.renderFrame();return B.renderer.domElement.toDataURL();};
  window.__cam=(yaw,dist,h,lookY,fov)=>{const c=B.camera,a=(P.facing||0)+yaw*Math.PI/180,gy=B.heightAt(P.x,P.z);
    const sp=c.position.clone(),sq=c.quaternion.clone(),sf=c.fov;
    c.position.set(P.x+Math.sin(a)*dist,gy+h,P.z+Math.cos(a)*dist);c.lookAt(P.x,gy+lookY,P.z);c.fov=fov;c.updateProjectionMatrix();c.updateMatrixWorld(true);
    const u=window.__grab();c.position.copy(sp);c.quaternion.copy(sq);c.fov=sf;c.updateProjectionMatrix();c.updateMatrixWorld(true);return u;};
  window.__until=(fn,ms)=>new Promise(res=>{const t0=performance.now();const tick=()=>{let r=null;try{r=fn();}catch(e){}
    if(r||performance.now()-t0>ms)res(r||null);else requestAnimationFrame(tick);};requestAnimationFrame(tick);});
  // nothing comes near while the pictures are taken
  window.__away=setInterval(()=>{P.hp=P.maxHp;for(const e of B.enemies){const dx=e.x-P.x,dz=e.z-P.z,d=Math.hypot(dx,dz)||1;if(d<30){e.x=P.x+dx/d*46;e.z=P.z+dz/d*46;}}},200);
  window.__stat=()=>{let tris=0,meshes=0,bad=0;P.rig.body.traverse(o=>{if(o.isMesh&&o.visible){let w=false;for(let p=o;p;p=p.parent)if(p===P.rig.weapon)w=true;
      if(!w){meshes++;const g=o.geometry;tris+=(g.index?g.index.count:g.attributes.position.count)/3;}}
      if(!isFinite(o.rotation.x+o.rotation.y+o.rotation.z+o.position.x+o.position.y+o.position.z))bad++;});
    B.renderFrame();return {bodyMeshes:meshes,bodyTris:tris,nanJoints:bad,frameDraws:B.renderer.info.render.calls,frameTris:B.renderer.info.render.triangles,state:P.state,hp:P.hp,blender:!!P.rig.blender};};
}
function inject(){
  const B=window.BP,T=window.THREE,P=B.player;
  const short=Math.min(innerWidth,innerHeight),bk=Math.min(216,short)/short,u={value:new T.Vector2(Math.round(innerWidth*bk)/2,Math.round(innerHeight*bk)/2)};
  // flatMat(0xffffff) is inside the game's closure; this is its twin: Lambert, vertex colours, the same clip-space snap
  const mk=()=>{const m=new T.MeshLambertMaterial({vertexColors:true});m.onBeforeCompile=s=>{s.uniforms.uSnap=u;
    s.vertexShader='uniform vec2 uSnap;\n'+s.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n gl_Position.xy=floor(gl_Position.xy/gl_Position.w*uSnap+0.5)/uSnap*gl_Position.w;');};return m;};
  const knight=()=>!B.LOADOUT.armour||B.LOADOUT.armour==='knight';
  const live=()=>{const r=P.rig;if(r.blender||!knight())return;
    bpDress(r,BP_KNIGHT,mk);
    P.mats=[];r.root.traverse(o=>{if(o.isMesh&&o.material&&o.material.emissive)P.mats.push(o.material);});   // the hurt flash
    r.fpsMask=null;r.fpsMasked=false;                                                                         // first person measures again
    if(r.snowDress){r.snowDress=r.snowDress.filter(e=>{let p=e.mesh;while(p&&p!==r.root)p=p.parent;return !!p;});   // the wardrobe: dressSnow's list, for the new meshes
      r.root.updateMatrixWorld(true);const v=new T.Vector3(),y0=r.root.position.y;
      for(const o of r.blender){o.getWorldPosition(v);const sh=Math.max(0,Math.min(1,(.88-(v.y-y0))/.5));if(sh>0)o.material=mk();
        r.snowDress.push({m:o.material,sh,wep:false,mesh:o,base:o.material.color.clone()});}
      r.snowAt=-1;}};
  live();
  const rb=P.rebuild;P.rebuild=function(){rb.call(this);live();};
  // the pause portrait builds its own rig in its own scene: caught on its way to the renderer
  const rr=B.renderer.render.bind(B.renderer);
  B.renderer.render=(sc,cam)=>{if(sc!==B.scene&&sc.isScene&&knight())for(const root of sc.children){
      if(!root.isGroup||root.userData.bp)continue;const G=o=>o.children.filter(c=>c.type==='Group'&&!c.userData.lodKeep);
      const body=G(root)[0];if(!body)continue;const bg=G(body),torso=bg.find(g=>Math.abs(g.position.x)<.01),legs=bg.filter(g=>Math.abs(g.position.x)>.05);
      if(!torso||legs.length!==2)continue;const tg=G(torso),head=tg.find(g=>Math.abs(g.position.x)<.01&&g.position.y>.5),arms=tg.filter(g=>Math.abs(g.position.x)>.2);
      if(!head||arms.length!==2)continue;const aR=arms.find(a=>a.position.x<0),aL=arms.find(a=>a.position.x>0),lR=legs.find(a=>a.position.x>0),lL=legs.find(a=>a.position.x<0);
      bpDress({head,torso,body,armR:aR,armL:aL,foreR:G(aR)[0],foreL:G(aL)[0],legR:lR,legL:lL,kneeR:G(lR)[0],kneeL:G(lL)[0]},BP_KNIGHT,mk);root.userData.bp=1;}
    return rr(sc,cam);};
}

(async()=>{
  const br=await L.launch();let srv=null;const rep={mode:MODE,tag:TAG,wx:WX||'clear',errors:[]};
  try{
    let base=null;
    if(MODE==='patched'){const p=L.patched();rep.addedBytes=p.added;const s=await L.serve(p.html);srv=s.srv;base=s.url;}
    const open=async(q,vw,vh)=>{const {pg,errs}=await L.begin(br,q+(WX?'&wx='+WX:''),vw,vh,base);
      if(MODE==='inject'){await pg.addScriptTag({content:DEC+'\nwindow.BP_KNIGHT='+BLK+';window.bpDress=bpDress;'});await pg.evaluate(inject);}
      await pg.evaluate(helpers);await pg.waitForTimeout(1200);return {pg,errs};};
    const key=(pg,k)=>pg.keyboard.press(k);
    const poses=async(pg,shot)=>{                               // the same four moments, whichever camera `shot` is
      await shot('stand');
      await pg.keyboard.down('KeyW');await pg.waitForTimeout(1500);await shot('walk');await pg.keyboard.up('KeyW');await pg.waitForTimeout(700);
      await key(pg,'KeyJ');await pg.evaluate(()=>window.__until(()=>{const P=window.BP.player;return P.state==='attack'&&P.t>P.atkDur*.56;},3000));await shot('swing');
      await pg.evaluate(()=>window.__until(()=>window.BP.player.state==='free',4000));await pg.waitForTimeout(300);
      await pg.keyboard.down('KeyW');await pg.waitForTimeout(250);await key(pg,'KeyK');
      await pg.evaluate(()=>window.__until(()=>{const P=window.BP.player;return P.state==='roll'&&P.t>.22;},3000));await shot('roll');
      await pg.keyboard.up('KeyW');await pg.evaluate(()=>window.__until(()=>window.BP.player.state==='free',4000));await pg.waitForTimeout(400);
    };

    if(!WX){
      /* ---- up close: 648 lines ---- */
      const {pg,errs}=await open('&res=648',1152,648);
      for(const [n,yaw] of [['front',0],['q34',35],['side',90],['back34',150],['back',180]])
        save('close_'+n,await pg.evaluate(y=>window.__cam(y,5.2,1.35,1.12,34),yaw));
      await poses(pg,async n=>{if(n!=='stand')save('close_'+n,await pg.evaluate(()=>window.__cam(150,5.6,1.5,1.05,34)));});
      await pg.evaluate(()=>window.BP.setPaused(true));await pg.waitForTimeout(1500);
      const hv=await pg.$('#heroView');
      if(hv&&await hv.isVisible())save('pause',await pg.evaluate(()=>document.getElementById('heroView').toDataURL()));else rep.pause='hero preview not visible';
      await pg.evaluate(()=>window.BP.setPaused(false));
      rep.close=await pg.evaluate(()=>window.__stat());rep.errors.push(...errs);await pg.close();
    }
    /* ---- the real camera, the real 216 lines ---- */
    const {pg,errs}=await open('',844,390);
    rep.canvas=await pg.evaluate(()=>[window.BP.renderer.domElement.width,window.BP.renderer.domElement.height]);
    if(WX){   // a roll through the drift first, so he is wearing it
      await pg.keyboard.down('KeyW');for(let i=0;i<3;i++){await pg.waitForTimeout(900);await key(pg,'KeyK');}await pg.waitForTimeout(1200);await pg.keyboard.up('KeyW');await pg.waitForTimeout(600);
      rep.snow=await pg.evaluate(()=>{const P=window.BP.player;return {cling:P.snowCling,coat:P.snowCoat,boot:P.snowBoot,deep:window.BP.snowDeep()};});
      save('close_back34',await pg.evaluate(()=>window.__cam(150,5.2,1.35,1.12,34)));save('close_q34',await pg.evaluate(()=>window.__cam(35,5.2,1.35,1.12,34)));
    }
    await poses(pg,async n=>save('game_'+n,await pg.evaluate(()=>window.__grab())));
    rep.game=await pg.evaluate(()=>window.__stat());
    if(!WX){
      /* ---- twenty seconds of play: walk, swing, roll, a blow taken, first person and back, the pause ---- */
      const t0=Date.now(),e0=errs.length;
      await pg.evaluate(()=>clearInterval(window.__away));
      await pg.keyboard.down('KeyW');await pg.waitForTimeout(2500);await key(pg,'KeyJ');await pg.waitForTimeout(1200);await key(pg,'KeyJ');await pg.waitForTimeout(300);await key(pg,'KeyJ');await pg.waitForTimeout(1800);
      await key(pg,'KeyK');await pg.waitForTimeout(1500);await pg.keyboard.up('KeyW');
      rep.hit=await pg.evaluate(()=>{const P=window.BP.player,h0=P.hp;const r=P.takeHit(5,P.x+1,P.z+1,false);return {ret:String(r),from:h0,to:P.hp,state:P.state};});
      await pg.waitForTimeout(500);save('game_hit',await pg.evaluate(()=>window.__grab()));await pg.waitForTimeout(1500);
      await pg.evaluate(()=>window.BP.setPov(true));await pg.keyboard.down('KeyW');await pg.waitForTimeout(2500);
      rep.fps=await pg.evaluate(()=>{const r=window.BP.player.rig,F=window.BP.FPS;return {on:F.on,masked:r.fpsMasked,maskN:r.fpsMask?r.fpsMask.length:null,rootVisible:r.root.visible};});
      save('game_fps',await pg.evaluate(()=>window.__grab()));
      await pg.keyboard.press('KeyJ');await pg.waitForTimeout(1200);
      await pg.evaluate(()=>window.BP.setPov(false));await pg.keyboard.up('KeyW');await pg.waitForTimeout(1500);
      rep.fpsBack=await pg.evaluate(()=>{const r=window.BP.player.rig;return {masked:r.fpsMasked,hidden:r.blender?r.blender.filter(m=>m.layers.mask!==1).length:null};});
      await pg.evaluate(()=>window.BP.setPaused(true));await pg.waitForTimeout(1200);await pg.evaluate(()=>window.BP.setPaused(false));
      // a death and a rising: the ragdoll writes the joints, respawn() rebuilds the rig
      rep.die=await pg.evaluate(async()=>{const P=window.BP.player;P.hp=1;P.takeHit(50,P.x+1,P.z,true);await new Promise(r=>setTimeout(r,2500));return {state:P.state,hp:P.hp};});
      while(Date.now()-t0<20000)await pg.waitForTimeout(500);
      save('game_dead',await pg.evaluate(()=>window.__grab()));
      rep.soak={seconds:(Date.now()-t0)/1000,newErrors:errs.length-e0,end:await pg.evaluate(()=>window.__stat())};
    }
    rep.errors.push(...errs);await pg.close();
  }finally{await br.close();if(srv)srv.close();}
  fs.writeFileSync(path.join(OUT,TAG+'_report.json'),JSON.stringify(rep,null,1));
  console.log(JSON.stringify(rep));
  if(rep.errors.length){console.error('PAGE ERRORS: '+rep.errors.length);process.exit(1);}
})().catch(e=>{console.error(e);process.exit(1);});
