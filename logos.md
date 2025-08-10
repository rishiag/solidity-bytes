## Logo spec — Solidity Bytes

- Brand: "Solidity Bytes"
- Monogram: "SB"

### Colors
- Background: `#0B0F17` (deep navy)
- Initials ("SB"): `#22D3EE` (bright cyan)
- Optional light-mode variant:
  - Background: `#FFFFFF`
  - Initials: `#0B0F17`

### Master asset
- Create an SVG master at 1024×1024 with ~12% padding around the glyphs.
- Composition: rounded-square background with centered "SB" monogram.

### Export sizes and filenames (PNG unless noted)
- Favicon: `frontend/public/favicon.ico` containing 16×16 and 32×32
- Header/app icon: `frontend/public/logo-32.png` (32×32)
- Apple touch: `frontend/public/apple-touch-icon.png` (180×180)
- PWA/manifest icons:
  - `frontend/public/icon-192.png` (192×192)
  - `frontend/public/icon-512.png` (512×512)
- Social preview (optional for now): `frontend/public/og-image.png` (1200×630)

### Notes
- Keep the “SB” strokes bold for legibility at 16–32px.
- Export from the SVG master; avoid raster scaling artifacts.
- We’ll wire these into `frontend/index.html` (favicon/apple-touch), and a manifest if/when we add a PWA.

