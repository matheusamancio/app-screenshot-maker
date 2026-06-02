'use client';

import React, { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import Modal from '../../ui/Modal';
import Dropdown from '../../ui/Dropdown';
import { useProjectStore } from '@/store/projectStore';
import { STARTER_KITS, StarterKit, RECIPE_ROLES } from '@/lib/starterKits';
import TemplateRenderer from '../../templates/TemplateRenderer';
import { fileToBase64 } from '@/lib/utils';
import { useToast } from '../../ui/Toast';
import type { Slide, SlideRole } from '@/types';
import {
  VOICES,
  ROLE_GUIDANCE,
  generatePatternCopy,
  previewHeroFor,
  type VoiceId,
} from '@/lib/copyPatterns';

interface Props {
  open: boolean;
  onClose: () => void;
}

type Step = 'describe' | 'template' | 'screenshots' | 'generate';
type Mode = 'ai' | 'pattern';

interface AISlide {
  role: SlideRole;
  title: string;
  subtitle: string;
  showSubtitle: boolean;
}

function kitToPreviewSlide(kit: StarterKit, idx: number): Slide {
  const ks = kit.slides[idx % kit.slides.length];
  return {
    id: `${kit.id}-${idx}`,
    screenshot: null,
    template: ks.template,
    background: kit.background,
    title: {
      text: ks.title,
      subtitle: ks.subtitle || '',
      showSubtitle: !!ks.showSubtitle,
      fontFamily: kit.title.fontFamily,
      fontSize: kit.title.fontSize,
      fontWeight: kit.title.fontWeight,
      color: kit.title.color,
      subtitleColor: kit.title.subtitleColor,
      subtitleFontSize: kit.title.subtitleFontSize,
      alignment: kit.title.alignment,
      position: 'top',
      floatingPosition: 'top',
      layer: { visible: true, opacity: 1, locked: false },
    },
    device: {
      frameType: kit.device.frameType,
      frameStyle: kit.device.frameStyle,
      orientation: 'portrait',
      scale: kit.device.scale,
      verticalPosition: 'center',
      layer: { visible: true, opacity: 1, locked: false },
    },
    overlayImage: { imageBase64: null, fit: 'contain', opacity: 1, verticalPosition: 'center', layer: { visible: true, opacity: 1, locked: false } },
    localizations: {},
    linkedToGlobals: true,
  };
}

export default function AIGenerateModal({ open, onClose }: Props) {
  const applyAIGeneration = useProjectStore((s) => s.applyAIGeneration);
  const setAppName = useProjectStore((s) => s.setAppName);
  const { toast } = useToast();

  const [step, setStep] = useState<Step>('describe');
  const [mode, setMode] = useState<Mode>('pattern');
  const [appName, setAppNameLocal] = useState('');
  const [description, setDescription] = useState('');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState('confident, direct');
  const [voiceId, setVoiceId] = useState<VoiceId>('bold');
  const [kitId, setKitId] = useState<string>('norte');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setStep('describe');
    setMode('pattern');
    setAppNameLocal('');
    setDescription('');
    setAudience('');
    setTone('confident, direct');
    setVoiceId('bold');
    setKitId('norte');
    setScreenshots([]);
    setError(null);
    setGenerating(false);
  };

  const handleClose = () => {
    if (generating) return;
    onClose();
    setTimeout(reset, 300);
  };

  const onDrop = async (files: File[]) => {
    const imgs = files.filter((f) => f.type.startsWith('image/'));
    if (imgs.length === 0) return;
    const b64s = await Promise.all(imgs.map((f) => fileToBase64(f)));
    setScreenshots((prev) => [...prev, ...b64s]);
  };

  const removeScreenshot = (i: number) => setScreenshots((prev) => prev.filter((_, idx) => idx !== i));
  const moveScreenshot = (i: number, dir: -1 | 1) => {
    setScreenshots((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const generate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const kit = STARTER_KITS.find((k) => k.id === kitId);
      if (!kit) throw new Error('Kit not found');

      let aiSlides: AISlide[];
      if (mode === 'pattern') {
        const roles = kit.slides.map((s) => (s.role || 'secondary') as SlideRole);
        aiSlides = generatePatternCopy({
          appName,
          description,
          audience,
          voiceId,
          roles,
        });
      } else {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ appName, description, audience, tone, kitId }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Request failed (${res.status})`);
        }
        const data = await res.json();
        aiSlides = data.slides;
      }

      const padded: (string | null)[] = [];
      for (let i = 0; i < kit.slides.length; i++) padded.push(screenshots[i] || null);

      if (appName.trim()) setAppName(appName.trim());
      applyAIGeneration(kitId, aiSlides, padded);
      const verb = mode === 'pattern' ? 'Built' : 'Generated';
      toast(`${verb} ${aiSlides.length} slides — edit any line in the panel on the right`, 'success');
      handleClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setGenerating(false);
    }
  };

  const stepIndex = (['describe', 'template', 'screenshots', 'generate'] as Step[]).indexOf(step);
  const canNextDescribe = appName.trim().length > 0 && description.trim().length > 20;
  const selectedKit = STARTER_KITS.find((k) => k.id === kitId);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Build a deck"
      description="Describe your app, pick a style, drop your screenshots. Pattern-based suggestions or AI-written copy — your choice."
      size="lg"
      footer={
        <>
          {step !== 'describe' && (
            <button
              onClick={() => {
                const order: Step[] = ['describe', 'template', 'screenshots', 'generate'];
                const idx = order.indexOf(step);
                if (idx > 0) setStep(order[idx - 1]);
              }}
              disabled={generating}
              className="h-9 px-3 rounded-md bg-muted border border-border-default text-secondary text-sm font-medium hover:bg-overlay disabled:opacity-50"
            >
              ← Back
            </button>
          )}
          <div className="flex-1" />
          {step === 'describe' && (
            <button
              onClick={() => setStep('template')}
              disabled={!canNextDescribe}
              className="h-9 px-4 rounded-md bg-norte-primary text-white text-sm font-sora font-semibold hover:bg-norte-primary-hover disabled:opacity-50"
            >
              Next: Pick template →
            </button>
          )}
          {step === 'template' && (
            <button
              onClick={() => setStep('screenshots')}
              className="h-9 px-4 rounded-md bg-norte-primary text-white text-sm font-sora font-semibold hover:bg-norte-primary-hover"
            >
              Next: Upload screenshots →
            </button>
          )}
          {step === 'screenshots' && (
            <button
              onClick={() => setStep('generate')}
              className="h-9 px-4 rounded-md bg-norte-primary text-white text-sm font-sora font-semibold hover:bg-norte-primary-hover"
            >
              Next: Review & generate →
            </button>
          )}
          {step === 'generate' && (
            <button
              onClick={generate}
              disabled={generating}
              className="h-9 px-4 rounded-md bg-norte-primary text-white text-sm font-sora font-semibold hover:bg-norte-primary-hover disabled:opacity-60 flex items-center gap-2"
            >
              {generating ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-white/40 border-t-white rounded-full spin" />
                  {mode === 'ai' ? 'Generating with Claude…' : 'Building deck…'}
                </>
              ) : mode === 'ai' ? (
                <>✦ Generate with Claude</>
              ) : (
                <>◇ Build with patterns</>
              )}
            </button>
          )}
        </>
      }
    >
      <div className="space-y-5">
        <ModeToggle mode={mode} onChange={setMode} />
        <Stepper current={stepIndex} />

        {step === 'describe' && (
          <DescribeStep
            mode={mode}
            appName={appName}
            description={description}
            audience={audience}
            tone={tone}
            voiceId={voiceId}
            onAppNameChange={setAppNameLocal}
            onDescriptionChange={setDescription}
            onAudienceChange={setAudience}
            onToneChange={setTone}
            onVoiceChange={setVoiceId}
          />
        )}

        {step === 'template' && (
          <TemplateStep kitId={kitId} onSelect={setKitId} />
        )}

        {step === 'screenshots' && selectedKit && (
          <ScreenshotsStep
            kit={selectedKit}
            screenshots={screenshots}
            onDrop={onDrop}
            onRemove={removeScreenshot}
            onMove={moveScreenshot}
          />
        )}

        {step === 'generate' && selectedKit && (
          <ReviewStep
            mode={mode}
            appName={appName}
            description={description}
            audience={audience}
            tone={tone}
            voiceId={voiceId}
            kit={selectedKit}
            screenshots={screenshots}
            error={error}
          />
        )}
      </div>
    </Modal>
  );
}

function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="bg-overlay border border-border-default rounded-md p-1 flex gap-1">
      <button
        onClick={() => onChange('pattern')}
        className={`flex-1 h-9 px-3 rounded text-sm font-sora font-semibold transition-all flex items-center justify-center gap-1.5 ${
          mode === 'pattern' ? 'bg-surface text-primary shadow-sm' : 'text-text-muted hover:text-secondary'
        }`}
      >
        <span className="text-base leading-none">◇</span>
        Pattern-based
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${mode === 'pattern' ? 'bg-success-light text-success' : 'bg-muted text-text-muted'}`}>
          Free · instant
        </span>
      </button>
      <button
        onClick={() => onChange('ai')}
        className={`flex-1 h-9 px-3 rounded text-sm font-sora font-semibold transition-all flex items-center justify-center gap-1.5 ${
          mode === 'ai' ? 'bg-surface text-primary shadow-sm' : 'text-text-muted hover:text-secondary'
        }`}
      >
        <span className="text-base leading-none">✦</span>
        AI · Claude
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${mode === 'ai' ? 'bg-norte-primary-light text-norte-primary' : 'bg-muted text-text-muted'}`}>
          Needs API key
        </span>
      </button>
    </div>
  );
}

function Stepper({ current }: { current: number }) {
  const labels = ['Describe', 'Template', 'Screenshots', 'Review'];
  return (
    <div className="flex items-center gap-2">
      {labels.map((l, i) => (
        <React.Fragment key={l}>
          <div
            className={`flex items-center gap-1.5 ${i === current ? 'text-norte-primary' : i < current ? 'text-success' : 'text-text-muted'}`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold ${
                i === current ? 'bg-norte-primary text-white' : i < current ? 'bg-success text-white' : 'bg-muted text-text-muted'
              }`}
            >
              {i < current ? '✓' : i + 1}
            </span>
            <span className="text-xs font-medium">{l}</span>
          </div>
          {i < labels.length - 1 && <div className="flex-1 h-px bg-border-default" />}
        </React.Fragment>
      ))}
    </div>
  );
}

