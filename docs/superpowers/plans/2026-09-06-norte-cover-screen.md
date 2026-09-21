# Norte Cover Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Refocus-style cover screen (pill headline, bold subline, laurel + stars, press logos, tilted tile wall with the Norte logo in the middle) as screen 1 of the Norte component kits, built only from editable elements.

**Architecture:** Two small element-system extensions (stars inside the existing `laurel` element; a new `press` element kind rendering monochrome publication wordmarks) plus a pure builder in `lib/starterKits.ts` that lays the cover out on the 390×844 baseline and prepends it to the `norte-components-v2` / `norte-components` kits. Rendering lives in `components/templates/ElementsLayer.tsx`, defaults in `lib/elements.ts`, editing in `components/editor/panels/ElementInspector.tsx`, palette entry in `components/editor/LeftRail.tsx`.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Zustand store, inline-style renderer. No test runner exists in this repo — verification is `npx tsc --noEmit`, `npm run build`, and visual checks in the running preview (port 3018), exactly as the spec prescribes.

**Spec:** `docs/superpowers/specs/2026-09-06-norte-cover-screen-design.md`

---

## File map

| File | Change |
| --- | --- |
| `types/index.ts` | `'press'` added to `ElementKind`; doc comments for laurel stars (`cols`) and press fields. |
| `components/templates/ElementsLayer.tsx` | Laurel renders an optional star row; new `PressLogo` component + `press` branch. |
| `lib/elements.ts` | `newLaurelEl()` default gets 5 stars; new `newPressLogos()`; `kindLabel('press')`. |
| `components/editor/LeftRail.tsx` | "Press logos" button in the Norte components grid. |
| `components/editor/panels/ElementInspector.tsx` | Laurel: "Value size" + "Stars" sliders; new `press` controls; press names always edit the base language. |
| `lib/starterKits.ts` | `rotatedGrid()` helper, `norteCoverElements()`, `NORTE_COVER` slide, prepended to both Norte component kits; old hero role → `use-case`. |

Every task ends with a typecheck; the final task builds and checks the result in the browser. Commit after each task.

---

### Task 1: Stars inside the laurel element

**Files:**
- Modify: `types/index.ts:215-216` (comment only)
- Modify: `components/templates/ElementsLayer.tsx:1027-1033`
- Modify: `components/editor/panels/ElementInspector.tsx:645-655`
- Modify: `lib/elements.ts:155-157`

- [ ] **Step 1: Document `cols` as the laurel star count**

In `types/index.ts`, replace the `// heatmap grid` block header comment so the field is documented for both uses:

```ts
  // heatmap grid (cols/rows) · star count for `stars` and the optional row under a `laurel` (cols, 0–5)
  cols?: number;
  rows?: number;
```

- [ ] **Step 2: Render the star row under the laurel caption**

In `components/templates/ElementsLayer.tsx`, replace the `laurel` branch (currently lines 1027–1033):

```tsx
          } else if (el.kind === 'laurel') {
            const lsize = (el.size || 56) * sf;
            const lcolor = el.color || '#111111';
            const starCount = Math.min(5, Math.max(0, el.cols || 0));
            content = (
              <Laurel size={lsize} color={lcolor} gap={6 * sf}>
                {el.cardValue && <div style={{ fontFamily: fam, fontSize: (el.fontSize || 30) * sf, fontWeight: 800, color: lcolor, whiteSpace: 'nowrap' }}>{el.cardValue}</div>}
                {el.cardCaption && <div style={{ fontFamily: fam, fontSize: 9 * sf, fontWeight: 700, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>{el.cardCaption}</div>}
                {starCount > 0 && (
                  <div style={{ marginTop: 3 * sf }}>
                    <StarsRow n={starCount} size={lsize * 0.16} color={lcolor} />
                  </div>
                )}
              </Laurel>
            );
```

`StarsRow` already exists at the top of the file (used by the `stars` kind).

- [ ] **Step 3: Expose value size + stars in the inspector**

In `components/editor/panels/ElementInspector.tsx`, replace the `laurel` block (currently lines 645–655):

```tsx
      {sel.kind === 'laurel' && (
        <>
          <TextField value={sel.cardValue || ''} onChange={(v) => update({ cardValue: v })} placeholder="+38,420" />
          <TextField value={sel.cardCaption || ''} onChange={(v) => update({ cardCaption: v })} placeholder="Hábitos cumpridos" />
          <div className="grid grid-cols-2 gap-2">
            <Slider label="Size" value={sel.size || 56} min={28} max={120} suffix="px" onChange={(v) => update({ size: v })} />
            <Slider label="Value size" value={sel.fontSize || 30} min={10} max={48} suffix="px" onChange={(v) => update({ fontSize: v })} />
          </div>
          <Slider label="Stars" value={sel.cols ?? 0} min={0} max={5} onChange={(v) => update({ cols: v })} />
          <div>
            <div className="section-label mb-1.5">Colour</div>
            <ColorPicker color={sel.color || '#111111'} onChange={(c) => update({ color: c })} />
          </div>
        </>
      )}
```

