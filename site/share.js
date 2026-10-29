/* Share target: receives ?title=&text=&url= from the Android share sheet, cleans the X link. */
(function () {
  'use strict';
  var core = window.UnsnitchCore;
  var $ = function (id) { return document.getElementById(id); };
  var URL_RE = /https?:\/\/[^\s<>"'`]+/gi;

  var params = new URLSearchParams(location.search);
  var fields = [params.get('url'), params.get('text'), params.get('title')];

  // Don't leave the tracked link sitting in history / the address bar.
  if (location.search) history.replaceState(null, '', location.pathname);

  // First X link found in url, then text, then title.
  function findXLink() {
    for (var i = 0; i < fields.length; i++) {
      var matches = (fields[i] || '').match(URL_RE) || [];
      for (var j = 0; j < matches.length; j++) {
        var u = matches[j].replace(/[.,;:!?)\]}]+$/, '');
        try { if (core.isXHost(new URL(u).hostname)) return u; } catch (e) { /* skip */ }
      }
    }
    return null;
  }

  var status = $('status'), result = $('result'), copyBtn = $('copy'), shareBtn = $('share');
  var orig = $('orig'), manual = $('manual'), input = $('in'), found = $('found');

  function setStatus(text, cls) {
    status.textContent = text;
    status.className = 'share-status' + (cls ? ' ' + cls : '');
  }

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return Promise.reject(new Error('no clipboard'));
  }

  var clean = '';

  function show(dirty) {
    clean = core.cleanUrl(dirty);
    result.textContent = clean;
    found.hidden = false;
    manual.hidden = true;
    orig.textContent = '';
    if (clean !== dirty) {
      var keep = new URL(clean).searchParams;
      var gone = [];
      new URL(dirty).searchParams.forEach(function (v, k) { if (!keep.has(k)) gone.push(k + '=' + v); });
      var s = document.createElement('s');
      s.textContent = gone.join('&');
      orig.append('Removed tracking: ', s);
    } else {
      orig.textContent = 'This link had no tracking.';
    }
    shareBtn.hidden = !navigator.share;
    copy(clean).then(function () {
      setStatus('✓ Clean link copied to your clipboard', 'ok');
    }, function () {
      setStatus('Tap Copy to grab your clean link', '');
    });
  }

  copyBtn.addEventListener('click', function () {
    copy(clean).then(function () {
      setStatus('✓ Clean link copied to your clipboard', 'ok');
      copyBtn.textContent = 'Copied ✓';
    }, function () {
      var range = document.createRange();
      range.selectNodeContents(result);
      var sel = getSelection(); sel.removeAllRanges(); sel.addRange(range);
      setStatus('Copy blocked — the link is selected, copy it manually', 'warn');
    });
  });

  shareBtn.addEventListener('click', function () {
    navigator.share({ url: clean }).catch(function () {});
  });

  $('clean-manual').addEventListener('click', function () {
    var t = input.value.trim();
    fields = [t];
    var link = findXLink();
    if (link) show(link);
    else setStatus('No X (Twitter) link found in that text.', 'warn');
  });

  var link = core && findXLink();
  if (link) {
    show(link);
  } else {
    found.hidden = true;
    manual.hidden = false;
    var anything = fields.some(Boolean);
    setStatus(anything ? 'No X (Twitter) link found in what was shared.' : 'Share an X post to Unsnitch, or paste a link below.', anything ? 'warn' : '');
    if (anything) input.value = fields.filter(Boolean).join('\n');
  }

  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }
})();
