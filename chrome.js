(function(){
  var o=document.querySelector('p.owner');
  if(o) o.remove();
  var brand=document.querySelector('.brand');
  if(brand){
    brand.innerHTML='<span class="iris-name">IRIS</span><span class="iris-marks" aria-hidden="true">💡🦅</span>';
  }
  function use(img, list, alt){
    if(!img) return;
    img.alt=alt;
    var i=0;
    img.onerror=function(){
      i+=1;
      if(i<list.length) img.src=list[i];
    };
    img.src=list[0];
  }
  var lock=document.querySelector('.lock');
  if(lock){
    lock.querySelectorAll('.lock-mask,.lock-words,.iris-word,.elg-word').forEach(function(n){n.remove();});
    use(lock.querySelector('img'), ['IMG_6698.jpeg','hero.jpg','hero.svg?v=up'], '35 IRIS ElGhaly');
  }
  use(document.querySelector('.eye img'), ['IMG_6697.jpeg','iris-eye.jpg','iris-eye.svg?v=up'], 'IRIS 35 landscape');
  if(!document.getElementById('iris-chrome')){
    var s=document.createElement('style');
    s.id='iris-chrome';
    s.textContent=[
      '.top{display:flex;align-items:center;gap:8px;flex-wrap:nowrap;margin-top:0}',
      '.brand{display:flex;align-items:center;gap:6px;flex:0 0 auto}',
      '.iris-name{font-size:18px;font-weight:800;letter-spacing:.14em;color:#2ee6c7;line-height:1}',
      '.iris-marks{font-size:16px;line-height:1}',
      '.langs{display:flex;flex-wrap:nowrap;gap:6px;margin-left:auto;overflow-x:auto}',
      '.langs button{flex:0 0 auto;min-width:36px;padding:6px 8px;font-size:11px}',
      '.lock-mask,.lock-words{display:none!important}',
      '.lock img,.eye img{width:100%;height:auto;display:block;object-fit:cover}'
    ].join('');
    document.head.appendChild(s);
  }
})();
