/* ---------------------------------------------------------------
   IRIS 35 — desk tracks, classifier, chain read.
   Everything runs on the glass. No answer is sent to a server.
   --------------------------------------------------------------- */
var TRACKS={
iphone:{key:"35-iris-iphone-v2",nextC:"Stop. Remove the unknown device / profile / linked session YOURSELF. Change Apple ID password on this phone.",qs:[
{id:"devices",q:"Apple ID -> Devices: a phone, iPad, or Mac you do not own?",path:"Settings -> [your name] -> Devices",yes:"C"},
{id:"mdm",q:"A configuration profile or MDM you did not install?",path:"Settings -> General -> VPN & Device Management",yes:"C"},
{id:"ext",q:"A Safari extension you do not remember installing?",path:"Settings -> Apps -> Safari -> Extensions",yes:"B"},
{id:"chat",q:"A second phone or browser linked to WhatsApp / iMessage / Telegram?",path:"WhatsApp -> Settings -> Linked devices",yes:"C"},
{id:"mail",q:"Mail forwarding or a filter you did not set?",path:"Gmail / iCloud Mail filters. Look only.",yes:"C"},
{id:"screen",q:"Screen Sharing or a remote-view app you did not turn on?",path:"Settings -> Screen Time -> unknown apps",yes:"C"},
{id:"shareplay",q:"Did anyone ask you to share the screen to fix the wallet?",path:"Control Center -> Screen Mirroring. Decline helpers.",yes:"C"},
{id:"profile",q:"Did anyone send a settings profile file (.mobileconfig)?",path:"Mail / Files / Safari downloads. Do not install.",yes:"C"}
]},
android:{key:"35-iris-android-v2",nextC:"Stop. Remove unknown device / admin / accessibility YOURSELF. Open myaccount.google.com/security on this phone.",qs:[
{id:"gdev",q:"Google account -> Devices: a phone or browser you do not own?",path:"Settings -> Google -> Manage account -> Security -> Your devices",yes:"C"},
{id:"admin",q:"A device-admin app you did not grant?",path:"Settings -> Security -> Device admin apps",yes:"C"},
{id:"acc",q:"An Accessibility service you did not install?",path:"Settings -> Accessibility",yes:"C"},
{id:"special",q:"Display-over-apps or install-unknown-apps you did not allow?",path:"Settings -> Apps -> Special app access",yes:"B"},
{id:"chat",q:"A second phone linked to WhatsApp / Telegram?",path:"WhatsApp -> Settings -> Linked devices",yes:"C"},
{id:"fwd",q:"Gmail forwarding or a filter you did not set?",path:"Gmail -> Settings -> Forwarding and filters",yes:"C"},
{id:"apk",q:"Did someone send an APK or a cleaner to check the phone?",path:"Do not install. That is the intermediary.",yes:"C"},
{id:"notif",q:"Notification access for an app you do not know?",path:"Settings -> Apps -> Special app access -> Notification access",yes:"B"}
]}
};

/* i18n is optional: if it did not load, fall back to the English in TRACKS. */
function hasT(){return typeof t==="function";}
function tr(id,fallback,vars){if(!hasT())return fallback;var s=t(id,vars);return s===id?fallback:s;}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function qq(item){return tr(item.id+"_q",item.q);}
function pp(item){return tr(item.id+"_p",item.path);}

function loadState(key){try{return JSON.parse(localStorage.getItem(key)||"{}");}catch(e){return {};}}
function saveState(key,s){try{localStorage.setItem(key,JSON.stringify(s));}catch(e){}}

