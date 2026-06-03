'use client';

import React from 'react';
import type { Slide, Language, TransformableElement } from '@/types';
import { BASE_LANGUAGE } from '@/types';
import HeroTemplate from './HeroTemplate';
import FeatureTemplate from './FeatureTemplate';
import MinimalTemplate from './MinimalTemplate';
import SocialProofTemplate from './SocialProofTemplate';
import SplitTemplate from './SplitTemplate';
import CenteredTemplate from './CenteredTemplate';
import PillTemplate from './PillTemplate';
import AwardsTemplate from './AwardsTemplate';
import ReviewTemplate from './ReviewTemplate';
import FeatureCardsTemplate from './FeatureCardsTemplate';
import { isRtl } from '@/lib/presets';

interface Props {
  slide: Slide;
  width: number;
  height: number;
  language?: Language;
  fontFamilyOverride?: string;
  onTitleChange?: (value: string) => void;
  onSubtitleChange?: (value: string) => void;
  onElementPointerDown?: (element: TransformableElement, e: React.PointerEvent) => void;
}

export default function TemplateRenderer({
  slide,
  width,
  height,
  language = BASE_LANGUAGE,
  fontFamilyOverride,
  onTitleChange,
  onSubtitleChange,
  onElementPointerDown,
}: Props) {
  const loc = slide.localizations?.[language];
  const titleText = loc?.title || slide.title.text;
  const subtitleText = loc?.subtitle || slide.title.subtitle;
  const rtl = isRtl(language);

  const common = {
    screenshot: slide.screenshot,
    title: titleText,
    subtitle: subtitleText,
    showSubtitle: slide.title.showSubtitle,
    background: slide.background,
    titleConfig: slide.title,
    deviceConfig: slide.device,
    overlayImage: slide.overlayImage,
    featureCards: slide.featureCards,
    featureMore: slide.featureMore,
    width,
    height,
    rtl,
    fontFamily: fontFamilyOverride || slide.title.fontFamily,
    onTitleChange,
    onSubtitleChange,
    titleTransform: slide.titleTransform,
    deviceTransform: slide.deviceTransform,
    onElementPointerDown,
  };

  switch (slide.template) {
    case 'feature':
      return <FeatureTemplate {...common} />;
    case 'minimal':
      return <MinimalTemplate {...common} />;
    case 'social-proof':
      return <SocialProofTemplate {...common} />;
    case 'split':
      return <SplitTemplate {...common} />;
    case 'centered':
      return <CenteredTemplate {...common} />;
    case 'pill':
      return <PillTemplate {...common} />;
    case 'awards':
      return <AwardsTemplate {...common} />;
    case 'review':
      return <ReviewTemplate {...common} />;
    case 'feature-cards':
      return <FeatureCardsTemplate {...common} />;
    case 'hero':
    default:
      return <HeroTemplate {...common} />;
  }
}
