#!/usr/bin/env node
/* Measures TODAY's knight on the live rig: every mesh under every joint, its
   triangles, its material, its box in the joint's own frame, and each joint's
   pivot in the rest pose. Writes today_parts.json (the table in README.md is
   made from it).   node measure_rig.js */
'use strict';
const fs=require('fs'),path=require('path'),{launch,begin}=require('./lib');
(async()=>{
  const br=await launch();
  try{
    const {pg,errs}=await begin(br,'');
    const out=await pg.evaluate(()=>{
      const B=window.BP,rig=B.player.rig,T=window.THREE;   // (boxes are taken in each joint's own frame, so the pose he happens to be in does not matter)
      rig.root.updateMatrixWorld(true);
      const J=['body','torso','head','armR','foreR','weapon','armL','foreL','legR','kneeR','legL','kneeL'];
      const owner=o=>{for(let p=o.parent;p;p=p.parent){const k=J.find(k=>rig[k]===p);if(k)return k;if(p===rig.root)return 'root';}return '?';};
      const avg=m=>{let c=[1,1,1];const im=m.map&&m.map.image;
        if(im&&im.getContext){const d=im.getContext('2d').getImageData(0,0,im.width,im.height).data;let r=0,g=0,b=0,n=d.length/4;
          for(let i=0;i<d.length;i+=4){r+=d[i];g+=d[i+1];b+=d[i+2];}c=[r/n/255,g/n/255,b/n/255];}
        // the map is sRGB, the colour linear: what is SEEN is map * colour, in sRGB
        const lin=v=>Math.pow(v,2.2),srgb=v=>Math.pow(Math.max(0,v),1/2.2);
        const k=m.color?[m.color.r,m.color.g,m.color.b]:[1,1,1];
        const texEnc=m.map&&m.map.encoding===T.sRGBEncoding;
        const o=c.map((v,i)=>srgb((texEnc?lin(v):v)*k[i]*(texEnc?1:1)));
        return '#'+o.map(v=>('0'+Math.round(Math.min(1,v)*255).toString(16)).slice(-2)).join('');};
      const meshes=[],v=new T.Vector3(),inv=new T.Matrix4(),bx=new T.Box3();let draws=0;
      rig.root.traverse(o=>{if(!o.isMesh)return;draws++;
        const k=owner(o),g=o.geometry,tri=(g.index?g.index.count:g.attributes.position.count)/3;
        const j=k==='root'?rig.root:rig[k];inv.copy(j.matrixWorld).invert();bx.makeEmpty();
        const P=g.attributes.position;for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(o.matrixWorld).applyMatrix4(inv);bx.expandByPoint(v);}
        const r=a=>a.toArray().map(x=>+x.toFixed(3));
        meshes.push({joint:k,geo:g.type,tris:tri,min:r(bx.min),max:r(bx.max),mat:(o.material.type.replace('Mesh','').replace('Material','')),
          tex:!!o.material.map,seen:avg(o.material),flat:!!o.material.flatShading,vc:!!o.material.vertexColors,keep:!!o.userData.lodKeep,matId:o.material.uuid.slice(0,6)});});
      const piv={};for(const k of J){piv[k]={parent:J.find(p=>rig[p]===rig[k].parent)||'root',local:rig[k].position.toArray().map(x=>+x.toFixed(3))};}piv.body.local[1]=rig.baseY;
      bx.setFromObject(rig.body);
      return {pivots:piv,baseY:rig.baseY,AL:rig.AL,L:rig.L,bodyBox:[bx.min.toArray(),bx.max.toArray()],draws,meshes,
        cloths:rig.cloths.length,loadout:rig.loadout};
    });
    out.errors=errs;
    fs.writeFileSync(path.join(__dirname,'today_parts.json'),JSON.stringify(out,null,1));
    const by={};for(const m of out.meshes){const b=by[m.joint]||(by[m.joint]={n:0,tris:0});b.n++;b.tris+=m.tris;}
    console.log('draws',out.draws,'tris',out.meshes.reduce((a,m)=>a+m.tris,0));console.log(by);console.log(out.pivots);console.log('errors',errs);
  }finally{await br.close();}
})().catch(e=>{console.error(e);process.exit(1);});
