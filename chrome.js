(function(){
  var o=document.querySelector('p.owner');
  if(o) o.remove();
  var brand=document.querySelector('.brand');
  if(brand){
    brand.innerHTML='<span class="iris-name">IRIS</span><span class="iris-marks" aria-hidden="true">💡🦅</span>';
  }
  var lock=document.querySelector('.lock');
  if(lock){
    lock.querySelectorAll('.lock-mask,.lock-words,.iris-word,.elg-word').forEach(function(n){n.remove();});
    var img=lock.querySelector('img');
    if(img){ img.src='hero.svg?v=photo'; img.alt='35 IRIS ElGhaly'; }
  }
  var eye=document.querySelector('.eye img');
  if(eye){ eye.src='iris-eye.svg?v=photo'; }
  if(!document.getElementById('iris-chrome')){
    var s=document.createElement('style');
    s.id='iris-chrome';
    s.textContent=[
      '.iris-name{font-size:clamp(26px,7vw,36px);font-weight:800;letter-spacing:.16em;color:#2ee6c7;line-height:1}',
      '.iris-marks{font-size:clamp(26px,7vw,36px);line-height:1}',
      '.brand{display:flex;align-items:center;gap:10px}',
      '.top{align-items:center;margin-top:0}',
      '.langs{margin-left:auto}',
      '.lock-mask,.lock-words{display:none!important}'
    ].join('');
    document.head.appendChild(s);
  }
})();
