#!/usr/bin/env python3
"""Unsnitch brand v2 — pixel-mosaic generator (Python 3 stdlib only, deterministic).

Concept: pixelation = anonymity. Tracking params dissolve into pixels.

Palette (keep in sync with ../tokens.css):
  orange    #F0703A  warm anchor, bottom-left
  apricot   #F5A77A
  cream     #EAD9C0  calm centre
  lavender  #E3D3F7
  lilac     #C8A6F2  cool anchor, top-right

Each square cell samples a smooth colour field at its centre and snaps to that colour,
so you get large visible pixels that still read as one soft gradient.

Writes (paths relative to assets/brand/):
  mosaic.svg                    1600x900 hero mosaic, 16x9 cells
  logo.svg                      mark, 8x8 cells + link glyph dissolving into pixels
  logo-small.svg                mark for 16-32 px: 4x4 cells, heavier glyph, no tail
  wordmark.svg                  mark + "unsnitch"
  ../icon.svg                   = logo.svg
  ../../extension/icons/mosaic-strip.svg   popup header strip (330x120, 11x4 cells)
Usage: python3 render/mosaic.py
"""
import math, os

PALETTE = [  # (stop, hex)
    (0.00, "#F0703A"),  # orange
    (0.30, "#F5A77A"),  # apricot
    (0.55, "#EAD9C0"),  # cream
    (0.78, "#E3D3F7"),  # lavender
    (1.00, "#C8A6F2"),  # lilac
]

def rgb(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
def hexc(c): return "#%02X%02X%02X" % tuple(max(0, min(255, round(x))) for x in c)

def ramp(t):
    t = max(0.0, min(1.0, t))
    for (a, ca), (b, cb) in zip(PALETTE, PALETTE[1:]):
        if t <= b:
            k = (t - a) / (b - a)
            k = k * k * (3 - 2 * k)  # smoothstep between stops
            return hexc([x + (y - x) * k for x, y in zip(rgb(ca), rgb(cb))])
    return PALETTE[-1][1]

# Colour anchors (u, v, hex) for the hero field; u right, v down. Inverse-distance blended.
ANCHORS = [
    (0.02, 0.55, "#F0703A"), (0.30, 0.78, "#F0703A"), (0.80, 0.98, "#F0703A"),  # orange pools left/bottom
    (0.22, 0.20, "#F5A77A"), (0.60, 0.62, "#F5A77A"),                           # apricot
    (0.52, 0.10, "#EAD9C0"), (0.40, 0.42, "#EAD9C0"),                           # cream highlight
    (0.80, 0.30, "#E3D3F7"), (1.00, 0.70, "#E3D3F7"),                           # lavender
    (0.98, 0.04, "#C8A6F2"), (0.00, 1.00, "#C8A6F2"),                           # lilac corners
]

def blend(u, v, anchors, power=2.6, aspect=16 / 9):
    acc, tot = [0.0, 0.0, 0.0], 0.0
    for au, av, h in anchors:
        d2 = ((u - au) * aspect) ** 2 + (v - av) ** 2
        wgt = 1 / (d2 + 1e-4) ** (power / 2)
        tot += wgt
        acc = [x + wgt * y for x, y in zip(acc, rgb(h))]
    return hexc([x / tot for x in acc])

def field(u, v, aspect=16 / 9):
    return blend(u, v, ANCHORS, aspect=aspect)

def cells(cols, rows, w, h, f=field, gap=0):
    cw, ch = w / cols, h / rows
    out = []
    for r in range(rows):
        for c in range(cols):
            col = f((c + .5) / cols, (r + .5) / rows)
            out.append('<rect x="%g" y="%g" width="%g" height="%g" fill="%s"/>' % (
                round(c * cw, 2), round(r * ch, 2), round(cw + .5 - gap, 2), round(ch + .5 - gap, 2), col))
    return "".join(out)

MARK_ANCHORS = [(0.0, 1.0, "#F0703A"), (0.35, 0.75, "#F0703A"), (0.55, 0.45, "#F5A77A"),
                (0.15, 0.15, "#F5A77A"), (1.0, 0.0, "#C8A6F2"), (0.95, 0.6, "#C8A6F2")]

def mark_field(u, v):
    # Square mark: warm bottom-left -> lilac top-right, skips the palest tones so the white glyph reads.
    return blend(u, v, MARK_ANCHORS, power=2, aspect=1)

# Link glyph on a 128 grid: two interlocked pills, rotated -45deg about the centre.
def glyph(stroke, tail):
    g = ('<g fill="none" stroke="#fff" stroke-width="%s" stroke-linecap="round" transform="rotate(-45 64 64)">'
         '<rect x="14" y="51" width="56" height="26" rx="13"/>' % stroke)
    g += '<rect x="58" y="51" width="56" height="26" rx="13"/>'
    g += '</g>'
    if tail:  # axis-aligned pixels drifting toward the top-right corner (no rotation)
        px = [(100, 14, 10), (113, 22, 8), (112, 7, 7), (121, 14, 5)]
        g += "".join('<rect x="%d" y="%d" width="%d" height="%d" fill="#fff" opacity="%.2f"/>' %
                     (x, y, s, s, 1 - i * 0.12) for i, (x, y, s) in enumerate(px))
    return g

def mark(n, stroke, tail, size=128, title="Unsnitch"):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="%d" height="%d" role="img" aria-label="%s">'
            '<defs><clipPath id="m"><rect width="128" height="128" rx="30"/></clipPath></defs>'
            '<filter id="s" x="-20%%" y="-20%%" width="140%%" height="140%%"><feDropShadow dx="0" dy="%g" stdDeviation="%g" flood-color="#111" flood-opacity=".22"/></filter>'
            '<g clip-path="url(#m)">%s</g><g filter="url(#s)">%s</g></svg>\n') % (
                size, size, title, stroke / 6, stroke / 5, cells(n, n, 128, 128, mark_field), glyph(stroke, tail))

def main():
    here = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
    def w(rel, s):
        p = os.path.normpath(os.path.join(here, rel))
        with open(p, "w") as fh: fh.write(s)
        print(p)
    w("mosaic.svg", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900" '
      'preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">%s</svg>\n' % cells(16, 9, 1600, 900))
    logo = mark(8, 12, True)
    w("logo.svg", logo)
    w("../icon.svg", logo)
    w("logo-small.svg", mark(4, 17, False))
    w("wordmark.svg",
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 128" width="560" height="128" role="img" aria-label="unsnitch">'
      '<svg width="128" height="128" viewBox="0 0 128 128">%s</svg>'
      '<text x="156" y="91" fill="#111111" font-family="Inter, \'Helvetica Neue\', Helvetica, Arial, sans-serif" '
      'font-size="84" font-weight="500" letter-spacing="-1.7">unsnitch</text></svg>\n'
      % logo.split(">", 1)[1].rsplit("</svg>", 1)[0])
    strip = lambda u, v: field(u, v * 0.55 + 0.45, 330 / 120)
    w("../../extension/icons/mosaic-strip.svg",
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 120" width="330" height="120" '
      'preserveAspectRatio="none" shape-rendering="crispEdges">%s</svg>\n' % cells(11, 4, 330, 120, strip))

if __name__ == "__main__":
    main()
