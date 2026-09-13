(function(){
  var w=document.querySelector(".iris-word");
  if(w){w.style.top="72%";w.style.fontSize="clamp(14px,4.6vw,24px)";}
  var f=document.querySelector("footer");
  if(f){
    var addrs=[].slice.call(f.querySelectorAll(".addr"));
    if(addrs.length>=2){
      var eg=addrs[1], sf=addrs[0];
      eg.className="addr addr-eg";
      sf.parentNode.insertBefore(eg,sf);
    }
  }
})();
function drawStatic(){
  var love=document.querySelector(".love");
  function put(id,html){
    var el=document.getElementById(id);
    if(!el){el=document.createElement("div");el.id=id;if(love&&love.parentNode)love.parentNode.insertBefore(el,love);}
    el.innerHTML=html;
  }
  put("priv",'<h2>'+t("priv_h")+'</h2><div class="card"><p class="path">'+t("priv_p")+'</p><p class="q">'+t("priv_q")+'</p><p class="rule">'+t("priv_r")+'</p></div>');
  put("alarm",'<h2>'+t("alarm_h")+'</h2><div class="card"><p class="path">'+t("alarm_p")+'</p><p class="q">'+t("alarm_q")+'</p><p class="rule">'+t("alarm_r")+'</p></div>');
}
(function(){
  var g=document.getElementById("gate");
  if(g&&g.parentNode)g.parentNode.removeChild(g);
  document.body.classList.remove("gated");
  drawStatic();
})();
function gotMail(){try{return !!(localStorage.getItem("35-iris-result-mail")||"").trim();}catch(e){return false;}}
function wantLogin(){try{return sessionStorage.getItem("35-iris-login")==="1";}catch(e){return false;}}
function saveMail(v){try{localStorage.setItem("35-iris-result-mail",v);}catch(e){}}
function qq(item){return t(item.id+"_q");}
function pp(item){return t(item.id+"_p");}
renderTrack=function(name){
  var track=TRACKS[name],root=document.getElementById(name);if(!root||!track)return;
  var answers=(loadState(track.key).answers)||{},html="";
  track.qs.forEach(function(item){
    var cur=answers[item.id]||"";
    html+="<div class='card'><p class='path'>"+pp(item)+"</p><p class='q'>"+qq(item)+"</p><div class='ans'>";
    ["no","yes","idk"].forEach(function(v){
      html+="<button type='button' data-track='"+name+"' data-id='"+item.id+"' data-v='"+v+"' class='"+(cur===v?("on-"+v):"")+"'>"+t(v)+"</button>";
    });
    html+="</div></div>";
  });
  if(gotMail()){
    var r=rank(track,answers);
    html+="<div class='card' dir='ltr'><span class='badge "+r.cls+"'>CLASS "+r.cls+"</span><p class='rule'>"+nextText(track,r.cls)+"\n"+r.notes.join("\n")+"</p><div class='row'><button class='ghost' type='button' id='reset-"+name+"'>"+t("reset")+"</button></div></div>";
    html+=afterDesk(r.cls).replace("<div class='card'","<div class='card' dir='ltr'");
  } else if(wantLogin()){
    html+="<div class='card'><p class='path'>"+t("login")+"</p><p class='q'>"+t("mailq")+"</p><label>Mail</label><input id='res-mail' type='email'/><div class='row'><button class='go' type='button' id='res-go'>"+t("enter")+"</button></div></div>";
  } else {
    html+="<div class='card'><div class='row'><button class='go' type='button' id='res-open'>"+t("result")+"</button></div></div>";
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
function refreshLang(){drawStatic();renderTrack("iphone");renderTrack("android");}
renderTrack("iphone");renderTrack("android");
document.querySelectorAll("#langs button").forEach(function(b){
  b.addEventListener("click",function(){setTimeout(refreshLang,40);});
});
