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

export default function MinimalTemplate(props: TemplateRenderProps) {
  const { screenshot, title, subtitle, showSubtitle, background, titleConfig, deviceConfig, overlayImage, width, height, rtl, fontFamily, onTitleChange, onSubtitleChange, titleTransform, deviceTransform, onElementPointerDown } = props;
  const scaleFactor = width / BASE_W;
  const titleFamily = fontFamily ? fontFamilyFor(fontFamily) : fontFamilyFor(titleConfig.fontFamily);

  const deviceWidth = 360 * (deviceConfig.scale / 100) * scaleFactor;
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

      {deviceConfig.layer.visible && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
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

      {titleConfig.layer.visible && (
        <div
          data-element="title"
          onPointerDown={(e) => onElementPointerDown?.('title', e)}
          style={{
            position: 'absolute',
            bottom: 30 * scaleFactor,
            left: 20 * scaleFactor,
            right: 20 * scaleFactor,
            background: 'rgba(255,255,255,0.78)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 16 * scaleFactor,
            padding: `${20 * scaleFactor}px ${22 * scaleFactor}px`,
            textAlign: titleConfig.alignment,
            fontFamily: titleFamily,
            opacity: titleConfig.layer.opacity,
            boxShadow: `0 ${8 * scaleFactor}px ${24 * scaleFactor}px rgba(0,0,0,0.08)`,
            transform: transformCss(titleTransform, scaleFactor),
            transformOrigin: 'center center',
          }}
        >
          <EditableText
            value={title}
            onChange={onTitleChange}
            style={{
              fontSize: titleConfig.fontSize * 0.6 * scaleFactor,
              fontWeight: titleConfig.fontWeight,
              color: '#1A1917',
              lineHeight: 1.2,
              whiteSpace: 'pre-line',
              letterSpacing: '-0.01em',
            }}
          />
          {showSubtitle && (subtitle || onSubtitleChange) && (
            <EditableText
              value={subtitle}
              onChange={onSubtitleChange}
              style={{
                fontSize: titleConfig.subtitleFontSize * 0.7 * scaleFactor,
                color: '#4A4845',
                marginTop: 6 * scaleFactor,
                fontWeight: 400,
                whiteSpace: 'pre-line',
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
