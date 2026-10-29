#!/bin/sh
# Render <svg|html> at WxH (2x supersampled via Chrome) then downscale with sips. Usage: png.sh in out w h
set -e
d=$(dirname "$0"); tmp=$(mktemp -d)
cat > "$tmp/p.html" <<H
<html><body style="margin:0;background:transparent"><img src="file://$(cd "$(dirname "$1")" && pwd)/$(basename "$1")" style="display:block;width:${3}0px;height:${4}0px"></body></html>
H
node "$d/render.mjs" "$tmp/p.html" "$tmp/big.png" "${3}0" "${4}0" >/dev/null
sips -z "$4" "$3" "$tmp/big.png" --out "$2" >/dev/null
rm -rf "$tmp"; echo "$2"
