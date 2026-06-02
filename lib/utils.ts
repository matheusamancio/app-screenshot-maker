import type { BackgroundConfig, GradientStop } from '@/types';

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function clsx(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function gradientCss(stops: GradientStop[], angle: number, type: 'linear' | 'radial' = 'linear'): string {
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const stopStr = sorted.map((s) => `${s.color} ${s.position}%`).join(', ');
  if (type === 'radial') return `radial-gradient(circle at center, ${stopStr})`;
  return `linear-gradient(${angle}deg, ${stopStr})`;
}

export function backgroundCss(bg: BackgroundConfig): React.CSSProperties {
  if (bg.type === 'none') return { backgroundColor: 'transparent' };
  if (bg.type === 'solid') return { backgroundColor: bg.solidColor || '#FFFFFF' };
  if (bg.type === 'linear-gradient' && bg.gradientStops) {
    return { backgroundImage: gradientCss(bg.gradientStops, bg.gradientAngle ?? 135, 'linear') };
  }
  if (bg.type === 'radial-gradient' && bg.gradientStops) {
    return { backgroundImage: gradientCss(bg.gradientStops, bg.gradientAngle ?? 135, 'radial') };
  }
  if (bg.type === 'image' && bg.imageBase64) {
    return { backgroundImage: `url(${bg.imageBase64})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  }
  if (bg.type === 'mesh') {
    return {
      backgroundImage: `radial-gradient(at 20% 20%, #5B5FED 0px, transparent 50%), radial-gradient(at 80% 30%, #F59E0B 0px, transparent 50%), radial-gradient(at 50% 80%, #818CF8 0px, transparent 50%)`,
      backgroundColor: '#EEEFFE',
    };
  }
  return { backgroundColor: '#F9F8F6' };
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function pad(n: number, w: number = 2): string {
  return String(n).padStart(w, '0');
}
