#!/usr/bin/env node
/* THE THREE.JS LINE. three.js stopped shipping a script that defines
   `window.THREE` (no UMD build since r160), and the game is one file that
   opens from disk with no server and no module loader. So the library is
   bundled here into ONE classic-script line and stamped into index.html:

     cd tools/build/three && npm ci
     node build.js              # rebuild the line and write it into ../../../index.html
     node build.js --check      # fail if the line in index.html is not what this would build
     node build.js --out=x.js   # only write the bundle, touch nothing

   Re-run this; never edit the line by hand.

   WHAT IS IN IT. three's WebGL renderer and core (never three.webgpu or
   tsl), from the package's own src/, shaken down to the names the GAME
   uses: the export list is read out of index.html (every `THREE.Name`),
   plus EXTRA below. A name the game starts to use that is not in the line
   is therefore a rebuild away, and `tools/check` (parse) fails until then.
   On top of the library sits legacy.js, THE OLD LIGHT: r128's look, put
   back (read its header). GLSL is stripped of comments and blank lines
   exactly as three's own build does.

   PATCHES are the few places where r128's behaviour cannot be had from
   outside the library. Each is an exact string that MUST be found, once,
   in the named source file, or the build fails: a new revision of three is
   then a decision somebody makes, not a silent change of the picture. */
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib'),esbuild=require('esbuild');
const HERE=__dirname,INDEX=path.resolve(HERE,'../../../index.html');
const arg=k=>{const a=process.argv.find(a=>a===('--'+k)||a.startsWith('--'+k+'='));return a?(a.includes('=')?a.slice(k.length+3):true):null;};
// names the harnesses and the notes may ask for, beyond what the game names
const EXTRA=['REVISION','ShaderChunk','ShaderLib','UniformsLib','ColorManagement','MathUtils','SRGBColorSpace','LinearSRGBColorSpace','NoColorSpace'];
const PATCHES=[
  /* no texture is stored sRGB: r128 kept every texture RGBA8 and decoded an sRGB map in the shader AFTER filtering. The GPU's own
     sRGB format decodes BEFORE filtering, which changes every mip level and every blend between two of them. */
  {file:'src/renderers/webgl/WebGLTextures.js',
   find:'const transfer = forceLinearTransfer ? LinearTransfer : ColorManagement.getTransfer( colorSpace );',
   put:'const transfer = LinearTransfer;'},
  // ...so an sRGB map is decoded in the shader (the path three keeps for video), whatever kind of texture it is
  {file:'src/renderers/webgl/WebGLPrograms.js',
   find:'decodeVideoTexture: HAS_MAP && ( material.map.isVideoTexture === true ) && ( ColorManagement.getTransfer( material.map.colorSpace ) === SRGBTransfer ),',
   put:'decodeVideoTexture: HAS_MAP && ( ColorManagement.getTransfer( material.map.colorSpace ) === SRGBTransfer ),'},
  {file:'src/renderers/webgl/WebGLPrograms.js',
   find:'decodeVideoTextureEmissive: HAS_EMISSIVEMAP && ( material.emissiveMap.isVideoTexture === true ) && ( ColorManagement.getTransfer( material.emissiveMap.colorSpace ) === SRGBTransfer ),',
   put:'decodeVideoTextureEmissive: HAS_EMISSIVEMAP && ( ColorManagement.getTransfer( material.emissiveMap.colorSpace ) === SRGBTransfer ),'},
  /* a render target is written in ITS texture's colour space (r128: the target's `encoding`). r187 writes every target but an XR
     one linear, and the grade pass reads the frame as sRGB. */
  {file:'src/renderers/webgl/WebGLPrograms.js',
   find:'( currentRenderTarget.isXRRenderTarget === true ? currentRenderTarget.texture.colorSpace : ColorManagement.workingColorSpace )',
   put:'( currentRenderTarget.texture.colorSpace || ColorManagement.workingColorSpace )'},
  /* and whether a material is see-through does not make a second program of it (r128's key had no such term; legacy.js writes the
     alpha as the material gave it either way). Without this every clone that fades (a cut body, a bone) compiles its own. */
  {file:'src/renderers/webgl/WebGLPrograms.js',
   find:'opaque: material.transparent === false && material.blending === NormalBlending && material.alphaToCoverage === false,',
   put:'opaque: false,'},
  // nor does whether the geometry carries normals (it only matters to r187's shadow maps, which the game has none of)
  {file:'src/renderers/webgl/WebGLPrograms.js',find:'vertexNormals: !! geometry.attributes.normal,',put:'vertexNormals: true,'},
  // and a Lambert on a geometry without normals is not "flat": it is the same Gouraud program (legacy.js), lit by a normal of zero as in r128
  {file:'src/renderers/webgl/WebGLPrograms.js',
   find:'( material.isMeshLambertMaterial || material.isMeshPhongMaterial || material.isMeshStandardMaterial || material.isMeshPhysicalMaterial )',
   put:'( material.isMeshPhongMaterial || material.isMeshStandardMaterial || material.isMeshPhysicalMaterial )'},
  {file:'src/renderers/WebGLRenderer.js',
   find:'( _currentRenderTarget.isXRRenderTarget === true ? _currentRenderTarget.texture.colorSpace : ColorManagement.workingColorSpace )',
   put:'( _currentRenderTarget.texture.colorSpace || ColorManagement.workingColorSpace )'},
];
/* and two generators are r128's own files, whole (from the three-r128 package, the same library at 0.128.0): the
   lathe, whose normals r187 works out analytically (r128 averaged its faces', and every highlight on a helm and a
   pauldron sits where those put it), and the extrusion, whose caps r187 cuts along other diagonals. */
