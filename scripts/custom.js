/* ============================================================
   流萤 · 清新博客主题 (Firefly Theme) — custom.js
   7 个功能模块 + 樱花飘落初始化
   全部 IIFE 包裹，'use strict'，跳过 data-gridea-inline="1"
   ============================================================ */
(function () {
  'use strict';

  /** 是否标记为内联渲染，需跳过避免重复绑定 */
  function isInline(el) {
    return el && el.getAttribute && el.getAttribute('data-gridea-inline') === '1';
  }

  /** NodeList 遍历兼容 */
  function each(list, fn) {
    Array.prototype.forEach.call(list, fn);
  }

  /* ---------- 1. 代码块复制按钮 ---------- */
  function initCodeCopy() {
    var pres = document.querySelectorAll('.post-content pre');
    each(pres, function (pre) {
      if (isInline(pre) || pre.querySelector('.code-copy-btn')) return;
      var btn = document.createElement('button');
      btn.className = 'code-copy-btn';
      btn.type = 'button';
      btn.textContent = '复制';
      btn.setAttribute('data-gridea-inline', '1');
      btn.setAttribute('aria-label', '复制代码');
      btn.addEventListener('click', function () {
        var code = pre.querySelector('code');
        var text = code ? code.innerText : pre.innerText;
        var done = function () {
          btn.textContent = '已复制';
          setTimeout(function () { btn.textContent = '复制'; }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done); });
        } else {
          fallbackCopy(text, done);
        }
      });
      pre.appendChild(btn);
    });
  }

  function fallbackCopy(text, cb) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    if (cb) cb();
  }

  /* ---------- 2. 回到顶部 ---------- */
  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn || isInline(btn)) return;
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        if (window.scrollY > 400) btn.classList.add('visible');
        else btn.classList.remove('visible');
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    onScroll();
  }

  /* ---------- 3. 阅读进度条 (rAF 节流) ---------- */
  function initReadingProgress() {
    var bar = document.getElementById('reading-progress');
    if (!bar || isInline(bar)) return;
    var ticking = false;
    function update() {
      var doc = document.documentElement;
      var scrollTop = window.scrollY || doc.scrollTop || 0;
      var scrollHeight = doc.scrollHeight - doc.clientHeight;
      var ratio = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      if (ratio < 0) ratio = 0;
      if (ratio > 1) ratio = 1;
      bar.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
      ticking = false;
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  /* ---------- 4. 图片点击放大 ---------- */
  function initImageZoom() {
    var overlay = document.getElementById('image-zoom-overlay');
    var zoomImg = document.getElementById('image-zoom-img');
    if (!overlay || !zoomImg) return;
    var imgs = document.querySelectorAll('.post-content img');
    each(imgs, function (img) {
      if (isInline(img) || img.getAttribute('data-zoom-bound') === '1') return;
      // 跳过代码块内的图片等
      if (img.closest('pre')) return;
      img.setAttribute('data-zoom-bound', '1');
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', function (e) {
        e.preventDefault();
        zoomImg.src = img.currentSrc || img.src;
        overlay.classList.add('visible');
      });
    });
    function close() { overlay.classList.remove('visible'); }
    overlay.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('visible')) close();
    });
  }

  /* ---------- 5. 目录高亮 ---------- */
  function initTocHighlight() {
    var tocLinks = document.querySelectorAll('.toc a');
    if (!tocLinks.length) return;
    var items = [];
    each(tocLinks, function (link) {
      if (isInline(link)) return;
      var href = link.getAttribute('href') || '';
      if (href.charAt(0) !== '#') return;
      var heading = document.getElementById(href.slice(1));
      if (heading) items.push({ heading: heading, link: link });
    });
    if (!items.length) return;
    var ticking = false;

    function update() {
      var pos = (window.scrollY || document.documentElement.scrollTop) + 120;
      var current = null;
      each(items, function (it) {
        if (it.heading.offsetTop <= pos) current = it;
      });
      each(items, function (it) { it.link.classList.remove('active'); });
      if (current) current.link.classList.add('active');
      ticking = false;
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
  }

  /* ---------- 6. 标题锚点 ---------- */
  function initHeaderAnchors() {
    var heads = document.querySelectorAll(
      '.post-content h1, .post-content h2, .post-content h3, ' +
      '.post-content h4, .post-content h5, .post-content h6'
    );
    each(heads, function (h) {
      if (isInline(h) || h.querySelector('.header-anchor')) return;
      if (!h.id) return;
      var a = document.createElement('a');
      a.className = 'header-anchor';
      a.href = '#' + h.id;
      a.setAttribute('data-gridea-inline', '1');
      a.setAttribute('aria-label', '链接到此处');
      a.title = '链接到此处';
      // 阻止默认锚点跳动的冒泡影响图片放大
      a.textContent = '#';
      h.appendChild(a);
    });
  }

  /* ---------- 7. 导航高亮 ---------- */
  function initNavHighlight() {
    var links = document.querySelectorAll('.nav-link');
    if (!links.length) return;
    var here = window.location.href.replace(/#.*$/, '').replace(/\/+$/, '');
    var path = window.location.pathname.replace(/\/+$/, '');
    var file = path.split('/').pop() || '';
    each(links, function (link) {
      if (isInline(link)) return;
      var raw = link.getAttribute('href') || '';
      if (!raw) return;
      var rawNorm = raw.replace(/#.*$/, '').replace(/\/+$/, '');
      var rawFile = rawNorm.split('/').pop();
      var linkAbs = link.href ? link.href.replace(/#.*$/, '').replace(/\/+$/, '') : '';
      var match = false;
      if (raw === './' || raw === '/' || raw === '') {
        // 首页链接
        if (!file || file === 'index.html' || here === linkAbs) match = true;
      } else if (rawFile && rawFile === file) {
        match = true;
      } else if (linkAbs && here.indexOf(linkAbs) === 0 && linkAbs.length > 0) {
        match = true;
      }
      if (match) link.classList.add('active');
    });
  }

  /* ---------- 樱花飘落初始化 (CSS keyframes 驱动) ---------- */
  function initSakura() {
    if (document.querySelector('.sakura')) return;
    var mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq && mq.matches) return;
    var container = document.createElement('div');
    container.className = 'sakura';
    container.setAttribute('data-gridea-inline', '1');
    container.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 6; i++) {
      var petal = document.createElement('span');
      petal.className = 'petal';
      container.appendChild(petal);
    }
    document.body.appendChild(container);
  }

  /* ---------- 启动 ---------- */
  function init() {
    initCodeCopy();
    initBackToTop();
    initReadingProgress();
    initImageZoom();
    initTocHighlight();
    initHeaderAnchors();
    initNavHighlight();
    initSakura();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
