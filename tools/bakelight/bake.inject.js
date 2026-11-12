/* BAKED LIGHT — an INJECTED experiment. Nothing here is part of the game:
   tools/bakelight/shots.js loads the real index.html, begins a run and
   evaluates this file in the page. It reaches the game only through
   window.BP and the global THREE.

   What it does (the method a PS1 game used, done at build time on the GPU):
     1. hides everything that is not the static world, and renders the world
        with a depth-only override material from N directions spread over
        the sky (orthographic, one RGBA-packed depth target, one
        readRenderTargetPixels each);
     2. for every vertex of every static lit mesh (pushed a little off its
        face, and lifted out of the soil it is sunk in) asks each map
        whether that direction of sky can be seen -> sky visibility 0..1;
     3. shapes it (a floor, a little sky lost counting as none, a darker foot
        close to the soil) and writes it as a normalized Uint8 attribute,
        aBake = (sky, key);
     4. optionally one bigger map from the key light fills aBake.y;
     5. BL.paint(): the feet of things, blurred into the ground's paint sheet.
   aBake is read by a TWIN of each material (clone + the original's
   onBeforeCompile + the light chunks re-cut: see cutLights), so nothing
   unbaked that shares the material reads a missing attribute. The ground's
   material is its own and is re-cut in place; every ground geometry is
   given the attribute (255 until baked).

   window.BL.bake(opts)  -> stats        window.BL.show(on)  -> swap baked/white
   window.BL.hook()      -> keeps twins in step and bakes ground/tiles that arrive later */
(function(){
'use strict';
const B=window.BP,R=B._renderer,S=B.scene;
const BL=window.BL={on:true,twins:new Map(),done:new Set(),stats:[],opt:null,late:0};

BL.world=function(){
  if(BL._w&&BL._w.parent)return BL._w;
  let w=null;S.traverse(o=>{if(w||!o.isMesh)return;if(o.userData.baked||(o.geometry.attributes.aTrail&&o.material.userData.shader)){let p=o;while(p.parent&&p.parent!==S)p=p.parent;w=p;}});
  return BL._w=w;
};
const isGround=o=>!!(o.geometry.attributes.aTrail&&o.material&&(o.material.userData.shader||o.material.userData.blGround));
const shown=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
// what may carry a baked colour: a lit, opaque, static mesh of the world
function wants(o){
  if(!o.isMesh||o.isSkinnedMesh||BL.done.has(o))return false;
  const m=o.material;if(!m||Array.isArray(m)||m.transparent)return false;
  if(!(m.isMeshLambertMaterial||m.isMeshPhongMaterial))return false;      // (Basic: windows, lantern glass — they are their own light)
  const a=o.geometry&&o.geometry.attributes;if(!a||!a.position||!a.normal)return false;
  if(m.vertexColors||m.userData.blTwin)return false;
  return shown(o);
}
/* THE BAKED TERM SCALES THE SKY'S LIGHT AND NOTHING ELSE. A vertex colour multiplies everything, so a lantern in
   the nave would be dimmed by the roof over it. Instead the two numbers ride in their own attribute, aBake =
   (sky, key), and the stock light chunks are re-cut: the hemisphere's share is multiplied by .x, the one
   directional light's by .y, and the point lights (lanterns, the pilgrim's glow, a flash) are left alone. */
function cutLights(m,orig){
  m.onBeforeCompile=function(s,r){if(orig)orig.call(this,s,r);
    const C=THREE.ShaderChunk;
    if(m.isMeshLambertMaterial){let ch=C.lights_lambert_vertex;const i=ch.indexOf('#if NUM_DIR_LIGHTS > 0');
      ch=ch.slice(0,i)+ch.slice(i).replace('vLightFront += saturate( dotNL ) * directLightColor_Diffuse;','vLightFront += saturate( dotNL ) * directLightColor_Diffuse * aBake.y;');
      ch=ch.replace('vIndirectFront += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );','vIndirectFront += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry ) * aBake.x;');
      s.vertexShader='attribute vec2 aBake;\n'+s.vertexShader.replace('#include <lights_lambert_vertex>',ch);
    }else{let ch=C.lights_fragment_begin;const i=ch.indexOf('#if ( NUM_DIR_LIGHTS > 0 )');
      ch=ch.slice(0,i)+ch.slice(i).replace('getDirectionalDirectLightIrradiance( directionalLight, geometry, directLight );','getDirectionalDirectLightIrradiance( directionalLight, geometry, directLight ); directLight.color *= vBake.y;');
      ch=ch.replace('irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );','irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry ) * vBake.x;');
      s.vertexShader='attribute vec2 aBake;varying vec2 vBake;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvBake=aBake;');
      s.fragmentShader='varying vec2 vBake;\n'+s.fragmentShader.replace('#include <lights_fragment_begin>',ch);}
  };
  const key='bakelight|'+(orig?orig.toString():'');m.customProgramCacheKey=()=>key;
}
function twinOf(m){
  let t=BL.twins.get(m);if(t)return t;
  t=m.clone();cutLights(t,m.onBeforeCompile);                    // (clone() drops onBeforeCompile: the original's is called first, so the wobble stays)
  t.userData=Object.assign({},m.userData,{blTwin:m});
  BL.twins.set(m,t);return t;
}
BL.sync=function(){for(const [m,t] of BL.twins){t.visible=m.visible;if(t.map!==m.map){t.map=m.map;t.needsUpdate=true;}
  t.color.copy(m.color);if(t.emissive&&m.emissive){t.emissive.copy(m.emissive);t.emissiveIntensity=m.emissiveIntensity;}t.opacity=m.opacity;}};

function dirs(N,low){const out=[],ga=Math.PI*(3-Math.sqrt(5));
  for(let i=0;i<N;i++){const y=low+(1-low)*(i+.5)/N,r=Math.sqrt(1-y*y),a=i*ga;out.push(new THREE.Vector3(Math.cos(a)*r,y,Math.sin(a)*r));}
  return out;}

const depthMat=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,side:THREE.DoubleSide});
const targets={};
function rt(size){return targets[size]||(targets[size]={t:new THREE.WebGLRenderTarget(size,size,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,format:THREE.RGBAFormat,type:THREE.UnsignedByteType,depthBuffer:true,stencilBuffer:false}),px:new Uint8Array(size*size*4),d:new Float32Array(size*size)});}