interface DescribeProps {
  mode: Mode;
  appName: string;
  description: string;
  audience: string;
  tone: string;
  voiceId: VoiceId;
  onAppNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onAudienceChange: (v: string) => void;
  onToneChange: (v: string) => void;
  onVoiceChange: (v: VoiceId) => void;
}

function DescribeStep({ mode, appName, description, audience, tone, voiceId, onAppNameChange, onDescriptionChange, onAudienceChange, onToneChange, onVoiceChange }: DescribeProps) {
  return (
    <div className="space-y-4">
      <div>
        <div className="section-label mb-1.5">App name *</div>
        <input
          value={appName}
          onChange={(e) => onAppNameChange(e.target.value)}
          placeholder="e.g. Timecap"
          className="w-full h-9 px-3 bg-overlay border border-border-default rounded-md text-sm"
        />
      </div>
      <div>
        <div className="section-label mb-1.5">What does your app do? *</div>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={4}
          placeholder="A simple habit tracker that uses screen-time blocks to help you stick to good habits and drop bad ones. Designed for ADHD users — one tap to log, no friction."
          className="w-full px-3 py-2 bg-overlay border border-border-default rounded-md text-sm resize-none"
        />
        <div className="text-[11px] text-text-muted mt-1">
          {description.length} characters · {mode === 'pattern' ? 'we extract a verb + noun from this to fill the patterns' : 'aim for 30+ to give Claude enough to work with'}
        </div>
      </div>
      <div>
        <div className="section-label mb-1.5">Target audience</div>
        <input
          value={audience}
          onChange={(e) => onAudienceChange(e.target.value)}
          placeholder="e.g. busy professionals, ADHD minds, design teams"
          className="w-full h-9 px-3 bg-overlay border border-border-default rounded-md text-sm"
        />
      </div>

      {mode === 'pattern' ? (
        <VoicePicker voiceId={voiceId} appName={appName} onChange={onVoiceChange} />
      ) : (
        <div>
          <div className="section-label mb-1.5">Tone</div>
          <Dropdown
            value={tone}
            onChange={onToneChange}
            options={[
              { value: 'confident, direct', label: 'Confident · direct' },
              { value: 'warm, friendly', label: 'Warm · friendly' },
              { value: 'playful, energetic', label: 'Playful · energetic' },
              { value: 'minimal, premium', label: 'Minimal · premium' },
              { value: 'bold, urgent', label: 'Bold · urgent' },
              { value: 'calm, reassuring', label: 'Calm · reassuring' },
            ]}
          />
        </div>
      )}
    </div>
  );
}

