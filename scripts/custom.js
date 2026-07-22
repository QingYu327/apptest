(function () {
  'use strict';

  /**
   * 樱花主题 JavaScript
   * 7 个功能模块，IIFE 包裹，跳过 data-gridea-inline="1" 防止重复绑定
   */

  // 防止重复初始化
  if (window.__sakuraThemeInitialized) return;
  window.__sakuraThemeInitialized = true;

  /**
   * 跳过标记为 data-gridea-inline="1" 的元素
   */
  function shouldSkip(el) {
    return el && el.getAttribute && el.getAttribute('data-gridea-inline') === '1';
  }

  /**
   * 1. 代码块复制按钮
   * 为 .post-content pre 添加 .code-copy-btn
   */
  function initCodeCopy() {
    var pres = document.querySelectorAll('.post-content pre');
    Array.prototype.forEach.call(pres, function (pre) {
      if (shouldSkip(pre)) return;
      if (pre.querySelector('.code-copy-btn')) return;

      pre.style.position = pre.style.position || 'relative';

      var btn = document.createElement('button');
      btn.className = 'code-copy-btn';
      btn.textContent = '复制';
      btn.setAttribute('data-gridea-inline', '1');

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var code = pre.querySelector('code');
        var text = code ? code.textContent : pre.textContent;

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            btn.textContent = '已复制';
            setTimeout(function () { btn.textContent = '复制'; }, 2000);
          }).catch(function () {
            fallbackCopy(text);
            btn.textContent = '已复制';
            setTimeout(function () { btn.textContent = '复制'; }, 2000);
          });
        } else {
          fallbackCopy(text);
          btn.textContent = '已复制';
          setTimeout(function () { btn.textContent = '复制'; }, 2000);
        }
      });

      pre.appendChild(btn);
    });
  }

  /**
   * 兼容性复制方法
   */
  function fallbackCopy(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      // 忽略
    }
    document.body.removeChild(textarea);
  }

  /**
   * 2. 回到顶部
   * #back-to-top 的 .visible 类切换
   */
  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn || shouldSkip(btn)) return;

    var ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        if (window.scrollY > 300) {
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    onScroll();
  }

  /**
   * 3. 阅读进度条
   * #reading-progress 的 transform: scaleX(...)，rAF 节流
   */
  function initReadingProgress() {
    var bar = document.getElementById('reading-progress');
    if (!bar || shouldSkip(bar)) return;

    var ticking = false;

    function update() {
      var docEl = document.documentElement;
      var scrollHeight = docEl.scrollHeight - window.innerHeight;
      var progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      bar.style.transform = 'scaleX(' + progress + ')';
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    update();
  }

  /**
   * 4. 图片点击放大
   * .post-content img 点击触发 #image-zoom-overlay
   */
  function initImageZoom() {
    var overlay = document.getElementById('image-zoom-overlay');
    var zoomImg = document.getElementById('image-zoom-img');
    if (!overlay || !zoomImg) return;
    if (shouldSkip(overlay)) return;

    var images = document.querySelectorAll('.post-content img');
    Array.prototype.forEach.call(images, function (img) {
      if (shouldSkip(img)) return;
      if (img.getAttribute('data-zoom-bound') === '1') return;
      img.setAttribute('data-zoom-bound', '1');

      img.addEventListener('click', function (e) {
        e.preventDefault();
        zoomImg.src = img.src;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeOverlay() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    overlay.addEventListener('click', closeOverlay);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        closeOverlay();
      }
    });
  }

  /**
   * 5. 目录高亮
   * .toc a 滚动高亮当前章节
   */
  function initTocHighlight() {
    var tocLinks = document.querySelectorAll('.toc a');
    if (tocLinks.length === 0) return;

    var headings = [];
    Array.prototype.forEach.call(tocLinks, function (link) {
      if (shouldSkip(link)) return;
      var href = link.getAttribute('href');
      if (href && href.charAt(0) === '#') {
        var target = document.getElementById(href.substring(1));
        if (target) {
          headings.push({ el: target, link: link });
        }
      }
    });

    if (headings.length === 0) return;

    var ticking = false;

    function update() {
      var scrollPos = window.scrollY + 120;
      var current = null;

      for (var i = 0; i < headings.length; i++) {
        if (headings[i].el.offsetTop <= scrollPos) {
          current = headings[i];
        } else {
          break;
        }
      }

      Array.prototype.forEach.call(tocLinks, function (l) {
        l.classList.remove('active');
      });

      if (current) {
        current.link.classList.add('active');
      }
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    update();
  }

  /**
   * 6. 标题锚点
   * .post-content h1-h6 添加 .header-anchor
   */
  function initHeaderAnchors() {
    var headers = document.querySelectorAll(
      '.post-content h1, .post-content h2, .post-content h3, ' +
      '.post-content h4, .post-content h5, .post-content h6'
    );

    Array.prototype.forEach.call(headers, function (h) {
      if (shouldSkip(h)) return;
      if (h.querySelector('.header-anchor')) return;

      var id = h.id;
      if (!id) return;

      var anchor = document.createElement('a');
      anchor.className = 'header-anchor';
      anchor.href = '#' + id;
      anchor.textContent = '#';
      anchor.title = '永久链接';
      anchor.setAttribute('data-gridea-inline', '1');
      h.appendChild(anchor);
    });
  }

  /**
   * 7. 导航高亮
   * .nav-link 当前页高亮
   */
  function initNavHighlight() {
    var navLinks = document.querySelectorAll('.nav-link');
    if (navLinks.length === 0) return;

    var currentPath = window.location.pathname;
    // 去除尾部斜杠统一比较
    var normalizedCurrent = currentPath.replace(/\/+$/, '') || '/';

    Array.prototype.forEach.call(navLinks, function (link) {
      if (shouldSkip(link)) return;
      var href = link.getAttribute('href');
      if (!href || href === '#' || href.charAt(0) === '#') return;

      try {
        var url = new URL(href, window.location.origin);
        var linkPath = url.pathname.replace(/\/+$/, '') || '/';

        if (linkPath === normalizedCurrent) {
          link.classList.add('active');
        } else if (linkPath !== '/' && normalizedCurrent.indexOf(linkPath) === 0) {
          // 前缀匹配（子路径）
          link.classList.add('active');
        }
      } catch (e) {
        // 忽略无效 URL
      }
    });
  }

  /**
   * 初始化所有模块
   */
  function init() {
    initCodeCopy();
    initBackToTop();
    initReadingProgress();
    initImageZoom();
    initTocHighlight();
    initHeaderAnchors();
    initNavHighlight();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