function rank(track,answers){
  var cls="A",notes=[],done=0;
  track.qs.forEach(function(item){
    var a=answers[item.id];
    if(!a){if(cls==="A")cls="B";notes.push(item.id+": "+tr("n_unanswered","unanswered"));return;}
    done++;
    if(a==="yes"){
      if(item.yes==="C")cls="C";else if(cls==="A")cls="B";
      notes.push(item.id+": "+tr("n_yes","YES"));
    }else if(a==="idk"){
      if(cls==="A")cls="B";
      notes.push(item.id+": "+tr("n_open","open the path"));
    }else notes.push(item.id+": "+tr("n_no","no"));
  });
  return{cls:cls,notes:notes,done:done,total:track.qs.length};
}
function classWord(cls){return tr("class_"+cls.toLowerCase()+"_word",{A:"QUIET",B:"OPEN PATHS",C:"ACT NOW"}[cls]||"");}
function nextText(track,cls){
  if(cls==="A")return tr("next_a","Looks quiet from what you tapped. Record the date. Do not install a cleaner.");
  if(cls==="B")return tr("next_b","Open the yellow paths. A name you cannot explain = treat as C.");
  return tr("next_c_"+(track===TRACKS.iphone?"iphone":"android"),track.nextC);
}
function buildList(){
  var out=[];
  for(var i=1;i<=7;i++)out.push(i+". "+tr("build_"+i,""));
  return tr("build_h","How to build quiet security")+"\n"+out.join("\n");
}
function afterDesk(cls){
  var pay=tr("pay","First pass is free. If you want the next pass (second phone, family brief, public-address review) write support@elghaly.dev — extra only AFTER the work. No printed price.");
  return "<div class='card'><p class='path'>"+esc(tr("after_p","AFTER CLASS {cls} — THIS IS THE DESK",{cls:cls}).replace("{cls}",cls))+"</p>"+
    "<p class='q'>"+esc(tr("after_q","Security is built here. Money is asked here, only if you want more."))+"</p>"+
    "<p class='rule' dir='auto'>"+esc(buildList()+"\n\n"+pay)+"</p></div>";
}

/* ---- the result gate: a mail address kept in this browser, nowhere else ---- */
function gotMail(){try{return !!(localStorage.getItem("35-iris-result-mail")||"").trim();}catch(e){return false;}}
function wantLogin(){try{return sessionStorage.getItem("35-iris-login")==="1";}catch(e){return false;}}
function saveMail(v){try{localStorage.setItem("35-iris-result-mail",v);}catch(e){}}

/* ---- a plain-text copy of the verdict, for the bank, the family, the file ---- */
function reportText(name,r){
  var track=TRACKS[name];
  return ["IRIS 35 — "+name,
    new Date().toISOString(),
    "CLASS "+r.cls+" — "+classWord(r.cls),
    "",nextText(track,r.cls),"",
    r.notes.join("\n"),"",
    buildList()].join("\n");
}
var LAST_REPORT={};

