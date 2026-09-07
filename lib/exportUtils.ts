'use client';

import type { Slide, Language } from '@/types';
import { DEVICE_SIZES, getDevice } from './deviceSizes';
import { getLocale } from './presets';
import { pad } from './utils';

/** Strip characters that are illegal/awkward in file paths. */
function safe(s: string): string {
  return (s || '').replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim();
}

/** Lowercased, unquoted family name for set lookup. */
function normFamily(f: string): string {
  return f.trim().replace(/^["']|["']$/g, '').toLowerCase();
}

/**
 * Build a self-contained @font-face stylesheet by inlining ONLY the
 * SAME-ORIGIN font files (next/font woff2) that are actually USED in the slide,
 * as data URIs. The app ships ~350 @font-face rules (11 families × weights ×
 * unicode subsets); inlining all of them would bloat every frame to ~10 MB and
 * stall the export. We deliberately do NOT fetch cross-origin font CSS (Google
 * Fonts @import) — that hangs with no timeout; CJK/Arabic fall back to the OS
 * system fonts, which render those scripts correctly. Computed once per export.
 */
async function buildFontEmbedCSS(root: Element): Promise<string> {
  if (typeof document === 'undefined') return '';

  // 1) Which font families are actually rendered in this subtree?
  const used = new Set<string>();
  const nodes: Element[] = [root, ...Array.from(root.querySelectorAll('*'))];
  for (const n of nodes) {
    const ff = getComputedStyle(n).fontFamily;
    if (ff) ff.split(',').forEach((f) => used.add(normFamily(f)));
  }

  // 2) Collect matching @font-face rules + their same-origin font URLs.
  const faceRules: { cssText: string; urls: { orig: string; abs: string }[] }[] = [];
  const urlSet = new Set<string>();
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList | null = null;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // cross-origin sheet — not readable, skip
    }
    if (!rules) continue;
    for (const rule of Array.from(rules)) {
      const cssText = (rule as CSSRule).cssText;
      if (!cssText || !cssText.toLowerCase().startsWith('@font-face')) continue;
      const famMatch = cssText.match(/font-family:\s*([^;]+);/i);
      if (!famMatch || !used.has(normFamily(famMatch[1]))) continue; // only used families
      const urls: { orig: string; abs: string }[] = [];
      const urlRe = /url\(["']?([^"')]+)["']?\)/g;
      let m: RegExpExecArray | null;
      while ((m = urlRe.exec(cssText)) !== null) {
        const u = m[1];
        if (u.startsWith('data:')) continue;
        try {
          const abs = new URL(u, sheet.href || location.href);
          if (abs.origin !== location.origin) continue; // only inline same-origin
          urls.push({ orig: u, abs: abs.href });
          urlSet.add(abs.href);
        } catch {
          /* skip */
        }
      }
      faceRules.push({ cssText, urls });
    }
  }

  // 3) Fetch every unique font file in parallel → data URI.
  const cache = new Map<string, string>();
  await Promise.all(
    Array.from(urlSet).map(async (u) => {
      try {
        const resp = await fetch(u);
        const blob = await resp.blob();
        const dataUrl: string = await new Promise((res, rej) => {
          const fr = new FileReader();
          fr.onload = () => res(fr.result as string);
          fr.onerror = () => rej(fr.error);
          fr.readAsDataURL(blob);
        });
        cache.set(u, dataUrl);
      } catch {
        /* skip this file */
      }
    }),
  );

  // 4) Rewrite each rule's url() to the inlined data URI.
  return faceRules
    .map(({ cssText, urls }) => {
      let out = cssText;
      for (const { orig, abs } of urls) {
        const data = cache.get(abs);
        if (data) out = out.split(orig).join(data);
      }
      return out;
    })
    .join('\n');
}

export interface ExportConfig {
  selectedDeviceIds: string[];
  selectedLanguages: Language[];
  format: 'png' | 'jpeg';
  quality: number;
  appName: string;
}

export interface ExportProgress {
  total: number;
  done: number;
  current: string;
}

type RenderFn = (slide: Slide, deviceId: string, language: Language, width: number, height: number) => Promise<HTMLElement>;

