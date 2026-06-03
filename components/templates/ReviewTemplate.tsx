'use client';

import React from 'react';
import type { TemplateRenderProps } from './types';
import { BASE_W, BASE_H } from './types';
import { backgroundCss } from '@/lib/utils';
import { fontFamilyFor } from '@/lib/fonts';
import DeviceWrapper from '../devices/DeviceWrapper';
import ScreenshotInner from './ScreenshotInner';
import EditableText from './EditableText';
import Laurel from './Laurel';
import { transformCss } from '@/lib/transform';

function Star({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: 'block' }}>
      <path d="M12 2l2.9 6.6 7.1.7-5.4 4.9 1.6 7-6.2-3.7L5.8 21l1.6-7L2 9.3l7.1-.7L12 2z" />
    </svg>
  );
}

/**
 * Testimonial slide: a white review card with a 5-star row, a quote (title) and
 * attribution (subtitle), with a laurel rating beneath. Device peeks at the bottom.
 */
export default function ReviewTemplate(props: TemplateRenderProps) {
  const { screenshot, title, subtitle, showSubtitle, background, titleConfig, deviceConfig, overlayImage, width, height, rtl, fontFamily, onTitleChange, onSubtitleChange, titleTransform, deviceTransform, onElementPointerDown } = props;
  const sx = width / BASE_W;
  const sy = height / BASE_H;
  const s = Math.min(sx, sy);
  const scaleFactor = width / BASE_W;

  const titleFamily = fontFamily ? fontFamilyFor(fontFamily) : fontFamilyFor(titleConfig.fontFamily);
  const starSize = 16 * scaleFactor;

  const deviceWidth = 240 * (deviceConfig.scale / 100) * scaleFactor;
  const deviceHeight = (deviceWidth / 280) * 580;

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

      {/* Device peeking at the bottom */}
      {deviceConfig.layer.visible && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: -deviceHeight * 0.42,
            opacity: deviceConfig.layer.opacity,
          }}
        >
          <div
            data-element="device"
            onPointerDown={(e) => onElementPointerDown?.('device', e)}
            style={{ transform: transformCss(deviceTransform, scaleFactor), transformOrigin: 'center center', touchAction: 'none' }}
          >
            <DeviceWrapper device={deviceConfig} width={deviceWidth} height={deviceHeight}>
              <ScreenshotInner src={screenshot} scale={s} />
            </DeviceWrapper>
          </div>
        </div>
      )}

      {/* Review card */}
      {titleConfig.layer.visible && (
        <div
          data-element="title"
          onPointerDown={(e) => onElementPointerDown?.('title', e)}
          style={{
            position: 'absolute',
            top: 84 * scaleFactor,
            left: '9%',
            right: '9%',
            transform: transformCss(titleTransform, scaleFactor),
            transformOrigin: 'center center',
            opacity: titleConfig.layer.opacity,
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 22 * scaleFactor,
              padding: `${26 * scaleFactor}px ${22 * scaleFactor}px`,
              boxShadow: `0 ${18 * scaleFactor}px ${40 * scaleFactor}px rgba(0,0,0,0.14)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontFamily: titleFamily,
            }}
          >
            <div style={{ display: 'flex', gap: 4 * scaleFactor, marginBottom: 14 * scaleFactor }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={starSize} color="#111111" />
              ))}
            </div>
            <EditableText
              value={title}
              onChange={onTitleChange}
              style={{
                fontSize: titleConfig.fontSize * 0.62 * scaleFactor,
                fontWeight: titleConfig.fontWeight,
                color: '#111111',
                lineHeight: 1.2,
                textAlign: 'center',
                whiteSpace: 'pre-line',
                letterSpacing: '-0.01em',
              }}
            />
            {showSubtitle && (subtitle || onSubtitleChange) && (
              <EditableText
                value={subtitle}
                onChange={onSubtitleChange}
                style={{
                  fontSize: titleConfig.subtitleFontSize * 0.82 * scaleFactor,
                  color: '#6B6B6B',
                  marginTop: 12 * scaleFactor,
                  fontWeight: 500,
                  textAlign: 'center',
                  whiteSpace: 'pre-line',
                }}
              />
            )}
          </div>

          {/* Laurel rating */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 * scaleFactor }}>
            <Laurel size={50 * scaleFactor} color={titleConfig.color} gap={8 * scaleFactor}>
              <div style={{ display: 'flex', gap: 3 * scaleFactor }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} size={11 * scaleFactor} color={titleConfig.color} />
                ))}
              </div>
              <div
                style={{
                  fontFamily: titleFamily,
                  fontSize: 9 * scaleFactor,
                  fontWeight: 700,
                  color: titleConfig.color,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginTop: 2 * scaleFactor,
                }}
              >
                App Store
              </div>
            </Laurel>
          </div>
        </div>
      )}
    </div>
  );
}
