(function(){
  var o=document.querySelector('p.owner');
  if(o) o.remove();
  var brand=document.querySelector('.brand');
  if(brand){
    brand.innerHTML='<span class="iris-name">IRIS</span><span class="iris-marks" aria-hidden="true">💡🦅</span>';
  }
  function use(img, primary, fallback, alt){
    if(!img) return;
    img.alt=alt;
    img.onerror=function(){ if(img.src.indexOf(fallback)===-1) img.src=fallback; };
    img.src=primary;
  }
  var lock=document.querySelector('.lock');
  if(lock){
    lock.querySelectorAll('.lock-mask,.lock-words,.iris-word,.elg-word').forEach(function(n){n.remove();});
    use(lock.querySelector('img'), 'hero.jpg?v=up', 'hero.svg?v=bar', '35 IRIS ElGhaly');
  }
  use(document.querySelector('.eye img'), 'iris-eye.jpg?v=up', 'iris-eye.svg?v=bar', 'IRIS 35 landscape');
  if(!document.getElementById('iris-chrome')){
    var s=document.createElement('style');
    s.id='iris-chrome';
    s.textContent=[
      '.top{display:flex;align-items:center;gap:8px;flex-wrap:nowrap;margin-top:0}',
      '.brand{display:flex;align-items:center;gap:6px;flex:0 0 auto}',
      '.iris-name{font-size:18px;font-weight:800;letter-spacing:.14em;color:#2ee6c7;line-height:1}',
      '.iris-marks{font-size:16px;line-height:1}',
      '.langs{display:flex;flex-wrap:nowrap;gap:6px;margin-left:auto;overflow-x:auto;max-width:none}',
      '.langs button{flex:0 0 auto;min-width:36px;padding:6px 8px;font-size:11px}',
      '.lock-mask,.lock-words{display:none!important}',
      '.lock img,.eye img{width:100%;height:auto;display:block;object-fit:cover}'
    ].join('');
    document.head.appendChild(s);
  }
})();
