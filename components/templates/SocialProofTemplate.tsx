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

function StarIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2l2.9 6.6 7.1.7-5.4 4.9 1.6 7-6.2-3.7L5.8 21l1.6-7L2 9.3l7.1-.7L12 2z" />
    </svg>
  );
}

export default function SocialProofTemplate(props: TemplateRenderProps) {
  const { screenshot, title, subtitle, showSubtitle, background, titleConfig, deviceConfig, overlayImage, width, height, rtl, fontFamily, onTitleChange, onSubtitleChange, titleTransform, deviceTransform, onElementPointerDown } = props;
  const scaleFactor = width / BASE_W;
  const titleFamily = fontFamily ? fontFamilyFor(fontFamily) : fontFamilyFor(titleConfig.fontFamily);

  const deviceWidth = 260 * (deviceConfig.scale / 100) * scaleFactor;
  const deviceHeight = (deviceWidth / 280) * 580;
  const starSize = 18 * scaleFactor;

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

      {/* Top row: stars and badge */}
      <div
        style={{
          position: 'absolute',
          top: 36 * scaleFactor,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10 * scaleFactor,
        }}
      >
        <div style={{ display: 'flex', gap: 4 * scaleFactor }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <StarIcon key={i} size={starSize} color="#F59E0B" />
          ))}
        </div>
        <div
          style={{
            fontFamily: titleFamily,
            fontSize: 12 * scaleFactor,
            color: titleConfig.color,
            opacity: 0.9,
            textTransform: 'uppercase',
            letterSpacing: 0.6,
            fontWeight: 600,
          }}
        >
          4.9 · Featured on the App Store
        </div>
      </div>

      {/* Title near top below badge */}
      {titleConfig.layer.visible && (
        <div
          data-element="title"
          onPointerDown={(e) => onElementPointerDown?.('title', e)}
          style={{
            position: 'absolute',
            top: 100 * scaleFactor,
            left: '6%',
            right: '6%',
            textAlign: titleConfig.alignment,
            fontFamily: titleFamily,
            opacity: titleConfig.layer.opacity,
            transform: transformCss(titleTransform, scaleFactor),
            transformOrigin: 'center center',
          }}
        >
          <EditableText
            value={title}
            onChange={onTitleChange}
            style={{
              fontSize: titleConfig.fontSize * 0.8 * scaleFactor,
              fontWeight: titleConfig.fontWeight,
              color: titleConfig.color,
              lineHeight: 1.1,
              whiteSpace: 'pre-line',
            }}
          />
          {showSubtitle && (subtitle || onSubtitleChange) && (
            <EditableText
              value={subtitle}
              onChange={onSubtitleChange}
              style={{
                fontSize: titleConfig.subtitleFontSize * 0.85 * scaleFactor,
                color: titleConfig.subtitleColor,
                marginTop: 8 * scaleFactor,
                whiteSpace: 'pre-line',
              }}
            />
          )}
        </div>
      )}

      {deviceConfig.layer.visible && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: -deviceHeight * 0.05,
            transform: 'translateX(-50%)',
            opacity: deviceConfig.layer.opacity,
          }}
        >
          <div
            data-element="device"
            onPointerDown={(e) => onElementPointerDown?.('device', e)}
            style={{ transform: transformCss(deviceTransform, scaleFactor), transformOrigin: 'center center', touchAction: 'none' }}
          >
            <DeviceWrapper device={deviceConfig} width={deviceWidth} height={deviceHeight}>
              <ScreenshotInner src={screenshot} scale={scaleFactor} />
            </DeviceWrapper>
          </div>
        </div>
      )}
    </div>
  );
}