function renderTrack(name){
  var track=TRACKS[name],root=document.getElementById(name);
  if(!root||!track)return;
  var answers=(loadState(track.key).answers)||{};
  var r=rank(track,answers);
  LAST_REPORT[name]=r;
  var html="<p class='path'>"+esc(typeof ct==="function"?ct("queue_h"):"What starts without you.")+"</p>"+
    "<p class='progress' role='status'>"+esc(tr("progress","{done} of {total} answered",{done:r.done,total:r.total}).replace("{done}",r.done).replace("{total}",r.total))+"</p>"+
    "<div class='bar' aria-hidden='true'><span style='width:"+Math.round(r.done/r.total*100)+"%'></span></div>";
  track.qs.forEach(function(item){
    var cur=answers[item.id]||"";
    html+="<div class='card'><p class='path'>"+esc(pp(item))+"</p><p class='q' id='q-"+name+"-"+item.id+"'>"+esc(qq(item))+"</p>"+
      "<div class='ans' role='group' aria-labelledby='q-"+name+"-"+item.id+"'>";
    ["no","yes","idk"].forEach(function(v){
      var on=cur===v;
      html+="<button type='button' data-track='"+name+"' data-id='"+item.id+"' data-v='"+v+"'"+
        " aria-pressed='"+(on?"true":"false")+"' class='"+(on?"on-"+v:"")+"'>"+esc(tr(v,{no:"no",yes:"yes",idk:"not sure"}[v]))+"</button>";
    });
    html+="</div></div>";
  });
  if(gotMail()){
    html+="<div class='card'><span class='badge "+r.cls+"'>CLASS "+r.cls+" — "+esc(classWord(r.cls))+"</span>"+
      "<p class='rule' dir='auto'>"+esc(nextText(track,r.cls)+"\n"+r.notes.join("\n"))+"</p>"+
      "<div class='row'>"+
        "<button class='ghost' type='button' data-copy='"+name+"'>"+esc(tr("copy","Copy report"))+"</button>"+
        "<button class='ghost' type='button' data-save='"+name+"'>"+esc(tr("download","Save report"))+"</button>"+
        "<button class='ghost' type='button' data-ics='1'>"+esc(tr("remind","Remind me in 7 days"))+"</button>"+
        "<button class='ghost' type='button' id='reset-"+name+"'>"+esc(tr("reset","Reset answers"))+"</button>"+
      "</div><p class='hint'>"+esc(tr("remind_hint","Downloads a calendar file. Nothing is sent anywhere."))+"</p></div>";
    html+=afterDesk(r.cls);
  }else if(wantLogin()){
    html+="<div class='card'><p class='path'>"+esc(tr("login","LOGIN"))+"</p><p class='q'>"+esc(tr("mailq","Put your mail to open the result."))+"</p>"+
      "<label for='res-mail-"+name+"'>Mail</label><input id='res-mail-"+name+"' type='email' autocomplete='email' inputmode='email'/>"+
      "<div class='row'><button class='go' type='button' data-mail='"+name+"'>"+esc(tr("enter","Enter"))+"</button></div></div>";
  }else{
    html+="<div class='card'><div class='row'><button class='go' type='button' id='res-open-"+name+"'>"+esc(tr("result","The Result"))+"</button></div></div>";
  }
  root.innerHTML=html;

  root.querySelectorAll(".ans button").forEach(function(b){
    b.onclick=function(){
      var tk=TRACKS[b.getAttribute("data-track")];
      var s=loadState(tk.key);s.answers=s.answers||{};
      var id=b.getAttribute("data-id"),v=b.getAttribute("data-v");
      if(s.answers[id]===v)delete s.answers[id];else s.answers[id]=v;
      s.updated=new Date().toISOString();
      saveState(tk.key,s);renderTrack(name);
    };
  });
  var reset=document.getElementById("reset-"+name);
  if(reset)reset.onclick=function(){saveState(track.key,{answers:{},updated:new Date().toISOString()});renderTrack(name);};
  var open=document.getElementById("res-open-"+name);
  if(open)open.onclick=function(){try{sessionStorage.setItem("35-iris-login","1");}catch(e){}renderTrack("iphone");renderTrack("android");};
  var mail=root.querySelector("[data-mail]");
  if(mail)mail.onclick=function(){
    var v=(document.getElementById("res-mail-"+name).value||"").trim();
    if(!v||v.indexOf("@")<1)return;
    saveMail(v);renderTrack("iphone");renderTrack("android");
  };
  var cp=root.querySelector("[data-copy]");
  if(cp)cp.onclick=function(){copyText(reportText(name,LAST_REPORT[name]),cp);};
  var sv=root.querySelector("[data-save]");
  if(sv)sv.onclick=function(){saveFile("iris-35-"+name+".txt","text/plain",reportText(name,LAST_REPORT[name]));};
  var ics=root.querySelector("[data-ics]");
  if(ics)ics.onclick=function(){saveFile("iris-35-recheck.ics","text/calendar",icsIn7Days());};
}

