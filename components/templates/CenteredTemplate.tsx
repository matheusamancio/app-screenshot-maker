'use client';

import React from 'react';
import type { TemplateRenderProps } from './types';
import { BASE_W } from './types';
import { backgroundCss } from '@/lib/utils';
import { fontFamilyFor } from '@/lib/fonts';
import DeviceWrapper from '../devices/DeviceWrapper';
import ScreenshotInner from './ScreenshotInner';
import EditableText from './EditableText';
import { transformCss } from '@/lib/transform';

export default function CenteredTemplate(props: TemplateRenderProps) {
  const { screenshot, title, subtitle, showSubtitle, background, titleConfig, deviceConfig, overlayImage, width, height, rtl, fontFamily, onTitleChange, onSubtitleChange, titleTransform, deviceTransform, onElementPointerDown } = props;
  const scaleFactor = width / BASE_W;
  const titleFamily = fontFamily ? fontFamilyFor(fontFamily) : fontFamilyFor(titleConfig.fontFamily);

  const deviceWidth = 250 * (deviceConfig.scale / 100) * scaleFactor;
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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24 * scaleFactor,
        padding: `${36 * scaleFactor}px ${24 * scaleFactor}px`,
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
            textAlign: 'center',
            fontFamily: titleFamily,
            width: '90%',
            opacity: titleConfig.layer.opacity,
            transform: transformCss(titleTransform, scaleFactor),
            transformOrigin: 'center center',
          }}
        >
          <EditableText
            value={title}
            onChange={onTitleChange}
            style={{
              fontSize: titleConfig.fontSize * 0.85 * scaleFactor,
              fontWeight: titleConfig.fontWeight,
              color: titleConfig.color,
              lineHeight: 1.1,
              whiteSpace: 'pre-line',
              letterSpacing: '-0.02em',
            }}
          />
        </div>
      )}

      {deviceConfig.layer.visible && (
        <div
          data-element="device"
          onPointerDown={(e) => onElementPointerDown?.('device', e)}
          style={{
            opacity: deviceConfig.layer.opacity,
            transform: transformCss(deviceTransform, scaleFactor),
            transformOrigin: 'center center',
            touchAction: 'none',
          }}
        >
          <DeviceWrapper device={deviceConfig} width={deviceWidth} height={deviceHeight}>
            <ScreenshotInner src={screenshot} scale={scaleFactor} />
          </DeviceWrapper>
        </div>
      )}

      {titleConfig.layer.visible && showSubtitle && (subtitle || onSubtitleChange) && (
        <EditableText
          value={subtitle}
          onChange={onSubtitleChange}
          style={{
            textAlign: 'center',
            width: '85%',
            fontFamily: titleFamily,
            fontSize: titleConfig.subtitleFontSize * scaleFactor,
            color: titleConfig.subtitleColor,
            fontWeight: 400,
            lineHeight: 1.4,
            whiteSpace: 'pre-line',
          }}
        />
      )}
    </div>
  );
}
