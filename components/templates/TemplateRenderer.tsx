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
import HabitHeroTemplate from './HabitHeroTemplate';
import ElementsLayer from './ElementsLayer';
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
  // Free-element editing (omitted in export/preview → static)
  onElementSelect?: (sel: string) => void;
  onElementTextChange?: (id: string, text: string) => void;
  onElementEditStart?: (id: string) => void;
  onElementEditEnd?: () => void;
  editingElementId?: string | null;
}

import type { TemplateRenderProps } from './types';

function renderTemplate(template: Slide['template'], common: TemplateRenderProps) {
  switch (template) {
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
    case 'habit-hero':
      return <HabitHeroTemplate {...common} />;
    case 'hero':
    default:
      return <HeroTemplate {...common} />;
  }
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
  onElementSelect,
  onElementTextChange,
  onElementEditStart,
  onElementEditEnd,
  editingElementId,
}: Props) {
  const loc = slide.localizations?.[language];
  const titleText = loc?.title || slide.title.text;
  const subtitleText = loc?.subtitle || slide.title.subtitle;
  const rtl = isRtl(language);
  const sf = width / 390;

  const common: TemplateRenderProps = {
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
    habitHero: slide.habitHero,
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

  return (
    <div style={{ position: 'relative', width, height }}>
      {renderTemplate(slide.template, common)}
      <ElementsLayer
        elements={slide.elements}
        sf={sf}
        fontFamily={fontFamilyOverride || slide.title.fontFamily}
        onSelect={onElementSelect}
        onTextChange={onElementTextChange}
        onEditStart={onElementEditStart}
        onEditEnd={onElementEditEnd}
        editingId={editingElementId}
      />
    </div>
  );
}