/* ---- small shared helpers used by the desk and the chain panel ---- */
function copyText(text,btn){
  var done=function(){
    if(!btn)return;
    var old=btn.textContent;
    btn.textContent=tr("copied","Copied");
    setTimeout(function(){btn.textContent=old;},1600);
  };
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(done,function(){fallbackCopy(text);done();});
  }else{fallbackCopy(text);done();}
}
function fallbackCopy(text){
  var ta=document.createElement("textarea");
  ta.value=text;ta.setAttribute("readonly","");ta.style.position="fixed";ta.style.opacity="0";
  document.body.appendChild(ta);ta.select();
  try{document.execCommand("copy");}catch(e){}
  document.body.removeChild(ta);
}
function saveFile(name,type,text){
  var blob=new Blob([text],{type:type+";charset=utf-8"});
  var url=URL.createObjectURL(blob);
  var a=document.createElement("a");
  a.href=url;a.download=name;document.body.appendChild(a);a.click();
  document.body.removeChild(a);
  setTimeout(function(){URL.revokeObjectURL(url);},2000);
}
function icsStamp(d){return d.toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";}
function icsIn7Days(){
  var start=new Date(Date.now()+7*24*3600*1000);
  start.setUTCMinutes(0,0,0);
  var end=new Date(start.getTime()+30*60*1000);
  return ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//IRIS 35//EN","BEGIN:VEVENT",
    "UID:"+Date.now()+"@iris-35.elghaly.dev",
    "DTSTAMP:"+icsStamp(new Date()),
    "DTSTART:"+icsStamp(start),
    "DTEND:"+icsStamp(end),
    "SUMMARY:"+tr("remind_title","IRIS 35 — run the list again"),
    "DESCRIPTION:https://iris-35.elghaly.dev/",
    "URL:https://iris-35.elghaly.dev/",
    "END:VEVENT","END:VCALENDAR"].join("\r\n");
}

/* ---- tabs ---- */
function showTab(id){
  ["iphone","android","sig"].forEach(function(n){
    var p=document.getElementById(n),b=document.getElementById("tab-"+n);
    if(p)p.classList.toggle("on",n===id);
    if(b){b.classList.toggle("on",n===id);b.setAttribute("aria-selected",n===id?"true":"false");}
  });
}
["iphone","android","sig"].forEach(function(n){
  var b=document.getElementById("tab-"+n);
  if(b)b.onclick=function(){showTab(n);};
});
/* The phone buttons say "iPhone / Android" but both opened the iPhone
   checklist, so an Android user's first question was Apple ID -> Devices. */
function phoneTab(){
  return /Android/i.test(navigator.userAgent||"")?"android":"iphone";
}
if(phoneTab()==="android")showTab("android");
document.querySelectorAll(".askgrid button").forEach(function(b){
  b.onclick=function(){
    var go=b.getAttribute("data-go");
    showTab(go==="sig"?"sig":phoneTab());
    var desk=document.getElementById("desk");
    if(desk)desk.scrollIntoView({behavior:prefersReducedMotion()?"auto":"smooth",block:"start"});
  };
});
function prefersReducedMotion(){
  try{return window.matchMedia("(prefers-reduced-motion: reduce)").matches;}catch(e){return false;}
}

/* ---------------------------------------------------------------
   Chain read. Public hashes only — never a key, never a seed.
   --------------------------------------------------------------- */
var ETH_MAX="ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
var SOL_RPC=["https://api.mainnet-beta.solana.com","https://solana-rpc.publicnode.com"];
var ETH_RPC="https://ethereum.publicnode.com";
var BTC_API="https://mempool.space/api/tx/";
var LOOKUP_MS=12000;

/* Paste a whole explorer link and we pull the hash out of it. */
function extractHash(raw){
  var s=String(raw||"").trim();
  if(!s)return "";
  if(/^(https?:)?\/\//i.test(s)||s.indexOf("/")>-1){
    var m=s.match(/(0x[0-9a-fA-F]{64}|[0-9a-fA-F]{64}|[1-9A-HJ-NP-Za-km-z]{64,88})/);
    if(m)return m[1];
  }
  return s.replace(/\s+/g,"");
}
function kindOf(s){
  var t=s.trim();
  if(/^0x[0-9a-fA-F]{64}$/.test(t))return "eth";
  if(/^[0-9a-fA-F]{64}$/.test(t))return "btc";
  if(/^[1-9A-HJ-NP-Za-km-z]{64,88}$/.test(t))return "sol";
  return "";
}
/* A seed phrase must never reach a network. Catch it before anything else. */
function looksLikeSeed(raw){
  var words=String(raw||"").trim().toLowerCase().split(/[\s,]+/).filter(Boolean);
  if(words.length<11||words.length>25)return false;
  return words.every(function(w){return /^[a-z]{3,8}$/.test(w);});
}

