(function(){
  var g=document.getElementById("gate");
  if(g&&g.parentNode)g.parentNode.removeChild(g);
  document.body.classList.remove("gated");
  if(!document.getElementById("priv")){
    var box=document.createElement("div");
    box.id="priv";
    box.innerHTML='<h2>PRIVATE SESSION</h2><div class="card">'+
      '<p class="path">MAIL ONLY</p>'+
      '<p class="q">For a person who already did the first pass and still needs a human next to the glass.</p>'+
      '<p class="rule" dir="ltr">What it is\n1. You stay on YOUR phone. Nobody takes it.\n2. We speak while you tap the same paths.\n3. Family brief: one person you love learns the list.\n4. Public-address review only. No seed. No 2FA. No wallet connect.\n\nWhat it is not\n- Not remote control.\n- Not a helper app.\n- Not screen share with a stranger.\n- Not opening an account for you.\n\nHow\nWrite support@elghaly.dev with the word PRIVATE.\nHUMAN lane stays mail-only.\nExtra only AFTER the work. No printed price.\nIf you cannot pay, write HUMAN.</p></div>';
    var love=document.querySelector(".love");
    if(love&&love.parentNode)love.parentNode.insertBefore(box,love);
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
    html+="<div class='card'><p class='path'>LOGIN</p><p class='q'>"+(ar()?"اكتب البريد لفتح النتيجة.":"Put your mail to open the result.")+"</p><label>Mail</label><input id='res-mail' type='email' autocomplete='email'/><div class='row'><button class='go' type='button' id='res-go'>Enter</button></div><p class='hint' id='res-msg'></p></div>";
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
    var msg=document.getElementById("res-msg");
    if(!mail||mail.indexOf("@")<0){if(msg)msg.textContent="Write a mail.";return;}
    saveMail(mail);renderTrack("iphone");renderTrack("android");
  };
};
renderTrack("iphone");renderTrack("android");
document.querySelectorAll("#langs button").forEach(function(b){
  b.addEventListener("click",function(){setTimeout(function(){renderTrack("iphone");renderTrack("android");},30);});
});
