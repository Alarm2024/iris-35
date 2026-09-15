/* IRIS 35 service worker.
   The desk must open on a bad line, in a taxi, in a bank lobby.
   Shell is cached; chain lookups are never cached and never touched. */
var VERSION="__BUILD__";
var SHELL="iris-shell-"+VERSION;
var FILES=["./","index.html","iris.css","i18n.js","app.js","boot.js","ui.js",
  "favicon.svg","iris-eye.svg","qr.svg","lockup.jpg","icon-192.png","icon-512.png","manifest.webmanifest"];

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
  if(url.origin!==self.location.origin)return;      /* chain RPCs go straight out */
  if(url.pathname.endsWith("/health.json"))return;   /* status must be live */

  if(req.mode==="navigate"){
    e.respondWith(
      fetch(req).then(function(res){
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
    caches.match(req,{ignoreSearch:true}).then(function(hit){
      if(hit){
        fetch(req).then(function(res){
          if(res&&res.ok)caches.open(SHELL).then(function(c){c.put(req,res);});
        }).catch(function(){});
        return hit;
      }
      return fetch(req).then(function(res){
        if(res&&res.ok){
          var copy=res.clone();
          caches.open(SHELL).then(function(c){c.put(req,copy);});
        }
        return res;
      });
    })
  );
});
