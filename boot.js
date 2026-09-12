(function(){
  var g=document.getElementById("gate");
  if(g&&g.parentNode)g.parentNode.removeChild(g);
  document.body.classList.remove("gated");
  var love=document.querySelector(".love");
  if(!document.getElementById("priv")){
    var box=document.createElement("div");
    box.id="priv";
    box.innerHTML='<h2>PRIVATE SESSION</h2><div class="card"><p class="path">MAIL ONLY</p><p class="q">After the first pass. A human next to the glass. Nobody takes the phone.</p><p class="rule" dir="ltr">Write support@elghaly.dev with PRIVATE.\nHUMAN if you cannot pay.\nExtra only AFTER the work.</p></div>';
    if(love&&love.parentNode)love.parentNode.insertBefore(box,love);
  }
  if(!document.getElementById("alarm")){
    var al=document.createElement("div");
    al.id="alarm";
    al.innerHTML='<h2>FAMILY ALARM</h2><div class="card"><p class="path">SHOW THIS TO ONE PERSON YOU LOVE</p><p class="q">If someone says this in the house, on the phone, or in chat — stop. Do not hand the phone.</p><p class="rule" dir="ltr">"Install this cleaner / fixer"\n→ Do not install. Open IRIS on THIS phone.\n\n"Share your screen so I can help"\n→ Hang up. Screen share is the intermediary.\n\n"Send me the code I just sent you"\n→ Do not send the code. Change the password on THIS device.\n\n"Connect the wallet to verify"\n→ Do not connect. Paste a public hash only.\n\n"Photo of the 12 words / seed"\n→ Wipe the chat. Those words never leave the house.\n\n"I am Apple / the bank / support — move the money now"\n→ Hang up. Open the real app yourself.\n\n"That unknown device is yours, ignore it"\n→ Treat as CLASS C. Remove it yourself.</p></div>';
    if(love&&love.parentNode)love.parentNode.insertBefore(al,love);
  }
})();
function gotMail(){try{return !!(localStorage.getItem("35-iris-result-mail")||"").trim();}catch(e){return false;}}
function wantLogin(){try{return sessionStorage.getItem("35-iris-login")==="1";}catch(e){return false;}}
function saveMail(v){try{localStorage.setItem("35-iris-result-mail",v);}catch(e){}}
function qq(item){return (typeof t==="function"&&t(item.id+"_q")!==item.id+"_q")?t(item.id+"_q"):item.q;}
function pp(item){return (typeof t==="function"&&t(item.id+"_p")!==item.id+"_p")?t(item.id+"_p"):item.path;}
function bb(v){return typeof t==="function"?t(v):v;}
function ar(){return typeof curLang==="function"&&curLang()==="ar";}
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
  if(gotMail()){
    var r=rank(track,answers);
    html+="<div class='card' dir='ltr'><span class='badge "+r.cls+"'>CLASS "+r.cls+"</span><p class='rule'>"+nextText(track,r.cls)+"\n"+r.notes.join("\n")+"</p><div class='row'><button class='ghost' type='button' id='reset-"+name+"'>"+bb("reset")+"</button></div></div>";
    html+=afterDesk(r.cls).replace("<div class='card'","<div class='card' dir='ltr'");
  } else if(wantLogin()){
    html+="<div class='card'><p class='path'>LOGIN</p><label>Mail</label><input id='res-mail' type='email'/><div class='row'><button class='go' type='button' id='res-go'>Enter</button></div></div>";
  } else {
    html+="<div class='card'><div class='row'><button class='go' type='button' id='res-open'>The Result</button></div></div>";
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
  var open=document.getElementById("res-open");
  if(open)open.onclick=function(){try{sessionStorage.setItem("35-iris-login","1");}catch(e){}renderTrack("iphone");renderTrack("android");};
  var go=document.getElementById("res-go");
  if(go)go.onclick=function(){
    var mail=(document.getElementById("res-mail").value||"").trim();
    if(!mail||mail.indexOf("@")<0)return;
    saveMail(mail);renderTrack("iphone");renderTrack("android");
  };
};
renderTrack("iphone");renderTrack("android");
document.querySelectorAll("#langs button").forEach(function(b){
  b.addEventListener("click",function(){setTimeout(function(){renderTrack("iphone");renderTrack("android");},30);});
});
