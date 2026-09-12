(function(){
  if(sessionStorage.getItem("35-iris-in")==="1")return;
  var g=document.createElement("div");
  g.id="gate";
  g.innerHTML='<div class="gate-card">'+
    '<div class="gate-mark">35</div>'+
    '<p class="gate-word">IRIS</p>'+
    '<p class="gate-signs">✝️ 🧿 🪬 · 💡 🦅</p>'+
    '<p class="gate-copy">A brand desk. Not a random page. First pass free. No password. No wallet.</p>'+
    '<label class="gate-lab" for="gate-mail">Member name or mail (stays on this browser)</label>'+
    '<input id="gate-mail" class="gate-in" autocomplete="username" placeholder="name or mail"/>'+
    '<button type="button" class="gate-go" id="gate-enter">Enter IRIS</button>'+
    '<p class="gate-fine">We do not receive this. It never leaves the phone.</p>'+
    '</div>';
  document.body.appendChild(g);
  document.body.classList.add("gated");
  function enter(){
    var v=(document.getElementById("gate-mail").value||"").trim();
    if(v)try{localStorage.setItem("35-iris-member",v);}catch(e){}
    sessionStorage.setItem("35-iris-in","1");
    document.body.classList.remove("gated");
    if(g.parentNode)g.parentNode.removeChild(g);
  }
  document.getElementById("gate-enter").onclick=enter;
  document.getElementById("gate-mail").addEventListener("keydown",function(e){if(e.key==="Enter")enter();});
})();
