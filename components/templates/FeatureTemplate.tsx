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

export default function FeatureTemplate(props: TemplateRenderProps) {
  const { screenshot, title, subtitle, showSubtitle, background, titleConfig, deviceConfig, overlayImage, width, height, rtl, fontFamily, onTitleChange, onSubtitleChange, titleTransform, deviceTransform, onElementPointerDown } = props;
  const scaleFactor = width / BASE_W;
  const titleFamily = fontFamily ? fontFamilyFor(fontFamily) : fontFamilyFor(titleConfig.fontFamily);

  const deviceWidth = 260 * (deviceConfig.scale / 100) * scaleFactor;
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

      {titleConfig.layer.visible && (
        <div
          data-element="title"
          onPointerDown={(e) => onElementPointerDown?.('title', e)}
          style={{
            position: 'absolute',
            top: '50%',
            transform: `translateY(-50%) ${transformCss(titleTransform, scaleFactor)}`.trim(),
            transformOrigin: 'center center',
            left: 28 * scaleFactor,
            width: '50%',
            paddingRight: 16 * scaleFactor,
            textAlign: titleConfig.alignment,
            fontFamily: titleFamily,
            opacity: titleConfig.layer.opacity,
          }}
        >
          <EditableText
            value={title}
            onChange={onTitleChange}
            style={{
              fontSize: titleConfig.fontSize * 0.85 * scaleFactor,
              fontWeight: titleConfig.fontWeight,
              color: titleConfig.color,
              lineHeight: 1.05,
              whiteSpace: 'pre-line',
              letterSpacing: '-0.025em',
            }}
          />
          {showSubtitle && (subtitle || onSubtitleChange) && (
            <EditableText
              value={subtitle}
              onChange={onSubtitleChange}
              style={{
                fontSize: titleConfig.subtitleFontSize * 0.85 * scaleFactor,
                color: titleConfig.subtitleColor,
                marginTop: 14 * scaleFactor,
                lineHeight: 1.4,
                fontWeight: 400,
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
            top: '50%',
            right: -30 * scaleFactor,
            transform: `translateY(-50%) rotateY(-12deg) rotateX(2deg) rotateZ(-3deg) perspective(1200px)`,
            transformOrigin: 'center',
            opacity: deviceConfig.layer.opacity,
            filter: 'drop-shadow(0 30px 50px rgba(0,0,0,0.25))',
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
