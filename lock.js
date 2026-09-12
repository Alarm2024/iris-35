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
  return "<div class='card' id='need-open'><p class='path'>RESULT</p>"+
    "<p class='q'>Read first. The class opens with a number mailed to you. No password. Nobody types it by hand.</p>"+
    "<label>Mail</label><input id='open-mail' type='email' autocomplete='email' placeholder='you@mail'/>"+
    "<div class='row'><button class='go' type='button' id='ask-num'>Send number to my mail</button></div>"+
    "<label style='margin-top:12px'>Open number</label><input id='open-num' autocomplete='one-time-code' placeholder='number from mail'/>"+
    "<div class='row'><button class='go' type='button' id='open-go'>Open result</button></div>"+
    "<p class='hint' id='open-msg'></p></div>";
}
function bindLock(){
  var ask=document.getElementById("ask-num");
  var go=document.getElementById("open-go");
  if(ask)ask.onclick=async function(){
    var mail=(document.getElementById("open-mail").value||"").trim();
    var msg=document.getElementById("open-msg");
    if(!mail||mail.indexOf("@")<0){msg.textContent="Write a mail first.";return;}
    try{localStorage.setItem("35-iris-member",mail);}catch(err){}
    msg.textContent="Sending...";
    ask.disabled=true;
    try{
      var res=await fetch("https://formsubmit.co/ajax/support@elghaly.dev",{
        method:"POST",
        headers:{"Content-Type":"application/json","Accept":"application/json"},
        body:JSON.stringify({
          name:"IRIS",
          email:mail,
          _subject:"IRIS open number",
          _template:"box",
          _captcha:"false",
          _autoresponse":"IRIS open number: 35IRIS7K\n\nPaste it on https://iris-35.elghaly.dev under Open number.\nNo password. You tap.\n\n35 IRIS \nsupport@elghaly.dev",
          message:"Send the open number to this mail: "+mail
        })
      });
      var j=await res.json().catch(function(){return {};});
      if(res.ok){
        msg.textContent="Number sent to "+mail+". Check inbox and spam. Then paste it below.";
      } else {
        msg.textContent=(j.message||"Mail blocked. Check spam or write support@elghaly.dev");
      }
    }catch(e){
      msg.textContent="Mail blocked on this network. Write support@elghaly.dev";
    }
    ask.disabled=false;
  };
  if(go)go.onclick=async function(){
    var n=(document.getElementById("open-num").value||"").trim();
    var msg=document.getElementById("open-msg");
    if(!n){msg.textContent="Paste the number from mail.";return;}
    var h=await hashNum(n);
    if(!OPEN_HASH[h]){msg.textContent="Number not open. Request it again.";return;}
    setOpen();
    renderTrack("iphone");renderTrack("android");
  };
}
renderTrack=function(name){
  var track=TRACKS[name],root=document.getElementById(name);if(!root||!track)return;
  var answers=(loadState(track.key).answers)||{};
  var html="";
  track.qs.forEach(function(item){
    var cur=answers[item.id]||"";
    html+="<div class='card'><p class='path'>"+item.path+"</p><p class='q'>"+item.q+"</p><div class='ans'>";
    ["no","yes","idk"].forEach(function(v){
      var label=v==="idk"?"not sure":v;
      var on=cur===v?(" on-"+v):"";
      html+="<button type='button' data-track='"+name+"' data-id='"+item.id+"' data-v='"+v+"' class='"+on.trim()+"'>"+label+"</button>";
    });
    html+="</div></div>";
  });
  if(isOpen()){
    var r=rank(track,answers);
    html+="<div class='card'><span class='badge "+r.cls+"'>CLASS "+r.cls+"</span><p class='rule'>"+nextText(track,r.cls)+"\n"+r.notes.join("\n")+"</p><div class='row'><button class='ghost' type='button' id='reset-"+name+"'>Reset answers</button></div></div>";
    html+=afterDesk(r.cls);
  } else {
    html+=lockCard();
  }
  root.innerHTML=html;
  root.querySelectorAll(".ans button").forEach(function(b){
    b.onclick=function(){
      var t=TRACKS[b.getAttribute("data-track")];
      var s=loadState(t.key);s.answers=s.answers||{};
      s.answers[b.getAttribute("data-id")]=b.getAttribute("data-v");
      s.updated=new Date().toISOString();saveState(t.key,s);renderTrack(name);
    };
  });
  var reset=document.getElementById("reset-"+name);
  if(reset)reset.onclick=function(){saveState(track.key,{answers:{},updated:new Date().toISOString()});renderTrack(name);};
  bindLock();
};
renderTrack("iphone");renderTrack("android");
