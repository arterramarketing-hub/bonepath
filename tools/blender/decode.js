/* THE BLENDER BLOCK'S DECODER. Plain functions, three.js r128, no loader.
   A block is what tools/blender/build_knight.py writes: a palette (the
   colour as SEEN, like flatMat's hex) and, per rig part, one base64 string
   holding 8-bit positions in the part's own box, a baked AO byte per
   vertex, the triangles' indices, and a palette index and a shade byte per
   face. It comes out NON-indexed with a normal per face, because r128's
   Lambert lights per vertex and ignores `flatShading` — the same reason
   loft() builds its hulls that way. Generated data: never edited by hand. */
function bpDecode(B){
  const pal=B.pal.map(h=>new THREE.Color(h).convertSRGBToLinear()),out={};
  for(const k in B.parts){
    const p=B.parts[k],bin=atob(p.d),u=i=>bin.charCodeAt(i),n=p.n,t=p.t,w=n>256?2:1;
    const oA=3*n,oI=oA+n,oC=oI+3*t*w,oS=oC+t;          // where AO, indices, colours and shades begin
    out[k]=mir=>{                                      // mir: the same part for the other side of the body
      const pos=new Float32Array(9*t),col=new Float32Array(9*t);
      for(let f=0;f<t;f++){
        const c=pal[u(oC+f)],fs=u(oS+f)/200;
        for(let j=0;j<3;j++){
          const o=oI+(3*f+(mir?2-j:j))*w,i=w>1?u(o)|u(o+1)<<8:u(o),q=(3*f+j)*3,s=fs*u(oA+i)/200;
          for(let a=0;a<3;a++)pos[q+a]=(p.b[a]+u(3*i+a)/255*p.b[3+a])*(mir&&!a?-1:1);
          col[q]=c.r*s;col[q+1]=c.g*s;col[q+2]=c.b*s;
        }
      }
      const g=new THREE.BufferGeometry();
      g.setAttribute('position',new THREE.BufferAttribute(pos,3));
      g.setAttribute('color',new THREE.BufferAttribute(col,3));
      g.computeVertexNormals();return g;               // (non-indexed: every face gets its own normal)
    };
  }
  return out;
}
/* ...and onto the rig, the way sheetDress does it: the meshes buildHumanoid
   hung on each joint come off, one mesh per part goes on. The joints, the
   weapon, the cloth and the ground shade are not touched. `mk` makes the
   one material they all share (in the game: ()=>flatMat(0xffffff)). */
function bpDress(rig,B,mk){
  const G=bpDecode(B),m=mk(),strip=g=>{for(const c of g.children.slice())if(c.isMesh&&c!==rig.saya)g.remove(c);};
  const L=[],put=(j,k,mir)=>{const me=new THREE.Mesh(G[k](mir),m);j.add(me);L.push(me);};
  for(const k of['head','torso','body']){strip(rig[k]);put(rig[k],k);}
  for(const s of['R','L']){
    const a=rig['arm'+s],l=rig['leg'+s],am=a.position.x<0,lm=l.position.x<0;   // limbs are authored for +x
    strip(a);put(a,'pauld',am);put(a,'arm',am);
    strip(rig['fore'+s]);put(rig['fore'+s],'fore',am);
    strip(l);put(l,'leg',lm);
    strip(rig['knee'+s]);put(rig['knee'+s],'knee',lm);
  }
  rig.blender=L;                                     // (the new meshes, for anything that wants to find them)
}