export async function runExport(
  slides: Slide[],
  config: ExportConfig,
  renderToElement: RenderFn,
  onProgress: (p: ExportProgress) => void,
): Promise<Blob> {
  // Faithful capture: html-to-image serializes the REAL rendered DOM via an SVG
  // <foreignObject>, so pills, emoji tiles, gradients, shadows, flex centring and
  // fonts come out exactly as on screen (unlike html2canvas, which re-paints in JS).
  // Use the low-level toSvg (DOM → SVG <foreignObject> data URL). We rasterize it
  // ourselves with a plain image onload — html-to-image's own toCanvas uses
  // img.decode(), which HANGS on foreignObject SVGs in some Chromium builds.
  const { toSvg } = await import('html-to-image');
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  let fontEmbedCSS = ''; // computed once (expensive) then reused for every image

  // Make sure web fonts (incl. CJK/Arabic Noto) are loaded before rasterizing.
  if (typeof document !== 'undefined' && (document as any).fonts?.ready) {
    try {
      await (document as any).fonts.ready;
    } catch {
      /* non-fatal */
    }
  }

  const total = config.selectedDeviceIds.length * config.selectedLanguages.length * slides.length;
  let done = 0;
  let written = 0;
  const ext = config.format === 'jpeg' ? 'jpg' : 'png';
  const root = safe(config.appName) || 'screenshots';

  // Language-first layout — matches how App Store Connect / Play Console upload
  // (pick a localization, then drop in each device size). Readable folder names.
  for (const language of config.selectedLanguages) {
    const loc = getLocale(language);
    const langFolder = `${safe(loc?.display || language)} (${language})`;

    for (const deviceId of config.selectedDeviceIds) {
      const device = getDevice(deviceId);
      if (!device) continue;
      const deviceFolder = `${safe(device.label)} ${device.width}x${device.height}`;
      const storeFolder = device.platform === 'ios' ? 'App Store (iOS)' : 'Google Play (Android)';

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const label = `${loc?.display || language} · ${device.label} · ${i + 1}/${slides.length}`;
        onProgress({ total, done, current: label });

        try {
          const el = await renderToElement(slide, deviceId, language, device.width, device.height);

          // Inline the used same-origin fonts once and reuse for every frame so
          // big exports stay fast (no per-frame, no remote, no-hang fetching).
          if (fontEmbedCSS === '') {
            try {
              fontEmbedCSS = (await buildFontEmbedCSS(el)) || ' ';
            } catch {
              fontEmbedCSS = ' '; // attempted; fall back to system rendering
            }
          }

          // Passing a non-null fontEmbedCSS makes html-to-image use it verbatim
          // and SKIP its own remote font fetching (the part that hangs).
          const svgUrl = await toSvg(el, {
            width: device.width,
            height: device.height,
            cacheBust: true,
            fontEmbedCSS, // always a string ('  ' fallback) → never triggers remote fetch
          });

          // Rasterize via plain onload (NOT img.decode → avoids the hang).
          const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const im = new Image();
            const t = setTimeout(() => reject(new Error('SVG image load timeout')), 15000);
            im.onload = () => {
              clearTimeout(t);
              resolve(im);
            };
            im.onerror = () => {
              clearTimeout(t);
              reject(new Error('SVG image failed to load'));
            };
            im.src = svgUrl;
          });

          const canvas = document.createElement('canvas');
          canvas.width = device.width;
          canvas.height = device.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('no 2d context');
          if (config.format === 'jpeg') {
            // JPEG has no alpha — paint a white backdrop so transparent areas
            // don't come out black.
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, device.width, device.height);
          }
          ctx.drawImage(img, 0, 0, device.width, device.height);

          const blob: Blob = await new Promise((resolve, reject) => {
            canvas.toBlob(
              (b) => (b ? resolve(b) : reject(new Error('toBlob returned null'))),
              config.format === 'jpeg' ? 'image/jpeg' : 'image/png',
              config.format === 'jpeg' ? config.quality / 100 : undefined,
            );
          });

          const path = `${root}/${langFolder}/${storeFolder}/${deviceFolder}/${pad(i + 1)}_screen.${ext}`;
          zip.file(path, blob);
          written++;
        } catch (err) {
          console.error('[export] failed:', label, err);
        } finally {
          done++;
          onProgress({ total, done, current: label });
        }
      }
    }
  }

  // Helpful manifest at the root.
  const readme =
    `${config.appName || 'App'} — App Store / Google Play screenshots\n` +
    `Generated by ScreenForge\n\n` +
    `Structure:\n` +
    `  <Language (code)>/<Store>/<Device WxH>/NN_screen.${ext}\n\n` +
    `Languages: ${config.selectedLanguages.map((l) => `${getLocale(l)?.display || l} (${l})`).join(', ')}\n` +
    `Devices: ${config.selectedDeviceIds.map((d) => getDevice(d)?.label).filter(Boolean).join(', ')}\n` +
    `Screens per set: ${slides.length}\n` +
    `Total images: ${written} of ${total}\n\n` +
    `Upload tips:\n` +
    `• App Store Connect → your app → a localization → each device size → drag that folder's images in order.\n` +
    `• Google Play Console → Store listing → a language → Phone/Tablet → upload the matching folder.\n` +
    `• Files are zero-padded (01, 02, …) so they keep order.\n`;
  zip.file(`${root}/README.txt`, readme);

  return zip.generateAsync({ type: 'blob' });
}

export function listAvailableDevicesByPlatform(platform: 'ios' | 'android' | 'both') {
  if (platform === 'both') return DEVICE_SIZES;
  return DEVICE_SIZES.filter((d) => d.platform === platform);
}
