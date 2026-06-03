import type { SlideElement } from '@/types';
import { uid } from './utils';

export function newTextElement(x = 195, y = 130): SlideElement {
  return {
    id: uid(),
    kind: 'text',
    x,
    y,
    rotation: 0,
    scale: 1,
    text: 'Double-click to edit',
    fontSize: 30,
    fontWeight: 700,
    color: '#111111',
    align: 'center',
    width: 300,
  };
}

export function newEmojiElement(x = 195, y = 300, emoji = '⭐'): SlideElement {
  return {
    id: uid(),
    kind: 'emoji',
    x,
    y,
    rotation: 0,
    scale: 1,
    emoji,
    tile: true,
    check: false,
    size: 64,
  };
}
