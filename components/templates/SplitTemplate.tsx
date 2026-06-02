'use client';

import React from 'react';
import type { TemplateRenderProps } from './types';
import { BASE_W } from './types';
import { backgroundCss } from '@/lib/utils';
import { fontFamilyFor } from '@/lib/fonts';
import ScreenshotInner from './ScreenshotInner';
import EditableText from './EditableText';
import { transformCss } from '@/lib/transform';

export default function SplitTemplate(props: TemplateRenderProps) {
  const { screenshot, title, subtitle, showSubtitle, background, titleConfig, overlayImage, width, height, rtl, fontFamily, onTitleChange, onSubtitleChange, titleTransform, deviceTransform, onElementPointerDown } = props;
  const scaleFactor = width / BASE_W;
  const titleFamily = fontFamily ? fontFamilyFor(fontFamily) : fontFamilyFor(titleConfig.fontFamily);

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

      {/* Top half: text */}
      {titleConfig.layer.visible && (
        <div
          data-element="title"
          onPointerDown={(e) => onElementPointerDown?.('title', e)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '45%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: titleConfig.alignment === 'center' ? 'center' : titleConfig.alignment === 'right' ? 'flex-end' : 'flex-start',
            padding: `${24 * scaleFactor}px ${28 * scaleFactor}px`,
            fontFamily: titleFamily,
            opacity: titleConfig.layer.opacity,
            transform: transformCss(titleTransform, scaleFactor),
            transformOrigin: 'center center',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: `${4 * scaleFactor}px ${12 * scaleFactor}px`,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.3)',
              fontSize: 11 * scaleFactor,
              fontWeight: 600,
              color: titleConfig.color,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              marginBottom: 14 * scaleFactor,
            }}
          >
            New
          </div>
          <EditableText
            value={title}
            onChange={onTitleChange}
            style={{
              fontSize: titleConfig.fontSize * scaleFactor,
              fontWeight: titleConfig.fontWeight,
              color: titleConfig.color,
              lineHeight: 1.05,
              whiteSpace: 'pre-line',
              letterSpacing: '-0.02em',
              textAlign: titleConfig.alignment,
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
                fontWeight: 400,
                lineHeight: 1.45,
                textAlign: titleConfig.alignment,
                whiteSpace: 'pre-line',
              }}
            />
          )}
        </div>
      )}

      {/* Bottom half: screenshot full bleed */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '60%',
          padding: `0 ${24 * scaleFactor}px`,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
      >
        <div
          data-element="device"
          onPointerDown={(e) => onElementPointerDown?.('device', e)}
          style={{
            width: '100%',
            height: '92%',
            borderTopLeftRadius: 24 * scaleFactor,
            borderTopRightRadius: 24 * scaleFactor,
            overflow: 'hidden',
            background: '#000',
            boxShadow: `0 ${20 * scaleFactor}px ${40 * scaleFactor}px rgba(0,0,0,0.18)`,
            transform: transformCss(deviceTransform, scaleFactor),
            transformOrigin: 'center center',
            touchAction: 'none',
          }}
        >
          <ScreenshotInner src={screenshot} scale={scaleFactor} />
        </div>
      </div>
    </div>
  );
}
