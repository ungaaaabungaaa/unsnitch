# Unsnitch brand (v2)

**Tagline:** Stop X from snitching on your links.

Editorial, calm, warm. A pixel-mosaic gradient on a warm off-white canvas, big quiet type.
**Concept:** pixelation = anonymity. Tracking params dissolve into pixels.

## Files

| File | Use |
| --- | --- |
| `tokens.css` | **Single source** for colours, type, radii, shadows. Import it in every UI. |
| `mosaic.svg` | Hero pixel-mosaic gradient, 1600×900, 16×9 cells. Use with `background-size: cover`. |
| `logo.svg` | Mark: rounded square filled with an 8×8 mosaic, white link glyph breaking into pixels. ≥ 48 px. |
| `logo-small.svg` | Mark for 16–32 px: 4×4 bigger pixels, heavier glyph, no pixel tail. |
| `wordmark.svg` | Mark + lowercase `unsnitch` (Inter 500, ink). Text is live, not outlined. |
| `../icon.svg` | Copy of `logo.svg`. |
| `logo-512.png` | Raster mark. |
| `og.png` | Social card 1200×630. |
| `store-promo-440x280.png`, `store-marquee-1400x560.png` | Chrome Web Store promo images. |
| `../../extension/icons/icon-{16,32,48,128}.png` | Extension icons (16/32 from `logo-small.svg`). |
| `../../extension/icons/mosaic-strip.svg` | Popup header strip (11×4 cells). |

## Regenerate

```sh
assets/brand/render/build.sh
```

- `render/mosaic.py` — stdlib-only Python, deterministic. Defines the palette and colour field and writes every SVG above.
- `render/png.sh` / `render/render.mjs` — rasterize with headless Chrome (`CHROME=...` to override) and macOS `sips`.
- `render/{og,promo,marquee}.html` + `card.css` + `dust.js` — card layouts. `dust.js` turns the tracking params into pixels.

## Colour

| Name | Hex | Use |
| --- | --- | --- |
| Canvas | `#F3F2EF` | Page background |
| Card | `#FAFAF8` | Cards, 24–28 px radius, soft shadow |
| Ink | `#111111` | Headlines, body, primary buttons |
| Grey | `#9B9B9B` | Big secondary paragraph, labels |
| Orange | `#F0703A` | Mosaic, warm anchor |
| Apricot | `#F5A77A` | Mosaic |
| Cream | `#EAD9C0` | Mosaic, highlight |
| Lavender | `#E3D3F7` | Mosaic |
| Lilac | `#C8A6F2` | Mosaic, cool anchor |
| Strike | `#E0533D` | **Only** the thin strike over tracking params |

Colour lives in the mosaic. UI chrome stays ink-on-off-white. No neon, no green, no dark default.

## Type

`Inter, "Helvetica Neue", Helvetica, system-ui, sans-serif`.
Headlines weight 500, leading 1.05, tracking −0.02em. Follow a black headline with a **grey second
sentence at the same size**. Body copy is small (12–14 px). URLs in `ui-monospace`.

## Components

- **Frosted pill nav:** translucent white (`--us-glass`), 1 px white border, `backdrop-filter: saturate(160%) blur(18px)`, fully rounded, sitting on the mosaic.
- **Reference card:** mosaic on top, card body below with headline, grey sub and tiny copy.
- **Dissolving link:** clean part in ink, tracking params struck in grey then breaking into mosaic-coloured squares.

## Don't

- Don't use the old dark/green brand (v1) anywhere.
- Don't smooth the mosaic into a plain gradient; the pixels must stay visible (about 12–20 per row).
- Don't put the white glyph on a pale-only mosaic; the mark keeps orange to lilac so it reads.
- Don't say which number `?s=` maps to which app; the mapping isn't reliable.
