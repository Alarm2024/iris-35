/* ---------------------------------------------------------------
   IRIS 35 — page chrome. Language, ask box, status, offline, install.
   Kept out of index.html so the page can run under a strict CSP.
   --------------------------------------------------------------- */
(function(){
"use strict";

var LANGS={en:"en",ar:"ar",ru:"ru",zh:"zh-Hans",de:"de",es:"es"};

function setLang(l){
  if(!LANGS[l])l="en";
  try{localStorage.setItem("35-iris-lang",l);}catch(e){}
  var root=document.getElementById("root");
  root.lang=LANGS[l];
  root.dir=(l==="ar")?"rtl":"ltr";
  document.querySelectorAll("#langs button").forEach(function(b){
    var on=b.getAttribute("data-lang")===l;
    b.classList.toggle("on",on);
    b.setAttribute("aria-pressed",on?"true":"false");
  });
  if(typeof refreshLang==="function")refreshLang();
  else if(typeof applyI18n==="function")applyI18n(document);
  if(typeof t==="function")document.title=t("h1");
}

/* First visit with no stored choice: follow the browser, not a guess. */
function initialLang(){
  var saved=null;
  try{saved=localStorage.getItem("35-iris-lang");}catch(e){}
  if(saved&&LANGS[saved])return saved;
  var list=(navigator.languages&&navigator.languages.length)?navigator.languages:[navigator.language||"en"];
  for(var i=0;i<list.length;i++){
    var base=String(list[i]||"").toLowerCase().split("-")[0];
    if(LANGS[base])return base;
  }
  return "en";
}

document.querySelectorAll("#langs button").forEach(function(b){
  b.addEventListener("click",function(){setLang(b.getAttribute("data-lang"));});
});
setLang(initialLang());

/* ---- Ask IRIS: pattern match on the glass, nothing leaves the phone ---- */
function tt(id,fallback){
  if(typeof t!=="function")return fallback;
  var s=t(id);return s===id?fallback:s;
}
function replyAsk(text){
  var s=(text||"").toLowerCase();
  if(!s.trim())return tt("a_empty","Write what they said or what you see.");
  if(/seed|mnemonic|private key|12 words|24 words|بذرة|مفتاح خاص|сид|мнемоник|助记词|私钥|semilla|clave privada|saatgut/.test(s))
    return tt("a_seed","Do not paste that here. Wipe the box. Change it on YOUR device.");
  if(/screen ?share|share (the |my )?screen|mirror|anydesk|teamviewer|quick ?support|مشاركة الشاشة|экран|共享屏幕|compartir pantalla|bildschirm/.test(s))
    return tt("a_screen","Do not share the screen. Screen share is the intermediary. Hang up.");
  if(/install|apk|cleaner|sideload|\.mobileconfig|profile|ثبّت|منظف|установи|安装|清理|instalar|installier/.test(s))
    return tt("a_install","Do not install. Open the phone tab.");
  if(/connect|wallet|approve|sign|اربط|محفظة|подключ|кошел|连接|钱包|conectar|cartera|verbind/.test(s))
    return tt("a_connect","Do not connect. Paste a public hash only.");
  if(/2fa|otp|code|verification|كود|رمز|код|验证码|código|code/.test(s))
    return tt("a_code","Do not send the code. Hang up. Change the password on this phone.");
  if(/price|pay|cost|fee|سعر|ادفع|цена|оплат|价格|付款|precio|pagar|preis/.test(s))
    return tt("a_price","First pass is free. Extra only after work you asked for.");
  return tt("a_default","Pick a phone tab or paste a public hash. App / code / connect from a stranger = stop.");
}
var askgo=document.getElementById("askgo");
if(askgo)askgo.addEventListener("click",function(){
  document.getElementById("askout").classList.add("on");
  document.getElementById("askrep").textContent=replyAsk(document.getElementById("askq").value);
});

/* ---- Status pill: say what is actually true, not a painted dot ---- */
function setStatus(state){
  var pill=document.getElementById("status-pill");
  var txt=document.getElementById("status-text");
  if(!pill||!txt)return;
  pill.classList.remove("up","down");
  if(state!=="wait")pill.classList.add(state);
  txt.setAttribute("data-i18n","status_"+state);
  txt.textContent=tt("status_"+state,state);
}
function checkHealth(){
  if(!navigator.onLine){setStatus("down");return;}
  var ctl=("AbortController" in window)?new AbortController():null;
  var timer=setTimeout(function(){if(ctl)ctl.abort();},6000);
  fetch("health.json",{cache:"no-store",signal:ctl?ctl.signal:undefined})
    .then(function(r){return r.ok?r.json():Promise.reject(new Error("HTTP "+r.status));})
    .then(function(j){setStatus(j&&j.ok?"up":"down");})
    .catch(function(){setStatus("down");})
    .then(function(){clearTimeout(timer);});
}
checkHealth();

/* ---- Offline banner: the desk still works, only the chain read needs a line ---- */
function paintOnline(){
  var bar=document.getElementById("offline-bar");
  if(bar)bar.hidden=navigator.onLine;
  var run=document.getElementById("run");
  if(run)run.disabled=!navigator.onLine;
  if(navigator.onLine)checkHealth();else setStatus("down");
}
window.addEventListener("online",paintOnline);
window.addEventListener("offline",paintOnline);
paintOnline();

/* ---- Add to home screen: the official door, kept off chat links ---- */
var deferred=null;
var row=document.getElementById("install-row");
var go=document.getElementById("install-go");
window.addEventListener("beforeinstallprompt",function(e){
  e.preventDefault();deferred=e;
  if(row)row.hidden=false;
});
if(go)go.addEventListener("click",function(){
  if(!deferred)return;
  deferred.prompt();
  deferred.userChoice.then(function(){deferred=null;if(row)row.hidden=true;});
});
window.addEventListener("appinstalled",function(){if(row)row.hidden=true;});

/* ---- Keyboard: left/right move between desk tabs, as a tablist should ---- */
var tabIds=["iphone","android","sig"];
document.querySelectorAll('#desk [role="tab"]').forEach(function(btn,i){
  btn.addEventListener("keydown",function(e){
    var step=(e.key==="ArrowRight")?1:(e.key==="ArrowLeft")?-1:0;
    if(!step)return;
    e.preventDefault();
    var rtl=document.getElementById("root").dir==="rtl";
    var next=(i+(rtl?-step:step)+tabIds.length)%tabIds.length;
    var el=document.getElementById("tab-"+tabIds[next]);
    el.click();el.focus();
  });
});

/* ---- Service worker: the page has to open when the line is bad ---- */
if("serviceWorker" in navigator&&window.isSecureContext){
  window.addEventListener("load",function(){
    navigator.serviceWorker.register("sw.js").catch(function(){});
  });
}
})();