- [ ] **Step 4: Default new laurels to 5 stars**

In `lib/elements.ts`, replace `newLaurelEl`:

```ts
/** Laurel-wreath rating badge: big value + small-caps caption + 5 stars (App Store convention). */
export function newLaurelEl(x = 195, y = 400): SlideElement {
  return { ...base(x, y), kind: 'laurel', size: 56, color: '#111111', cardValue: '+38,420', cardCaption: 'Hábitos cumpridos', cols: 5 };
}
```

- [ ] **Step 5: Typecheck**

Run: `cd "/Users/matheusseixeiro/Projects/snapshot app" && npx tsc --noEmit`
Expected: no output (exit 0).

- [ ] **Step 6: Commit**

```bash
git add types/index.ts components/templates/ElementsLayer.tsx components/editor/panels/ElementInspector.tsx lib/elements.ts
git commit -m "feat(elements): optional star row inside the laurel badge"
```

(Only stage the four files above — the working tree also carries the user's unrelated in-progress edits to `ElementsLayer.tsx` and `ElementInspector.tsx`; staging those files includes that work, which is acceptable because it is their own pending work on the same files. Do **not** `git add -A`.)

---

### Task 2: `press` element kind (row of publication wordmarks)

**Files:**
- Modify: `types/index.ts:133` (+ new comment block before `// datestrip / charts`)
- Modify: `components/templates/ElementsLayer.tsx` (new `PressLogo` after `StarsRow`, new branch before the `stars` branch)
- Modify: `lib/elements.ts:53-75` (`kindLabel`) and after `newLaurelEl`
- Modify: `components/editor/LeftRail.tsx:5-33, 99-123`
- Modify: `components/editor/panels/ElementInspector.tsx:45-53, 700-706`

- [ ] **Step 1: Add the kind + field docs**

In `types/index.ts` line 133, append `'press'`:

```ts
export type ElementKind = 'text' | 'emoji' | 'shape' | 'heatmap' | 'card' | 'icon' | 'stars' | 'laurel' | 'datestrip' | 'barchart' | 'linechart' | 'streak' | 'button' | 'blur' | 'phone' | 'habitrow' | 'notification' | 'widget' | 'press';
```

Directly above the `// datestrip / charts` comment inside `SlideElement`, add:

```ts
  // press ("as seen in" row of publication wordmarks)
  // `text` = comma-separated names (TechCrunch, USA TODAY, Forbes, …) · `fontSize` = logo height · `color` = ink.
  // Known names get their signature monochrome treatment; anything else renders as bold caps. Not localized.
```

- [ ] **Step 2: Add the `PressLogo` component**

In `components/templates/ElementsLayer.tsx`, insert after the `StarsRow` function (after line 70):

```tsx
/** Monochrome wordmark for one publication (known names get a recognizable treatment, others bold caps). */
function PressLogo({ name, size, color, fam }: { name: string; size: number; color: string; fam: string }) {
  const key = name.toLowerCase().replace(/[^a-z]/g, '');
  const row: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: size * 0.32, color, whiteSpace: 'nowrap', lineHeight: 1 };
  const sans = (weight: number, fs: number, ls = '0em'): React.CSSProperties => ({ fontFamily: fam, fontWeight: weight, fontSize: fs, letterSpacing: ls });
  const disc = (d: number): React.CSSProperties => ({ width: d, height: d, borderRadius: '50%', background: color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 });
  switch (key) {
    case 'techcrunch':
      return (
        <span style={row}>
          <svg width={size * 1.05} height={size * 0.84} viewBox="0 0 40 32" fill={color} aria-hidden="true">
            <rect x="0" y="0" width="20" height="8" /><rect x="6" y="8" width="8" height="24" />
            <rect x="22" y="0" width="18" height="8" /><rect x="22" y="0" width="8" height="32" /><rect x="22" y="24" width="18" height="8" />
          </svg>
          <span style={sans(700, size * 0.95, '-0.01em')}>TechCrunch</span>
        </span>
      );
    case 'usatoday':
      return (
        <span style={row}>
          <span style={disc(size * 0.9)} />
          <span style={sans(800, size * 0.9, '0.02em')}>USA TODAY</span>
        </span>
      );
    case 'forbes':
      return <span style={{ ...row, fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, fontSize: size * 1.25 }}>Forbes</span>;
    case 'wired':
      return <span style={{ ...row, ...sans(800, size * 0.9, '0.18em') }}>WIRED</span>;
    case 'theverge':
      return <span style={{ ...row, ...sans(800, size * 0.9, '0.06em') }}>THE VERGE</span>;
    case 'producthunt':
      return (
        <span style={row}>
          <span style={disc(size * 0.95)}><span style={{ ...sans(800, size * 0.6), color: '#FFFFFF' }}>P</span></span>
          <span style={sans(700, size * 0.95)}>Product Hunt</span>
        </span>
      );
    case 'mashable':
      return <span style={{ ...row, ...sans(800, size * 1.05, '-0.03em') }}>Mashable</span>;
    case 'cnet':
      return <span style={{ ...row, ...sans(800, size * 1.1, '-0.02em') }}>cnet</span>;
    case 'fastcompany':
      return <span style={{ ...row, ...sans(800, size * 0.85, '0.1em') }}>FAST COMPANY</span>;
    case 'businessinsider':
      return <span style={{ ...row, ...sans(800, size * 0.85, '0.04em') }}>BUSINESS INSIDER</span>;
    default:
      return <span style={{ ...row, ...sans(800, size * 0.9, '0.06em'), textTransform: 'uppercase' }}>{name}</span>;
  }
}
```

- [ ] **Step 3: Render the `press` kind**

In the same file, inside the `if (el.kind !== 'text')` block, insert this branch immediately **before** `} else if (el.kind === 'stars') {`:

```tsx
          } else if (el.kind === 'press') {
            const logoSize = (el.fontSize || 14) * sf;
            const names = resolveElementText(el, language).split(',').map((s) => s.trim()).filter(Boolean);
            content = (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22 * sf, whiteSpace: 'nowrap' }}>
                {names.map((n, i) => <PressLogo key={`${n}-${i}`} name={n} size={logoSize} color={el.color || '#1A1A1A'} fam={fam} />)}
              </div>
            );
```

(`fam` is already defined a few lines above as `fontFamilyFor(el.fontFamily || fontFamily || 'Sora')`.)

- [ ] **Step 4: Factory + label**

In `lib/elements.ts`, add to `kindLabel` before `default:`:

```ts
    case 'press': return 'Press logos';
```

and add after `newLaurelEl`:

```ts
/** "As seen in" row of publication wordmarks — comma-separated names, edited in the right panel. */
export function newPressLogos(x = 195, y = 262): SlideElement {
  return { ...base(x, y), kind: 'press', text: 'TechCrunch, USA TODAY, Forbes', fontSize: 14, color: '#1A1A1A' };
}
```

- [ ] **Step 5: Elements panel button**

In `components/editor/LeftRail.tsx`, add `newPressLogos,` to the import list from `@/lib/elements` (after `newLaurelEl,`), and add this entry at the end of the `COMPONENTS` array (after `{ label: 'Laurel rating', ... }`):

```ts
    { label: 'Press logos', make: () => newPressLogos() },
```

- [ ] **Step 6: Inspector controls**

In `components/editor/panels/ElementInspector.tsx`:

(a) Press names are proper nouns and never localized. In the `update` helper (lines 45–53) change the routing condition so `text` on a press element always writes the base:

```ts
    Object.entries(patch).forEach(([k, v]) => {
      if (LOCALIZABLE_TEXT.has(k) && typeof v === 'string' && baseEl.kind !== 'press') setElementLocalizedText(slide.id, baseEl.id, activeLanguage, v, k);
      else baseOnly[k] = v;
    });
```

(b) Add the controls after the `datestrip` block (after line 706, before the closing `</div>` of `ComponentEditor`):

```tsx
      {sel.kind === 'press' && (
        <>
          <TextField value={sel.text || ''} onChange={(v) => update({ text: v })} placeholder="TechCrunch, USA TODAY, Forbes" />
          <Slider label="Logo size" value={sel.fontSize || 14} min={10} max={24} suffix="px" onChange={(v) => update({ fontSize: v })} />
          <div>
            <div className="section-label mb-1.5">Colour</div>
            <ColorPicker color={sel.color || '#1A1A1A'} onChange={(c) => update({ color: c })} />
          </div>
          <p className="text-[11px] text-text-muted">Comma-separated names. TechCrunch, USA TODAY, Forbes, Wired, The Verge, Product Hunt, Mashable, CNET, Fast Company and Business Insider get their signature look; anything else renders as bold caps.</p>
        </>
      )}
```

- [ ] **Step 7: Typecheck**

Run: `cd "/Users/matheusseixeiro/Projects/snapshot app" && npx tsc --noEmit`
Expected: no output (exit 0). If `PressLogo` reports an unused `h`/`w` warning there is none — those variables are shared by every box kind.

- [ ] **Step 8: Commit**

```bash
git add types/index.ts components/templates/ElementsLayer.tsx lib/elements.ts components/editor/LeftRail.tsx components/editor/panels/ElementInspector.tsx
git commit -m "feat(elements): press-logos component (as-seen-in wordmark row)"
```

---

### Task 3: The cover screen in the Norte kits

**Files:**
- Modify: `lib/starterKits.ts:93` (`NORTE_ROLES`), after line 267 (`upgradeNorteScreenV2`), and lines 286–306 (kit `slides`)

- [ ] **Step 1: Retitle the old hero's role**

Replace line 93:

```ts
const NORTE_ROLES: RecipeRole[] = ['use-case', 'use-case', 'differentiator', 'secondary', 'secondary', 'secondary', 'cta'];
```

- [ ] **Step 2: Add the lattice helper + cover builder**

Insert after the closing brace of `upgradeNorteScreenV2` (after line 267) and before `NORTE_COMPONENTS_SLIDES`:

```ts
/**
 * Centers of a rotated square lattice. `cells` are [col, row] offsets from the
 * grid center (−1 / 0 / 1 for a 3×3), `pitch` the cell-to-cell distance and
 * `rotation` the CSS rotation (degrees, clockwise-positive) applied to the wall —
 * pass the same value as each tile's own `rotation` so the tiles stay aligned.
 */
export function rotatedGrid(cx: number, cy: number, pitch: number, rotation: number, cells: [number, number][]): { x: number; y: number }[] {
  const t = (rotation * Math.PI) / 180;
  const cos = Math.cos(t);
  const sin = Math.sin(t);
  return cells.map(([c, r]) => ({
    x: Math.round(cx + pitch * (c * cos - r * sin)),
    y: Math.round(cy + pitch * (c * sin + r * cos)),
  }));
}

const NORTE_COVER_TILE = 134;
const NORTE_COVER_ROTATION = -10;
/** Row-major, center cell skipped (that one is the Norte logo). App-flavoured to match the "Block Apps" headline. */
const NORTE_COVER_EMOJI = ['📺', '📸', '🎵', '💬', '📱', '👻', '🧵', '🎮'];

/**
 * The Refocus-style cover, rebuilt from Norte components — pill headline, bold
 * subline, laurel + stars, press logos and a tilted 3×3 tile wall with the Norte
 * logo in the middle. Spec: docs/superpowers/specs/2026-09-06-norte-cover-screen-design.md
 */
export function norteCoverElements(): RawEl[] {
  const cells: [number, number][] = [[-1, -1], [0, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
  const wall = 'norte-cover-wall';
  let emojiIdx = 0;
  const tiles: RawEl[] = rotatedGrid(195, 596, 148, NORTE_COVER_ROTATION, cells).map((p, i) => {
    const [c, r] = cells[i];
    if (c === 0 && r === 0) {
      return { kind: 'icon', icon: 'mountain', tile: true, x: p.x, y: p.y, size: NORTE_COVER_TILE, radius: Math.round(NORTE_COVER_TILE * 0.28), bg: '#1A1A1A', color: '#F4F2ED', check: true, accent: '#E8923C', rotation: NORTE_COVER_ROTATION, scale: 1, groupId: wall };
    }
    return { kind: 'emoji', emoji: NORTE_COVER_EMOJI[emojiIdx++], tile: true, check: true, x: p.x, y: p.y, size: NORTE_COVER_TILE, rotation: NORTE_COVER_ROTATION, scale: 1, groupId: wall };
  });
  return [
    ...tiles,
    { kind: 'laurel', x: 195, y: 196, rotation: 0, scale: 1, size: 56, color: '#1A1A1A', cardValue: '15 MILLION', cardCaption: 'SUCCESS STORIES', fontSize: 15, cols: 5 },
    { kind: 'press', x: 195, y: 262, rotation: 0, scale: 1, text: 'TechCrunch, USA TODAY, Forbes', fontSize: 14, color: '#1A1A1A' },
    { kind: 'text', x: 195, y: 124, rotation: 0, scale: 1, text: 'Reduce <span style="font-weight:800;color:#1a1a1a">screen time</span> by <span style="font-weight:800;color:#1a1a1a">63%</span>!', fontSize: 14, fontWeight: 500, color: '#6f6c66', align: 'center', width: 340 },
    { kind: 'text', x: 195, y: 80, rotation: 0, scale: 1, text: '[Block] Apps\n& Websites', fontSize: 29, fontWeight: 800, color: '#1a1a1a', align: 'center', width: 360 },
  ];
}

/** Screen 1 of the Norte component kits. */
const NORTE_COVER: StarterKitSlide = {
  role: 'hero',
  template: 'hero',
  title: 'Block Apps & Websites',
  noChrome: true,
  elements: norteCoverElements(),
};
```

Sanity numbers (rotation −10°, pitch 148, center 195/596): top-right cell → (315, 424), top-left → (23, 476), bottom-left → (75, 768). The outer columns and bottom row bleed past the canvas on purpose.

- [ ] **Step 3: Prepend the cover to both component kits**

In `STARTER_KITS`, change the two `slides:` lines:

```ts
    slides: [NORTE_COVER, ...NORTE_V2_SLIDES],
```

for `norte-components-v2`, and

```ts
    slides: [NORTE_COVER, ...NORTE_COMPONENTS_SLIDES],
```

for `norte-components`.

- [ ] **Step 4: Typecheck**

Run: `cd "/Users/matheusseixeiro/Projects/snapshot app" && npx tsc --noEmit`
Expected: no output (exit 0).

- [ ] **Step 5: Commit**

```bash
git add lib/starterKits.ts
git commit -m "feat(norte): Refocus-style cover as screen 1 of the Norte component kits"
```

---

### Task 4: Build + visual verification in the preview

**Files:** none new (fix-ups go back into the files above)

- [ ] **Step 1: Production build**

Run: `cd "/Users/matheusseixeiro/Projects/snapshot app" && npm run build 2>&1 | tail -25`
Expected: `✓ Compiled successfully`, route table printed, exit 0. (The dev server on port 3018 keeps running; `next build` writes to `.next` independently. If the build complains about the dev lock, stop the dev server first with `preview_stop` and restart it afterwards with `preview_start` name `screenforge`.)

- [ ] **Step 2: Apply the kit in the running preview**

In the Browser pane (tab `seed`, http://localhost:3018): click **Templates** → on the **Norte · Components v2** card click **Use template** (no confirm dialog appears while the deck is the untouched default). Expected: the canvas shows 8 screens, screen 1 = the cover.

- [ ] **Step 3: Screenshot + checklist (iPhone 6.9″)**

Take a screenshot of screen 1 and confirm: `Block` sits in a dark pill, "& Websites" on line 2; the subline has bold black "screen time" / "63%"; the laurel shows `15 MILLION / SUCCESS STORIES` + 5 stars; press row reads TC TechCrunch · ● USA TODAY · Forbes; the 3×3 wall is tilted −10°, bleeds off the sides/bottom, has black check badges, and the dark Norte logo tile with the orange check sits in the middle.

- [ ] **Step 4: Interaction checks**

- Click a tile → the whole wall (9 elements) is selected (group). Drag → all move.
- Double-click a tile → inline emoji editor opens; Escape.
- Click the laurel → inspector shows "Value size" and "Stars" sliders; drag Stars to 3 → three stars.
- Click the press row → inspector shows the names field; append `, Wired` → a fourth wordmark appears.

- [ ] **Step 5: iPad check**

Switch the Preview dropdown to an iPad size and screenshot: the cover scales to fit (contain) and stays centered, nothing cut off except the intentional tile bleed.

- [ ] **Step 6: Fix anything off, re-run `npx tsc --noEmit`, commit fix-ups**

```bash
git add components/templates/ElementsLayer.tsx components/editor/panels/ElementInspector.tsx lib/starterKits.ts lib/elements.ts
git commit -m "fix(norte): cover screen polish after visual check"
```

(Skip the commit if nothing changed.)

---

## Self-review

- **Spec coverage:** layout table → Task 3; laurel stars (render, inspector, default) → Task 1; press kind (type, render, factory, palette, inspector, non-localized) → Task 2; kit insertion + role change → Task 3; verification list → Task 4. `norte-designs` / `norte-store` untouched ✓.
- **Placeholders:** none — every code step carries the code.
- **Type consistency:** `rotatedGrid(cx, cy, pitch, rotation, cells)` used with the same signature in Task 3; `newPressLogos()` defined in Task 2 Step 4 and imported in Step 5; `PressLogo` props `{ name, size, color, fam }` match the call site; `cols` on laurel read in Task 1 render + inspector + factory.