function VoicePicker({ voiceId, appName, onChange }: { voiceId: VoiceId; appName: string; onChange: (v: VoiceId) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="section-label">Voice · how it should sound</div>
        <div className="text-[11px] text-text-muted">Live preview using your app name</div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {VOICES.map((v) => {
          const active = v.id === voiceId;
          const sample = previewHeroFor(v.id, appName || 'your app');
          return (
            <button
              key={v.id}
              onClick={() => onChange(v.id)}
              className={`text-left p-3 rounded-md border transition-all ${
                active ? 'border-norte-primary bg-norte-primary-light ring-2 ring-norte-primary/30' : 'border-border-default bg-overlay hover:border-border-strong'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-3 h-3 rounded-full shadow-sm" style={{ background: v.swatch }} />
                <span className="font-sora font-semibold text-sm text-primary">{v.label}</span>
              </div>
              <div className="text-[11px] text-text-muted mb-2 leading-snug">{v.tagline}</div>
              <div
                className="text-[12px] font-sora font-bold text-primary leading-tight whitespace-pre-line bg-surface rounded px-2 py-1.5 border border-border-default"
                style={{ minHeight: 40 }}
              >
                {sample}
              </div>
              <div className="text-[10px] text-text-muted mt-1.5 leading-snug">{v.bestFor}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TemplateStep({ kitId, onSelect }: { kitId: string; onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {STARTER_KITS.map((kit) => {
        const active = kit.id === kitId;
        return (
          <button
            key={kit.id}
            onClick={() => onSelect(kit.id)}
            className={`p-3 rounded-lg border text-left transition-all ${
              active ? 'border-norte-primary bg-norte-primary-light ring-2 ring-norte-primary/30' : 'border-border-default bg-overlay hover:border-border-strong'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-4 h-4 rounded shadow-sm" style={{ background: kit.swatch }} />
              <div className="font-sora font-semibold text-sm text-primary">{kit.name}</div>
              <span className="ml-auto text-[9px] font-semibold uppercase tracking-wider bg-success-light text-success px-1.5 py-0.5 rounded">
                {kit.slides.length} slides
              </span>
            </div>
            <div className="text-[11px] text-text-muted mb-2">{kit.tagline}</div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {kit.slides.slice(0, 4).map((_, i) => {
                const w = 56;
                const h = 100;
                const innerW = 390;
                const innerH = 844;
                const scale = w / innerW;
                const slide = kitToPreviewSlide(kit, i);
                return (
                  <div key={i} className="rounded overflow-hidden flex-shrink-0" style={{ width: w, height: h }}>
                    <div style={{ width: innerW, height: innerH, transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
                      <TemplateRenderer slide={slide} width={innerW} height={innerH} />
                    </div>
                  </div>
                );
              })}
            </div>
          </button>
        );
      })}
    </div>
  );
}

interface ScreenshotsStepProps {
  kit: StarterKit;
  screenshots: string[];
  onDrop: (files: File[]) => void;
  onRemove: (i: number) => void;
  onMove: (i: number, dir: -1 | 1) => void;
}

function ScreenshotsStep({ kit, screenshots, onDrop, onRemove, onMove }: ScreenshotsStepProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
    noClick: true,
    noKeyboard: true,
  });

  return (
    <div className="space-y-3">
      <div className="bg-norte-primary-light border border-norte-primary/30 rounded-md px-4 py-2.5 text-sm text-norte-primary">
        <span className="font-sora font-semibold">{kit.name}</span> needs <span className="font-sora font-semibold">{kit.slides.length} screenshots</span> · drop them in slide order. You can fill any missing ones later.
      </div>

      <div
        {...getRootProps()}
        className={`rounded-lg border-2 border-dashed px-4 py-6 text-center cursor-pointer transition-all ${
          isDragActive ? 'border-norte-primary bg-norte-primary-light' : 'border-border-strong bg-overlay hover:border-norte-primary'
        }`}
        onClick={() => fileRef.current?.click()}
      >
        <input {...getInputProps()} />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={async (e) => {
            const files = Array.from(e.target.files || []);
            if (files.length) onDrop(files);
            e.target.value = '';
          }}
        />
        <div className="text-sm text-secondary font-medium">Drop screenshots here, or click to upload</div>
        <div className="text-[11px] text-text-muted mt-1">PNG or JPG · multiple files supported · ordering matters</div>
      </div>

      {screenshots.length > 0 && (
        <div>
          <div className="section-label mb-2">{screenshots.length} uploaded · {Math.min(screenshots.length, kit.slides.length)} will be used</div>
          <div className="grid grid-cols-4 gap-2">
            {screenshots.map((src, i) => {
              const role = kit.slides[i]?.role;
              const roleLabel = role && RECIPE_ROLES.find((r) => r.id === role)?.label;
              const used = i < kit.slides.length;
              return (
                <div
                  key={i}
                  className={`relative rounded-md overflow-hidden border ${used ? 'border-border-default' : 'border-border-default opacity-50'}`}
                >
                  <img src={src} alt="" className="w-full h-24 object-cover" />
                  <div className="absolute top-1 left-1 bg-surface/90 text-[10px] font-semibold rounded px-1.5 py-0.5 text-primary">
                    {i + 1}{roleLabel ? ` · ${roleLabel}` : used ? '' : ' · unused'}
                  </div>
                  <div className="absolute top-1 right-1 flex gap-0.5">
                    <button
                      onClick={() => onMove(i, -1)}
                      disabled={i === 0}
                      className="w-5 h-5 bg-surface/90 rounded text-primary text-xs hover:bg-surface disabled:opacity-30"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => onMove(i, 1)}
                      disabled={i === screenshots.length - 1}
                      className="w-5 h-5 bg-surface/90 rounded text-primary text-xs hover:bg-surface disabled:opacity-30"
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => onRemove(i)}
                      className="w-5 h-5 bg-surface/90 rounded text-error text-xs hover:bg-surface"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface ReviewProps {
  mode: Mode;
  appName: string;
  description: string;
  audience: string;
  tone: string;
  voiceId: VoiceId;
  kit: StarterKit;
  screenshots: string[];
  error: string | null;
}

function ReviewStep({ mode, appName, description, audience, tone, voiceId, kit, screenshots, error }: ReviewProps) {
  const voice = VOICES.find((v) => v.id === voiceId);
  const previewSlides =
    mode === 'pattern'
      ? generatePatternCopy({
          appName,
          description,
          audience,
          voiceId,
          roles: kit.slides.map((s) => (s.role || 'secondary') as SlideRole),
        })
      : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 bg-overlay border border-border-default rounded-md p-4">
        <Field label="App" value={appName} />
        <Field label="Template" value={`${kit.name} · ${kit.slides.length} slides`} />
        <Field label="Audience" value={audience || '—'} />
        {mode === 'pattern' ? (
          <Field label="Voice" value={voice ? `${voice.label} · ${voice.tagline}` : '—'} />
        ) : (
          <Field label="Tone" value={tone} />
        )}
        <Field label="Screenshots" value={`${Math.min(screenshots.length, kit.slides.length)} of ${kit.slides.length} used`} />
        <Field label="Mode" value={mode === 'pattern' ? 'Pattern-based · local · free' : 'AI · Claude Opus 4.7'} />
      </div>

      {previewSlides && (
        <div className="bg-overlay border border-border-default rounded-md p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="section-label">Preview · {previewSlides.length} slides</div>
            <div className="text-[11px] text-text-muted">Editable after you build · proof slide placeholders need real numbers</div>
          </div>
          <div className="space-y-2">
            {previewSlides.map((s, i) => {
              const guidance = ROLE_GUIDANCE.find((g) => g.role === s.role);
              return (
                <div key={i} className="bg-surface border border-border-default rounded-md p-3 flex gap-3 items-start">
                  <div className="w-7 h-7 rounded-full bg-norte-primary text-white text-xs font-sora font-semibold flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-norte-primary">{guidance?.label}</span>
                      <span className="text-[10px] text-text-muted truncate" title={guidance?.recipe}>· {guidance?.recipe}</span>
                    </div>
                    <div className="font-sora font-semibold text-primary text-sm whitespace-pre-line leading-tight">{s.title}</div>
                    {s.showSubtitle && s.subtitle && (
                      <div className="text-xs text-text-muted mt-1">{s.subtitle}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!previewSlides && (
        <div className="bg-overlay border border-border-default rounded-md p-4">
          <div className="section-label mb-1.5">Description</div>
          <div className="text-sm text-secondary whitespace-pre-line">{description}</div>
        </div>
      )}

      {error && (
        <div className="bg-error/10 border border-error/40 text-error text-sm rounded-md px-3 py-2">{error}</div>
      )}

      <div className="bg-norte-primary-light border border-norte-primary/30 text-norte-primary text-xs rounded-md px-3 py-2">
        {mode === 'pattern'
          ? `Built locally from research-backed App Store patterns. ${kit.slides.length} slides following the recipe (Hero → Use Case → Differentiator → Feature → Proof). Edit any line in the right panel after building.`
          : `Claude Opus 4.7 will write ${kit.slides.length} headlines + subtitles following the App Store recipe. You can edit any slide afterwards.`}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-0.5">{label}</div>
      <div className="text-sm text-primary truncate">{value}</div>
    </div>
  );
}
