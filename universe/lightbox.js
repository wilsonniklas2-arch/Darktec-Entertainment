(function(){
  'use strict';
  function init(){
    const galleryLinks=Array.from(document.querySelectorAll('.gallery a.original-image-link'));
    if(!galleryLinks.length)return;
    galleryLinks.forEach(a=>{a.removeAttribute('target');a.removeAttribute('rel');});
    const style=document.createElement('style');
    style.textContent=`
      #darktec-lightbox{position:fixed;inset:0;z-index:2147483647;display:none;align-items:center;justify-content:center;padding:56px 64px;background:rgba(3,2,8,.96);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
      #darktec-lightbox.open{display:flex}
      #darktec-lightbox img{max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;display:block}
      #darktec-lightbox button{position:absolute;z-index:2;width:46px;height:46px;border:1px solid #ffffff66;border-radius:50%;background:#21152ddd;color:white;font:32px/1 Arial;display:grid;place-items:center;cursor:pointer}
      #darktec-lightbox .close{top:14px;right:14px}#darktec-lightbox .prev{left:12px;top:50%;transform:translateY(-50%)}#darktec-lightbox .next{right:12px;top:50%;transform:translateY(-50%)}
      #darktec-lightbox .count{position:absolute;bottom:14px;left:50%;transform:translateX(-50%);color:white;font:12px Arial;letter-spacing:2px;background:#17101dcc;padding:8px 14px;border-radius:30px}
      @media(max-width:600px){#darktec-lightbox{padding:52px 8px}#darktec-lightbox button{width:40px;height:40px}#darktec-lightbox .prev{left:4px}#darktec-lightbox .next{right:4px}}
    `;
    document.head.appendChild(style);
    const box=document.createElement('div');box.id='darktec-lightbox';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label','DARKTEC image viewer');
    box.innerHTML='<button class="close" type="button" aria-label="Close">×</button><button class="prev" type="button" aria-label="Previous image">‹</button><img alt=""><button class="next" type="button" aria-label="Next image">›</button><div class="count"></div>';
    document.body.appendChild(box);
    const img=box.querySelector('img'),count=box.querySelector('.count');let active=0,oldFocus=null,touchStart=0;
    function show(n){active=(n+galleryLinks.length)%galleryLinks.length;const a=galleryLinks[active];img.src=a.href;img.alt=a.querySelector('img')?.alt||'DARKTEC artwork';count.textContent=(active+1)+' / '+galleryLinks.length;}
    function open(n){oldFocus=document.activeElement;show(n);box.classList.add('open');document.body.style.overflow='hidden';box.querySelector('.close').focus();}
    function close(){box.classList.remove('open');document.body.style.overflow='';img.removeAttribute('src');if(oldFocus&&oldFocus.focus)oldFocus.focus();}
    document.addEventListener('click',function(e){const a=e.target.closest&&e.target.closest('.gallery a.original-image-link');if(!a)return;const n=galleryLinks.indexOf(a);if(n<0)return;e.preventDefault();e.stopPropagation();open(n);},true);
    box.querySelector('.close').addEventListener('click',close);
    box.querySelector('.prev').addEventListener('click',()=>show(active-1));
    box.querySelector('.next').addEventListener('click',()=>show(active+1));
    box.addEventListener('click',e=>{if(e.target===box)close();});
    document.addEventListener('keydown',e=>{if(!box.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(active-1);if(e.key==='ArrowRight')show(active+1);});
    box.addEventListener('touchstart',e=>{touchStart=e.changedTouches[0].screenX;},{passive:true});
    box.addEventListener('touchend',e=>{const dx=e.changedTouches[0].screenX-touchStart;if(Math.abs(dx)>45)show(active+(dx<0?1:-1));},{passive:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();