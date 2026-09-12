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
function gotMail(){try{return !!(localStorage.getItem("35-iris-result-mail")||"").trim();}catch(e){return false;}}
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
  } else {
    html+="<div class='card' id='need-mail'><p class='path'>THE RESULT</p>";
    html+="<p class='q'>"+(ar()?"بعد الإجابات. اكتب البريد ثم اضغط The Result.":"Mark the answers first. Then put your mail and tap The Result.")+"</p>";
    html+="<label>Mail</label><input id='res-mail' type='email' autocomplete='email' placeholder='you@mail'/>";
    html+="<div class='row'><button class='go' type='button' id='res-go'>The Result</button></div>";
    html+="<p class='hint' id='res-msg'></p></div>";
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
  var go=document.getElementById("res-go");
  if(go)go.onclick=function(){
    var mail=(document.getElementById("res-mail").value||"").trim();
    var msg=document.getElementById("res-msg");
    if(!mail||mail.indexOf("@")<0){if(msg)msg.textContent=ar()?"اكتب بريداً.":"Write a mail.";return;}
    saveMail(mail);
    renderTrack("iphone");renderTrack("android");
  };
};
renderTrack("iphone");renderTrack("android");
document.querySelectorAll("#langs button").forEach(function(b){
  b.addEventListener("click",function(){setTimeout(function(){renderTrack("iphone");renderTrack("android");},30);});
});
