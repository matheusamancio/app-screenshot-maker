'use client';

import React from 'react';

interface Props {
  width: number;
  height: number;
  children?: React.ReactNode;
}

export default function NoFrame({ width, height, children }: Props) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: Math.min(width, height) * 0.06,
        overflow: 'hidden',
        background: '#000',
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}
