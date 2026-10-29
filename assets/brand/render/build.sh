#!/bin/sh
# Regenerate every brand asset. Requires python3, node, Google Chrome (set CHROME=... to override) + macOS sips.
set -e
cd "$(dirname "$0")/.."
python3 render/mosaic.py   # mosaic.svg, logo*.svg, wordmark.svg, ../icon.svg, popup mosaic strip
I=../../extension/icons
render/png.sh logo-small.svg $I/icon-16.png 16 16
render/png.sh logo-small.svg $I/icon-32.png 32 32
render/png.sh logo.svg $I/icon-48.png 48 48
render/png.sh logo.svg $I/icon-128.png 128 128
render/png.sh logo.svg logo-512.png 512 512
node render/render.mjs render/og.html og.png 1200 630
node render/render.mjs render/promo.html store-promo-440x280.png 440 280
node render/render.mjs render/marquee.html store-marquee-1400x560.png 1400 560
