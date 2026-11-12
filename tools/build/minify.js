#!/usr/bin/env node
/* THE SERVED PAGE IS THE SOURCE WITHOUT ITS NOTES. A third of the game's
   script is prose comment, which is what the source is FOR and which no
   phone needs to download. The deploy runs this on its own checkout, after
   the build stamp, so the file in the repository is never touched and the
   game still opens straight from disk with no build.

     node tools/build/minify.js index.html            # in place
     node tools/build/minify.js index.html out.html

   Comments and whitespace ONLY: no renaming, no rewriting. Every name in a
   stack trace is still the name in the source, and `window.BP` and every
   harness keep working. The three.js line is already minified and is left
   alone. The title's update check reads `const BP_BUILD='..',BP_BUILT='..';`
   and `const BP_MAJOR='..';` out of the live page's text, so both must
   survive exactly: this fails if they do not. */
'use strict';
const fs=require('fs'),{minify}=require('terser');
const [src,dst]=[process.argv[2],process.argv[3]||process.argv[2]];
if(!src){console.error('usage: minify.js <index.html> [out.html]');process.exit(2);}
(async()=>{
  const html=fs.readFileSync(src,'utf8');
  const re=/(<script(?![^>]*src)[^>]*>)([\s\S]*?)(<\/script>)/g;
  let out='',last=0,m,done=0;
  while((m=re.exec(html))){
    out+=html.slice(last,m.index);last=m.index+m[0].length;
    let code=m[2];
    const dense=code.length/(code.split('\n').length)>2000;      // (the three.js bundle: one line)
    if(!dense&&code.length>20000){
      const r=await minify(code,{compress:false,mangle:false,format:{comments:false,quote_style:3,semicolons:true}});
      if(!r.code)throw new Error('terser gave nothing back');
      new Function(r.code);                                        // it must still compile
      code='\n'+r.code+'\n';done++;
    }
    out+=m[1]+code+m[3];
  }
  out+=html.slice(last);
  if(done!==1)throw new Error('expected to minify exactly one script (the game), minified '+done);
  for(const [name,rx] of [['BP_BUILD',/const BP_BUILD='([^']*)',BP_BUILT='([^']*)';/],['BP_MAJOR',/const BP_MAJOR='([^']*)';/]]){
    const a=html.match(rx),b=out.match(rx);
    if(!a||!b||a[0]!==b[0])throw new Error('the '+name+' line did not survive: the update check would go blind');
  }
  fs.writeFileSync(dst,out);
  console.log('minified '+src+': '+html.length+' -> '+out.length+' bytes ('+Math.round(100-100*out.length/html.length)+'% less)');
})().catch(e=>{console.error('minify failed: '+e.message);process.exit(1);});
