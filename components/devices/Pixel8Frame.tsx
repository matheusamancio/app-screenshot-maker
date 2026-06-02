'use client';

import React from 'react';
import type { DeviceFrameStyle } from '@/types';

interface Props {
  style: DeviceFrameStyle;
  width: number;
  height: number;
  children?: React.ReactNode;
}

const styleColors: Record<DeviceFrameStyle, { frame: string; bezel: string; stroke: string; punch: string }> = {
  'real-dark': { frame: '#1A1917', bezel: '#000000', stroke: '#2A2826', punch: '#000000' },
  'real-light': { frame: '#F5F5F5', bezel: '#E5E5E5', stroke: '#D4D4D4', punch: '#1A1917' },
  'clay-dark': { frame: '#3F3D3A', bezel: '#2A2826', stroke: '#4A4845', punch: '#1A1917' },
  'clay-light': { frame: '#EAE9E6', bezel: '#D9D7D3', stroke: '#C9C7C2', punch: '#4A4845' },
  outline: { frame: 'transparent', bezel: 'transparent', stroke: '#1A1917', punch: '#1A1917' },
  none: { frame: 'transparent', bezel: 'transparent', stroke: 'transparent', punch: 'transparent' },
};

export default function Pixel8Frame({ style, width, height, children }: Props) {
  const c = styleColors[style] || styleColors['real-dark'];
  const isOutline = style === 'outline';
  const isNone = style === 'none';
  const radius = Math.min(width, height) * 0.075;
  const innerInset = 8;
  const innerRadius = radius - 4;
  const punchSize = 18;
  const punchY = 22;

  const screenX = innerInset;
  const screenY = innerInset;
  const screenW = width - innerInset * 2;
  const screenH = height - innerInset * 2;

  return (
    <div style={{ position: 'relative', width, height, flexShrink: 0 }}>
      {!isNone && (
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        >
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            rx={radius}
            ry={radius}
            fill={isOutline ? 'transparent' : c.frame}
            stroke={c.stroke}
            strokeWidth={isOutline ? 4 : 2}
          />
          {!isOutline && (
            <rect
              x={4}
              y={4}
              width={width - 8}
              height={height - 8}
              rx={radius - 2}
              ry={radius - 2}
              fill={c.bezel}
            />
          )}
          {!isOutline && (
            <>
              <rect x={width - 2} y={height * 0.18} width={3} height={60} rx={1.5} fill={c.stroke} />
              <rect x={width - 2} y={height * 0.28} width={3} height={90} rx={1.5} fill={c.stroke} />
            </>
          )}
        </svg>
      )}

      <div
        style={{
          position: 'absolute',
          left: isNone ? 0 : screenX,
          top: isNone ? 0 : screenY,
          width: isNone ? width : screenW,
          height: isNone ? height : screenH,
          borderRadius: isNone ? Math.min(width, height) * 0.05 : innerRadius,
          overflow: 'hidden',
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>

      {!isNone && (
        <div
          style={{
            position: 'absolute',
            left: width / 2 - punchSize / 2,
            top: punchY,
            width: punchSize,
            height: punchSize,
            background: c.punch,
            borderRadius: '50%',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
}
