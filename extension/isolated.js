/*
 * Unsnitch — isolated-world content script for x.com / twitter.com.
 *
 * The page-world script (main-world.js) can't use extension APIs, so this
 * script is its bridge:
 *   - reads the on/off switch from chrome.storage.sync ({ enabled: true })
 *     and relays it to main-world.js via window.postMessage
 *   - counts 'cleaned' reports into chrome.storage.local.cleanedCount
 *   - performs "Copy clean link" clipboard writes for the context menu
 */
(function () {
  'use strict';

  var NS = 'unsnitch';
  var enabled = true;
  var pending = 0;
  var flushTimer = null;

  // After an extension update/reload this orphaned script loses its API access.
  function alive() {
    try { return !!(chrome.runtime && chrome.runtime.id); } catch (e) { return false; }
  }

  function sendState() {
    try { window.postMessage({ ns: NS, type: 'state', enabled: enabled }, location.origin); } catch (e) { /* ignore */ }
  }

  if (alive()) {
    chrome.storage.sync.get({ enabled: true }, function (res) {
      enabled = !res || res.enabled !== false;
      sendState();
    });
    chrome.storage.onChanged.addListener(function (changes, area) {
      if (area !== 'sync' || !changes.enabled) return;
      enabled = changes.enabled.newValue !== false;
      sendState();
    });
  }

  // Batch counter writes so a burst of copies costs a single storage write.
  function bumpCounter() {
    pending++;
    if (flushTimer) return;
    flushTimer = setTimeout(function () {
      flushTimer = null;
      var n = pending;
      pending = 0;
      if (!alive()) return;
      chrome.storage.local.get({ cleanedCount: 0 }, function (res) {
        var count = (res && Number(res.cleanedCount)) || 0;
        chrome.storage.local.set({ cleanedCount: count + n });
      });
    }, 500);
  }

  // Only accept well-formed messages from this very window (same origin).
  window.addEventListener('message', function (e) {
    if (e.source !== window || e.origin !== location.origin) return;
    var d = e.data;
    if (!d || typeof d !== 'object' || d.ns !== NS) return;
    if (d.type === 'hello') sendState();
    else if (d.type === 'cleaned' && enabled) bumpCounter();
  });

  // --- Context menu "Copy clean link" (message from background.js) ------
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    (document.body || document.documentElement).appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* ignore */ }
    ta.remove();
  }

  if (alive()) {
    chrome.runtime.onMessage.addListener(function (msg) {
      if (!msg || msg.type !== 'unsnitch:copy' || typeof msg.text !== 'string') return;
      try {
        navigator.clipboard.writeText(msg.text).catch(function () { fallbackCopy(msg.text); });
      } catch (e) {
        fallbackCopy(msg.text);
      }
    });
  }
})();
