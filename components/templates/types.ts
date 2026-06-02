import type { BackgroundConfig, TitleConfig, DeviceConfig, OverlayImageConfig, ElementTransform, TransformableElement } from '@/types';

export interface TemplateRenderProps {
  screenshot: string | null;
  title: string;
  subtitle: string;
  showSubtitle: boolean;
  background: BackgroundConfig;
  titleConfig: TitleConfig;
  deviceConfig: DeviceConfig;
  overlayImage: OverlayImageConfig;
  width: number;
  height: number;
  rtl?: boolean;
  fontFamily?: string;
  /** When provided, the title text becomes inline-editable. */
  onTitleChange?: (value: string) => void;
  /** When provided, the subtitle text becomes inline-editable. */
  onSubtitleChange?: (value: string) => void;
  titleTransform?: ElementTransform;
  deviceTransform?: ElementTransform;
  /** Called when the user pointerdown's on a transformable element. */
  onElementPointerDown?: (element: TransformableElement, e: React.PointerEvent) => void;
}

export const BASE_W = 390;
export const BASE_H = 844;
