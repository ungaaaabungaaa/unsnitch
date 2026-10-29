/* Unsnitch site: live cleaner, PWA install button, service worker. No network, no tracking. */
(function () {
  'use strict';
  var core = window.UnsnitchCore;
  var $ = function (id) { return document.getElementById(id); };
  var EXAMPLE = 'https://x.com/0xBrokkr/status/2115719483620571136?a=Kq3vX9mPzR2tLw8nYb4c&s=19';
  var URL_RE = /https?:\/\/[^\s<>"'`]+/gi;

  // Names of params cleanUrl dropped from every X link in `text`.
  function removedParams(text) {
    var out = [];
    (text.match(URL_RE) || []).forEach(function (u) {
      u = u.replace(/[.,;:!?)\]}]+$/, '');
      var clean = core.cleanUrl(u);
      if (clean === u) return;
      try {
        var keep = new URL(clean).searchParams;
        new URL(u).searchParams.forEach(function (_, k) {
          if (!keep.has(k) && out.indexOf(k) < 0) out.push(k);
        });
      } catch (e) { /* ignore */ }
    });
    return out;
  }

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.className = 'skip';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { /* ignore */ }
      ta.remove();
      ok ? resolve() : reject(new Error('copy failed'));
    });
  }

  function flash(btn, label) {
    var orig = btn.dataset.label || (btn.dataset.label = btn.textContent);
    btn.textContent = label;
    clearTimeout(btn._t);
    btn._t = setTimeout(function () { btn.textContent = orig; }, 1600);
  }

  var input = $('in');
  if (input && core) {
    var out = $('out'), result = $('result'), removed = $('removed'), copyBtn = $('copy');

    var render = function () {
      var text = input.value.trim();
      out.hidden = !text;
      if (!text) return;
      var clean = core.cleanText(text);
      var gone = removedParams(text);
      result.textContent = clean;
      result.classList.toggle('is-same', !gone.length);
      removed.textContent = '';
      if (gone.length) {
        removed.append('Removed: ');
        gone.forEach(function (k, i) {
          var s = document.createElement('s');
          s.textContent = k;
          removed.append(i ? ', ' : '', s);
        });
      } else {
        removed.textContent = /https?:\/\//i.test(text) ? 'Already clean — no X tracking found.' : 'Paste a link that starts with https://';
      }
    };

    input.addEventListener('input', render);
    $('example').addEventListener('click', function () { input.value = EXAMPLE; render(); });
    $('paste').addEventListener('click', function () {
      if (!navigator.clipboard || !navigator.clipboard.readText) { input.focus(); return; }
      navigator.clipboard.readText().then(function (t) { input.value = t; render(); }, function () { input.focus(); });
    });
    copyBtn.addEventListener('click', function () {
      copy(result.textContent).then(function () { flash(copyBtn, 'Copied ✓'); }, function () { flash(copyBtn, 'Copy failed — select it manually'); });
    });
  }

  // Bookmarklets can't run from this page (CSP); they must be dragged to the bookmarks bar.
  var bm = $('bookmarklet');
  if (bm) bm.addEventListener('click', function (e) { e.preventDefault(); flash(bm, 'Drag me to your bookmarks bar'); });

  // "Install app" button for browsers that support it (Android Chrome etc).
  var installBtn = $('install-pwa'), deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    if (installBtn) installBtn.hidden = false;
  });
  if (installBtn) installBtn.addEventListener('click', function () {
    if (!deferred) return;
    deferred.prompt();
    deferred.userChoice.finally(function () { deferred = null; installBtn.hidden = true; });
  });

  if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();
