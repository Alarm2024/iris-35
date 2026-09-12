var OPEN_HASH={
"776f73d0828bcbc1b000e23d7c98cd8124aa1089f8bdeb2ccc0a9afe7adcddc9":1,
"0d2242d08fbb6a46f5eef8f8958ebab6295c483de07379e59da4c69135e73bdd":1,
"68a686d61efda2141bbfa030b22b6d9d6f4e5b8c9f529f41d26f984ad4d3528d":1
};
function isOpen(){try{return localStorage.getItem("35-iris-open")==="1";}catch(e){return false;}}
function setOpen(){try{localStorage.setItem("35-iris-open","1");}catch(e){}}
async function hashNum(s){
  var buf=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(String(s).trim().toUpperCase()));
  return Array.from(new Uint8Array(buf)).map(function(b){return b.toString(16).padStart(2,"0");}).join("");
}
function lockCard(){
  var ar=curLang()==="ar";
  return "<div class='card' id='need-open'><p class='path'>RESULT</p>"+
    "<p class='q'>"+(ar?"اقرأ أولاً. النتيجة تُفتح برقم يُرسل إلى بريدك. بلا كلمة سر.":"Read first. The class opens with a number mailed to you. No password.")+"</p>"+
    "<form id='open-form' action='https://formsubmit.co/support@elghaly.dev' method='POST'>"+
    "<input type='hidden' name='_subject' value='IRIS open number'/>"+
    "<input type='hidden' name='_captcha' value='false'/>"+
    "<input type='hidden' name='_template' value='box'/>"+
    "<input type='hidden' name='_next' value='https://iris-35.elghaly.dev/?sent=1'/>"+
    "<input type='hidden' name='_autoresponse' value='IRIS open number: 35IRIS7K. Paste it on iris-35.elghaly.dev'/>"+
    "<input type='hidden' name='message' value='IRIS open number request'/>"+
    "<label>Mail</label><input id='open-mail' name='email' type='email' required autocomplete='email' placeholder='you@mail'/>"+
    "<div class='row'><button class='go' type='submit'>"+(ar?"أرسل الرقم إلى بريدي":"Send number to my mail")+"</button></div></form>"+
    "<label style='margin-top:12px'>"+(ar?"رقم الفتح":"Open number")+"</label><input id='open-num' autocomplete='one-time-code'/>"+
    "<div class='row'><button class='go' type='button' id='open-go'>"+(ar?"افتح النتيجة":"Open result")+"</button></div>"+
    "<p class='hint' id='open-msg'></p></div>";
}
function bindLock(){
  var form=document.getElementById("open-form");
  var go=document.getElementById("open-go");
  var msg=document.getElementById("open-msg");
  if(form)form.addEventListener("submit",function(){
    var mail=(document.getElementById("open-mail").value||"").trim();
    try{localStorage.setItem("35-iris-member",mail);}catch(e){}
  });
  if(go)go.onclick=async function(){
    var n=(document.getElementById("open-num").value||"").trim();
    if(!n){if(msg)msg.textContent="Paste the number from mail.";return;}
    var h=await hashNum(n);
    if(!OPEN_HASH[h]){if(msg)msg.textContent="Number not open.";return;}
    setOpen();renderTrack("iphone");renderTrack("android");
  };
}
renderTrack=function(name){
  var track=TRACKS[name],root=document.getElementById(name);if(!root||!track)return;
  var answers=(loadState(track.key).answers)||{};
  var html="";
  track.qs.forEach(function(item){
    var cur=answers[item.id]||"";
    html+="<div class='card'><p class='path'>"+t(item.id+"_p")+"</p><p class='q'>"+t(item.id+"_q")+"</p><div class='ans'>";
    ["no","yes","idk"].forEach(function(v){
      var on=cur===v?(" on-"+v):"";
      html+="<button type='button' data-track='"+name+"' data-id='"+item.id+"' data-v='"+v+"' class='"+on.trim()+"'>"+t(v)+"</button>";
    });
    html+="</div></div>";
  });
  if(isOpen()){
    var r=rank(track,answers);
    html+="<div class='card'><span class='badge "+r.cls+"'>CLASS "+r.cls+"</span><p class='rule'>"+nextText(track,r.cls)+"\n"+r.notes.join("\n")+"</p><div class='row'><button class='ghost' type='button' id='reset-"+name+"'>"+t("reset")+"</button></div></div>";
    html+=afterDesk(r.cls);
  } else html+=lockCard();
  root.innerHTML=html;
  root.querySelectorAll(".ans button").forEach(function(b){
    b.onclick=function(){
      var tck=TRACKS[b.getAttribute("data-track")];
      var s=loadState(tck.key);s.answers=s.answers||{};
      s.answers[b.getAttribute("data-id")]=b.getAttribute("data-v");
      s.updated=new Date().toISOString();saveState(tck.key,s);renderTrack(name);
    };
  });
  var reset=document.getElementById("reset-"+name);
  if(reset)reset.onclick=function(){saveState(track.key,{answers:{},updated:new Date().toISOString()});renderTrack(name);};
  bindLock();
};
renderTrack("iphone");renderTrack("android");
document.querySelectorAll("#langs button").forEach(function(b){
  b.addEventListener("click",function(){setTimeout(function(){renderTrack("iphone");renderTrack("android");},0);});
});
