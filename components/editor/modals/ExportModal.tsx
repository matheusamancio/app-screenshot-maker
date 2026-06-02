'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { saveAs } from 'file-saver';
import Modal from '../../ui/Modal';
import { useProjectStore } from '@/store/projectStore';
import { DEVICE_SIZES, getDevice } from '@/lib/deviceSizes';
import { LANGUAGES } from '@/lib/presets';
import { runExport, ExportProgress } from '@/lib/exportUtils';
import TemplateRenderer from '../../templates/TemplateRenderer';
import type { Language, Slide } from '@/types';
import { useToast } from '../../ui/Toast';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ExportModal({ open, onClose }: Props) {
  const slides = useProjectStore((s) => s.slides);
  const platform = useProjectStore((s) => s.platform);
  const enabledLanguages = useProjectStore((s) => s.enabledLanguages);
  const appName = useProjectStore((s) => s.appName);
  const { toast } = useToast();

  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [selectedLangs, setSelectedLangs] = useState<Language[]>([]);
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [quality, setQuality] = useState(90);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);

  const sandboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const required = DEVICE_SIZES.filter((d) => d.required && (platform === 'both' || d.platform === platform)).map((d) => d.id);
    setSelectedDevices(required);
    setSelectedLangs(enabledLanguages);
  }, [open, platform, enabledLanguages]);

  const visibleDevices = useMemo(() => {
    if (platform === 'both') return DEVICE_SIZES;
    return DEVICE_SIZES.filter((d) => d.platform === platform);
  }, [platform]);

  const grouped = useMemo(() => {
    const ios = visibleDevices.filter((d) => d.platform === 'ios');
    const android = visibleDevices.filter((d) => d.platform === 'android');
    return { ios, android };
  }, [visibleDevices]);

  const toggleDevice = (id: string) => {
    setSelectedDevices((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const toggleLang = (l: Language) => {
    setSelectedLangs((prev) => (prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]));
  };

  const renderSlide = async (slide: Slide, deviceId: string, language: Language, width: number, height: number): Promise<HTMLElement> => {
    if (!sandboxRef.current) throw new Error('No sandbox');
    const host = sandboxRef.current;
    host.innerHTML = '';

    const stage = document.createElement('div');
    stage.style.width = `${width}px`;
    stage.style.height = `${height}px`;
    stage.style.position = 'absolute';
    stage.style.left = '0';
    stage.style.top = '0';
    stage.style.background = '#fff';
    host.appendChild(stage);

    const root: Root = createRoot(stage);
    root.render(<TemplateRenderer slide={slide} width={width} height={height} language={language} />);

    // Allow paint
    await new Promise((r) => setTimeout(r, 60));

    // Wait for any images to load
    const imgs = Array.from(stage.querySelectorAll('img'));
    await Promise.all(
      imgs.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          setTimeout(() => resolve(), 1500);
        });
      }),
    );
    await new Promise((r) => setTimeout(r, 30));
    return stage;
  };

  const handleExport = async () => {
    if (selectedDevices.length === 0) {
      toast('Select at least one device size', 'error');
      return;
    }
    if (selectedLangs.length === 0) {
      toast('Select at least one language', 'error');
      return;
    }
    setExporting(true);
    setProgress({ total: 0, done: 0, current: 'Preparing…' });

    try {
      const blob = await runExport(
        slides,
        { selectedDeviceIds: selectedDevices, selectedLanguages: selectedLangs, format, quality, appName },
        renderSlide,
        (p) => setProgress(p),
      );
      const filename = `${(appName || 'screenforge').replace(/\s+/g, '-').toLowerCase()}-export.zip`;
      saveAs(blob, filename);
      toast(`Exported ${progress?.total || ''} screenshots`, 'success');
      onClose();
    } catch (err) {
      console.error(err);
      toast('Export failed — see console', 'error');
    } finally {
      setExporting(false);
      setProgress(null);
      if (sandboxRef.current) sandboxRef.current.innerHTML = '';
    }
  };

  const pct = progress ? Math.round((progress.done / Math.max(1, progress.total)) * 100) : 0;

  return (
    <>
      <Modal
        open={open}
        onClose={exporting ? () => {} : onClose}
        title="Export screenshots"
        description={`${slides.length} slide${slides.length !== 1 ? 's' : ''} · ${appName || 'My App'}`}
        size="lg"
        footer={
          <>
            <button
              onClick={onClose}
              disabled={exporting}
              className="h-9 px-4 rounded-md bg-muted border border-border-default text-secondary text-sm font-medium hover:bg-overlay disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="h-9 px-4 rounded-md bg-norte-primary text-white text-sm font-sora font-semibold hover:bg-norte-primary-hover disabled:opacity-60 flex items-center gap-2"
            >
              {exporting ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-white/40 border-t-white rounded-full spin" />
                  Exporting…
                </>
              ) : (
                <>Export all — Download ZIP ↓</>
              )}
            </button>
          </>
        }
      >
        <div className="space-y-5">
          {(() => {
            const n = slides.length;
            if (n >= 5 && n <= 6) return null;
            const isWarn = n >= 2 && n <= 8;
            const isErr = n < 2 || n > 8;
            const tone = isErr
              ? 'bg-error/10 border-error/40 text-error'
              : 'bg-norte-secondary-light border-norte-secondary/40 text-norte-secondary';
            const msg = isErr
              ? n < 2
                ? `Play Store requires at least 2 phone screenshots. You have ${n}.`
                : `Play Store accepts up to 8 phone screenshots. You have ${n}.`
              : isWarn
              ? n < 5
                ? `${n} slides — most top apps ship 5–6. Consider adding ${5 - n} more.`
                : `${n} slides — most top apps ship 5–6. The first 3 carry most weight.`
              : '';
            return (
              <div className={`text-xs px-3 py-2 rounded-md border ${tone}`}>{msg}</div>
            );
          })()}
          {grouped.ios.length > 0 && (
            <div>
              <div className="section-label mb-2">iOS — App Store</div>
              <div className="grid grid-cols-2 gap-1.5">
                {grouped.ios.map((d) => (
                  <DeviceCheckbox
                    key={d.id}
                    label={d.label}
                    sub={`${d.width} × ${d.height}`}
                    required={d.required}
                    checked={selectedDevices.includes(d.id)}
                    onChange={() => toggleDevice(d.id)}
                  />
                ))}
              </div>
            </div>
          )}
          {grouped.android.length > 0 && (
            <div>
              <div className="section-label mb-2">Android — Google Play</div>
              <div className="grid grid-cols-2 gap-1.5">
                {grouped.android.map((d) => (
                  <DeviceCheckbox
                    key={d.id}
                    label={d.label}
                    sub={`${d.width} × ${d.height}`}
                    required={d.required}
                    checked={selectedDevices.includes(d.id)}
                    onChange={() => toggleDevice(d.id)}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="section-label mb-2">Languages</div>
            <div className="flex flex-wrap gap-1.5">
              {LANGUAGES.filter((l) => enabledLanguages.includes(l.code)).map((l) => (
                <label
                  key={l.code}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium border cursor-pointer ${
                    selectedLangs.includes(l.code)
                      ? 'bg-norte-primary-light border-norte-primary text-norte-primary'
                      : 'bg-muted border-border-default text-secondary hover:bg-overlay'
                  }`}
                >
                  <input type="checkbox" className="sr-only" checked={selectedLangs.includes(l.code)} onChange={() => toggleLang(l.code)} />
                  {selectedLangs.includes(l.code) ? '✓ ' : ''}
                  {l.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="section-label mb-2">Format</div>
            <div className="flex items-center gap-3">
              <div className="flex bg-overlay rounded-md p-1 border border-border-default">
                {(['png', 'jpeg'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`px-3 py-1.5 text-xs rounded font-medium uppercase ${
                      format === f ? 'bg-surface text-norte-primary shadow-sm' : 'text-text-muted hover:text-secondary'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              {format === 'jpeg' && (
                <div className="flex items-center gap-2 flex-1 max-w-xs">
                  <span className="text-xs text-text-muted">Quality</span>
                  <input type="range" min={50} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} />
                  <span className="text-xs text-secondary font-mono w-8 text-right">{quality}%</span>
                </div>
              )}
            </div>
          </div>

          {exporting && progress && (
            <div className="bg-overlay border border-border-default rounded-md p-3 space-y-2">
              <div className="text-xs text-secondary">
                Generating {progress.current} ({progress.done} / {progress.total})
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-norte-primary transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Off-screen render sandbox */}
      <div
        ref={sandboxRef}
        aria-hidden
        style={{
          position: 'fixed',
          left: '-200000px',
          top: 0,
          width: 0,
          height: 0,
          overflow: 'visible',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />
    </>
  );
}

function DeviceCheckbox({
  label,
  sub,
  required,
  checked,
  onChange,
}: {
  label: string;
  sub: string;
  required?: boolean;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md border cursor-pointer transition-all ${
        checked ? 'border-norte-primary bg-norte-primary-light' : 'border-border-default bg-overlay hover:border-border-strong'
      }`}
    >
      <input type="checkbox" className="accent-[var(--norte-primary)]" checked={checked} onChange={onChange} />
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-medium ${checked ? 'text-norte-primary' : 'text-secondary'}`}>{label}</div>
        <div className="text-[10px] text-text-muted font-mono">{sub}</div>
      </div>
      {required && (
        <span className="text-[9px] uppercase tracking-wider text-norte-secondary font-semibold bg-norte-secondary-light px-1.5 py-0.5 rounded">
          Required
        </span>
      )}
    </label>
  );
}