// one depth map of the world, from `dir` (pointing AT the sky), framing the sphere (c, rad)
function depthMap(dir,c,rad,size,tm){
  const T=rt(size),cam=BL._cam||(BL._cam=new THREE.OrthographicCamera(-1,1,1,-1,0,2));
  cam.left=-rad;cam.right=rad;cam.top=rad;cam.bottom=-rad;cam.near=0;cam.far=2*rad;cam.updateProjectionMatrix();
  cam.position.copy(c).addScaledVector(dir,rad);cam.up.set(0,1,0);if(Math.abs(dir.y)>.99)cam.up.set(0,0,-1);cam.lookAt(c);cam.updateMatrixWorld(true);
  let t0=performance.now();
  R.setRenderTarget(T.t);R.setClearColor(0xffffff,1);R.clear(true,true,true);R.render(S,cam);
  const gl=R.getContext();gl.finish();
  let t1=performance.now();
  R.readRenderTargetPixels(T.t,0,0,size,size,T.px);
  let t2=performance.now();
  const px=T.px,d=T.d,k=255/256/255;
  for(let i=0,j=0;i<d.length;i++,j+=4)d[i]=(px[j+3]+px[j+2]/256+px[j+1]/65536+px[j]/16777216)*k;
  tm.render+=t1-t0;tm.read+=t2-t1;tm.unpack+=performance.now()-t2;
  const vp=new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);
  return {d,size,e:vp.elements.slice(),texel:2*rad/size,rad};
}
// visibility of world point (x,y,z) in a map: 2x2 taps, 0..1 (off the map counts as open sky)
function seen(M,x,y,z,bias){
  const e=M.e,s=M.size,d=M.d;
  const u=((e[0]*x+e[4]*y+e[8]*z+e[12])*.5+.5)*s-.5,v=((e[1]*x+e[5]*y+e[9]*z+e[13])*.5+.5)*s-.5;
  const w=(e[2]*x+e[6]*y+e[10]*z+e[14])*.5+.5-bias;
  const iu=Math.floor(u),iv=Math.floor(v);
  if(iu<0||iv<0||iu>=s-1||iv>=s-1)return 1;
  const i=iv*s+iu,fu=u-iu,fv=v-iv;
  return ((w<=d[i]?1:0)*(1-fu)+(w<=d[i+1]?1:0)*fu)*(1-fv)+((w<=d[i+s]?1:0)*(1-fu)+(w<=d[i+s+1]?1:0)*fu)*fv;
}

