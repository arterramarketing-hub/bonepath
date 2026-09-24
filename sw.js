/* BONEPATH'S OFFLINE KEEPER. The game is one page, so keeping it is
   keeping one page: index.html, the manifest and the home-screen icon.
   NETWORK FIRST: with a connection the phone always gets the page as it
   was last pushed, and the copy it keeps is refreshed on the way through;
   with none, the kept copy is served and the game runs as before. The
   records themselves are not here: they are the page's own localStorage
   (see WHAT THE MARROW REMEMBERS in index.html). Bump VERSION only to
   throw away every kept copy at once. */
const VERSION='bonepath-1';
const KEEP=['./','index.html','manifest.webmanifest','icons/icon-180.png','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','icons/icon-64.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(VERSION).then(c=>c.addAll(KEEP)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==self.location.origin)return;
  e.respondWith(fetch(r).then(res=>{
    if(res&&res.ok){const copy=res.clone();caches.open(VERSION).then(c=>c.put(r,copy));}
    return res;
  }).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==='navigate'?caches.match('index.html'):undefined))));
});
