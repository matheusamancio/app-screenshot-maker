'use client';

import React from 'react';

/**
 * App-icon tiles for the "blocked apps" wall — hand-drawn vector marks on the
 * brand's tile colour (no bitmap assets). Used by the `app` element, the Elements
 * panel and the inspector's brand picker.
 */
export interface AppBrand {
  id: string;
  label: string;
  /** CSS background of the tile (solid colour or gradient). */
  bg: string;
}

export const APP_BRANDS: AppBrand[] = [
  { id: 'youtube', label: 'YouTube', bg: '#FF0000' },
  { id: 'instagram', label: 'Instagram', bg: 'linear-gradient(45deg, #F9CE34 0%, #EE2A7B 50%, #6228D7 100%)' },
  { id: 'tiktok', label: 'TikTok', bg: '#000000' },
  { id: 'snapchat', label: 'Snapchat', bg: '#FFFC00' },
  { id: 'x', label: 'X', bg: '#000000' },
  { id: 'threads', label: 'Threads', bg: '#000000' },
  { id: 'netflix', label: 'Netflix', bg: '#000000' },
  { id: 'whatsapp', label: 'WhatsApp', bg: '#25D366' },
  { id: 'facebook', label: 'Facebook', bg: '#1877F2' },
];

export function brandOf(id?: string): AppBrand {
  return APP_BRANDS.find((b) => b.id === id) || APP_BRANDS[0];
}

/** TikTok note silhouette — drawn three times (cyan / red offsets under white) for the chromatic look. */
const TIKTOK_NOTE = 'M53 16h14c1 7 6 13 13 15v11c-6 0-11-2-16-5v25a22 22 0 1 1-22-22c1 0 2 0 4 .3v11.4c-2-.5-3-.7-4-.7a11 11 0 1 0 11 11z';

function Mark({ brand }: { brand: string }) {
  const svg = { width: '100%', height: '100%', viewBox: '0 0 100 100', 'aria-hidden': true as const, style: { display: 'block' } };
  switch (brand) {
    case 'youtube':
      return (
        <svg {...svg}>
          <rect x="15" y="27" width="70" height="46" rx="16" fill="#FFFFFF" />
          <polygon points="42,39 42,61 62,50" fill="#FF0000" />
        </svg>
      );
    case 'instagram':
      return (
        <svg {...svg}>
          <rect x="22" y="22" width="56" height="56" rx="16" fill="none" stroke="#FFFFFF" strokeWidth="6.5" />
          <circle cx="50" cy="50" r="12.5" fill="none" stroke="#FFFFFF" strokeWidth="6.5" />
          <circle cx="66.5" cy="33.5" r="3.6" fill="#FFFFFF" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg {...svg}>
          <g transform="translate(-2.5 -2.5)"><path d={TIKTOK_NOTE} fill="#25F4EE" /></g>
          <g transform="translate(2.5 2.5)"><path d={TIKTOK_NOTE} fill="#FE2C55" /></g>
          <path d={TIKTOK_NOTE} fill="#FFFFFF" />
        </svg>
      );
    case 'snapchat':
      return (
        <svg {...svg}>
          <path
            d="M50 19c-13 0-21 9-21 21v10c-3 1-6 0-8-1-2 0-3 3-1 4l8 4c-2 6-8 10-14 12 0 3 6 4 10 5l2 5c5-1 9 0 13 3 3 2 7 3 11 3s8-1 11-3c4-3 8-4 13-3l2-5c4-1 10-2 10-5-6-2-12-6-14-12l8-4c2-1 1-4-1-4-2 1-5 2-8 1V40c0-12-8-21-21-21z"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'x':
      return (
        <svg {...svg}>
          <line x1="70" y1="26" x2="30" y2="74" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="square" />
          <line x1="30" y1="26" x2="70" y2="74" stroke="#000000" strokeWidth="16" />
          <line x1="30" y1="26" x2="70" y2="74" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="square" />
        </svg>
      );
    case 'threads':
      return (
        <svg {...svg}>
          <text x="50" y="70" textAnchor="middle" fontSize="62" fontWeight="500" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fill="#FFFFFF">@</text>
        </svg>
      );
    case 'netflix':
      return (
        <svg {...svg}>
          <polygon points="30,16 42,16 42,84 30,84" fill="#E50914" />
          <polygon points="58,16 70,16 70,84 58,84" fill="#E50914" />
          <polygon points="30,16 42,16 70,84 58,84" fill="#B20710" />
        </svg>
      );
    case 'whatsapp':
      return (
        <svg {...svg}>
          <path d="M50 20a30 30 0 0 0-26 45l-4 15 15-4a30 30 0 1 0 15-56z" fill="#FFFFFF" />
          <path d="M40 36c1-1 3-1 4 0l3 6c1 1 0 2-1 3l-2 2c2 4 6 8 10 10l2-2c1-1 2-1 3 0l6 3c1 1 1 3 0 4l-2 3c-2 2-5 2-8 1-9-3-16-10-19-19-1-3 0-6 2-8z" fill="#25D366" />
        </svg>
      );
    case 'facebook':
      return (
        <svg {...svg}>
          <path d="M56 84V56h10l2-12H56v-8c0-4 1-6 6-6h6V19c-2 0-6-1-10-1-10 0-16 6-16 17v9H31v12h11v28z" fill="#FFFFFF" />
        </svg>
      );
    default:
      return null;
  }
}

/** A brand tile: rounded square in the brand colour with its mark centred. */
export default function AppIcon({ brand, size, radius, style }: { brand: string; size: number; radius: number; style?: React.CSSProperties }) {
  const b = brandOf(brand);
  return (
    <div style={{ width: size, height: size, borderRadius: radius, background: b.bg, overflow: 'hidden', flexShrink: 0, ...style }}>
      <Mark brand={b.id} />
    </div>
  );
}
