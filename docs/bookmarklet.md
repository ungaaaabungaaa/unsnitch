# Bookmarklets

No extension? Use a bookmarklet: a bookmark whose "URL" is JavaScript. They run only when you click them, make no network requests, and use the same rules as the extension (every query param on X links is dropped except `q`, `f`, `pf`, `lf`; hash, host and path untouched).

**Install:** create a new bookmark (any page), name it, and paste the whole `javascript:...` line below as its URL. On mobile, bookmark any page, then edit the bookmark and replace its URL.

## 1. Clean this page's link and copy it

Use on an x.com / twitter.com page. It rewrites the address bar to the clean URL and copies it (if clipboard access is refused, it shows the link in a prompt to copy by hand).

```
javascript:(function(){var u=location.href;if(!/^(?:www\.|mobile\.)?(?:x|twitter)\.com$/i.test(location.hostname)){alert("Unsnitch: not an X page");return}var h=u.indexOf("#"),b=h<0?u:u.slice(0,h),H=h<0?"":u.slice(h),q=b.indexOf("?");if(q>=0){var k=b.slice(q+1).split("&").filter(function(p){return/^(q|f|pf|lf)(=|$)/.test(p)});u=b.slice(0,q)+(k.length?"?"+k.join("&"):"")+H}history.replaceState(history.state,"",u);(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).catch(function(){prompt("Clean link:",u)})})()
```

## 2. Clean text from the clipboard

Cleans every X link in whatever text you copied, then writes the result back to the clipboard. If the browser won't let the bookmarklet read the clipboard, it asks you to paste the text into a prompt instead. Works on any page.

```
javascript:(function(){function c(t){return t.replace(/https?:\/\/[^\s<>"'`]+/gi,function(m){var r=(m.match(/[.,;:!?)\]}]+$/)||[""])[0],u=r?m.slice(0,-r.length):m;try{var o=new URL(u)}catch(e){return m}if(!/^(?:(?:www|mobile)\.)?(?:x|twitter)\.com$/i.test(o.hostname))return m;var h=u.indexOf("#"),b=h<0?u:u.slice(0,h),H=h<0?"":u.slice(h),q=b.indexOf("?");if(q<0)return m;var k=b.slice(q+1).split("&").filter(function(p){return/^(q|f|pf|lf)(=|$)/.test(p)});return b.slice(0,q)+(k.length?"?"+k.join("&"):"")+H+r})}function d(t){var o=c(t);navigator.clipboard.writeText(o).then(function(){alert("Unsnitch: cleaned and copied\n\n"+o)},function(){prompt("Clean text (copy it):",o)})}navigator.clipboard&&navigator.clipboard.readText?navigator.clipboard.readText().then(d,function(){var t=prompt("Paste text with X links:");t&&d(t)}):(function(){var t=prompt("Paste text with X links:");t&&d(t)})()})()
```

## Notes

- Some browsers or sites with a strict Content-Security-Policy may block bookmarklets; Chrome, Firefox and Safari generally still allow them. If yours doesn't, use the [userscript](../userscript/unsnitch.user.js) or the extension.
- Clipboard reads usually need a permission prompt or user gesture; that is why the prompt fallback exists.
- The bookmarklets are a compact copy of `extension/core/clean.js`; the core file is the source of truth.