BL.DEF={N:16,size:1024,low:.1,off:.16,lift:.1,floor:.5,gamma:1,lo:.08,hi:.8,wrap:.03,glass:true,
  soil:.62,soilH:1.1,                 // darkening of anything standing within soilH of the soil, to `soil` at the foot
  gFloor:.45,gGamma:1.2,              // the ground's own shaping (a wide flat thing: it is kept gentler)
  sun:false,sunSize:2048,sunK:1,cath:false,     // the baked shadow of the key light
  cell:0};                           // 0: one set of maps for everything; >0: a set per `cell` metres square
BL.bake=function(opts){
  const o=BL.opt=Object.assign({},BL.DEF,BL.opt||{},opts||{}),W=BL.world(),tAll=performance.now();
  const tm={render:0,read:0,unpack:0,verts:0,gather:0,renders:0};
  const list=[];W.updateWorldMatrix(true,true);((o.cath&&B.cath())||W).traverse(m=>{if(wants(m))list.push(m);});   // (`cath`: the cathedral's group alone, to time one group)
  if(!list.length)return null;
  const hAt=(B.PATH&&B.PATH.on&&B.pathHeightAt)?B.pathHeightAt:B.heightAt;
  // ---- gather: world positions and normals, a private geometry where one is shared
  let tg=performance.now();
  const users=new Map();W.traverse(m=>{if(m.isMesh)users.set(m.geometry,(users.get(m.geometry)||0)+1);});
  const jobs=[],v=new THREE.Vector3(),n=new THREE.Vector3(),nm=new THREE.Matrix3();let nv=0,cloned=0;
  const box=new THREE.Box3();
  for(const m of list){
    const ground=isGround(m);
    if(!ground&&!m.userData.baked&&users.get(m.geometry)>1){m.geometry=m.geometry.clone();cloned++;}
    const g=m.geometry,P=g.attributes.position,Nn=g.attributes.normal,c=P.count;
    const wp=new Float32Array(c*3),wn=new Float32Array(c*3);nm.getNormalMatrix(m.matrixWorld);
    for(let i=0;i<c;i++){v.fromBufferAttribute(P,i).applyMatrix4(m.matrixWorld);n.fromBufferAttribute(Nn,i).applyMatrix3(nm).normalize();
      wn[i*3]=n.x;wn[i*3+1]=n.y;wn[i*3+2]=n.z;
      let x=v.x+n.x*o.off,y=v.y+n.y*o.off,z=v.z+n.z*o.off;
      if(ground){x=v.x;z=v.z;y=v.y+o.lift;}
      else if(Math.abs(v.x)<90){const h=hAt(v.x,v.z);if(isFinite(h)&&v.y<h+o.lift&&v.y>h-3)y=h+o.lift;}   // (a wall is sunk in the soil: its foot is asked from where the soil is)
      wp[i*3]=x;wp[i*3+1]=y;wp[i*3+2]=z;
      if(Math.abs(v.x)<82&&Math.abs(v.z-(m.matrixWorld.elements[14]||0))<400&&v.y>-6)box.expandByPoint(v);}
    jobs.push({m,ground,c,wp,wn,vis:new Float32Array(c),wsum:new Float32Array(c),sh:null});nv+=c;
  }
  tm.gather=performance.now()-tg;
  // ---- hide what is not the static world
  const hid=[];for(const c of S.children)if(c!==W&&c.visible){c.visible=false;hid.push(c);}
  W.traverse(c=>{if(c===W||!c.visible)return;if(c.isSprite||c.isPoints||c.isLine||(c.isMesh&&c.material&&!Array.isArray(c.material)&&(c.material.transparent||(o.glass&&c.material.isMeshBasicMaterial)))){c.visible=false;hid.push(c);}});   // (glass: a window lets the sky in)
  const keep={rt:R.getRenderTarget(),cc:R.getClearColor(new THREE.Color()),ca:R.getClearAlpha(),bg:S.background,ov:S.overrideMaterial,ac:R.autoClear,fog:S.fog};
  S.background=null;S.overrideMaterial=depthMat;R.autoClear=false;
  // ---- the sky's maps, per cell
  const D=dirs(o.N,o.low);
  const cells=new Map();
  const regions=[];
  if(o.cell>0){const cs=o.cell,mk=new Map();
    const reg=(x,z)=>{const k=Math.floor(x/cs)+'|'+Math.floor(z/cs);let r=mk.get(k);if(!r){r={box:new THREE.Box3(),runs:[]};mk.set(k,r);regions.push(r);}return r;};
    for(const j of jobs){const idx=new Map();
      for(let i=0;i<j.c;i++){const x=j.wp[i*3],y=j.wp[i*3+1],z=j.wp[i*3+2];if(Math.abs(x)>82||y<-6)continue;const r=reg(x,z);let a=idx.get(r);if(!a){a=[];idx.set(r,a);r.runs.push({j,a});}a.push(i);r.box.expandByPoint(v.set(x,y,z));}}
  }else{const r={box,runs:jobs.map(j=>({j,a:null}))};regions.push(r);}
  for(const r of regions){
    const c=r.box.getCenter(new THREE.Vector3()),rad=r.box.getSize(new THREE.Vector3()).length()/2+1;
    for(const d of D){const M=depthMap(d,c,rad,o.size,tm);tm.renders++;
      const tv=performance.now(),bias=(M.texel*1.6+.04)/(2*rad);
      for(const run of r.runs){const j=run.j,wp=j.wp,wn=j.wn,vis=j.vis,ws=j.wsum,a=run.a,cnt=a?a.length:j.c;
        for(let q=0;q<cnt;q++){const i=a?a[q]:q,k=i*3;
          const w=j.ground?1:o.wrap+(1-o.wrap)*Math.max(0,wn[k]*d.x+wn[k+1]*d.y+wn[k+2]*d.z);
          vis[i]+=w*seen(M,wp[k],wp[k+1],wp[k+2],bias);ws[i]+=w;}}
      tm.verts+=performance.now()-tv;}
  }
  // ---- the key light's own map
  if(o.sun){const L=B.worldLights.moon.position.clone().normalize();
    const c=box.getCenter(new THREE.Vector3()),rad=box.getSize(new THREE.Vector3()).length()/2+1;
    const M=depthMap(L,c,rad,o.sunSize,tm);tm.renders++;
    const tv=performance.now(),bias=(M.texel*2.2+.05)/(2*rad);
    for(const j of jobs){j.sh=new Float32Array(j.c);for(let i=0,k=0;i<j.c;i++,k+=3)j.sh[i]=seen(M,j.wp[k],j.wp[k+1],j.wp[k+2],bias);}
    tm.verts+=performance.now()-tv;}
  // ---- restore
  S.background=keep.bg;S.overrideMaterial=keep.ov;R.autoClear=keep.ac;R.setRenderTarget(keep.rt);R.setClearColor(keep.cc,keep.ca);
  for(const c of hid)c.visible=true;
  // ---- keep the raw terms (so the shaping can be tried again without the maps), shape, write
  const tw=performance.now();let bytes=0;
  for(const j of jobs){const m=j.m,g=m.geometry,c=j.c;
    const s=new Float32Array(c),gp=new Float32Array(c).fill(1);
    for(let i=0,k=0;i<c;i++,k+=3){
      s[i]=j.wsum[i]>0?j.vis[i]/j.wsum[i]:1;
      if(!j.ground&&j.wn[k+1]<.5&&Math.abs(j.wp[k])<90){const h=hAt(j.wp[k],j.wp[k+2]),up=(j.wp[k+1]-o.lift-h)/o.soilH;
        if(isFinite(h)&&up<1&&up>-1){const u=Math.max(0,up);gp[i]=u*u*(3-2*u);}}}
    const col=new Uint8Array(c*2),white=new Uint8Array(c*2).fill(255),colS=j.sh?new Uint8Array(c*2):null;
    const at=new THREE.BufferAttribute(white,2,true);g.setAttribute('aBake',at);
    m.userData.bl={col,colS,white,at,s,gp,sh:j.sh,ground:j.ground};bytes+=c*2;
    shape(m.userData.bl,o);
    if(j.ground){if(!m.material.userData.blGround){const gm=m.material;cutLights(gm,gm.onBeforeCompile);gm.userData.blGround=true;gm.needsUpdate=true;BL.groundMat=gm;}}
    else{m.userData.blOrig=m.material;m.material=twinOf(m.material);}
    BL.done.add(m);}
  BL.show(BL.on);
  tm.write=performance.now()-tw;
  const st={meshes:jobs.length,ground:jobs.filter(j=>j.ground).length,folded:jobs.filter(j=>j.m.userData.baked).length,verts:nv,cloned,regions:regions.length,renders:tm.renders,readbacks:tm.renders,
    mapSize:o.size,ms:{total:+(performance.now()-tAll).toFixed(1),gather:+tm.gather.toFixed(1),render:+tm.render.toFixed(1),read:+tm.read.toFixed(1),unpack:+tm.unpack.toFixed(1),verts:+tm.verts.toFixed(1),write:+tm.write.toFixed(1)},
    bytes,twins:BL.twins.size};
  BL.stats.push(st);return st;
};
function shape(u,o){const c=u.s.length,col=u.col,cs=u.colS;
  for(let i=0,k=0;i<c;i++,k+=2){const s=Math.min(1,Math.max(0,(u.s[i]-o.lo)/(o.hi-o.lo)));   // (a little sky lost is no shade at all: without this every wall is merely dirtier)
    let a=u.ground?o.gFloor+(1-o.gFloor)*Math.pow(s,o.gGamma):(o.floor+(1-o.floor)*Math.pow(s,o.gamma))*(o.soil+(1-o.soil)*u.gp[i]);
    a=Math.round(255*Math.min(1,a));col[k]=a;col[k+1]=255;
    if(cs){cs[k]=a;cs[k+1]=Math.round(255*(1-o.sunK*(1-u.sh[i])));}}}
