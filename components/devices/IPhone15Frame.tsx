'use client';

import React from 'react';
import type { DeviceFrameStyle } from '@/types';

interface Props {
  style: DeviceFrameStyle;
  width: number;
  height: number;
  children?: React.ReactNode;
}

const styleColors: Record<DeviceFrameStyle, { frame: string; bezel: string; stroke: string; island: string }> = {
  'real-dark': { frame: '#1A1917', bezel: '#000000', stroke: '#2A2826', island: '#000000' },
  'real-light': { frame: '#F5F5F5', bezel: '#E5E5E5', stroke: '#D4D4D4', island: '#1A1917' },
  'clay-dark': { frame: '#3F3D3A', bezel: '#2A2826', stroke: '#4A4845', island: '#1A1917' },
  'clay-light': { frame: '#EAE9E6', bezel: '#D9D7D3', stroke: '#C9C7C2', island: '#4A4845' },
  outline: { frame: 'transparent', bezel: 'transparent', stroke: '#1A1917', island: '#1A1917' },
  none: { frame: 'transparent', bezel: 'transparent', stroke: 'transparent', island: 'transparent' },
};

export default function IPhone15Frame({ style, width, height, children }: Props) {
  const c = styleColors[style] || styleColors['real-dark'];
  const isOutline = style === 'outline';
  const isNone = style === 'none';
  const radius = Math.min(width, height) * 0.115;
  const innerInset = 10;
  const innerRadius = radius - 6;
  const islandWidth = width * 0.32;
  const islandHeight = 26;
  const islandY = 16;

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
          {/* Outer bezel */}
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
          {/* Inner bezel */}
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
          {/* Side button accents */}
          {!isOutline && (
            <>
              <rect x={-1} y={height * 0.2} width={3} height={50} rx={1.5} fill={c.stroke} />
              <rect x={-1} y={height * 0.3} width={3} height={80} rx={1.5} fill={c.stroke} />
              <rect x={-1} y={height * 0.4} width={3} height={80} rx={1.5} fill={c.stroke} />
              <rect x={width - 2} y={height * 0.25} width={3} height={120} rx={1.5} fill={c.stroke} />
            </>
          )}
        </svg>
      )}

      {/* Screen content */}
      <div
        style={{
          position: 'absolute',
          left: isNone ? 0 : screenX,
          top: isNone ? 0 : screenY,
          width: isNone ? width : screenW,
          height: isNone ? height : screenH,
          borderRadius: isNone ? Math.min(width, height) * 0.08 : innerRadius,
          overflow: 'hidden',
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>

      {/* Dynamic Island */}
      {!isNone && (
        <div
          style={{
            position: 'absolute',
            left: (width - islandWidth) / 2,
            top: islandY,
            width: islandWidth,
            height: islandHeight,
            background: c.island,
            borderRadius: islandHeight / 2,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
}
