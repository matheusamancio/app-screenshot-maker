# Norte cover screen — design

**Date:** 2026-09-06
**Status:** approved (copy + placement confirmed by the user)

## Goal

Add a new first screen ("cover") to the component-based Norte kits that recreates the
Refocus App Store cover (reference image: pill headline, bold subline, laurel badge with
stars, press logos, tilted wall of app icons with the app's own icon in the center) in
Norte's visual language, built entirely from editable, movable components.

## Approved decisions

| Decision | Choice |
| --- | --- |
| Copy | Reference words verbatim, Norte styling (see layout). |
| Placement | Inserted as screen 1 (role `hero`) of `norte-components-v2` and `norte-components`. The existing hero ("[Track] Every Habit, Every Day" + phone) becomes screen 2 with role `use-case`. Decks grow from 7 to 8 screens. |
| Tiles | Norte habit tiles (white tile + black check badge). Because the headline is about blocking apps, the default emoji evoke apps/screens rather than habits. The Norte logo tile (orange check) sits in the center cell, where the reference shows the app's own icon. |
| Styling | Kit background `#EDEBE5`, Archivo, headline 29px/800/`#1a1a1a` with `[pill]` word (`#1a1a1a` pill, `#f6f4ef` ink), subline 14px/500/`#6f6c66` with inline-bold black runs, accent `#E8923C`. |

## Layout (390 × 844 baseline; x/y are element centers)

| # | Element | Kind | Position / size | Content & style |
| --- | --- | --- | --- | --- |
| 1 | Headline | `text` | (195, 80), width 360 | `[Block] Apps\n& Websites` — 29px, 800, `#1a1a1a`, center |
| 2 | Subline | `text` | (195, 124), width 340 | `Reduce <b>screen time</b> by <b>63%</b>!` stored as rich-text spans (`font-weight:800;color:#1a1a1a`) — 14px, 500, `#6f6c66` |
| 3 | Laurel | `laurel` | (195, 196), size 56 | `cardValue` `15 MILLION` (fontSize 15, 800), `cardCaption` `SUCCESS STORIES`, `cols: 5` stars, color `#1a1a1a` |
| 4 | Press row | `press` (new) | (195, 262) | `text` `TechCrunch, USA TODAY, Forbes`, fontSize 14, color `#1a1a1a` |
| 5–13 | Tile wall | 8 × `emoji` + 1 × `icon` | 3 × 3 grid, center (195, 596), pitch 148, tile 134, rotation −10° on every tile, shared `groupId` | Emoji tiles: `tile: true`, `check: true`, `size: 134`. Center: `icon: 'mountain'`, `tile: true`, `size: 134`, `radius: 37`, `bg: #1A1A1A`, `color: #F4F2ED`, `check: true`, `accent: #E8923C`. Default emoji (row-major, center skipped): 📺 📸 🎵 / 💬 · 📱 / 👻 🧵 🎮 |

Grid cell centers come from a rotated lattice: for column `c` and row `r` in `{−1, 0, 1}`,
`x = 195 + pitch·(c·cosθ + r·sinθ)`, `y = 596 + pitch·(−c·sinθ + r·cosθ)` with θ = 10°
(CSS rotation −10°). The outer columns and bottom row intentionally bleed past the canvas
edges, as in the reference. Elements are ordered back-to-front: tiles first (rows top to
bottom), then laurel, press row, subline, headline.

## New capabilities

### 1. Stars inside the laurel (`laurel` element)

- `cols` on a `laurel` element = number of stars rendered under the caption (undefined / 0 = none, max 5).
- Star size = laurel `size × 0.16`, color = laurel `color`, small gap above.
- Inspector: "Stars" slider 0–5 next to the existing laurel controls.
- `newLaurelEl()` default gains `cols: 5` (the App Store convention). No change to
  localizable fields (`cardValue`, `cardCaption` already localized).

### 2. Press logos row (`press` element kind)

- `ElementKind` gains `'press'`.
- Fields: `text` = comma-separated publication names; `fontSize` = logo height in
  baseline px (default 14); `color` (default `#1a1a1a`). Gap between logos is fixed at
  22 baseline px (scaled).
- Rendering: `flex` row, centered. Each name is matched case/space-insensitively against a
  small map of monochrome wordmark treatments; unknown names fall back to bold caps with
  slight letter-spacing.
  - `techcrunch` → heavy "TC" block mark + "TechCrunch" (700)
  - `usa today` → filled circle + "USA TODAY" (800)
  - `forbes` → serif "Forbes" (700, Georgia/Times fallback)
  - `wired` → "WIRED" (800, wide tracking)
  - `the verge` → "THE VERGE" (800)
  - `product hunt` → circled "P" + "Product Hunt" (700)
  - `mashable` → "Mashable" (800, tight tracking)
  - `cnet` → "cnet" (800, lowercase)
  - `fast company` → "FAST COMPANY" (800, wide tracking)
  - `business insider` → "BUSINESS INSIDER" (800)
- Inspector: text field "Publications (comma-separated)", "Logo size" slider 10–24,
  colour picker. Shares the universal Arrange / Appearance blocks.
- `kindLabel('press')` → "Press logos". Elements panel: new "Press logos" button
  (`newPressLogos()` → `TechCrunch, USA TODAY, Forbes` at (195, 262)).
- Not localizable (proper nouns): no entry in `localizableFields` `SIMPLE`. Double-click on
  the canvas does not open an inline editor; the names are edited in the inspector.

## Kit changes (`lib/starterKits.ts`)

- `norteCoverElements()` — pure builder returning the element list above (ids assigned on
  apply, as for every kit slide). Uses a small `rotatedGrid()` helper for the lattice.
- `NORTE_COVER: StarterKitSlide = { role: 'hero', template: 'hero', title: 'Block Apps & Websites', noChrome: true, elements: norteCoverElements() }`.
- `NORTE_ROLES[0]` changes from `'hero'` to `'use-case'`; the cover is prepended to both
  `NORTE_V2_SLIDES` and `NORTE_COMPONENTS_SLIDES`.
- `norte-designs` (PNG-based) and `norte-store` (built-in templates) are untouched.

## Out of scope

- Real app-brand icons (YouTube, Instagram, …) or hourglass badges — tiles stay Norte emoji tiles.
- Changing other Norte screens, the indigo `norte` kit, or adding a test runner to the repo.

## Revision (same day, after review)

- **Real app icons instead of emoji tiles.** New `app` element kind ("App icon"): a
  brand tile drawn as inline SVG on the brand colour (`components/templates/AppIcon.tsx`,
  `APP_BRANDS`: YouTube, Instagram, TikTok, Snapchat, X, Threads, Netflix, WhatsApp,
  Facebook). Fields: `icon` (brand id), `size`, `radius` (default 22 % of size),
  `check` / `badge` / `accent` for the corner badge. Picker in the Elements panel and
  the inspector. No text → not localizable.
- **Badge glyph.** `badge?: 'check' | 'lock' | 'hourglass'` on every tile kind (emoji,
  icon, app); the cover's app tiles use the padlock. Inspector shows a Badge picker
  whenever the corner badge is on.
- **Bigger headline.** 36 px (was 29) at y = 88; subline → y 146, laurel → y 214, press
  → y 280, wall center → y 612. Wall order (row-major, centre = Norte logo): YouTube,
  Instagram, TikTok / Netflix, ·, WhatsApp / Snapchat, Threads, X.

## Verification

1. `npx tsc --noEmit` and `npm run build` pass.
2. In the running preview, apply `Norte · Components v2`: screen 1 shows the cover, screen 2
   the old hero; the kit card and preview thumbnails render it.
3. Screenshot slide 1 at iPhone 6.9″ and iPad; check the pill headline, bold subline runs,
   laurel + stars, press row, and the tilted wall with the Norte logo centered.
4. Drag one tile → the whole wall moves (group); double-click a tile → emoji edits; select
   the laurel → "Stars" slider works; select the press row → names/size/colour edit.
