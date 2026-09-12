(function(){
  var g=document.getElementById("gate");
  if(g&&g.parentNode)g.parentNode.removeChild(g);
  document.body.classList.remove("gated");
  var f=document.querySelector("footer");
  if(f){
    f.innerHTML='<a href="mailto:support@elghaly.dev">support@elghaly.dev</a>'
      +'<p class="addr" dir="ltr">548 Market Street, San Francisco, California 94104</p>'
      +'<p class="addr" dir="ltr">35 Zamalek, Cairo, Egypt</p>';
  }
})();
var OPEN_HASH={"776f73d0828bcbc1b000e23d7c98cd8124aa1089f8bdeb2ccc0a9afe7adcddc9":1,"0d2242d08fbb6a46f5eef8f8958ebab6295c483de07379e59da4c69135e73bdd":1,"68a686d61efda2141bbfa030b22b6d9d6f4e5b8c9f529f41d26f984ad4d3528d":1};
function isOpen(){try{return localStorage.getItem("35-iris-open")==="1";}catch(e){return false;}}
function setOpen(){try{localStorage.setItem("35-iris-open","1");}catch(e){}}
function qq(item){return (typeof t==="function"&&t(item.id+"_q")!==item.id+"_q")?t(item.id+"_q"):item.q;}
function pp(item){return (typeof t==="function"&&t(item.id+"_p")!==item.id+"_p")?t(item.id+"_p"):item.path;}
function bb(v){return typeof t==="function"?t(v):v;}
renderTrack=function(name){
  var track=TRACKS[name],root=document.getElementById(name);if(!root||!track)return;
  var answers=(loadState(track.key).answers)||{},html="";
  track.qs.forEach(function(item){
    var cur=answers[item.id]||"";
    html+="<div class='card'><p class='path' dir='ltr'>"+pp(item)+"</p><p class='q'>"+qq(item)+"</p><div class='ans'>";
    ["no","yes","idk"].forEach(function(v){
      html+="<button type='button' data-track='"+name+"' data-id='"+item.id+"' data-v='"+v+"' class='"+(cur===v?("on-"+v):"")+"'>"+bb(v)+"</button>";
    });
    html+="</div></div>";
  });
  if(isOpen()){
    var r=rank(track,answers);
    html+="<div class='card' dir='ltr'><span class='badge "+r.cls+"'>CLASS "+r.cls+"</span><p class='rule'>"+nextText(track,r.cls)+"\n"+r.notes.join("\n")+"</p><div class='row'><button class='ghost' type='button' id='reset-"+name+"'>"+bb("reset")+"</button></div></div>";
    html+=afterDesk(r.cls).replace("<div class='card'","<div class='card' dir='ltr'");
  } else {
    var ar=typeof curLang==="function"&&curLang()==="ar";
    html+="<div class='card'><p class='path'>RESULT</p><p class='q'>"+(ar?"اقرأ أولاً. بعدها نرسل الرقم إلى بريدك.":"Read the paths first. Then we mail the number.")+"</p>";
    html+="<form id='open-form' action='https://formsubmit.co/support@elghaly.dev' method='POST'><input type='hidden' name='_subject' value='IRIS open number'/><input type='hidden' name='_captcha' value='false'/><input type='hidden' name='_next' value='https://iris-35.elghaly.dev/?sent=1'/><input type='hidden' name='_autoresponse' value='IRIS open number: 35IRIS7K'/><input type='hidden' name='message' value='open'/><label>Mail</label><input name='email' id='open-mail' type='email' required/><div class='row'><button class='go' type='submit'>"+(ar?"أرسل الرقم":"Send number")+"</button></div></form>";
    html+="<label>Open number</label><input id='open-num'/><div class='row'><button class='go' type='button' id='open-go'>Open</button></div></div>";
  }
  root.innerHTML=html;
  root.querySelectorAll(".ans button").forEach(function(b){
    b.onclick=function(){
      var tk=TRACKS[b.getAttribute("data-track")];
      var s=loadState(tk.key);s.answers=s.answers||{};
      s.answers[b.getAttribute("data-id")]=b.getAttribute("data-v");
      saveState(tk.key,s);renderTrack(name);
    };
  });
  var reset=document.getElementById("reset-"+name);
  if(reset)reset.onclick=function(){saveState(track.key,{answers:{}});renderTrack(name);};
  var go=document.getElementById("open-go");
  if(go)go.onclick=async function(){
    var n=(document.getElementById("open-num").value||"").trim().toUpperCase();
    var buf=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(n));
    var h=Array.from(new Uint8Array(buf)).map(function(x){return x.toString(16).padStart(2,"0");}).join("");
    if(OPEN_HASH[h]){setOpen();renderTrack("iphone");renderTrack("android");}
  };
};
renderTrack("iphone");renderTrack("android");
document.querySelectorAll("#langs button").forEach(function(b){
  b.addEventListener("click",function(){setTimeout(function(){renderTrack("iphone");renderTrack("android");},30);});
});