var LAST_CHAIN="";
function show(cls,text,word){
  var out=document.getElementById("out");if(!out)return;
  out.classList.add("on");
  var badge=document.getElementById("badge");
  badge.className="badge "+(cls==="X"?"X":cls);
  badge.textContent=cls==="X"?(word||tr("c_error","NO READ")):("CLASS "+cls+" — "+classWord(cls));
  document.getElementById("report").textContent=text;
  LAST_CHAIN=badge.textContent+"\n\n"+text;
  var cp=document.getElementById("copy-chain");
  if(cp)cp.hidden=(cls==="X");
}

function fetchJSON(url,opts){
  var ctl=("AbortController" in window)?new AbortController():null;
  var o=Object.assign({},opts||{});
  if(ctl)o.signal=ctl.signal;
  var timer=setTimeout(function(){if(ctl)ctl.abort();},LOOKUP_MS);
  return fetch(url,o).then(function(res){
    clearTimeout(timer);
    if(!res.ok)throw new Error("HTTP "+res.status);
    return res.json();
  },function(e){
    clearTimeout(timer);
    throw new Error(e&&e.name==="AbortError"?"timeout":(e.message||"network"));
  });
}
function rpc(url,method,params){
  return fetchJSON(url,{method:"POST",headers:{"content-type":"application/json"},
    body:JSON.stringify({jsonrpc:"2.0",id:1,method:method,params:params})});
}

function classifySol(tx){
  var d=IrisSol.decodeSolanaTx(tx);
  return {cls:d.cls, notes:d.findings, changes:d.changes||[]};
}
async function solTx(sig){
  var last=null;
  for(var i=0;i<SOL_RPC.length;i++){
    try{
      var j=await rpc(SOL_RPC[i],"getTransaction",[sig,{encoding:"jsonParsed",maxSupportedTransactionVersion:0}]);
      if(j&&j.result)return j.result;
      if(j&&j.result===null)return null;
      last=(j&&j.error&&j.error.message)||"empty";
    }catch(e){last=String(e.message||e);}
  }
  throw new Error(last||"sol rpc");
}
async function btcTx(id){return fetchJSON(BTC_API+id);}
async function ethTx(hash){
  var j=await rpc(ETH_RPC,"eth_getTransactionByHash",[hash]);
  if(!j||j.result===null)return null;
  if(!j.result)throw new Error((j.error&&j.error.message)||"eth empty");
  return j.result;
}

function classifyBtc(tx){
  var notes=[],cls="A";
  var vins=(tx.vin||[]).length,vouts=tx.vout||[];
  notes.push("inputs "+vins+" outputs "+vouts.length);
  if(tx.status)notes.push(tx.status.confirmed?("confirmed in block "+tx.status.block_height):"UNCONFIRMED — still in the mempool");
  if(tx.fee)notes.push("fee "+tx.fee+" sat");
  vouts.forEach(function(o,i){notes.push("out"+i+" "+(o.value||0)+" sat -> "+(o.scriptpubkey_address||o.scriptpubkey_type||"?"));});
  if(vouts.length>4){if(cls==="A")cls="B";notes.push("many outputs");}
  if(!vouts.length)cls="C";
  return{cls:cls,notes:notes};
}

