'use client';

import React from 'react';
import type { TemplateRenderProps } from './types';
import { BASE_W } from './types';
import { backgroundCss } from '@/lib/utils';
import { fontFamilyFor } from '@/lib/fonts';
import { parseCardBody, cardMode, SAMPLE_FEATURE_CARDS, type ParsedRow } from '@/lib/featureCards';
import { transformCss } from '@/lib/transform';

const CARD_BG = '#1C1C1E';
const CARD_INNER = '#2C2C2E';

function Row({ row, sf, mode }: { row: ParsedRow; sf: number; mode: 'picker' | 'rows' }) {
  if (mode === 'picker') {
    return (
      <div
        style={{
          textAlign: 'center',
          fontSize: 17 * sf,
          fontWeight: row.highlight ? 700 : 500,
          color: row.highlight ? '#FFFFFF' : 'rgba(255,255,255,0.45)',
          background: row.highlight ? CARD_INNER : 'transparent',
          borderRadius: 10 * sf,
          padding: `${9 * sf}px ${10 * sf}px`,
        }}
      >
        {row.label}
      </div>
    );
  }
  // Plain sub-row (no value) → nested lighter card
  if (row.value === undefined) {
    return (
      <div
        style={{
          background: row.highlight ? '#FFFFFF' : CARD_INNER,
          color: row.highlight ? '#111111' : '#FFFFFF',
          borderRadius: 12 * sf,
          padding: `${11 * sf}px ${13 * sf}px`,
          fontSize: 14.5 * sf,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8 * sf,
        }}
      >
        <span>{row.label}</span>
        {row.chevron && <span style={{ opacity: 0.5, fontSize: 16 * sf }}>›</span>}
      </div>
    );
  }
  // Key/value row
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10 * sf,
        padding: `${9 * sf}px ${2 * sf}px`,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <span style={{ fontSize: 14.5 * sf, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{row.label}</span>
      <span
        style={{
          fontSize: 14 * sf,
          color: row.highlight ? '#FFFFFF' : 'rgba(255,255,255,0.95)',
          fontWeight: row.highlight ? 700 : 600,
          background: row.highlight ? CARD_INNER : 'transparent',
          borderRadius: 8 * sf,
          padding: row.highlight ? `${4 * sf}px ${8 * sf}px` : 0,
          whiteSpace: 'nowrap',
        }}
      >
        {row.value}
      </span>
    </div>
  );
}

function Card({ title, body, sf, titleFamily }: { title: string; body: string; sf: number; titleFamily: string }) {
  const rows = parseCardBody(body);
  const mode = cardMode(rows);
  return (
    <div
      style={{
        background: CARD_BG,
        borderRadius: 24 * sf,
        padding: `${18 * sf}px ${18 * sf}px ${20 * sf}px`,
        boxShadow: `0 ${8 * sf}px ${22 * sf}px rgba(0,0,0,0.16)`,
        fontFamily: titleFamily,
      }}
    >
      <div
        style={{
          fontSize: 25 * sf,
          fontWeight: 800,
          color: '#FFFFFF',
          textAlign: 'center',
          letterSpacing: '-0.02em',
          marginBottom: 14 * sf,
          lineHeight: 1.1,
          whiteSpace: 'pre-line',
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: mode === 'picker' ? 2 * sf : 8 * sf }}>
        {rows.map((r, i) => (
          <Row key={i} row={r} sf={sf} mode={mode} />
        ))}
      </div>
    </div>
  );
}

/**
 * Stacked dark "feature highlight" cards (Block Any App / Schedule Any Time / Set
 * App Limits). Reads slide.featureCards; falls back to sample cards when empty.
 */
export default function FeatureCardsTemplate(props: TemplateRenderProps) {
  const { background, titleConfig, overlayImage, width, height, rtl, fontFamily, titleTransform, onElementPointerDown } = props;
  const sf = width / BASE_W;
  const titleFamily = fontFamily ? fontFamilyFor(fontFamily) : fontFamilyFor(titleConfig.fontFamily);

  const cards = props.featureCards && props.featureCards.length > 0 ? props.featureCards : SAMPLE_FEATURE_CARDS;
  const showMore = props.featureMore !== false;

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        ...backgroundCss(background),
        direction: rtl ? 'rtl' : 'ltr',
      }}
    >
      {overlayImage.imageBase64 && overlayImage.layer.visible && (
        <img
          src={overlayImage.imageBase64}
          alt=""
          crossOrigin="anonymous"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: overlayImage.fit, opacity: overlayImage.opacity, pointerEvents: 'none' }}
        />
      )}

      <div
        data-element="title"
        onPointerDown={(e) => onElementPointerDown?.('title', e)}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'stretch',
          gap: 16 * sf,
          padding: `${40 * sf}px ${26 * sf}px`,
          transform: transformCss(titleTransform, sf),
          transformOrigin: 'center center',
        }}
      >
        {cards.map((c, i) => (
          <Card key={i} title={c.title} body={c.body} sf={sf} titleFamily={titleFamily} />
        ))}
        {showMore && (
          <div style={{ textAlign: 'center', fontFamily: titleFamily, fontSize: 18 * sf, fontWeight: 800, color: titleConfig.color, marginTop: 2 * sf }}>
            &amp; more!
          </div>
        )}
      </div>
    </div>
  );
}
