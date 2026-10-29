/*
 * Unsnitch — page ("MAIN" world) script for x.com / twitter.com.
 *
 * Runs at document_start, right after core/clean.js, before X's own code.
 * It wraps the browser APIs X uses to copy/share links so every X URL that
 * passes through them is cleaned:
 *   - navigator.clipboard.writeText / write
 *   - DataTransfer#setData + a capturing 'copy' listener (execCommand / Ctrl+C)
 *   - navigator.share
 * It also scrubs tracking params from the address bar (load + SPA navigation).
 *
 * Talks to isolated.js (which owns chrome.storage) via window.postMessage:
 *   isolated -> main : { ns: 'unsnitch', type: 'state', enabled: <bool> }
 *   main -> isolated : { ns: 'unsnitch', type: 'hello' | 'cleaned' }
 *
 * Golden rule: never throw and never break the page. If anything goes wrong
 * we fall back to the original, untouched browser behaviour.
 */
(function () {
  'use strict';

  var NS = 'unsnitch';
  var core = globalThis.UnsnitchCore;
  if (!core || typeof core.cleanText !== 'function') return; // core missing: do nothing
  // Grab our reference, then hide the global so the page can't tamper with it.
  try { delete globalThis.UnsnitchCore; } catch (e) { /* ignore */ }

  var enabled = true;   // optimistic default; isolated.js confirms ASAP
  var stateKnown = false;

  function post(type) {
    try { window.postMessage({ ns: NS, type: type }, location.origin); } catch (e) { /* ignore */ }
  }

  // Clean any X URLs inside `text`. Reports a 'cleaned' event when it changed something.
  function clean(text, fn) {
    if (!enabled || typeof text !== 'string') return text;
    try {
      var out = (fn || core.cleanText)(text);
      if (out !== text) post('cleaned');
      return out;
    } catch (e) {
      return text;
    }
  }

  // Replace obj[name] with wrap(original). Silently skips if unavailable.
  function patch(obj, name, wrap) {
    try {
      var orig = obj && obj[name];
      if (typeof orig === 'function') obj[name] = wrap(orig);
    } catch (e) { /* ignore */ }
  }

  // --- navigator.clipboard.writeText(text) -------------------------------
  patch(globalThis.Clipboard && Clipboard.prototype, 'writeText', function (orig) {
    return function writeText(text) {
      var args = Array.prototype.slice.call(arguments);
      if (typeof text === 'string') args[0] = clean(text);
      return orig.apply(this, args);
    };
  });

  // --- navigator.clipboard.write([ClipboardItem]) ------------------------
  var TEXT_TYPES = ['text/plain', 'text/html'];

  // Returns a new ClipboardItem whose text types are cleaned lazily (as promises).
  function cleanItem(item) {
    var types = item.types || [];
    if (!types.some(function (t) { return TEXT_TYPES.indexOf(t) >= 0; })) return item;
    var data = {};
    types.forEach(function (type) {
      var blob = item.getType(type);
      data[type] = TEXT_TYPES.indexOf(type) < 0 ? blob : blob.then(function (b) {
        return b.text().then(function (txt) {
          var out = clean(txt);
          return out === txt ? b : new Blob([out], { type: type });
        });
      });
    });
    var opts = item.presentationStyle ? { presentationStyle: item.presentationStyle } : undefined;
    return new ClipboardItem(data, opts);
  }

  patch(globalThis.Clipboard && Clipboard.prototype, 'write', function (orig) {
    return function write(items) {
      var args = Array.prototype.slice.call(arguments);
      if (enabled && Array.isArray(items) && typeof ClipboardItem === 'function') {
        try { args[0] = items.map(cleanItem); } catch (e) { args[0] = items; }
      }
      return orig.apply(this, args);
    };
  });

  // --- DataTransfer#setData (sites' own 'copy' handlers, drag & drop) ----
  patch(globalThis.DataTransfer && DataTransfer.prototype, 'setData', function (orig) {
    return function setData(format, data) {
      var args = Array.prototype.slice.call(arguments);
      if (typeof format === 'string' && /^text(\/plain|\/html|\/uri-list)?$/i.test(format)) {
        args[1] = clean(data);
      }
      return orig.apply(this, args);
    };
  });

  // --- Plain copy (Ctrl+C / execCommand('copy')) of a selection ----------
  function selectedText() {
    var el = document.activeElement;
    if (el && (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') &&
        typeof el.selectionStart === 'number' && el.selectionStart !== el.selectionEnd) {
      return String(el.value).slice(el.selectionStart, el.selectionEnd);
    }
    var sel = document.getSelection && document.getSelection();
    return sel ? String(sel) : '';
  }

  window.addEventListener('copy', function (e) {
    try {
      if (!enabled || !e.clipboardData) return;
      var text = selectedText();
      var out = clean(text);
      if (!text || out === text) return;
      e.clipboardData.setData('text/plain', out);
      e.preventDefault(); // use our cleaned text instead of the raw selection
    } catch (err) { /* ignore */ }
  }, true);

  // --- navigator.share({ url, text, title }) -----------------------------
  patch(globalThis.Navigator && Navigator.prototype, 'share', function (orig) {
    return function share(data) {
      var args = Array.prototype.slice.call(arguments);
      if (enabled && data && typeof data === 'object') {
        try {
          var copy = Object.assign({}, data);
          if (typeof copy.url === 'string') copy.url = clean(copy.url, core.cleanUrl);
          if (typeof copy.text === 'string') copy.text = clean(copy.text);
          args[0] = copy;
        } catch (e) { args[0] = data; }
      }
      return orig.apply(this, args);
    };
  });

  // --- Address bar: drop tracking params on load and SPA navigation ------
  var replaceState = history.replaceState;

  function scrubLocation() {
    if (!enabled || !stateKnown) return; // wait until we know the user's setting
    try {
      var href = location.href;
      var out = core.cleanUrl(href);
      if (out !== href) replaceState.call(history, history.state, '', out);
    } catch (e) { /* ignore */ }
  }

  ['pushState', 'replaceState'].forEach(function (name) {
    patch(History.prototype, name, function (orig) {
      return function () {
        var ret = orig.apply(this, arguments);
        scrubLocation();
        return ret;
      };
    });
  });
  window.addEventListener('popstate', scrubLocation);

  // --- Settings from isolated.js -----------------------------------------
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (e.source !== window || e.origin !== location.origin) return;
    if (!d || typeof d !== 'object' || d.ns !== NS || d.type !== 'state' || typeof d.enabled !== 'boolean') return;
    enabled = d.enabled;
    stateKnown = true;
    scrubLocation();
  });

  post('hello'); // ask isolated.js for the current state (in case it loaded first)
})();
