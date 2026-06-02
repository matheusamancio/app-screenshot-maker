import type { ElementTransform } from '@/types';

export function transformCss(t?: ElementTransform, scaleFactor: number = 1): string {
  if (!t) return '';
  const x = (t.x || 0) * scaleFactor;
  const y = (t.y || 0) * scaleFactor;
  const r = t.rotation || 0;
  const s = t.scale ?? 1;
  return `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`;
}

export function isIdentityTransform(t?: ElementTransform): boolean {
  if (!t) return true;
  return (t.x || 0) === 0 && (t.y || 0) === 0 && (t.rotation || 0) === 0 && (t.scale ?? 1) === 1;
}
