var VERSION="2026-09-26-sol-decode";
var SHELL="iris-shell-"+VERSION;
var FILES=["./","index.html","iris.css","i18n.js","sol-decode.js","app.js","boot.js","ui.js","chrome.js",
  "favicon.svg","iris-eye.svg","hero.svg","qr.svg","icon-192.png","icon-512.png","manifest.webmanifest",
  "IMG_6697.jpeg","IMG_6698.jpeg"];

self.addEventListener("install",function(e){
  e.waitUntil(caches.open(SHELL).then(function(c){
    return Promise.all(FILES.map(function(f){
      return c.add(new Request(f,{cache:"reload"})).catch(function(){});
    }));
  }).then(function(){return self.skipWaiting();}));
});

self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){
      return k===SHELL?null:caches.delete(k);
    }));
  }).then(function(){return self.clients.claim();}));
});

self.addEventListener("fetch",function(e){
  var req=e.request;
  if(req.method!=="GET")return;
  var url=new URL(req.url);
  if(url.origin!==self.location.origin)return;
  if(url.pathname.endsWith("/health.json"))return;
  if(req.mode==="navigate"){
    e.respondWith(
      fetch(req,{cache:"no-store"}).then(function(res){
        var copy=res.clone();
        caches.open(SHELL).then(function(c){c.put("index.html",copy);});
        return res;
      }).catch(function(){
        return caches.match("index.html").then(function(m){return m||caches.match("./");});
      })
    );
    return;
  }
  e.respondWith(
    fetch(req).then(function(res){
      if(res&&res.ok){
        var copy=res.clone();
        caches.open(SHELL).then(function(c){c.put(req,copy);});
      }
      return res;
    }).catch(function(){
      return caches.match(req,{ignoreSearch:true});
    })
  );
});
