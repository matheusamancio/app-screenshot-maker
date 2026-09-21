# Norte Focus Screens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the blocked-apps screen and the screen-time screen as screens 2–3 of the Norte component kits, switch the cover to the real app-icon PNGs, and add the reusable components (image app icons with glow, phone status bar, segmented control, stats row, usage chart, app usage row) that make every part of those screens editable.

**Architecture:** Four new element kinds (`segmented`, `statrow`, `usagechart`, `approw`) follow the existing element pipeline: type in `types/index.ts`, rendering branch in `components/templates/ElementsLayer.tsx`, factory + label in `lib/elements.ts`, translatable paths in `lib/localizableFields.ts`, controls in `components/editor/panels/ElementInspector.tsx`, palette button in `components/editor/LeftRail.tsx`. Existing kinds get small extensions (`app` images + glow, `phone` status bar colour/icons, laurel caption colour, chevron icons). Two pure builders in `lib/starterKits.ts` lay the screens out on the 390×844 baseline and both Norte component kits prepend them after the cover.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Zustand store, inline-style renderer. No test runner exists in this repo — every task ends with `npx tsc --noEmit`; the last task builds and verifies in the running preview (port 3018, `preview_start` name `screenforge`) plus an export smoke test, exactly as the spec prescribes.

**Spec:** `docs/superpowers/specs/2026-09-20-norte-focus-screens-design.md`

**Git hygiene:** work on branch `feat/norte-focus-screens` (already created). Never `git add -A` — an untracked `norte-localization.xlsx` belongs to the user. Stage files by name.

---

## File map

| File | Change |
| --- | --- |
| `public/apps/*.png` | New: nine icon assets (8 brands + Norte). |
| `components/templates/AppIcon.tsx` | `AppBrand.image`; PNG rendering with SVG fallback; `norte` brand. |
| `types/index.ts` | `glow` on app tiles; four new `ElementKind`s; doc comments for the new fields' reuse. |
| `components/templates/ElementsLayer.tsx` | `StatusIcons`, chevron icons, laurel caption colour, app glow, phone status bar, `segmented` / `statrow` / `approw` branches, `UsageChartCard`. |
| `lib/elements.ts` | `newSegmented`, `newStatRow`, `newUsageChart`, `newAppRow`; `kindLabel` entries. |
| `lib/localizableFields.ts` | `SIMPLE` + `KIND_SHORT` entries for the four kinds. |
| `components/editor/panels/ElementInspector.tsx` | `BrandPicker` (shared by `app` + `approw`), Glow slider, phone Status colour, four new kind sections, chevrons in `ICON_OPTIONS`, `dates`/`yTicks` localizable. |
| `components/editor/LeftRail.tsx` | Four palette buttons; chevrons in the icon grid. |
| `lib/starterKits.ts` | Cover centre tile → `app`/`norte`; `norteBlockedElements()`, `norteScreenTimeElements()`, `NORTE_BLOCKED`, `NORTE_SCREEN_TIME`; both kits get the new screens. |

Commit after each task with the message given in the task.

---

### Task 1: Icon assets + image-backed app icons

**Files:**
- Create: `public/apps/youtube.png` … `public/apps/norte.png`
- Modify: `components/templates/AppIcon.tsx`

- [ ] **Step 1: Copy the attached PNGs into `public/apps/`**

The attachments live in `/private/tmp/claude-501/-Users-matheusseixeiro-Projects-snapshot-app/66bca544-0f62-43f9-a88e-13011278470c/images/` as `4.png`–`12.png` (400 × 400, alpha). Mapping: 4 → x, 5 → threads, 6 → snapchat, 7 → whatsapp, 8 → netflix, 9 → tiktok, 10 → instagram, 11 → youtube, 12 → norte.

```bash
cd "/Users/matheusseixeiro/Projects/snapshot app" && mkdir -p public/apps && S=/private/tmp/claude-501/-Users-matheusseixeiro-Projects-snapshot-app/66bca544-0f62-43f9-a88e-13011278470c/images && cp "$S/4.png" public/apps/x.png && cp "$S/5.png" public/apps/threads.png && cp "$S/6.png" public/apps/snapchat.png && cp "$S/7.png" public/apps/whatsapp.png && cp "$S/8.png" public/apps/netflix.png && cp "$S/9.png" public/apps/tiktok.png && cp "$S/10.png" public/apps/instagram.png && cp "$S/11.png" public/apps/youtube.png && cp "$S/12.png" public/apps/norte.png && ls -la public/apps
```

Expected: nine files, each ~10–60 KB.

- [ ] **Step 2: Add `image` to `AppBrand` and the `norte` brand**

In `components/templates/AppIcon.tsx` replace the interface + `APP_BRANDS` block with:

```tsx
export interface AppBrand {
  id: string;
  label: string;
  /** CSS background of the tile (solid colour or gradient) — also the fallback behind the SVG mark. */
  bg: string;
  /** Real icon artwork (public URL, square PNG with the rounded shape baked in). Rendered instead of the SVG mark when present. */
  image?: string;
}

export const APP_BRANDS: AppBrand[] = [
  { id: 'youtube', label: 'YouTube', bg: '#FF0000', image: '/apps/youtube.png' },
  { id: 'instagram', label: 'Instagram', bg: 'linear-gradient(45deg, #F9CE34 0%, #EE2A7B 50%, #6228D7 100%)', image: '/apps/instagram.png' },
  { id: 'tiktok', label: 'TikTok', bg: '#000000', image: '/apps/tiktok.png' },
  { id: 'snapchat', label: 'Snapchat', bg: '#FFFC00', image: '/apps/snapchat.png' },
  { id: 'x', label: 'X', bg: '#000000', image: '/apps/x.png' },
  { id: 'threads', label: 'Threads', bg: '#000000', image: '/apps/threads.png' },
  { id: 'netflix', label: 'Netflix', bg: '#000000', image: '/apps/netflix.png' },
  { id: 'whatsapp', label: 'WhatsApp', bg: '#25D366', image: '/apps/whatsapp.png' },
  { id: 'facebook', label: 'Facebook', bg: '#1877F2' },
  { id: 'norte', label: 'Norte', bg: '#1A1A1A', image: '/apps/norte.png' },
];
```