// the shaping tried again on the kept terms
BL.reshape=function(opts){const o=Object.assign(BL.opt,opts||{});for(const m of BL.done)if(m.userData.bl)shape(m.userData.bl,o);BL.show(BL.on);};
// the same frame with and without: swap each colour array (no recompile, no material change). on: false | true ('ao') | 'sun'
BL.show=function(on){BL.on=on;BL.paintShow(!!on);for(const m of BL.done){const u=m.userData.bl;if(!u)continue;u.at.array=!on?u.white:(on==='sun'&&u.colS)?u.colS:u.col;u.at.needsUpdate=true;}};
/* THE FOOT OF THINGS, IN THE GROUND'S PAINT SHEET. The ground is a grid a metre and a half across: no vertex
   colour can put a shadow round a gravestone. But the ground already samples a 1024px sheet by world position
   (GP: where torn earth and scorch are painted), fifteen centimetres a texel. So: three depth maps straight up
   and down over the sheet's own square (the soil alone; everything else from below; everything else from above),
   a texel is STOOD ON where something reaches the soil and rises from it, and the blurred footprint goes into
   the sheet as black at a low alpha. */
BL.PDEF={k:.5,blur:2,grow:2,rise:.35,reach:.2,tall:1.2,steps:5};
BL.paint=function(opts){
  const o=BL.popt=Object.assign({},BL.PDEF,opts||{}),GP=B.GP,W=BL.world(),N=GP.S,rad=GP.EXT/2,t0=performance.now(),tm={render:0,read:0,unpack:0};
  if(N>2048)return null;
  const keep={rt:R.getRenderTarget(),cc:R.getClearColor(new THREE.Color()),ca:R.getClearAlpha(),bg:S.background,ov:S.overrideMaterial,ac:R.autoClear};
  const hidS=[];for(const k of S.children)if(k!==W&&k.visible){k.visible=false;hidS.push(k);}
  const gr=[],ob=[];W.traverse(k=>{if(k===W||!k.visible)return;if(k.isMesh&&k.material&&!Array.isArray(k.material)&&!k.material.transparent){(isGround(k)?gr:ob).push(k);}else if(k.isSprite||k.isPoints||k.isLine||k.isMesh){k.visible=false;hidS.push(k);}});
  S.background=null;S.overrideMaterial=depthMat;R.autoClear=false;
  const c=new THREE.Vector3(0,10,GP.oz),up=new THREE.Vector3(0,1,0),dn=new THREE.Vector3(0,-1,0);
  const grab=(dir)=>{const M=depthMap(dir,c,rad,N,tm);return {h:Float32Array.from(M.d),e:M.e};};
  for(const k of ob)k.visible=false;const G0=grab(dn);                       // the soil, from beneath
  for(const k of ob)k.visible=true;for(const k of gr)k.visible=false;
  const Bt=grab(dn),Tp=grab(up);                                               // everything else: its underside, its crown
  for(const k of gr)k.visible=true;for(const k of hidS)k.visible=true;
  S.background=keep.bg;S.overrideMaterial=keep.ov;R.autoClear=keep.ac;R.setRenderTarget(keep.rt);R.setClearColor(keep.cc,keep.ca);
  // from beneath: y = (c.y-rad)+d*2rad ; from above: y = (c.y+rad)-d*2rad. A sheet texel (px,py) -> a map texel through the map's own matrix
  const occ=new Float32Array(N*N),y0=c.y-rad,y1=c.y+rad,ix=(e,x,z)=>{const u=Math.floor(((e[0]*x+e[8]*z+e[12])*.5+.5)*N),v=Math.floor(((e[1]*x+e[9]*z+e[13])*.5+.5)*N);return (u<0||v<0||u>=N||v>=N)?-1:v*N+u;};
  for(let py=0;py<N;py++)for(let px=0;px<N;px++){const x=((px+.5)/N-.5)*GP.EXT,z=((py+.5)/N-.5)*GP.EXT+GP.oz;
    const a=ix(G0.e,x,z),b=ix(Tp.e,x,z);if(a<0||b<0)continue;
    if(G0.h[a]>.999||Bt.h[a]>.999)continue;                                    // no soil here, or nothing over it
    const g=y0+G0.h[a]*2*rad,bot=y0+Bt.h[a]*2*rad,top=y1-Tp.h[b]*2*rad;
    if(bot<g+o.reach&&top>g+o.rise)occ[py*N+px]=Math.min(1,.35+.65*(top-g)/o.tall);}
  // two box blurs: a soft-edged foot, about `blur` texels wide
  const tmp=new Float32Array(N*N),r=o.blur,box=(src,dst,dx)=>{const w=2*r+1;for(let y=0;y<N;y++)for(let x=0;x<N;x++){let s=0;for(let q=-r;q<=r;q++){const xx=dx?Math.min(N-1,Math.max(0,x+q)):x,yy=dx?y:Math.min(N-1,Math.max(0,y+q));s+=src[yy*N+xx];}dst[y*N+x]=s/w;}};
  // (a headstone is one texel thick: the footprint is grown first, or the blur thins it to nothing)
  const grow=(src,dst,dx)=>{const q0=o.grow;for(let y=0;y<N;y++)for(let x=0;x<N;x++){let m=0;for(let q=-q0;q<=q0;q++){const xx=dx?Math.min(N-1,Math.max(0,x+q)):x,yy=dx?y:Math.min(N-1,Math.max(0,y+q)),v=src[yy*N+xx];if(v>m)m=v;}dst[y*N+x]=m;}};
  if(o.grow){grow(occ,tmp,1);grow(tmp,occ,0);}
  box(occ,tmp,1);box(tmp,occ,0);box(occ,tmp,1);box(tmp,occ,0);
  const ctx=GP.ctx,off=ctx.getImageData(0,0,N,N),on=ctx.getImageData(0,0,N,N),d=on.data;let lit=0;
  for(let i=0;i<N*N;i++){let a=Math.min(1,occ[i]*1.25)*o.k;if(o.steps)a=Math.round(a*o.steps/o.k)*o.k/o.steps;   // (a few flat steps: a PS1's banding, not a soft halo)
    const A=Math.round(a*255);if(A>d[i*4+3]){d[i*4]=d[i*4+1]=d[i*4+2]=0;d[i*4+3]=A;lit++;}}
  BL.sheet={on,off};BL.paintShow(BL.on);
  const st={ms:+(performance.now()-t0).toFixed(1),render:+tm.render.toFixed(1),read:+tm.read.toFixed(1),renders:3,readbacks:3,size:N,texels:lit,bytes:0};
  BL.pstats=st;return st;};
