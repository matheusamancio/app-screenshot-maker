'use client';

import React from 'react';
import type { TemplateRenderProps } from './types';
import { BASE_W, BASE_H } from './types';
import { backgroundCss } from '@/lib/utils';
import { fontFamilyFor } from '@/lib/fonts';
import DeviceWrapper from '../devices/DeviceWrapper';
import ScreenshotInner from './ScreenshotInner';
import EditableText from './EditableText';
import { transformCss } from '@/lib/transform';

export default function HeroTemplate(props: TemplateRenderProps) {
  const { screenshot, title, subtitle, showSubtitle, background, titleConfig, deviceConfig, overlayImage, width, height, rtl, fontFamily, onTitleChange, onSubtitleChange, titleTransform, deviceTransform, onElementPointerDown } = props;
  const sx = width / BASE_W;
  const sy = height / BASE_H;
  const s = Math.min(sx, sy);
  const ratio = (height / width) / (BASE_H / BASE_W);
  const scaleFactor = ratio < 1 ? height / BASE_H : width / BASE_W;

  const titleFamily = fontFamily ? fontFamilyFor(fontFamily) : fontFamilyFor(titleConfig.fontFamily);

  const deviceWidth = 280 * (deviceConfig.scale / 100) * scaleFactor;
  const deviceHeight = (deviceWidth / 280) * 580;

  const positionStyles: Record<string, React.CSSProperties> = {
    top: { paddingTop: 60 * scaleFactor, paddingBottom: 0, justifyContent: 'flex-start' },
    middle: { paddingTop: 40 * scaleFactor, paddingBottom: 40 * scaleFactor, justifyContent: 'center' },
    bottom: { paddingTop: 0, paddingBottom: 60 * scaleFactor, justifyContent: 'flex-end' },
  };

  const titlePos = positionStyles[titleConfig.floatingPosition || 'top'];

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
      {/* Overlay image */}
      {overlayImage.imageBase64 && overlayImage.layer.visible && (
        <img
          src={overlayImage.imageBase64}
          alt=""
          crossOrigin="anonymous"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: overlayImage.fit,
            opacity: overlayImage.opacity,
            pointerEvents: 'none',
          }}
        />
      )}

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', ...titlePos, pointerEvents: 'none' }}>
        {titleConfig.layer.visible && (
          <div
            data-element="title"
            onPointerDown={(e) => onElementPointerDown?.('title', e)}
            style={{
              width: '85%',
              maxWidth: '85%',
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
            {showSubtitle && (subtitle || onSubtitleChange) && (
              <EditableText
                value={subtitle}
                onChange={onSubtitleChange}
                style={{
                  fontSize: titleConfig.subtitleFontSize * scaleFactor,
                  color: titleConfig.subtitleColor,
                  marginTop: 12 * scaleFactor,
                  lineHeight: 1.4,
                  fontWeight: 400,
                  whiteSpace: 'pre-line',
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Device */}
      {deviceConfig.layer.visible && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: titleConfig.floatingPosition === 'bottom' ? 'auto' : -deviceHeight * 0.18,
            top: titleConfig.floatingPosition === 'bottom' ? -deviceHeight * 0.05 : 'auto',
            opacity: deviceConfig.layer.opacity,
          }}
        >
          <div
            data-element="device"
            onPointerDown={(e) => onElementPointerDown?.('device', e)}
            style={{
              transform: `${
                deviceConfig.verticalPosition === 'top'
                  ? `translateY(${-30 * scaleFactor}px)`
                  : deviceConfig.verticalPosition === 'bottom'
                  ? `translateY(${30 * scaleFactor}px)`
                  : ''
              } ${transformCss(deviceTransform, scaleFactor)}`.trim(),
              transformOrigin: 'center center',
              touchAction: 'none',
            }}
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
