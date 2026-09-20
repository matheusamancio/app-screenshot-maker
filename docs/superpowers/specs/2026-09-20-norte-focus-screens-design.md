# Norte focus screens (blocked apps + screen time) — design

**Date:** 2026-09-20
**Status:** approved (copy, placement, palette and component approach confirmed by the user)

## Goal

Recreate three App Store reference screens in Norte's visual language, built entirely from
editable, movable components, and ship them as screens 1–3 of the component-based Norte kits:

1. **Cover** — "Block Apps & Websites" (already exists as screen 1; this work swaps the
   hand-drawn SVG brand marks for the real app-icon PNGs the user supplied).
2. **Blocked** — Opal's "Blocks the apps you keep opening." (dark phone, blocked Instagram
   icon with a glow, "Instagram is Blocked by …", laurel).
3. **Screen time** — Refocus' "Track Screen Time" (dark phone, segmented control, week
   navigation, summary stats, a bar chart popping out of the phone, "most screen time" row).

## Approved decisions

| Decision | Choice |
| --- | --- |
| Cover | Keep the approved layout; tiles use the supplied PNGs (8 apps + the Norte mountain icon in the centre). |
| Placement | Inserted after the cover as screens 2 and 3 of `norte-components-v2` and `norte-components` (decks grow from 8 to 10). Roles: blocked = `use-case`, screen time = `differentiator`. |
| Copy | Reference words verbatim, brand swapped to Norte. Each new screen also gets a short editable subline for rhythm with the other Norte screens. |
| Blocked screen look | Norte off-white background, big dark-screen iPhone, 4 tilted padlocked app tiles around it instead of Opal's shards, laurel inside the dark screen. |
| Laurel | Rating-style laurel: `10 MILLION` / `HOURS SAVED` / 5 stars (no award claim). |
| Screen-time colours | Dark phone screen `#19191B`, light chart card `#F6F4EF` popping out of the phone, black bars with the active bar in orange `#E8923C`. |
| Screen-time depth | Full recreation of the in-phone UI. |
| New components | Exposed in the Elements panel and the inspector like every other Norte component. |

## Brand tokens (from the existing kit)

Background `#EDEBE5` · ink `#1A1A1A` · secondary text `#6F6C66` · mono labels `#A8A49C` ·
light surface `#F6F4EF` · dark surfaces `#1A1A1A` / `#242427` / `#2A2A2C` · dark phone screen
`#19191B` · phone bezel `#2B2B2D` · off-white ink on dark `#F4F2ED` · accent `#E8923C` ·
Archivo, headline 36px/800 with one `[pill]` word, subline 14px/500.

## Assets

The nine attached PNGs (400 × 400, alpha, iOS-style rounded square baked in) are copied to
`public/apps/`: `youtube.png`, `instagram.png`, `tiktok.png`, `snapchat.png`, `x.png`,
`threads.png`, `netflix.png`, `whatsapp.png`, `norte.png`. At the largest export (iPhone
6.9″, 1320 px wide) the 134-baseline-px cover tiles render at ~450 px, a small upscale that
was accepted by the user; larger sources can be dropped in later without code changes.

## Layouts (390 × 844 baseline; x/y are element centres)

### Screen 1 — cover (change only)

The centre tile becomes an `app` element with `icon: 'norte'` (size 134, radius 29,
`check: true`, `badge: 'check'`, `accent: '#E8923C'`, same rotation/group as the wall).
The eight brand tiles are unchanged and pick up their PNGs through `APP_BRANDS`.

### Screen 2 — "Blocks the apps you keep opening." (`NORTE_BLOCKED`, role `use-case`)

Elements back-to-front:

| # | Element | Kind | Position / size | Content & style |
| --- | --- | --- | --- | --- |
| 1 | Phone | `phone` (frame) | (195, 460), 268 × 560, radius 50 | bezel `#2B2B2D`, screen `#19191B`, island, `text: '9:41'`, `color: '#F4F2ED'`, `cardTitle: ''` |
| 2 | Blocked icon | `app` | (195, 378), size 92 | `icon: 'instagram'`, no badge, `glow: 22` |
| 3 | Title | `text` | (195, 478), width 240 | `Instagram is\nBlocked by Norte` — 22px, 800, `#F4F2ED` |
| 4 | Body | `text` | (195, 530), width 240 | `You set this rule yesterday.\nPast you was right.` — 13px, 500, `#A8A49C` |
| 5 | Laurel | `laurel` | (195, 686), size 50 | `cardValue` `10 MILLION` (fontSize 14), `cardCaption` `HOURS SAVED`, `cols: 5`, color `#F4F2ED` |
| 6–9 | Floating tiles | 4 × `app` | Snapchat (46, 236) 62 / −14° · TikTok (350, 268) 70 / 12° · YouTube (38, 522) 58 / 9° · X (354, 604) 54 / −10° | `check: true`, `badge: 'lock'`, `accent: '#111111'`; they overlap the phone edges like the tiles on "Track Every Habit" |
| 10 | Subline | `text` | (195, 148), width 340 | `One rule. Set once, kept every day.` — 14px, 500, `#6f6c66` |
| 11 | Headline | `text` | (195, 88), width 370 | `[Blocks] the apps\nyou keep opening.` — 36px, 800, `#1a1a1a` |

### Screen 3 — "[Track] Screen Time" (`NORTE_SCREEN_TIME`, role `differentiator`)

The phone is 290 wide, top at y 225, and bleeds 11 px past the bottom edge as in the
reference. In-phone content sits in a 246-px column centred at x 195 (x 72–318).

| # | Element | Kind | Position / size | Content & style |
| --- | --- | --- | --- | --- |
| 1 | Phone | `phone` (frame) | (195, 540), 290 × 630, radius 52 | bezel `#2B2B2D`, screen `#19191B`, island, `text: '9:41'`, `color: '#F4F2ED'`, `cardTitle: ''` |
| 2 | Logo | `app` | (84, 298), size 24, radius 6 | `icon: 'norte'`, no badge |
| 3 | App name | `text` | (131, 298), width 60, align left | `Norte` — 15px, 800, `#F4F2ED` |
| 4–5 | Header buttons | 2 × `icon` (tile) | (272, 298) and (306, 298), size 24, radius 12 | `plus` and `bell`, bg `#2A2A2C`, color `#F4F2ED` |
| 6 | Segmented | `segmented` | (195, 336), 246 × 32, radius 16 | `days: 'Month,Week,Day'`, `activeIndex: 1`, track `#2A2A2C`, active pill `#F4F2ED`, ink `#F4F2ED`, fontSize 11 |
| 7–9 | Week nav | `icon` (tile) + `text` + `icon` (tile) | (84, 372) `chevron-left` · (195, 372) width 150 · (306, 372) `chevron-right`; circles size 22, radius 11, bg `#2A2A2C` | `This Week` — 13px, 700, `#F4F2ED` |
| 10 | Section label | `text` | (195, 404), width 246, align left | `SUMMARY` — 9px, 700, `#A8A49C` |
| 11 | Summary card bg | `shape` (rect) | (195, 456), 246 × 118, radius 16 | bg `#242427`; grouped with 12–15 (`groupId: 'norte-st-summary'`) |
| 12 | Date range | `text` | (195, 414), width 214, align left | `May 25, 2025 – May 31, 2025` — 10px, 500, `#A8A49C` |
| 13 | Daily value | `text` | (195, 438), width 214, align left | `1h 9m` — 26px, 800, `#F4F2ED` |
| 14 | Daily caption | `text` | (195, 458), width 214, align left | `DAILY AVERAGE` — 8px, 700, `#A8A49C` |
| 15 | Stats | `statrow` | (195, 490), width 214 | `dates: '2h 17m,54,51'`, `days: 'SCREEN TIME,PICKUPS,NOTIFICATIONS'`, value 14px `#F4F2ED`, labels `#A8A49C` |
| 16 | Chart | `usagechart` | (195, 620), 320 × 200, radius 20 | bg `#F6F4EF`, bars `#1A1A1A`, active `#E8923C`, ink `#1A1A1A`, `days: 'Sun,Mon,Tue,Wed,Thu,Fri,Sat'`, `dates: '1.4,1.5,1.1,0.9,0.8,1.4,1.6'`, `unit: 'h'`, `yTicks: '0m,1h,2h'`, `yMax: 2`, `activeIndex: 6`, `shadow: 26`. 15 px wider than the phone on each side. |
| 17 | Section label | `text` | (195, 746), width 246, align left | `MOST SCREEN TIME` — 9px, 700, `#A8A49C` |
| 18 | App row | `approw` | (195, 784), 246 × 56, radius 12 | bg `#242427`, `icon: 'youtube'`, `text: 'YouTube'`, `cardValue: '33m 59s'`, `cardCaption: '1 pickups · 0 notifications'`, `fill: 0.86`, ink `#F4F2ED`, bar `#E8923C` |
| 19 | Subline | `text` | (195, 148), width 340 | `Screen time, pickups and notifications at a glance.` — 14px, 500, `#6f6c66` |
| 20 | Headline | `text` | (195, 88), width 370 | `[Track]\nScreen Time` — 36px, 800, `#1a1a1a` |

