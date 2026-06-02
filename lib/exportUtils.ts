'use client';

import type { Slide, Language } from '@/types';
import { DEVICE_SIZES, getDevice } from './deviceSizes';
import { pad } from './utils';

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
  const html2canvas = (await import('html2canvas')).default;
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

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

  for (const deviceId of config.selectedDeviceIds) {
    const device = getDevice(deviceId);
    if (!device) continue;
    const platformFolder = device.platform;
    const deviceFolder = device.id;

    for (const language of config.selectedLanguages) {
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const label = `${device.label} · ${language.toUpperCase()} · slide ${i + 1}`;
        onProgress({ total, done, current: label });

        const el = await renderToElement(slide, deviceId, language, device.width, device.height);

        try {
          const canvas = await html2canvas(el, {
            width: device.width,
            height: device.height,
            scale: 1,
            useCORS: true,
            allowTaint: false,
            backgroundColor: null,
            logging: false,
          });

          const blob: Blob = await new Promise((resolve) => {
            canvas.toBlob(
              (b) => resolve(b as Blob),
              config.format === 'jpeg' ? 'image/jpeg' : 'image/png',
              config.format === 'jpeg' ? config.quality / 100 : undefined,
            );
          });

          const ext = config.format === 'jpeg' ? 'jpg' : 'png';
          const path = `screenforge-export/${platformFolder}/${deviceFolder}/${language}/slide_${pad(i + 1)}.${ext}`;
          zip.file(path, blob);
        } catch (err) {
          console.error('export error', err);
        } finally {
          done++;
          onProgress({ total, done, current: label });
        }
      }
    }
  }

  return zip.generateAsync({ type: 'blob' });
}

export function listAvailableDevicesByPlatform(platform: 'ios' | 'android' | 'both') {
  if (platform === 'both') return DEVICE_SIZES;
  return DEVICE_SIZES.filter((d) => d.platform === platform);
}
