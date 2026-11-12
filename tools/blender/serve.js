#!/usr/bin/env node
/* THE TEST PAGE: the real game with the block inlined IN MEMORY, served on
   localhost so it can be played in any browser. index.html is not written.
   Add ?oldknight to the address to see today's knight on the same build.
     node serve.js        */
'use strict';
const L=require('./lib');
(async()=>{const p=L.patched(),s=await L.serve(p.html);
  console.log('BONEPATH with the Blender knight (+'+p.added+' bytes): '+s.url+'\n  today\'s knight, same build:  '+s.url+'?oldknight\nCtrl-C to stop.');})();