const OLD=['src/geometries/LatheGeometry.js','src/geometries/ExtrudeGeometry.js'];
const threeDir=path.join(HERE,'node_modules/three'),oldDir=path.join(HERE,'node_modules/three-r128');
const REV=JSON.parse(fs.readFileSync(path.join(threeDir,'package.json'),'utf8')).version;
// three's own build does this to every chunk (utils/build/rollup.config.js, glsl()): comments and blank lines out, one string
const glsl=code=>code.replace(/\/\* glsl \*\/`([\s\S]*?)`/g,(m,p)=>JSON.stringify(p.trim().replace(/\r/g,'').replace(/[ \t]*\/\/.*\n/g,'').replace(/[ \t]*\/\*[\s\S]*?\*\//g,'').replace(/\n{2,}/g,'\n')));
function gameNames(html){
  const lines=html.split('\n'),names=new Set();
  for(const l of lines){if(l.length>5000&&/THREE/.test(l.slice(0,4000))&&!/THREE\.[A-Z]\w+\(/.test(l.slice(0,200)))continue;   // (the bundle itself)
    for(const m of l.matchAll(/\bTHREE\.([A-Za-z_]\w*)/g))names.add(m[1]);}
  return names;
}
async function bundle(names){
  const used={};for(const p of PATCHES)used[p.file]=0;
  const plugin={name:'bonepath',setup(b){
    b.onLoad({filter:/[\\/]three[\\/]src[\\/].*\.js$/},async a=>{
      const rel=path.relative(threeDir,a.path).split(path.sep).join('/');
      let code=await fs.promises.readFile(OLD.includes(rel)?path.join(oldDir,rel):a.path,'utf8');
      if(OLD.includes(rel))used[rel]=1;
      for(const p of PATCHES)if(p.file===rel){
        const n=code.split(p.find).length-1;
        if(n!==1)throw new Error('PATCH: expected one match in '+rel+', found '+n+': '+p.find.slice(0,70));
        code=code.replace(p.find,()=>p.put);used[rel]++;}
      if(/\.glsl\.js$/.test(a.path))code=glsl(code);
      return {contents:code,loader:'js'};});
    b.onLoad({filter:/legacy\.js$/},async a=>({contents:glsl(await fs.promises.readFile(a.path,'utf8')),loader:'js'}));
  }};
  const entry="import './legacy.js';\nexport {"+[...names].sort().join(',')+"} from 'three/src/Three.js';\n";
  const r=await esbuild.build({stdin:{contents:entry,resolveDir:HERE,sourcefile:'entry.js'},bundle:true,format:'iife',globalName:'THREE',minify:true,
    legalComments:'none',target:'es2020',charset:'ascii',supported:{'template-literal':false},   // (a template literal would carry real newlines: the line must stay one line)
    write:false,plugins:[plugin],logLevel:'warning'});
  for(const p of PATCHES)if(used[p.file]<PATCHES.filter(q=>q.file===p.file).length)throw new Error('PATCH: '+p.file+' was never loaded');
  for(const f of OLD)if(!used[f])throw new Error('OLD: '+f+' was never loaded');
  let code=r.outputFiles[0].text.trim();
  if(code.includes('\n')){const i=code.indexOf('\n');throw new Error('the bundle is not one line: ...'+code.slice(i-160,i+80));}
  if(code.includes('</script'))throw new Error('the bundle would close its own script tag');
  return code;
}
(async()=>{
  const html=fs.readFileSync(INDEX,'utf8');
  const exported=Object.keys(await import('three/src/Three.js'));
  const names=new Set([...gameNames(html),...EXTRA]),missing=[...names].filter(n=>!exported.includes(n));
  if(missing.length)throw new Error('the game names things three r'+REV.split('.')[1]+' does not have: THREE.'+missing.join(', THREE.'));
  const code=await bundle(names);
  const lic=fs.readFileSync(path.join(threeDir,'build/three.module.js'),'utf8').match(/^\/\*\*[\s\S]*?\*\//)[0];
  const block='<script>\n'+lic+'\n'+code+'\n</script>';
  const gz=zlib.gzipSync(code,{level:9}).length;
  console.log('three r'+REV.split('.')[1]+': '+names.size+' names, '+code.length+' bytes ('+gz+' gzipped)');
  if(arg('out')){fs.writeFileSync(path.resolve(arg('out')),code+'\n');return;}
  // the three.js script is the first inline script of the page: the licence comment, then the one long line
  const re=/<script>\n\/\*\*\n \* @license[\s\S]*?\n<\/script>/,m=html.match(re);
  if(!m)throw new Error('cannot find the three.js script in index.html');
  if(arg('check')){
    if(m[0]!==block)throw new Error('the three.js line in index.html is not what build.js builds: re-run `node build.js`');
    console.log('index.html carries exactly this line');return;}
  fs.writeFileSync(INDEX,html.replace(re,()=>block));
  console.log('stamped into '+path.relative(process.cwd(),INDEX));
})().catch(e=>{console.error('build failed: '+e.message);process.exit(1);});