## New capabilities

### 1. Image-backed app icons (`AppBrand.image`, `app` element)

- `AppBrand` gains `image?: string` (public URL). Every existing brand except Facebook gets
  its PNG; a new brand `{ id: 'norte', label: 'Norte', bg: '#1A1A1A', image: '/apps/norte.png' }`
  is appended. Facebook keeps the SVG mark (no asset supplied).
- `AppIcon` renders `<img src={image} draggable={false}>` filling the rounded container
  (`overflow: hidden`, so `radius` still clips) when `image` is set, otherwise the SVG mark.
  The Elements panel grid and the inspector picker therefore show the real icons.
- `glow?: number` on `app` elements (baseline px, 0/undefined = none): a copy of the icon is
  drawn behind the tile, scaled 1.12, blurred by `glow × sf` and at 85 % opacity — the
  "blocked" halo. Inspector: "Glow" slider 0–40.

### 2. Phone frame status bar (`phone`, `phoneStyle: 'frame'`)

- `color` = status-bar ink (default `#1A1A1A`, off-white on dark screens).
- The time (`text`) renders whenever it is non-empty; the app name + avatar circle render
  only when `cardTitle` is non-empty (previously the whole status bar required `cardTitle`).
  Existing kit frames (`cardTitle: ''`, no `text`) are unaffected; `newPhoneFrame()` gains the
  status icons described next.
- When the time is shown, an iOS status cluster (signal bars, wifi, battery) is drawn at the
  top-right in `color`. The status row is vertically centred on the dynamic island.
- Inspector: "Status colour" picker next to the bezel/screen pickers.

### 3. `segmented` element kind ("Segmented control")

- Fields: `days` = comma-separated labels · `activeIndex` · `w` (246) · `h` (32) · `radius`
  (h/2) · `bg` track · `accent` active pill · `color` inactive label ink · `fontSize` (11).
  Active label colour = `readableTextColor(accent)`.
- Rendering: flex row, equal segments, active segment is a pill with a faint shadow.
- Inspector: labels text field, Highlight slider (0–5), Width/Height/Radius, track / active /
  ink colour pickers. Localizable: `days`.

### 4. `statrow` element kind ("Stats row")

- Fields: `dates` = comma-separated values · `days` = comma-separated labels · `w` · `fontSize`
  (value size, 14) · `color` value ink · `accent` label ink · `align` (`left` = packed with a
  24-px gap, `center` = spread evenly).
- Rendering: one column per value: value (800) above an uppercase, letter-spaced 7.5-px label.
- Inspector: values + labels text fields, Value size slider, Width, alignment, two colour
  pickers. Localizable: `dates`, `days`.

### 5. `usagechart` element kind ("Usage chart")

- Fields: `days` labels · `dates` numeric values (decimals allowed) · `unit` suffix for the
  value labels (`h`) · `yTicks` comma-separated axis labels bottom→top · `yMax` scale max
  (defaults to the largest value) · `activeIndex` · `w` (320) · `h` (200) · `radius` (20) ·
  `bg` · `cell` bar · `accent` active bar · `color` ink (labels; ticks at 55 % opacity).
