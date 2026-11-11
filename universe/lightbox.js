(function () {
  'use strict';
  function startDarktecViewer() {
    const links = Array.from(document.querySelectorAll('.gallery a.original-image-link'));
    if (!links.length || document.getElementById('darktec-lightbox')) return;

    // Read every image URL once from its own gallery link. Never reuse the
    // currently displayed image URL when moving through the gallery.
    const items = links.map(function (link) {
      const image = link.querySelector('img');
      return {
        src: new URL(link.getAttribute('href'), document.baseURI).href,
        alt: image ? image.alt : 'DARKTEC artwork'
      };
    });
    links.forEach(function (link) {
      link.removeAttribute('target');
      link.removeAttribute('rel');
    });

    const css = document.createElement('style');
    css.textContent = [
      '#darktec-lightbox{position:fixed;inset:0;z-index:2147483647;display:none;align-items:center;justify-content:center;padding:58px 66px;background:rgba(3,2,8,.97);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}',
      '#darktec-lightbox.open{display:flex}',
      '#darktec-lightbox img{display:block;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain}',
      '#darktec-lightbox button{position:absolute;z-index:2;width:48px;height:48px;border:1px solid #ffffff66;border-radius:50%;background:#21152dee;color:#fff;font:32px/1 Arial;display:grid;place-items:center;cursor:pointer}',
      '#darktec-lightbox .close{top:14px;right:14px}',
      '#darktec-lightbox .prev{left:12px;top:50%;transform:translateY(-50%)}',
      '#darktec-lightbox .next{right:12px;top:50%;transform:translateY(-50%)}',
      '#darktec-lightbox .count{position:absolute;bottom:14px;left:50%;transform:translateX(-50%);color:#fff;font:12px Arial;letter-spacing:2px;background:#17101ddd;padding:8px 14px;border-radius:30px}',
      '@media(max-width:600px){#darktec-lightbox{padding:54px 8px}#darktec-lightbox button{width:42px;height:42px}#darktec-lightbox .prev{left:4px}#darktec-lightbox .next{right:4px}}'
    ].join('');
    document.head.appendChild(css);

    const viewer = document.createElement('div');
    viewer.id = 'darktec-lightbox';
    viewer.setAttribute('role', 'dialog');
    viewer.setAttribute('aria-modal', 'true');
    viewer.setAttribute('aria-label', 'DARKTEC image gallery');
    viewer.innerHTML = '<button class="close" type="button" aria-label="Close">×</button><button class="prev" type="button" aria-label="Previous image">‹</button><img alt=""><button class="next" type="button" aria-label="Next image">›</button><div class="count"></div>';
    document.body.appendChild(viewer);

    const display = viewer.querySelector('img');
    const counter = viewer.querySelector('.count');
    let index = 0;
    let previousFocus = null;
    let touchX = null;

    function showImage(nextIndex) {
      index = (nextIndex + items.length) % items.length;
      const item = items[index];
      display.src = item.src;
      display.alt = item.alt;
      counter.textContent = (index + 1) + ' / ' + items.length;
      // Preload adjacent originals so navigation feels immediate.
      [items[(index + 1) % items.length], items[(index - 1 + items.length) % items.length]].forEach(function (adjacent) {
        const preload = new Image();
        preload.src = adjacent.src;
      });
    }
    function openViewer(nextIndex) {
      previousFocus = document.activeElement;
      showImage(nextIndex);
      viewer.classList.add('open');
      document.body.style.overflow = 'hidden';
      viewer.querySelector('.close').focus();
    }
    function closeViewer() {
      viewer.classList.remove('open');
      document.body.style.overflow = '';
      display.removeAttribute('src');
      if (previousFocus && previousFocus.focus) previousFocus.focus();
    }

    // Delegation handles every image link on every category page.
    document.addEventListener('click', function (event) {
      const link = event.target.closest && event.target.closest('.gallery a.original-image-link');
      if (!link) return;
      const clickedIndex = links.indexOf(link);
      if (clickedIndex === -1) return;
      event.preventDefault();
      event.stopPropagation();
      openViewer(clickedIndex);
    }, true);

    viewer.querySelector('.close').addEventListener('click', closeViewer);
    viewer.querySelector('.prev').addEventListener('click', function () { showImage(index - 1); });
    viewer.querySelector('.next').addEventListener('click', function () { showImage(index + 1); });
    viewer.addEventListener('click', function (event) { if (event.target === viewer) closeViewer(); });
    document.addEventListener('keydown', function (event) {
      if (!viewer.classList.contains('open')) return;
      if (event.key === 'Escape') closeViewer();
      if (event.key === 'ArrowLeft') showImage(index - 1);
      if (event.key === 'ArrowRight') showImage(index + 1);
    });
    viewer.addEventListener('touchstart', function (event) { touchX = event.changedTouches[0].screenX; }, { passive: true });
    viewer.addEventListener('touchend', function (event) {
      if (touchX === null) return;
      const delta = event.changedTouches[0].screenX - touchX;
      touchX = null;
      if (Math.abs(delta) > 45) showImage(index + (delta < 0 ? 1 : -1));
    }, { passive: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startDarktecViewer);
  else startDarktecViewer();
})();