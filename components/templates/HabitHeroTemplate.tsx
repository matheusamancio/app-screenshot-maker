'use client';

import React from 'react';
import type { TemplateRenderProps } from './types';
import { BASE_W } from './types';
import { backgroundCss } from '@/lib/utils';
import { fontFamilyFor } from '@/lib/fonts';
import EditableText from './EditableText';
import EditablePillText, { readableTextColor } from './EditablePillText';
import Laurel from './Laurel';
import { DEFAULT_HABIT_HERO, TILE_POSITIONS } from '@/lib/habitHero';
import { transformCss } from '@/lib/transform';

function CheckBadge({ size }: { size: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: -size * 0.32,
        right: -size * 0.32,
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#111111',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }}
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  );
}

function Tile({ emoji, size, check }: { emoji: string; size: number; check: boolean }) {
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.5,
        boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
      }}
    >
      <span style={{ lineHeight: 1 }}>{emoji}</span>
      {check && <CheckBadge size={size * 0.34} />}
    </div>
  );
}

function Star({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: 'block' }}>
      <path d="M12 2l2.9 6.6 7.1.7-5.4 4.9 1.6 7-6.2-3.7L5.8 21l1.6-7L2 9.3l7.1-.7L12 2z" />
    </svg>
  );
}

/**
 * Composed "habit tracker" hero: pill headline + subtitle, floating emoji tiles
 * with check badges, and a dark gradient device showcase with an app icon,
 * name/tagline and a laurel rating.
 */
export default function HabitHeroTemplate(props: TemplateRenderProps) {
  const { background, titleConfig, title, subtitle, showSubtitle, overlayImage, width, height, rtl, fontFamily, onTitleChange, onSubtitleChange, titleTransform, onElementPointerDown } = props;
  const sf = width / BASE_W;
  const titleFamily = fontFamily ? fontFamilyFor(fontFamily) : fontFamilyFor(titleConfig.fontFamily);
  const cfg = props.habitHero || DEFAULT_HABIT_HERO;
  const pillColor = readableTextColor(titleConfig.color);

  // Fade target = the slide background colour so the device blends into the page.
  const fadeTo = background.type === 'solid' && background.solidColor ? background.solidColor : '#EAE8E1';
  const tileSize = 60 * sf;
  // habit-hero render
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

      {/* Device showcase */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '31%',
          bottom: '3.5%',
          width: 256 * sf,
          transform: 'translateX(-50%)',
          borderRadius: 46 * sf,
          background: `linear-gradient(180deg, #0A0A0A 0%, #0A0A0A 52%, ${fadeTo} 100%)`,
          boxShadow: '0 30px 60px rgba(0,0,0,0.28)',
          overflow: 'hidden',
        }}
      >
        {/* notch */}
        <div style={{ position: 'absolute', top: '2.6%', left: '50%', transform: 'translateX(-50%)', width: 92 * sf, height: 26 * sf, borderRadius: 14 * sf, background: '#000' }} />

        {/* app icon */}
        {!cfg.exploded && (
        <div style={{ position: 'absolute', top: '44%', left: '50%', transform: 'translateX(-50%)' }}>
          <Tile emoji={cfg.appEmoji} size={84 * sf} check={cfg.showChecks} />
        </div>
        )}

        {/* app name + tagline */}
        {!cfg.exploded && (
        <div style={{ position: 'absolute', top: '63%', left: 0, right: 0, textAlign: 'center', fontFamily: titleFamily }}>
          <div style={{ fontSize: 30 * sf, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>{cfg.appName}</div>
          <div style={{ fontSize: 17 * sf, fontWeight: 500, color: 'rgba(255,255,255,0.82)', marginTop: 2 * sf }}>{cfg.appTagline}</div>
        </div>
        )}

        {/* rating */}
        {!cfg.exploded && (
        <div style={{ position: 'absolute', bottom: '5%', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: titleFamily }}>
          {cfg.showLaurel ? (
            <Laurel size={56 * sf} color="#1A1917" gap={6 * sf}>
              <div style={{ fontSize: 32 * sf, fontWeight: 800, color: '#111111', letterSpacing: '-0.02em' }}>{cfg.ratingValue}</div>
              <div style={{ fontSize: 9 * sf, fontWeight: 700, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: 1 }}>{cfg.ratingLabel}</div>
            </Laurel>
          ) : (
            <>
              <div style={{ fontSize: 32 * sf, fontWeight: 800, color: '#111111', letterSpacing: '-0.02em' }}>{cfg.ratingValue}</div>
              <div style={{ fontSize: 9 * sf, fontWeight: 700, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: 1 }}>{cfg.ratingLabel}</div>
            </>
          )}
          {cfg.showStars && (
            <div style={{ display: 'flex', gap: 3 * sf, marginTop: 6 * sf }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={13 * sf} color="#111111" />
              ))}
            </div>
          )}
        </div>
        )}
      </div>

      {/* Floating habit tiles */}
      {!cfg.exploded &&
        cfg.emojis.map((emoji, i) => {
          const pos = TILE_POSITIONS[i % TILE_POSITIONS.length];
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: `rotate(${pos.r}deg)`,
              }}
            >
              <Tile emoji={emoji} size={tileSize} check={cfg.showChecks} />
            </div>
          );
        })}

      {/* Headline + subtitle */}
      <div
        data-element="title"
        onPointerDown={(e) => onElementPointerDown?.('title', e)}
        style={{
          position: 'absolute',
          top: '4.5%',
          left: '6%',
          right: '6%',
          textAlign: titleConfig.alignment,
          fontFamily: titleFamily,
          opacity: titleConfig.layer.opacity,
          transform: transformCss(titleTransform, sf),
          transformOrigin: 'center center',
        }}
      >
        <EditablePillText
          value={title}
          onChange={onTitleChange}
          pillBg={titleConfig.color}
          pillColor={pillColor}
          placeholder="Type [keyword] for a pill"
          style={{
            fontSize: titleConfig.fontSize * sf,
            fontWeight: titleConfig.fontWeight,
            color: titleConfig.color,
            lineHeight: 1.1,
            whiteSpace: 'pre-line',
            letterSpacing: '-0.02em',
          }}
        />
        {showSubtitle && (subtitle || onSubtitleChange) && (
          <EditableText
            value={subtitle}
            onChange={onSubtitleChange}
            style={{
              fontSize: titleConfig.subtitleFontSize * sf,
              color: titleConfig.subtitleColor,
              marginTop: 10 * sf,
              fontWeight: 500,
              whiteSpace: 'pre-line',
            }}
          />
        )}
      </div>
    </div>
  );
}
