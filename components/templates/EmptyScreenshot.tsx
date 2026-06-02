'use client';

import React from 'react';

export default function EmptyScreenshot({ scale = 1 }: { scale?: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F2F1EF',
        color: '#8C8984',
        gap: 8 * scale,
        padding: 16 * scale,
        textAlign: 'center',
        border: `${2 * scale}px dashed #C9C7C2`,
      }}
    >
      <svg width={32 * scale} height={32 * scale} viewBox="0 0 24 24" fill="none" stroke="#5B5FED" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      <div style={{ fontSize: 11 * scale, fontWeight: 500, letterSpacing: 0.4, textTransform: 'uppercase' }}>Drop your screenshot here</div>
    </div>
  );
}