- Rendering: rounded card; plot area with one hairline per y tick (ink at 12 % opacity) and
  the tick labels stacked at the right edge; bars with rounded tops, value label above each
  bar (mono, 9 px) and day label below (mono, 10 px); the active bar and its labels use the
  accent / full ink weight. No toggle pill.
- Inspector: labels, values, unit, axis ticks, y max, Highlight, Width/Height/Radius, four
  colour pickers. Localizable: `days`, `dates`, `yTicks`, `unit`.

### 6. `approw` element kind ("App usage row")

- Fields: `icon` brand id · `text` app name · `cardValue` time (right of the bar) ·
  `cardCaption` meta line · `fill` 0–1 progress · `w` (246) · `h` (56) · `radius` (12) · `bg`
  · `color` ink · `accent` bar fill.
- Rendering: brand icon (PNG, 18 px) + name on the first line, a thin progress bar with the
  time at its right, then the meta line in mono at 55 % ink.
- Inspector: brand picker (same grid as `app`), name / time / meta text fields, Progress
  slider, Width/Height/Radius, background / ink / bar colour pickers. Localizable: `text`,
  `cardValue`, `cardCaption`. Double-click edits the name inline.

### 7. Small shared changes

- `NorteIcon` gains `chevron-left` and `chevron-right`; both are listed in the inspector's
  icon options and the Elements panel icon grid.
- Laurel caption colour derives from the laurel `color` at 62 % alpha instead of the fixed
  `#6B6B6B` (visually identical on the cover, readable on the dark screen).
- `kindLabel()`: `segmented` → "Segmented control", `statrow` → "Stats row", `usagechart` →
  "Usage chart", `approw` → "App usage row".
- `localizableFields.ts`: `SIMPLE` + `KIND_SHORT` entries for the four kinds (paths above).
  The inspector's `LOCALIZABLE_TEXT` set gains `dates` and `yTicks` so those fields follow the
  active language like `days` already does.
- Elements panel (`LeftRail` `COMPONENTS`): "Segmented control", "Stats row", "Usage chart",
  "App usage row" buttons. Factories in `lib/elements.ts`: `newSegmented()`, `newStatRow()`,
  `newUsageChart()`, `newAppRow()` with the defaults above (dark variants, centred on the
  canvas).

## Kit changes (`lib/starterKits.ts`)

- `norteBlockedElements()` and `norteScreenTimeElements()` — pure builders returning the
  element lists above (ids assigned on apply).
- `NORTE_BLOCKED: StarterKitSlide = { role: 'use-case', template: 'hero', title: 'Blocks the apps you keep opening', noChrome: true, elements: norteBlockedElements() }`
  and `NORTE_SCREEN_TIME = { role: 'differentiator', …, title: 'Track Screen Time', … }`.
- Both Norte component kits become `[NORTE_COVER, NORTE_BLOCKED, NORTE_SCREEN_TIME, ...rest]`.
- `norteCoverElements()`: centre tile → `app` / `norte` as described.
- `norte-designs`, `norte-store` and the indigo `norte` kit are untouched.

## Out of scope

- A tab bar at the bottom of the screen-time phone (cut off in the reference; adds nothing).
- Header buttons matching Refocus (eye / search / refresh / help); Norte uses its own `plus`
  and `bell` circles.
- Higher-resolution icon assets, other brands, or changing the remaining Norte screens.

## Verification

1. `npx tsc --noEmit` and `npm run build` pass.
2. In the running preview apply `Norte · Components v2`: screens 1–3 are cover / blocked /
   screen time, the old hero is screen 4; the kit gallery thumbnails render them.
3. Screenshot the three screens and compare against the references: PNG icons on the cover,
   glow + laurel on the dark screen, the chart card overhanging the phone.
4. Editing: double-click a headline / in-phone text edits inline; each new component's
   inspector controls work (segmented highlight, stats values, chart values + ticks, app row
   progress + brand, app icon glow, phone status colour); dragging one summary element moves
   the group; the Elements panel adds each new component.
5. Export the three screens at iPhone 6.9″ and confirm the PNG icons and the chart shadow are
   in the files.