BL.paintShow=function(on){if(!BL.sheet)return;const GP=B.GP;GP.ctx.putImageData(on?BL.sheet.on:BL.sheet.off,0,0);GP.tex.needsUpdate=true;};
// what a set of points can see, direction by direction (a check on the maps themselves)
BL.probe=function(pts,c,rad){const o=BL.opt||BL.DEF,W=BL.world(),tm={render:0,read:0,unpack:0};
  const hid=[];for(const k of S.children)if(k!==W&&k.visible){k.visible=false;hid.push(k);}
  W.traverse(k=>{if(k===W||!k.visible)return;if(k.isSprite||k.isPoints||k.isLine||(k.isMesh&&k.material&&!Array.isArray(k.material)&&(k.material.transparent||(o.glass&&k.material.isMeshBasicMaterial)))){k.visible=false;hid.push(k);}});
  const keep={rt:R.getRenderTarget(),cc:R.getClearColor(new THREE.Color()),ca:R.getClearAlpha(),bg:S.background,ov:S.overrideMaterial,ac:R.autoClear};
  S.background=null;S.overrideMaterial=depthMat;R.autoClear=false;
  const out=pts.map(()=>[]);
  for(const d of dirs(o.N,o.low)){const M=depthMap(d,new THREE.Vector3(c[0],c[1],c[2]),rad,o.size,tm),bias=(M.texel*1.6+.04)/(2*rad);
    pts.forEach((p,i)=>out[i].push(+seen(M,p[0],p[1],p[2],bias).toFixed(2)));}
  S.background=keep.bg;S.overrideMaterial=keep.ov;R.autoClear=keep.ac;R.setRenderTarget(keep.rt);R.setClearColor(keep.cc,keep.ca);for(const k of hid)k.visible=true;
  return out;};
// while the game runs: twins follow their originals, and a ground mesh that arrives (a path tile) is white at once and baked a moment later
BL.hook=function(bakeLate){
  if(BL._hooked)return;BL._hooked=true;
  const render=R.render.bind(R);let last=-1,pend=0;
  R.render=function(sc,cam){
    if(sc===S&&S.overrideMaterial!==depthMat){BL.sync();const W=BL.world();
      if(W&&W.children.length!==last){last=W.children.length;let fresh=0;
        if(BL.groundMat)W.traverse(m=>{if(m.isMesh&&m.material===BL.groundMat&&!m.geometry.attributes.aBake){m.geometry.setAttribute('aBake',new THREE.BufferAttribute(new Uint8Array(m.geometry.attributes.position.count*2).fill(255),2,true));fresh++;}});
        pend=30;}
      if(pend>0&&--pend===0&&bakeLate){const st=BL.bake();if(st){BL.late++;}}}
    return render(sc,cam);};
};
})();
