'use client';

import React from 'react';

/** One laurel branch built from leaves placed along a gently bowing stem. */
function Branch({ size, color, side }: { size: number; color: string; side: 'left' | 'right' }) {
  const w = size * 0.62;
  const h = size;
  const n = 7;
  const leaves = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1); // 0 = bottom, 1 = top
    const cy = h * (0.96 - 0.92 * t);
    const bow = Math.sin(t * Math.PI) * w * 0.55;
    const stemX = side === 'left' ? w - bow * 0.35 : bow * 0.35;
    const lx = side === 'left' ? stemX - w * 0.26 : stemX + w * 0.26;
    const angle = side === 'left' ? -42 - t * 26 : 42 + t * 26;
    leaves.push(
      <ellipse
        key={i}
        cx={lx}
        cy={cy}
        rx={w * 0.17}
        ry={h * 0.055}
        fill={color}
        transform={`rotate(${angle} ${lx} ${cy})`}
      />,
    );
  }
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', flex: '0 0 auto' }}>
      {leaves}
    </svg>
  );
}

/** A laurel-wreath badge: two mirrored branches flanking centered content. */
export default function Laurel({
  size,
  color = '#1A1917',
  children,
  gap = 6,
}: {
  size: number;
  color?: string;
  children?: React.ReactNode;
  gap?: number;
}) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap }}>
      <Branch size={size} color={color} side="left" />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>{children}</div>
      <Branch size={size} color={color} side="right" />
    </div>
  );
}
