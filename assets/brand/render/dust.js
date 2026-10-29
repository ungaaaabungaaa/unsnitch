// Renders the dirty share link with its tracking params "dissolving into pixels". Render-time only.
// <div class="url" data-clean="https://x.com/..." data-dirty="?a=...&s=19" data-px="14"></div>
(function () {
  var P = ['#F0703A', '#C8A6F2', '#F5A77A', '#E3D3F7', '#F0703A', '#EAD9C0', '#C8A6F2'];
  document.querySelectorAll('[data-dirty]').forEach(function (el) {
    var px = +el.dataset.px || 12, dirty = el.dataset.dirty, keep = +el.dataset.keep || 8;
    var html = '<span class="clean">' + el.dataset.clean + '</span><s>';
    for (var i = 0; i < keep; i++) html += '<span style="opacity:' + (1 - i / (keep + 2)).toFixed(2) + '">' + dirty[i].replace('&', '&amp;') + '</span>';
    html += '</s><span class="dust">';
    for (var j = keep; j < dirty.length; j++) {
      var k = (j - keep) / (dirty.length - keep), s = Math.round(px * (1 - k * 0.6)), y = Math.round(Math.sin(j * 2.3) * px * k * 0.9);
      html += '<i style="width:' + s + 'px;height:' + s + 'px;margin:0 ' + Math.round(px * (0.12 + k * 0.5)) + 'px 0 ' + (j === keep ? Math.round(px * .3) : 0) +
        'px;transform:translateY(' + y + 'px);opacity:' + (1 - k * 0.75).toFixed(2) + ';background:' + P[(j * 3) % P.length] + '"></i>';
    }
    el.innerHTML = html + '</span>';
  });
})();
