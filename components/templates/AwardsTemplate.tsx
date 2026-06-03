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

/**
 * stoic-style: bold headline on top, a row of laurel-wreath award badges, then
 * the device. Badge labels come from the subtitle, split by `|`
 * (e.g. "App of the Day|Editors' Choice").
 */
export default function AwardsTemplate(props: TemplateRenderProps) {
  const { screenshot, title, subtitle, background, titleConfig, deviceConfig, overlayImage, width, height, rtl, fontFamily, onTitleChange, onSubtitleChange, titleTransform, deviceTransform, onElementPointerDown } = props;
  const sx = width / BASE_W;
  const sy = height / BASE_H;
  const s = Math.min(sx, sy);
  const scaleFactor = width / BASE_W;

  const titleFamily = fontFamily ? fontFamilyFor(fontFamily) : fontFamilyFor(titleConfig.fontFamily);
  const badgeText = subtitle && subtitle.trim() ? subtitle : "App of the Day|Editors' Choice";
  const badges = badgeText.split('|').map((b) => b.trim()).filter(Boolean).slice(0, 4);

  const deviceWidth = 280 * (deviceConfig.scale / 100) * scaleFactor;
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

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60 * scaleFactor, pointerEvents: 'none' }}>
        {titleConfig.layer.visible && (
          <div
            data-element="title"
            onPointerDown={(e) => onElementPointerDown?.('title', e)}
            style={{
              width: '86%',
              maxWidth: '86%',
              textAlign: titleConfig.alignment,
              opacity: titleConfig.layer.opacity,
              fontFamily: titleFamily,
              transform: transformCss(titleTransform, scaleFactor),
              transformOrigin: 'center center',
              pointerEvents: 'auto',
            }}
          >
            <EditableText
              value={title}
              onChange={onTitleChange}
              style={{
                fontSize: titleConfig.fontSize * scaleFactor,
                fontWeight: titleConfig.fontWeight,
                color: titleConfig.color,
                lineHeight: 1.1,
                whiteSpace: 'pre-line',
                letterSpacing: '-0.02em',
              }}
            />
          </div>
        )}

        {/* Award badges row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 22 * scaleFactor, marginTop: 22 * scaleFactor, pointerEvents: 'auto' }}>
          {badges.map((label, i) => (
            <Laurel key={i} size={52 * scaleFactor} color={titleConfig.color} gap={4 * scaleFactor}>
              <div
                style={{
                  fontFamily: titleFamily,
                  fontSize: 8.5 * scaleFactor,
                  fontWeight: 700,
                  color: titleConfig.color,
                  textTransform: 'uppercase',
                  letterSpacing: 0.4,
                  lineHeight: 1.15,
                  maxWidth: 60 * scaleFactor,
                  textAlign: 'center',
                }}
              >
                {label}
              </div>
            </Laurel>
          ))}
        </div>

        {/* Hidden editable subtitle anchor so the pipe-list stays editable inline */}
        {onSubtitleChange && (
          <div style={{ width: '70%', marginTop: 8 * scaleFactor, opacity: 0.0001, pointerEvents: 'auto' }}>
            <EditableText
              value={subtitle}
              onChange={onSubtitleChange}
              style={{ fontSize: 10 * scaleFactor, color: titleConfig.color, textAlign: 'center', whiteSpace: 'pre-line' }}
              placeholder="App of the Day|Editors' Choice"
            />
          </div>
        )}
      </div>

      {deviceConfig.layer.visible && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: -deviceHeight * 0.18,
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
    </div>
  );
}
