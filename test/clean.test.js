'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { cleanUrl, cleanText, isXHost } = require('../extension/core/clean.js');

test('removes s / t / a share-tracking params', () => {
  assert.equal(
    cleanUrl('https://x.com/0xBrokkr/status/2115853762229076368?a=Kq3vX9mPzR2tLw8nYb4c&s=19'),
    'https://x.com/0xBrokkr/status/2115853762229076368'
  );
  assert.equal(cleanUrl('https://x.com/a/status/1?s=20'), 'https://x.com/a/status/1');
  assert.equal(cleanUrl('https://x.com/a/status/1?s=46&t=AbC-123_xyz'), 'https://x.com/a/status/1');
  assert.equal(cleanUrl('https://x.com/a/status/1?t=abc'), 'https://x.com/a/status/1');
});

test('removes other tracking params (ref_src, utm_*, cn, …)', () => {
  assert.equal(
    cleanUrl('https://twitter.com/a/status/1?ref_src=twsrc%5Etfw&ref_url=https%3A%2F%2Fe.com&cn=ZmxleGl&refsrc=email&utm_source=x&utm_medium=y'),
    'https://twitter.com/a/status/1'
  );
});

test('keeps allowlisted search params q / f / pf / lf', () => {
  assert.equal(
    cleanUrl('https://x.com/search?q=%23privacy&src=typed_query&f=live&s=20'),
    'https://x.com/search?q=%23privacy&f=live'
  );
  assert.equal(
    cleanUrl('https://x.com/search?s=19&q=from%3Aa&pf=on&lf=on&t=x'),
    'https://x.com/search?q=from%3Aa&pf=on&lf=on'
  );
  assert.equal(cleanUrl('https://x.com/search?q=a+b'), 'https://x.com/search?q=a+b');
});

test('handles twitter.com, www., mobile. and uppercase hosts', () => {
  assert.equal(cleanUrl('https://twitter.com/a/status/1?s=20'), 'https://twitter.com/a/status/1');
  assert.equal(cleanUrl('https://www.x.com/a/status/1?s=20'), 'https://www.x.com/a/status/1');
  assert.equal(cleanUrl('https://mobile.twitter.com/a/status/1?s=21'), 'https://mobile.twitter.com/a/status/1');
  assert.equal(cleanUrl('https://mobile.x.com/a/status/1?t=z'), 'https://mobile.x.com/a/status/1');
  assert.equal(cleanUrl('HTTPS://X.COM/a/status/1?s=20'), 'HTTPS://X.COM/a/status/1');
  assert.equal(cleanUrl('https://WWW.Twitter.Com/a/status/1?s=20'), 'https://WWW.Twitter.Com/a/status/1');
  assert.equal(cleanUrl('http://x.com/a/status/1?s=20'), 'http://x.com/a/status/1');
});

test('keeps hash fragment, host and path as-is', () => {
  assert.equal(cleanUrl('https://x.com/a/status/1?s=20#m'), 'https://x.com/a/status/1#m');
  assert.equal(cleanUrl('https://x.com/a/status/1?s=20&q=1#x?s=1'), 'https://x.com/a/status/1?q=1#x?s=1');
  assert.equal(cleanUrl('https://x.com/a/status/1#frag?s=20'), 'https://x.com/a/status/1#frag?s=20');
  assert.equal(cleanUrl('https://x.com?s=20'), 'https://x.com');
  assert.equal(cleanUrl('https://x.com/a/status/1?'), 'https://x.com/a/status/1');
});

test('non-X URLs are untouched', () => {
  const urls = [
    'https://youtu.be/dQw4w9WgXcQ?si=abcdef',
    'https://www.youtube.com/watch?v=1&si=abc',
    'https://example.com/?s=20&t=1',
    'https://t.co/abc?s=20',
    'https://api.x.com/a?s=20',
    'ftp://x.com/a?s=20',
  ];
  for (const u of urls) assert.equal(cleanUrl(u), u);
});

test('lookalike hosts are untouched', () => {
  const urls = [
    'https://x.com.evil.com/a/status/1?s=20',
    'https://notx.com/a/status/1?s=20',
    'https://twitter.com.evil.com/a?s=20',
    'https://mytwitter.com/a?s=20',
    'https://evil.com/x.com/a?s=20',
    'https://evil.com/?u=https://x.com/a',
  ];
  for (const u of urls) assert.equal(cleanUrl(u), u);
});

test('garbage input returned unchanged', () => {
  for (const v of ['', 'not a url', 'x.com/a?s=20', '://x.com?s=1', 'https://', '?s=20']) {
    assert.equal(cleanUrl(v), v);
  }
  for (const v of [null, undefined, 42, {}]) assert.equal(cleanUrl(v), v);
  assert.equal(cleanText(null), null);
  assert.equal(cleanText(''), '');
});

test('already-clean URLs are idempotent', () => {
  const urls = [
    'https://x.com/0xBrokkr/status/2115853762229076368',
    'https://x.com/search?q=hi&f=live',
    'https://x.com/a/status/1#m',
  ];
  for (const u of urls) {
    assert.equal(cleanUrl(u), u);
    assert.equal(cleanUrl(cleanUrl(u + '?s=20')), cleanUrl(u + '?s=20'));
  }
});

test('isXHost', () => {
  for (const h of ['x.com', 'twitter.com', 'www.x.com', 'mobile.twitter.com', 'X.COM']) assert.ok(isXHost(h), h);
  for (const h of ['x.com.evil.com', 'notx.com', 'api.x.com', 'evilx.com', '', null]) assert.ok(!isXHost(h), String(h));
});

test('cleanText cleans multiple URLs and keeps trailing punctuation', () => {
  assert.equal(
    cleanText('look https://x.com/a/status/1?s=20 lol'),
    'look https://x.com/a/status/1 lol'
  );
  assert.equal(
    cleanText('a https://x.com/a/status/1?s=20&t=k, b (https://twitter.com/b/status/2?s=19). c https://x.com/c/status/3?t=z!'),
    'a https://x.com/a/status/1, b (https://twitter.com/b/status/2). c https://x.com/c/status/3!'
  );
  assert.equal(
    cleanText('keep https://youtu.be/x?si=1 and https://x.com/a/status/1?s=46?'),
    'keep https://youtu.be/x?si=1 and https://x.com/a/status/1?'
  );
  assert.equal(
    cleanText('Check out this post\n\nhttps://x.com/a/status/1?s=46&t=abc'),
    'Check out this post\n\nhttps://x.com/a/status/1'
  );
  assert.equal(
    cleanText('<a href="https://x.com/a/status/1?s=20">x</a>'),
    '<a href="https://x.com/a/status/1">x</a>'
  );
  assert.equal(cleanText('no links here'), 'no links here');
});