Also update the file's header comment: `hand-drawn vector marks on the brand's tile colour (no bitmap assets)` → `real icon PNGs from public/apps (hand-drawn vector marks as the fallback for brands without an asset)`.

- [ ] **Step 3: Render the PNG when present**

Replace the default export at the bottom of `AppIcon.tsx`:

```tsx
/** A brand tile: the real icon PNG when the brand has one, otherwise a rounded square in the brand colour with its mark centred. */
export default function AppIcon({ brand, size, radius, style }: { brand: string; size: number; radius: number; style?: React.CSSProperties }) {
  const b = brandOf(brand);
  return (
    <div style={{ width: size, height: size, borderRadius: radius, background: b.image ? 'transparent' : b.bg, overflow: 'hidden', flexShrink: 0, ...style }}>
      {b.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={b.image} alt="" draggable={false} style={{ width: size, height: size, display: 'block', objectFit: 'cover', pointerEvents: 'none' }} />
      ) : (
        <Mark brand={b.id} />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Typecheck**

Run: `cd "/Users/matheusseixeiro/Projects/snapshot app" && npx tsc --noEmit`
Expected: no output (exit 0).

- [ ] **Step 5: Commit**

```bash
cd "/Users/matheusseixeiro/Projects/snapshot app" && git add public/apps components/templates/AppIcon.tsx && git commit -m "feat(norte): real app-icon PNGs for the App icon component (+ Norte brand)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: App icon glow + shared brand picker

**Files:**
- Modify: `types/index.ts` (app comment block, ~line 137)
- Modify: `components/templates/ElementsLayer.tsx` (`app` branch, ~line 929)
- Modify: `components/editor/panels/ElementInspector.tsx` (`app` section, ~line 459)

- [ ] **Step 1: Add the `glow` field**

In `types/index.ts` replace the two-line app comment inside `SlideElement`:

```ts
  // app (brand app-icon tile — YouTube, Instagram, TikTok, …)
  // `icon` = brand id from APP_BRANDS · `size` · `radius` (defaults to 22% of size) · `check`/`badge`/`accent` = corner badge
  /** Blurred halo of the icon drawn behind the tile (baseline px of blur; 0 / undefined = none) — the "blocked app" look. */
  glow?: number;
```

- [ ] **Step 2: Render the halo**

In `components/templates/ElementsLayer.tsx` replace the `app` branch:

```tsx
          } else if (el.kind === 'app') {
            const ts = (el.size || 96) * sf;
            const radius = (el.radius ?? Math.round((el.size || 96) * 0.22)) * sf;
            const glow = (el.glow || 0) * sf;
            content = (
              <div style={{ position: 'relative', width: ts, height: ts, borderRadius: radius, boxShadow: glow > 0 ? undefined : '0 10px 24px rgba(0,0,0,0.18)' }}>
                {glow > 0 && (
                  <div aria-hidden style={{ position: 'absolute', inset: 0, transform: 'scale(1.12)', filter: `blur(${glow}px)`, opacity: 0.85 }}>
                    <AppIcon brand={el.icon || 'youtube'} size={ts} radius={radius} />
                  </div>
                )}
                <div style={{ position: 'relative' }}>
                  <AppIcon brand={el.icon || 'youtube'} size={ts} radius={radius} />
                </div>
                {el.check && <CheckBadge size={Math.min(ts * 0.36, 36 * sf)} color={el.accent || '#111111'} glyph={el.badge} />}
              </div>
            );
```

- [ ] **Step 3: Extract `BrandPicker` and add the Glow slider**

In `components/editor/panels/ElementInspector.tsx`, add this component right after the `ICON_OPTIONS` constant:

```tsx
/** Grid of brand tiles (YouTube, Instagram, …, Norte) used by the App icon and App usage row inspectors. */
function BrandPicker({ value, onChange }: { value?: string; onChange: (id: string) => void }) {
  return (
    <div>
      <div className="section-label mb-1.5">App</div>
      <div className="grid grid-cols-5 gap-1.5">
        {APP_BRANDS.map((b) => (
          <button
            key={b.id}
            onClick={() => onChange(b.id)}
            title={b.label}
            className={`aspect-square rounded-md border flex items-center justify-center ${(value || 'youtube') === b.id ? 'border-norte-primary bg-norte-primary-light' : 'border-border-default bg-overlay'}`}
          >
            <AppIcon brand={b.id} size={26} radius={6} />
          </button>
        ))}
      </div>
    </div>
  );
}
```

Then replace the `app` section so it starts with the picker and gains the slider:

```tsx
      {sel.kind === 'app' && (
        <>
          <BrandPicker value={sel.icon} onChange={(id) => update({ icon: id })} />
          <Slider label="Size" value={sel.size || 96} min={40} max={200} suffix="px" onChange={(v) => update({ size: v })} />
          <Slider label="Corner radius" value={sel.radius ?? Math.round((sel.size || 96) * 0.22)} min={0} max={Math.round((sel.size || 96) / 2)} suffix="px" onChange={(v) => update({ radius: v })} />
          <Slider label="Glow" value={sel.glow || 0} min={0} max={40} suffix="px" onChange={(v) => update({ glow: v })} />
          <label className="flex items-center justify-between gap-2 px-1">
            <span className="section-label">Corner badge</span>
            <Toggle on={!!sel.check} onToggle={() => update({ check: !sel.check })} />
          </label>
          {sel.check && (
            <>
              <BadgePicker value={sel.badge} onChange={(b) => update({ badge: b })} />
              <div>
                <div className="section-label mb-1.5">Badge colour</div>
                <ColorPicker color={sel.accent || '#111111'} onChange={(c) => update({ accent: c })} />
              </div>
            </>
          )}
        </>
      )}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit` — Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add types/index.ts components/templates/ElementsLayer.tsx components/editor/panels/ElementInspector.tsx && git commit -m "feat(elements): glow halo on app icons, shared brand picker

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Phone frame status bar (colour, icons, split time / app name)

**Files:**
- Modify: `types/index.ts` (phone comment block, ~line 190)
- Modify: `components/templates/ElementsLayer.tsx` (`StatusIcons` next to `StarsRow`; frame branch ~line 970)
- Modify: `components/editor/panels/ElementInspector.tsx` (`phone` frame section, ~line 567)

- [ ] **Step 1: Document the fields**

In `types/index.ts` replace the phone comment block:

```ts
  // phone (device frame)
  /** Show the dynamic-island pill near the top (phone). */
  island?: boolean;
  /** Phone visual: 'gradient' (decorative dark→grey) or 'frame' (realistic bezel + light screen + status bar). */
  phoneStyle?: 'gradient' | 'frame';
  // frame status bar: `text` = time (shown with signal/wifi/battery when non-empty) · `cardTitle` = app name + avatar (shown when non-empty) · `color` = status ink (default #1A1A1A)
```

- [ ] **Step 2: Add `StatusIcons`**

In `ElementsLayer.tsx`, right after the `StarsRow` function:

```tsx
/** iOS status cluster — signal bars, wifi, battery — in one colour, `height` px tall. */
function StatusIcons({ height, color }: { height: number; color: string }) {
  return (
    <svg width={height * 5.4} height={height} viewBox="0 0 54 10" fill={color} style={{ display: 'block' }}>
      <rect x="0" y="6.5" width="2.6" height="3.5" rx="0.7" />
      <rect x="4" y="4.5" width="2.6" height="5.5" rx="0.7" />
      <rect x="8" y="2.5" width="2.6" height="7.5" rx="0.7" />
      <rect x="12" y="0.5" width="2.6" height="9.5" rx="0.7" />
      <path d="M18.6 3.9a10.4 10.4 0 0 1 14.4 0l-1.6 1.8a8 8 0 0 0-11.2 0z" />
      <path d="M21.3 6.7a6.4 6.4 0 0 1 9 0l-1.6 1.8a4 4 0 0 0-5.8 0z" />
      <circle cx="25.8" cy="9.1" r="1.3" />
      <rect x="36.5" y="0.75" width="14.5" height="8.5" rx="2.4" fill="none" stroke={color} strokeWidth="1" />
      <rect x="38" y="2.25" width="11.5" height="5.5" rx="1.3" />
      <rect x="52" y="3.3" width="1.5" height="3.4" rx="0.75" opacity="0.5" />
    </svg>
  );
}
```

- [ ] **Step 3: Rebuild the frame's status bar**

Replace the `if (el.phoneStyle === 'frame') { … }` block:

```tsx
            if (el.phoneStyle === 'frame') {
              const bezel = el.bg || '#2B2B2D';
              const screen = el.bg2 || '#EFEDE8';
              const ink = el.color || '#1A1A1A';
              const bw = Math.max(3 * sf, w * 0.022); // bezel width
              const u = ((el.w || 240) / 240) * sf; // status-bar scale relative to a 240-wide frame
              const islandTop = h * 0.045;
              const islandH = Math.max(14 * sf, h * 0.042);
              const row2 = islandTop + islandH + 10 * u; // app-name row under the status row
              content = (
                <div style={{ width: w, height: h, borderRadius: radius, background: bezel, padding: bw, boxSizing: 'border-box', boxShadow: `0 ${22 * sf}px ${55 * sf}px rgba(0,0,0,0.22)`, position: 'relative' }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: radius - bw, background: screen, position: 'relative', overflow: 'hidden', fontFamily: fontFamilyFor('Sora') }}>
                    {island}
                    {/* status row (time + signal/wifi/battery), centred on the island — only when a time is set.
                        A "pure" frame with no time is just bezel + screen (the Norte kit screens draw their own). */}
                    {el.text && (
                      <>
                        <div style={{ position: 'absolute', top: islandTop, left: 18 * u, height: islandH, display: 'flex', alignItems: 'center', fontSize: 13 * u, fontWeight: 700, color: ink, letterSpacing: '-0.01em' }}>{el.text}</div>
                        <div style={{ position: 'absolute', top: islandTop, right: 16 * u, height: islandH, display: 'flex', alignItems: 'center' }}>
                          <StatusIcons height={11 * u} color={ink} />
                        </div>
                      </>
                    )}
                    {/* app name + avatar — only when the frame carries an app name */}
                    {el.cardTitle && (
                      <>
                        <div style={{ position: 'absolute', top: row2, left: 18 * u, fontFamily: MONO, fontSize: 10 * u, letterSpacing: '0.14em', color: ink }}>
                          {el.cardTitle}<span style={{ opacity: 0.55 }}>°</span>
                        </div>
                        <div style={{ position: 'absolute', top: row2 - 7 * u, right: 16 * u, width: 26 * u, height: 26 * u, borderRadius: '50%', background: ink }} />
                      </>
                    )}
                  </div>
                </div>
              );
            } else {
```

- [ ] **Step 4: Inspector: Status colour**

In `ElementInspector.tsx`, inside `sel.kind === 'phone'` → `sel.phoneStyle === 'frame'`, replace the two-column Bezel/Screen grid and the hint paragraph:

```tsx
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <div className="section-label mb-1.5">Bezel</div>
                  <ColorPicker color={sel.bg || '#2B2B2D'} onChange={(c) => update({ bg: c })} />
                </div>
                <div>
                  <div className="section-label mb-1.5">Screen</div>
                  <ColorPicker color={sel.bg2 || '#EFEDE8'} onChange={(c) => update({ bg2: c })} />
                </div>
                <div>
                  <div className="section-label mb-1.5">Status</div>
                  <ColorPicker color={sel.color || '#1A1A1A'} onChange={(c) => update({ color: c })} />
                </div>
              </div>
              <p className="text-[11px] text-text-muted">An empty device — drop other components on top to fill the screen. Clear the time to hide the status bar, clear the app name to hide the name + avatar.</p>
```

- [ ] **Step 5: Typecheck + commit**

Run: `npx tsc --noEmit` — Expected: exit 0.

```bash
git add types/index.ts components/templates/ElementsLayer.tsx components/editor/panels/ElementInspector.tsx && git commit -m "feat(elements): iPhone frame status bar with colour + iOS status icons

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Chevron icons + laurel caption colour

**Files:**
- Modify: `components/templates/ElementsLayer.tsx` (`NorteIcon` ~line 49; laurel branch ~line 1103)
- Modify: `components/editor/LeftRail.tsx` (`ICONS` ~line 128; `NorteIconPreview` ~line 300)
- Modify: `components/editor/panels/ElementInspector.tsx` (`ICON_OPTIONS` ~line 206)

- [ ] **Step 1: Renderer icons**

In `NorteIcon` (ElementsLayer.tsx) add before `default:`:

```tsx
    case 'chevron-left': return (<svg {...p} strokeWidth={2.6}><polyline points="15 5 8 12 15 19" /></svg>);
    case 'chevron-right': return (<svg {...p} strokeWidth={2.6}><polyline points="9 5 16 12 9 19" /></svg>);
```

- [ ] **Step 2: Laurel caption follows the laurel colour**

In the laurel branch replace the caption `color: '#6B6B6B'` with `color: hexToRgba(lcolor, 0.62)` (the `hexToRgba` helper already exists further down the file; function declarations are hoisted).

- [ ] **Step 3: Palette + inspector lists**

`LeftRail.tsx`: `const ICONS = ['check', 'fire', 'lock', 'bell', 'mountain', 'plus', 'play', 'chevron-left', 'chevron-right'];` and in `NorteIconPreview` add before `default:`:

```tsx
    case 'chevron-left': return (<svg {...p} strokeWidth={2.6}><polyline points="15 5 8 12 15 19" /></svg>);
    case 'chevron-right': return (<svg {...p} strokeWidth={2.6}><polyline points="9 5 16 12 9 19" /></svg>);
```

`ElementInspector.tsx`: `const ICON_OPTIONS = ['check', 'fire', 'lock', 'bell', 'mountain', 'plus', 'play', 'chevron-left', 'chevron-right'];`

- [ ] **Step 4: Typecheck + commit**

Run: `npx tsc --noEmit` — Expected: exit 0.

```bash
git add components/templates/ElementsLayer.tsx components/editor/LeftRail.tsx components/editor/panels/ElementInspector.tsx && git commit -m "feat(elements): chevron icons; laurel caption tints from the laurel colour

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: `segmented` element kind

**Files:**
- Modify: `types/index.ts` (`ElementKind` ~line 118; `days` comment ~line 234)
- Modify: `components/templates/ElementsLayer.tsx` (new branch before `} else if (el.kind === 'press') {`)
- Modify: `lib/elements.ts` (`kindLabel` + factory)
- Modify: `lib/localizableFields.ts` (`KIND_SHORT`, `SIMPLE`)
- Modify: `components/editor/panels/ElementInspector.tsx` (Width condition ~line 212; new section before `{sel.kind === 'press' && (`)
- Modify: `components/editor/LeftRail.tsx` (import + `COMPONENTS`)

- [ ] **Step 1: Type**

`ElementKind` becomes:

```ts
export type ElementKind = 'text' | 'emoji' | 'shape' | 'heatmap' | 'card' | 'icon' | 'stars' | 'laurel' | 'datestrip' | 'barchart' | 'linechart' | 'streak' | 'button' | 'blur' | 'phone' | 'habitrow' | 'notification' | 'widget' | 'press' | 'app' | 'segmented' | 'statrow' | 'usagechart' | 'approw';
```

Add above the `// datestrip / charts` comment:

```ts
  // segmented (iOS-style segmented control): `days` = comma-separated labels · `activeIndex` · `bg` track · `accent` active pill · `color` label ink · `fontSize`
  // statrow (row of value/label columns): `dates` = values · `days` = labels · `fontSize` value size · `color` values · `accent` labels · `align` left = packed, center = spread
  // usagechart (bars per day with y-axis): `days` labels · `dates` numeric values · `unit` suffix · `yTicks` bottom→top · `yMax` scale · `activeIndex` · `bg` card · `cell` bar · `accent` active bar · `color` ink
  // approw (app usage row): `icon` brand · `text` name · `cardValue` time · `cardCaption` meta · `fill` progress 0–1 · `bg` · `color` ink · `accent` bar
```

- [ ] **Step 2: Renderer**

Insert before `} else if (el.kind === 'press') {`:

```tsx
          } else if (el.kind === 'segmented') {
            const sw = (el.w || 246) * sf;
            const sh = (el.h || 32) * sf;
            const u = sf * ((el.w || 246) / 246);
            const labels = (el.days || '').split(',').map((s) => s.trim()).filter(Boolean);
            const ai = el.activeIndex ?? 0;
            const track = el.bg || '#2A2A2C';
            const pill = el.accent || '#F4F2ED';
            const ink = el.color || '#F4F2ED';
            const activeInk = readableTextColor(pill);
            const r = (el.radius ?? 16) * sf;
            content = (
              <div style={{ display: 'flex', width: sw, height: sh, background: track, borderRadius: r, padding: 3 * u, boxSizing: 'border-box', fontFamily: fam, direction: rtl ? 'rtl' : undefined }}>
                {labels.map((label, i) => {
                  const on = i === ai;
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: (el.fontSize || 11) * u, fontWeight: on ? 800 : 600, color: on ? activeInk : ink, opacity: on ? 1 : 0.7, background: on ? pill : 'transparent', borderRadius: Math.max(0, r - 3 * u), boxShadow: on ? '0 1px 4px rgba(0,0,0,0.18)' : undefined, whiteSpace: 'nowrap' }}>{label}</div>
                  );
                })}
              </div>
            );
```

- [ ] **Step 3: Factory + label**

`lib/elements.ts`: in `kindLabel` add `case 'segmented': return 'Segmented control';` and append:

```ts
/** iOS-style segmented control — comma-separated labels, one highlighted (dark variant). */
export function newSegmented(x = 195, y = 300): SlideElement {
  return { ...base(x, y), kind: 'segmented', w: 246, h: 32, radius: 16, days: 'Month,Week,Day', activeIndex: 1, bg: '#2A2A2C', accent: '#F4F2ED', color: '#F4F2ED', fontSize: 11 };
}
```

- [ ] **Step 4: Localization**

`lib/localizableFields.ts`: `KIND_SHORT` gains `segmented: 'Segmented'`; `SIMPLE` gains `segmented: [['days', 'labels']],`.

- [ ] **Step 5: Inspector**

Add `sel.kind === 'segmented'` to the Width slider condition (the long `(sel.kind === 'shape' || … || sel.kind === 'blur')` list). Insert before `{sel.kind === 'press' && (`:

```tsx
      {sel.kind === 'segmented' && (
        <>
          <TextField value={sel.days || ''} onChange={(v) => update({ days: v })} placeholder="Month,Week,Day" />
          <Slider label="Highlight" value={sel.activeIndex ?? 0} min={0} max={5} onChange={(v) => update({ activeIndex: v })} />
          <div className="grid grid-cols-2 gap-2">
            <Slider label="Height" value={sel.h || 32} min={22} max={60} suffix="px" onChange={(v) => update({ h: v })} />
            <Slider label="Radius" value={sel.radius ?? 16} min={0} max={30} onChange={(v) => update({ radius: v })} />
          </div>
          <Slider label="Text size" value={sel.fontSize || 11} min={8} max={20} suffix="px" onChange={(v) => update({ fontSize: v })} />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <div className="section-label mb-1.5">Track</div>
              <ColorPicker color={sel.bg || '#2A2A2C'} onChange={(c) => update({ bg: c })} />
            </div>
            <div>
              <div className="section-label mb-1.5">Active</div>
              <ColorPicker color={sel.accent || '#F4F2ED'} onChange={(c) => update({ accent: c })} />
            </div>
            <div>
              <div className="section-label mb-1.5">Ink</div>
              <ColorPicker color={sel.color || '#F4F2ED'} onChange={(c) => update({ color: c })} />
            </div>
          </div>
          <p className="text-[11px] text-text-muted">Comma-separated labels; Highlight picks the active segment.</p>
        </>
      )}
```

- [ ] **Step 6: Palette**

`LeftRail.tsx`: import `newSegmented` from `@/lib/elements` and add `{ label: 'Segmented control', make: () => newSegmented() },` after the `'Press logos'` entry in `COMPONENTS`.

- [ ] **Step 7: Typecheck + commit**

Run: `npx tsc --noEmit` — Expected: exit 0.

```bash
git add types/index.ts components/templates/ElementsLayer.tsx lib/elements.ts lib/localizableFields.ts components/editor/panels/ElementInspector.tsx components/editor/LeftRail.tsx && git commit -m "feat(elements): segmented control component

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: `statrow` element kind

**Files:** same six files as Task 5 (type already added in Task 5).

- [ ] **Step 1: Renderer** — insert before `} else if (el.kind === 'press') {`:

```tsx
          } else if (el.kind === 'statrow') {
            const sw = (el.w || 214) * sf;
            const u = sf * ((el.w || 214) / 214);
            const values = (el.dates || '').split(',').map((s) => s.trim());
            const labels = (el.days || '').split(',').map((s) => s.trim());
            const n = Math.max(values.length, labels.length);
            const ink = el.color || '#F4F2ED';
            const sub = el.accent || '#A8A49C';
            const spread = el.align === 'center';
            content = (
              <div style={{ display: 'flex', width: sw, gap: spread ? 0 : 24 * u, justifyContent: spread ? 'space-around' : 'flex-start', fontFamily: fam, direction: rtl ? 'rtl' : undefined }}>
                {Array.from({ length: n }).map((_, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3 * u, minWidth: 0 }}>
                    <span style={{ fontSize: (el.fontSize || 14) * u, fontWeight: 800, color: ink, lineHeight: 1, whiteSpace: 'nowrap', letterSpacing: rtl ? 'normal' : '-0.01em' }}>{values[i] || ''}</span>
                    <span style={{ fontFamily: MONO, fontSize: 7.5 * u, fontWeight: 700, letterSpacing: rtl ? 'normal' : '0.08em', textTransform: 'uppercase', color: sub, whiteSpace: 'nowrap' }}>{labels[i] || ''}</span>
                  </div>
                ))}
              </div>
            );
```

- [ ] **Step 2: Factory + label** — `kindLabel`: `case 'statrow': return 'Stats row';` and:

```ts
/** Row of value/label columns (e.g. "2h 17m · SCREEN TIME"), dark variant. */
export function newStatRow(x = 195, y = 300): SlideElement {
  return { ...base(x, y), kind: 'statrow', w: 214, dates: '2h 17m,54,51', days: 'SCREEN TIME,PICKUPS,NOTIFICATIONS', fontSize: 14, color: '#F4F2ED', accent: '#A8A49C', align: 'left' };
}
```

- [ ] **Step 3: Localization** — `KIND_SHORT` `statrow: 'Stats'`; `SIMPLE` `statrow: [['dates', 'values'], ['days', 'labels']],`.

- [ ] **Step 4: Inspector** — add `sel.kind === 'statrow'` to the Width condition; insert before `{sel.kind === 'press' && (`:

```tsx
      {sel.kind === 'statrow' && (
        <>
          <TextField value={sel.dates || ''} onChange={(v) => update({ dates: v })} placeholder="2h 17m,54,51" />
          <TextField value={sel.days || ''} onChange={(v) => update({ days: v })} placeholder="SCREEN TIME,PICKUPS,NOTIFICATIONS" />
          <Slider label="Value size" value={sel.fontSize || 14} min={9} max={40} suffix="px" onChange={(v) => update({ fontSize: v })} />
          <div className="grid grid-cols-2 gap-2">
            {(['left', 'center'] as const).map((a) => (
              <button key={a} onClick={() => update({ align: a })} className={`px-2 py-2 rounded-md border text-xs ${(sel.align || 'left') === a ? 'border-norte-primary bg-norte-primary-light text-norte-primary' : 'border-border-default bg-overlay text-secondary'}`}>
                {a === 'left' ? 'Packed' : 'Spread'}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="section-label mb-1.5">Values</div>
              <ColorPicker color={sel.color || '#F4F2ED'} onChange={(c) => update({ color: c })} />
            </div>
            <div>
              <div className="section-label mb-1.5">Labels</div>
              <ColorPicker color={sel.accent || '#A8A49C'} onChange={(c) => update({ accent: c })} />
            </div>
          </div>
          <p className="text-[11px] text-text-muted">Comma-separated values and labels — one column each.</p>
        </>
      )}
```

Also add `'dates'` and `'yTicks'` to the `LOCALIZABLE_TEXT` set at the top of the file so those CSV fields follow the active language like `days` does.

- [ ] **Step 5: Palette** — import `newStatRow`; `{ label: 'Stats row', make: () => newStatRow() },`.

- [ ] **Step 6: Typecheck + commit**

```bash
npx tsc --noEmit && git add components/templates/ElementsLayer.tsx lib/elements.ts lib/localizableFields.ts components/editor/panels/ElementInspector.tsx components/editor/LeftRail.tsx && git commit -m "feat(elements): stats row component

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: `usagechart` element kind

**Files:** same files as Task 6, plus a new `UsageChartCard` function in `ElementsLayer.tsx` (place it right after `BarChartCard`).

- [ ] **Step 1: Card component** — after `BarChartCard`:

```tsx
/** Weekly usage bars — value labels above, day labels below, y-axis ticks + gridlines at the right. */
function UsageChartCard({ el, sf, rtl }: { el: SlideElement; sf: number; rtl?: boolean }) {
  const w = (el.w || 320) * sf;
  const h = (el.h || 200) * sf;
  const u = sf * ((el.w || 320) / 320); // width-proportional unit
  const labels = (el.days || '').split(',').map((s) => s.trim());
  const values = (el.dates || '').split(',').map((s) => parseFloat(s) || 0);
  const n = Math.max(labels.length, values.length, 1);
  const ai = el.activeIndex ?? n - 1;
  const ticks = (el.yTicks || '').split(',').map((s) => s.trim()).filter(Boolean);
  const maxV = Math.max(el.yMax || 0, ...values, 0.0001);
  const ink = el.color || '#1A1A1A';
  const bar = el.cell || '#1A1A1A';
  const active = el.accent || '#E8923C';
  const unit = el.unit ?? '';
  const padX = 18 * u;
  const padTop = 18 * u;
  const padBottom = 14 * u;
  const axisW = ticks.length ? 30 * u : 0;
  const valueBlock = 16 * u; // value label above each bar
  const labelBlock = 18 * u; // day label below
  const plotH = h - padTop - padBottom - valueBlock - labelBlock;
  const plotW = w - padX * 2 - axisW;
  const plotTop = padTop + valueBlock;
  const slot = plotW / n;
  const barW = slot * 0.5;
  const muted = hexToRgba(ink, 0.55);
  return (
    <div style={{ position: 'relative', width: w, height: h, background: el.bg || '#F6F4EF', borderRadius: (el.radius ?? 20) * sf, fontFamily: fontFamilyFor('Sora'), overflow: 'hidden', direction: rtl ? 'rtl' : undefined }}>
      {ticks.map((t, i) => {
        const y = plotTop + plotH * (1 - i / Math.max(1, ticks.length - 1));
        return (
          <React.Fragment key={`t${i}`}>
            <div style={{ position: 'absolute', left: padX, width: plotW, top: y, height: 1, background: hexToRgba(ink, 0.12) }} />
            <div style={{ position: 'absolute', left: padX + plotW + 8 * u, top: y, transform: 'translateY(-50%)', fontFamily: MONO, fontSize: 9 * u, color: muted, whiteSpace: 'nowrap' }}>{t}</div>
          </React.Fragment>
        );
      })}
      {Array.from({ length: n }).map((_, i) => {
        const on = i === ai;
        const v = values[i] || 0;
        const bh = Math.max(3 * u, plotH * (v / maxV));
        const cx = padX + slot * i + slot / 2;
        return (
          <React.Fragment key={`b${i}`}>
            <div style={{ position: 'absolute', left: cx, top: plotTop + plotH - bh - 4 * u, transform: 'translate(-50%, -100%)', fontFamily: MONO, fontSize: 9 * u, fontWeight: on ? 700 : 500, color: on ? ink : muted, whiteSpace: 'nowrap' }}>{rtl ? arNum(v) : v}{unit}</div>
            <div style={{ position: 'absolute', left: cx - barW / 2, top: plotTop + plotH - bh, width: barW, height: bh, background: on ? active : bar, borderRadius: `${barW * 0.3}px ${barW * 0.3}px ${barW * 0.12}px ${barW * 0.12}px` }} />
            <div style={{ position: 'absolute', left: cx, top: plotTop + plotH + 6 * u, transform: 'translateX(-50%)', fontFamily: MONO, fontSize: 10 * u, fontWeight: on ? 700 : 500, color: on ? ink : muted, whiteSpace: 'nowrap' }}>{labels[i] || ''}</div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Branch** — insert before `} else if (el.kind === 'press') {`:

```tsx
          } else if (el.kind === 'usagechart') {
            content = <UsageChartCard el={el} sf={sf} rtl={rtl} />;
```

- [ ] **Step 3: Factory + label** — `kindLabel`: `case 'usagechart': return 'Usage chart';` and:

```ts
/** Bars per day with the value above each bar and a y-axis at the right (screen-time style), light card. */
export function newUsageChart(x = 195, y = 460): SlideElement {
  return {
    ...base(x, y), kind: 'usagechart', w: 320, h: 200, radius: 20,
    bg: '#F6F4EF', cell: '#1A1A1A', accent: '#E8923C', color: '#1A1A1A',
    days: 'Sun,Mon,Tue,Wed,Thu,Fri,Sat', dates: '1.4,1.5,1.1,0.9,0.8,1.4,1.6', unit: 'h',
    yTicks: '0m,1h,2h', yMax: 2, activeIndex: 6, shadow: 26,
  };
}
```

- [ ] **Step 4: Localization** — `KIND_SHORT` `usagechart: 'Usage'`; `SIMPLE` `usagechart: [['days', 'labels'], ['dates', 'values'], ['yTicks', 'axis'], ['unit', 'unit']],`.

- [ ] **Step 5: Inspector** — add `sel.kind === 'usagechart'` to BOTH the Width and the Height slider conditions; insert before `{sel.kind === 'press' && (`:

```tsx
      {sel.kind === 'usagechart' && (
        <>
          <TextField value={sel.days || ''} onChange={(v) => update({ days: v })} placeholder="Sun,Mon,Tue,Wed,Thu,Fri,Sat" />
          <TextField value={sel.dates || ''} onChange={(v) => update({ dates: v })} placeholder="1.4,1.5,1.1,0.9,0.8,1.4,1.6" />
          <div className="grid grid-cols-2 gap-2">
            <TextField value={sel.unit || ''} onChange={(v) => update({ unit: v })} placeholder="Unit (h)" />
            <TextField value={sel.yTicks || ''} onChange={(v) => update({ yTicks: v })} placeholder="0m,1h,2h" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Slider label="Y max" value={sel.yMax || 0} min={0} max={24} step={0.5} onChange={(v) => update({ yMax: v })} />
            <Slider label="Highlight" value={sel.activeIndex ?? 6} min={0} max={11} onChange={(v) => update({ activeIndex: v })} />
          </div>
          <Slider label="Radius" value={sel.radius ?? 20} min={0} max={48} onChange={(v) => update({ radius: v })} />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="section-label mb-1.5">Card</div>
              <ColorPicker color={sel.bg || '#F6F4EF'} onChange={(c) => update({ bg: c })} />
            </div>
            <div>
              <div className="section-label mb-1.5">Ink</div>
              <ColorPicker color={sel.color || '#1A1A1A'} onChange={(c) => update({ color: c })} />
            </div>
            <div>
              <div className="section-label mb-1.5">Bars</div>
              <ColorPicker color={sel.cell || '#1A1A1A'} onChange={(c) => update({ cell: c })} />
            </div>
            <div>
              <div className="section-label mb-1.5">Active bar</div>
              <ColorPicker color={sel.accent || '#E8923C'} onChange={(c) => update({ accent: c })} />
            </div>
          </div>
          <p className="text-[11px] text-text-muted">Values are numbers (decimals ok) shown with the unit above each bar. Y max sets the scale (0 = fit the tallest bar); axis ticks run bottom → top.</p>
        </>
      )}
```

- [ ] **Step 6: Palette** — import `newUsageChart`; `{ label: 'Usage chart', make: () => newUsageChart() },`.

- [ ] **Step 7: Typecheck + commit**

```bash
npx tsc --noEmit && git add components/templates/ElementsLayer.tsx lib/elements.ts lib/localizableFields.ts components/editor/panels/ElementInspector.tsx components/editor/LeftRail.tsx && git commit -m "feat(elements): usage chart component (hours per day, y-axis, highlight)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: `approw` element kind

**Files:** same files as Task 6.

- [ ] **Step 1: Renderer** — insert before `} else if (el.kind === 'press') {`:

```tsx
          } else if (el.kind === 'approw') {
            const rw = (el.w || 246) * sf;
            const rh = (el.h || 56) * sf;
            const u = sf * ((el.w || 246) / 246);
            const ink = el.color || '#F4F2ED';
            const fillPct = Math.max(0, Math.min(1, el.fill ?? 0.8));
            const name = resolveElementText(el, language);
            content = (
              <div style={{ width: rw, minHeight: rh, background: el.bg || '#242427', borderRadius: (el.radius ?? 12) * sf, padding: `${9 * u}px ${12 * u}px`, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5 * u, fontFamily: fam, direction: rtl ? 'rtl' : undefined }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 * u }}>
                  <AppIcon brand={el.icon || 'youtube'} size={18 * u} radius={5 * u} />
                  {editing ? (
                    <EditingBox value={name} onChange={(v) => onTextChange?.(el.id, v)} onDone={() => onEditEnd?.()} style={{ fontFamily: fam, fontSize: 12 * u, fontWeight: 700, color: ink }} />
                  ) : (
                    <span style={{ fontSize: 12 * u, fontWeight: 700, color: ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 * u }}>
                  <div style={{ flex: 1, height: 4 * u, borderRadius: 999, background: hexToRgba(ink, 0.14), overflow: 'hidden' }}>
                    <div style={{ width: `${fillPct * 100}%`, height: '100%', background: el.accent || '#E8923C', borderRadius: 999 }} />
                  </div>
                  {el.cardValue && <span style={{ fontFamily: MONO, fontSize: 9.5 * u, fontWeight: 600, color: ink, whiteSpace: 'nowrap' }}>{el.cardValue}</span>}
                </div>
                {el.cardCaption && <span style={{ fontFamily: MONO, fontSize: 8 * u, letterSpacing: rtl ? 'normal' : '0.02em', color: hexToRgba(ink, 0.55), whiteSpace: 'nowrap' }}>{el.cardCaption}</span>}
              </div>
            );
```

- [ ] **Step 2: Factory + label** — `kindLabel`: `case 'approw': return 'App usage row';` and:

```ts
/** App usage row — brand icon + name, progress bar with the time, meta line (dark variant). */
export function newAppRow(x = 195, y = 300): SlideElement {
  return { ...base(x, y), kind: 'approw', w: 246, h: 56, radius: 12, bg: '#242427', color: '#F4F2ED', accent: '#E8923C', icon: 'youtube', text: 'YouTube', cardValue: '33m 59s', cardCaption: '1 pickups · 0 notifications', fill: 0.86 };
}
```

- [ ] **Step 3: Localization** — `KIND_SHORT` `approw: 'App row'`; `SIMPLE` `approw: [['text', 'app'], ['cardValue', 'time'], ['cardCaption', 'meta']],`.

- [ ] **Step 4: Inspector** — add `sel.kind === 'approw'` to the Width condition; insert before `{sel.kind === 'press' && (`:

```tsx
      {sel.kind === 'approw' && (
        <>
          <BrandPicker value={sel.icon} onChange={(id) => update({ icon: id })} />
          <TextField value={sel.text || ''} onChange={(v) => update({ text: v })} placeholder="YouTube" />
          <div className="grid grid-cols-2 gap-2">
            <TextField value={sel.cardValue || ''} onChange={(v) => update({ cardValue: v })} placeholder="33m 59s" />
            <TextField value={sel.cardCaption || ''} onChange={(v) => update({ cardCaption: v })} placeholder="1 pickups · 0 notifications" />
          </div>
          <Slider label="Progress" value={Math.round((sel.fill ?? 0.8) * 100)} min={0} max={100} suffix="%" onChange={(v) => update({ fill: v / 100 })} />
          <div className="grid grid-cols-2 gap-2">
            <Slider label="Height" value={sel.h || 56} min={36} max={120} suffix="px" onChange={(v) => update({ h: v })} />
            <Slider label="Radius" value={sel.radius ?? 12} min={0} max={40} onChange={(v) => update({ radius: v })} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <div className="section-label mb-1.5">Card</div>
              <ColorPicker color={sel.bg || '#242427'} onChange={(c) => update({ bg: c })} />
            </div>
            <div>
              <div className="section-label mb-1.5">Ink</div>
              <ColorPicker color={sel.color || '#F4F2ED'} onChange={(c) => update({ color: c })} />
            </div>
            <div>
              <div className="section-label mb-1.5">Bar</div>
              <ColorPicker color={sel.accent || '#E8923C'} onChange={(c) => update({ accent: c })} />
            </div>
          </div>
          <p className="text-[11px] text-text-muted">Double-click the row on the canvas to edit the app name.</p>
        </>
      )}
```

- [ ] **Step 5: Palette** — import `newAppRow`; `{ label: 'App usage row', make: () => newAppRow() },`.

- [ ] **Step 6: Typecheck + commit**

```bash
npx tsc --noEmit && git add components/templates/ElementsLayer.tsx lib/elements.ts lib/localizableFields.ts components/editor/panels/ElementInspector.tsx components/editor/LeftRail.tsx && git commit -m "feat(elements): app usage row component

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: Kit screens (cover centre tile, blocked, screen time)

**Files:**
- Modify: `lib/starterKits.ts` (`norteCoverElements` ~line 268; new builders + slides after `NORTE_COVER`; both `STARTER_KITS` Norte entries)

- [ ] **Step 1: Cover centre tile → Norte PNG**

In `norteCoverElements()` replace the `if (c === 0 && r === 0) { return { kind: 'icon', icon: 'mountain', … } }` return with:

```ts
      return { kind: 'app', icon: 'norte', x: p.x, y: p.y, size: NORTE_COVER_TILE, radius: Math.round(NORTE_COVER_TILE * 0.22), check: true, badge: 'check', accent: '#E8923C', rotation: NORTE_COVER_ROTATION, scale: 1, groupId: wall };
```

- [ ] **Step 2: Builders + slides**

Insert after the `NORTE_COVER` constant:

```ts
const INK_ON_DARK = '#F4F2ED';
const MUTED_ON_DARK = '#A8A49C';
const DARK_SCREEN = '#19191B';
const DARK_SURFACE = '#242427';
const DARK_CHIP = '#2A2A2C';

/**
 * Screen 2 — the Opal-style "blocked app" moment in Norte's language: big dark
 * iPhone, glowing Instagram icon, "Blocked by Norte", laurel on the dark screen,
 * padlocked app tiles floating around the phone instead of Opal's shards.
 * Spec: docs/superpowers/specs/2026-09-20-norte-focus-screens-design.md
 */
export function norteBlockedElements(): RawEl[] {
  const tile = (icon: string, x: number, y: number, size: number, rotation: number): RawEl =>
    ({ kind: 'app', icon, x, y, size, check: true, badge: 'lock', accent: '#111111', rotation, scale: 1 });
  return [
    { kind: 'phone', phoneStyle: 'frame', x: 195, y: 460, w: 268, h: 560, radius: 50, bg: '#2B2B2D', bg2: DARK_SCREEN, island: true, text: '9:41', color: INK_ON_DARK, cardTitle: '', rotation: 0, scale: 1 },
    { kind: 'app', icon: 'instagram', x: 195, y: 378, size: 92, check: false, glow: 22, rotation: 0, scale: 1 },
    { kind: 'text', x: 195, y: 478, rotation: 0, scale: 1, text: 'Instagram is\nBlocked by Norte', fontSize: 22, fontWeight: 800, color: INK_ON_DARK, align: 'center', width: 240 },
    { kind: 'text', x: 195, y: 530, rotation: 0, scale: 1, text: 'You set this rule yesterday.\nPast you was right.', fontSize: 13, fontWeight: 500, color: MUTED_ON_DARK, align: 'center', width: 240 },
    { kind: 'laurel', x: 195, y: 686, rotation: 0, scale: 1, size: 50, color: INK_ON_DARK, cardValue: '10 MILLION', cardCaption: 'HOURS SAVED', fontSize: 14, cols: 5 },
    tile('snapchat', 46, 236, 62, -14),
    tile('tiktok', 350, 268, 70, 12),
    tile('youtube', 38, 522, 58, 9),
    tile('x', 354, 604, 54, -10),
    { kind: 'text', x: 195, y: 148, rotation: 0, scale: 1, text: 'One rule. Set once, kept every day.', fontSize: 14, fontWeight: 500, color: '#6f6c66', align: 'center', width: 340 },
    { kind: 'text', x: 195, y: 88, rotation: 0, scale: 1, text: '[Blocks] the apps\nyou keep opening.', fontSize: 36, fontWeight: 800, color: '#1a1a1a', align: 'center', width: 370 },
  ];
}

/**
 * Screen 3 — the Refocus-style "Track Screen Time" screen: dark iPhone bleeding
 * off the bottom, segmented period control, week navigation, summary card with
 * three stats, a light usage chart popping out of the phone and the "most
 * screen time" app row. Every piece is an editable component.
 */
export function norteScreenTimeElements(): RawEl[] {
  const T = (x: number, y: number, text: string, fontSize: number, fontWeight: number, color: string, width: number, align: 'left' | 'center' = 'left', groupId?: string): RawEl =>
    ({ kind: 'text', x, y, rotation: 0, scale: 1, text, fontSize, fontWeight, color, align, width, ...(groupId ? { groupId } : {}) });
  const chip = (icon: string, x: number, y: number, size: number): RawEl =>
    ({ kind: 'icon', icon, tile: true, x, y, size, radius: size / 2, bg: DARK_CHIP, color: INK_ON_DARK, check: false, rotation: 0, scale: 1 });
  const summary = 'norte-st-summary';
  return [
    { kind: 'phone', phoneStyle: 'frame', x: 195, y: 540, w: 290, h: 630, radius: 52, bg: '#2B2B2D', bg2: DARK_SCREEN, island: true, text: '9:41', color: INK_ON_DARK, cardTitle: '', rotation: 0, scale: 1 },
    // header: logo + name, two round buttons
    { kind: 'app', icon: 'norte', x: 84, y: 298, size: 24, radius: 6, check: false, rotation: 0, scale: 1 },
    T(131, 298, 'Norte', 15, 800, INK_ON_DARK, 60),
    chip('plus', 272, 298, 24),
    chip('bell', 306, 298, 24),
    // period picker + week navigation
    { kind: 'segmented', x: 195, y: 336, w: 246, h: 32, radius: 16, days: 'Month,Week,Day', activeIndex: 1, bg: DARK_CHIP, accent: INK_ON_DARK, color: INK_ON_DARK, fontSize: 11, rotation: 0, scale: 1 },
    chip('chevron-left', 84, 372, 22),
    T(195, 372, 'This Week', 13, 700, INK_ON_DARK, 150, 'center'),
    chip('chevron-right', 306, 372, 22),
    // summary card (grouped so it moves as one)
    T(195, 404, 'SUMMARY', 9, 700, MUTED_ON_DARK, 246),
    { kind: 'shape', shapeType: 'rect', x: 195, y: 456, w: 246, h: 118, radius: 16, bg: DARK_SURFACE, opacity: 1, rotation: 0, scale: 1, groupId: summary },
    T(195, 414, 'May 25, 2025 – May 31, 2025', 10, 500, MUTED_ON_DARK, 214, 'left', summary),
    T(195, 438, '1h 9m', 26, 800, INK_ON_DARK, 214, 'left', summary),
    T(195, 458, 'DAILY AVERAGE', 8, 700, MUTED_ON_DARK, 214, 'left', summary),
    { kind: 'statrow', x: 195, y: 490, w: 214, dates: '2h 17m,54,51', days: 'SCREEN TIME,PICKUPS,NOTIFICATIONS', fontSize: 14, color: INK_ON_DARK, accent: MUTED_ON_DARK, align: 'left', rotation: 0, scale: 1, groupId: summary },
    // the chart pops out of the phone (wider than the screen, floating shadow)
    { kind: 'usagechart', x: 195, y: 620, w: 320, h: 200, radius: 20, bg: '#F6F4EF', cell: '#1A1A1A', accent: '#E8923C', color: '#1A1A1A', days: 'Sun,Mon,Tue,Wed,Thu,Fri,Sat', dates: '1.4,1.5,1.1,0.9,0.8,1.4,1.6', unit: 'h', yTicks: '0m,1h,2h', yMax: 2, activeIndex: 6, shadow: 26, rotation: 0, scale: 1 },
    // most screen time
    T(195, 746, 'MOST SCREEN TIME', 9, 700, MUTED_ON_DARK, 246),
    { kind: 'approw', x: 195, y: 784, w: 246, h: 56, radius: 12, bg: DARK_SURFACE, color: INK_ON_DARK, accent: '#E8923C', icon: 'youtube', text: 'YouTube', cardValue: '33m 59s', cardCaption: '1 pickups · 0 notifications', fill: 0.86, rotation: 0, scale: 1 },
    // headline block
    T(195, 148, 'Screen time, pickups and notifications at a glance.', 14, 500, '#6f6c66', 340, 'center'),
    T(195, 88, '[Track]\nScreen Time', 36, 800, '#1a1a1a', 370, 'center'),
  ];
}

/** Screens 2 and 3 of the Norte component kits. */
const NORTE_BLOCKED: StarterKitSlide = {
  role: 'use-case',
  template: 'hero',
  title: 'Blocks the apps you keep opening',
  noChrome: true,
  elements: norteBlockedElements(),
};
const NORTE_SCREEN_TIME: StarterKitSlide = {
  role: 'differentiator',
  template: 'hero',
  title: 'Track Screen Time',
  noChrome: true,
  elements: norteScreenTimeElements(),
};
```

- [ ] **Step 3: Prepend to both kits**

In `STARTER_KITS`: `slides: [NORTE_COVER, NORTE_BLOCKED, NORTE_SCREEN_TIME, ...NORTE_V2_SLIDES]` for `norte-components-v2` and `slides: [NORTE_COVER, NORTE_BLOCKED, NORTE_SCREEN_TIME, ...NORTE_COMPONENTS_SLIDES]` for `norte-components`. Update the `NORTE_COVER` doc comment to "Screen 1 of the Norte component kits (screens 2–3 follow below)."

- [ ] **Step 4: Typecheck + commit**

```bash
npx tsc --noEmit && git add lib/starterKits.ts && git commit -m "feat(norte): blocked-apps + screen-time screens after the cover; cover uses the Norte PNG

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 10: Build + visual verification + polish

- [ ] **Step 1: Build**

Run: `cd "/Users/matheusseixeiro/Projects/snapshot app" && npm run build 2>&1 | tail -25`
Expected: "Compiled successfully", route table printed, exit 0.

- [ ] **Step 2: Apply the kit in the preview**

In the browser tab from `preview_start` (`screenforge`, port 3018): left rail → Templates → the `Norte · Components v2` card → apply. Confirm 10 screens; screens 1–3 are cover / blocked / screen time.

- [ ] **Step 3: Compare with the references**

Screenshot each of the three screens (zoom into each at 100 %) and check against the reference images: PNG icons on the cover with the Norte tile centred; on screen 2 the glow behind Instagram, off-white status bar, laurel with 5 stars inside the dark screen, four tilted padlocked tiles; on screen 3 the segmented control, week nav, summary card + stats, the light chart overhanging the phone with the orange Saturday bar, and the YouTube row. Fix anything off (positions in `lib/starterKits.ts`, sizes in the renderer) and re-check.

- [ ] **Step 4: Editing checks**

Double-click the screen-2 headline → inline editor opens; select the segmented control → Highlight slider moves the pill; select the usage chart → change `dates` and `yTicks`; select the app row → change the brand and Progress; select the Instagram icon → Glow slider; select the phone → Status colour picker; drag the `1h 9m` text → the whole summary group moves; Elements panel → each of the four new buttons adds its component; the App icons grid shows the PNGs + Norte.

- [ ] **Step 5: Export smoke test**

Export (top-right `Export` in the top nav) with iPhone 6.9″ selected for the base language; watch `read_console_messages` for errors and `read_network_requests` for `/apps/*.png` fetches (html-to-image inlines them). If the built-in browser blocks the zip download, the absence of console errors plus the image fetches is the acceptance evidence.

- [ ] **Step 6: Final commit of any polish + typecheck**

```bash
npx tsc --noEmit && git add lib/starterKits.ts components/templates/ElementsLayer.tsx && git commit -m "fix(norte): polish after visual verification

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

(Only if there are changes; stage exactly the files you touched.)

---

## Self-review

- **Spec coverage:** assets + image icons + Norte brand (T1); glow (T2); phone status bar colour / split / icons / island alignment (T3); chevrons + laurel caption (T4); segmented (T5); statrow (T6); usagechart (T7); approw (T8); kit builders, placement, roles, cover centre tile (T9); verification list (T10). `LOCALIZABLE_TEXT` gains `dates`/`yTicks` (T6). Elements-panel buttons and inspector sections for all four kinds (T5–T8). ✔
- **Type consistency:** factories `newSegmented` / `newStatRow` / `newUsageChart` / `newAppRow` match the LeftRail imports; renderer field names (`days`, `dates`, `yTicks`, `yMax`, `unit`, `fill`, `glow`, `color`) match `types/index.ts`; `BrandPicker` is defined in T2 before use in T8; `hexToRgba`, `arNum`, `MONO`, `readableTextColor`, `EditingBox`, `AppIcon`, `CheckBadge` all already exist in `ElementsLayer.tsx`. ✔
