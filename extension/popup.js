/*
 * Unsnitch popup: on/off switch, cleaned-links counter and a paste & clean box.
 * Settings: chrome.storage.sync.enabled (default true)
 * Stats:    chrome.storage.local.cleanedCount
 */
'use strict';

var core = globalThis.UnsnitchCore;
var $ = function (id) { return document.getElementById(id); };

function renderEnabled(on) {
  $('enabled').checked = on;
  document.body.classList.toggle('off', !on);
  $('status').textContent = on ? 'Protecting your links on X' : 'Paused — links are not cleaned';
}

function renderCount(n) {
  n = Number(n) || 0;
  $('count').textContent = n.toLocaleString();
  $('count-label').textContent = n === 1 ? 'link unsnitched' : 'links unsnitched';
}

chrome.storage.sync.get({ enabled: true }, function (res) { renderEnabled(res.enabled !== false); });
chrome.storage.local.get({ cleanedCount: 0 }, function (res) { renderCount(res.cleanedCount); });

chrome.storage.onChanged.addListener(function (changes, area) {
  if (area === 'local' && changes.cleanedCount) renderCount(changes.cleanedCount.newValue);
  if (area === 'sync' && changes.enabled) renderEnabled(changes.enabled.newValue !== false);
});

$('enabled').addEventListener('change', function (e) {
  chrome.storage.sync.set({ enabled: e.target.checked });
  renderEnabled(e.target.checked);
});

$('clean').addEventListener('click', function () {
  var input = $('input');
  var before = input.value;
  var after = core.cleanText(before);
  input.value = after;
  if (!after.trim()) {
    $('feedback').textContent = 'Paste a link first.';
    return;
  }
  navigator.clipboard.writeText(after).then(function () {
    $('feedback').textContent = after === before ? 'Already clean — copied.' : 'Cleaned & copied!';
  }, function () {
    input.select();
    $('feedback').textContent = after === before ? 'Already clean.' : 'Cleaned! Copy it manually.';
  });
  if (after !== before) {
    chrome.storage.local.get({ cleanedCount: 0 }, function (res) {
      chrome.storage.local.set({ cleanedCount: (Number(res.cleanedCount) || 0) + 1 });
    });
  }
});
