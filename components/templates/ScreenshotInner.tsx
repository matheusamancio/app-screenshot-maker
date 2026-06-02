'use client';

import React from 'react';
import EmptyScreenshot from './EmptyScreenshot';

interface Props {
  src: string | null;
  scale?: number;
  width?: number | string;
  height?: number | string;
}

export default function ScreenshotInner({ src, scale = 1, width = '100%', height = '100%' }: Props) {
  if (!src) {
    return (
      <div style={{ position: 'relative', width, height }}>
        <EmptyScreenshot scale={scale} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      style={{
        width,
        height,
        objectFit: 'cover',
        objectPosition: 'top center',
        display: 'block',
      }}
      crossOrigin="anonymous"
    />
  );
}