/* The four-byte selector is what the wallet actually agreed to. */
var ETH_SEL={
"0x095ea7b3":"approve(address,uint256)",
"0xa22cb465":"setApprovalForAll(address,bool)",
"0x39509351":"increaseAllowance(address,uint256)",
"0xd505accf":"permit(...)",
"0x23b872dd":"transferFrom(address,address,uint256)",
"0x42842e0e":"safeTransferFrom(address,address,uint256)",
"0xb88d4fde":"safeTransferFrom(address,address,uint256,bytes)",
"0xa9059cbb":"transfer(address,uint256)",
"0xd0e30db0":"deposit()",
"0x2e1a7d4d":"withdraw(uint256)"
};
function addrAt(data,word){
  var off=10+word*64;
  var chunk=data.slice(off,off+64);
  return chunk?"0x"+chunk.slice(24):"?";
}
function classifyEth(tx){
  var notes=[],cls="A";
  var to=tx.to||"(contract creation)";
  var data=(tx.input||"0x").toLowerCase();
  var sel=data.slice(0,10);
  notes.push("to "+to);
  if(tx.value&&tx.value!=="0x0")notes.push("value "+(parseInt(tx.value,16)/1e18)+" ETH");
  if(!tx.blockNumber)notes.push("PENDING — not mined yet");
  if(data==="0x"){notes.push("plain transfer, no contract call");return{cls:cls,notes:notes};}
  notes.push("call "+(ETH_SEL[sel]||("unknown selector "+sel)));
  if(sel==="0x095ea7b3"){
    var amount=data.slice(-64);
    if(amount===ETH_MAX){cls="C";notes.push("UNLIMITED ERC-20 approve -> "+addrAt(data,0));}
    else if(/^0+$/.test(amount)){notes.push("approve 0 = revoke (good)");}
    else{cls="B";notes.push("finite ERC-20 approve -> "+addrAt(data,0));}
  }else if(sel==="0xa22cb465"){
    var on=/1$/.test(data.slice(-64));
    if(on){cls="C";notes.push("setApprovalForAll TRUE -> "+addrAt(data,0)+" — this hands over every NFT in the collection");}
    else notes.push("setApprovalForAll FALSE = revoke (good)");
  }else if(sel==="0x39509351"){cls="B";notes.push("increaseAllowance -> "+addrAt(data,0));}
  else if(sel==="0xd505accf"){cls="C";notes.push("permit — an off-chain signature is being spent on chain");}
  else if(sel==="0x23b872dd"||sel==="0x42842e0e"||sel==="0xb88d4fde"){
    cls="B";notes.push("pull transfer "+addrAt(data,0)+" -> "+addrAt(data,1));
  }else if(!ETH_SEL[sel]){cls="C";notes.push("unknown contract call");}
  return{cls:cls,notes:notes};
}

function chainErr(e){
  var m=String((e&&e.message)||e);
  if(m==="timeout")return tr("c_timeout","The chain lookup timed out. This is not a verdict — try again.");
  return tr("c_neterr","Could not reach the chain (network or provider). This is not a verdict — try again on a line you trust.")+"\n("+m+")";
}

var run=document.getElementById("run");
if(run)run.onclick=async function(){
  var box=document.getElementById("q");
  var raw=box.value||"";
  if(looksLikeSeed(raw)){
    box.value="";
    show("X",tr("c_seed","Rejected. That looks like a seed phrase. It was not sent anywhere and the box is wiped."));
    return;
  }
  var hash=extractHash(raw);
  var k=kindOf(hash);
  if(!k){show("X",tr("c_need","Need a public Solana signature, Bitcoin txid, or Ethereum 0x hash."));return;}
  run.disabled=true;
  show("X",tr("c_reading","Reading the chain…"),tr("c_working","WORKING"));
  try{
    if(k==="sol"){
      var tx=await solTx(hash);
      if(!tx){show("C",tr("c_notfound","Not found on this chain. Check the hash."));return;}
      var r=classifySol(tx);
      show(r.cls,["chain SOL",hash]
        .concat(r.notes.map(function(n){return "- "+n;}))
        .concat(r.changes.map(IrisSol.formatChange)).join("\n"));
    }else if(k==="btc"){
      var bt=await btcTx(hash);
      var rb=classifyBtc(bt);
      show(rb.cls,["chain BTC",hash].concat(rb.notes.map(function(n){return "- "+n;})).join("\n"));
    }else{
      var et=await ethTx(hash);
      if(!et){show("C",tr("c_notfound","Not found on this chain. Check the hash."));return;}
      var re=classifyEth(et);
      show(re.cls,["chain ETH",hash].concat(re.notes.map(function(n){return "- "+n;})).join("\n"));
    }
  }catch(e){
    show("X",chainErr(e));
  }finally{run.disabled=false;}
};
var clr=document.getElementById("clr");
if(clr)clr.onclick=function(){
  document.getElementById("q").value="";
  document.getElementById("out").classList.remove("on");
  LAST_CHAIN="";
};
var cpChain=document.getElementById("copy-chain");
if(cpChain)cpChain.onclick=function(){copyText("IRIS 35 chain read\n"+new Date().toISOString()+"\n\n"+LAST_CHAIN,cpChain);};

renderTrack("iphone");renderTrack("android");
