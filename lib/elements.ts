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

export function kindLabel(kind: SlideElement['kind']): string {
  switch (kind) {
    case 'text': return 'Text';
    case 'emoji': return 'Sticker';
    case 'shape': return 'Shape';
    case 'heatmap': return 'Heatmap';
    case 'card': return 'Card';
    case 'icon': return 'Icon';
    case 'stars': return 'Stars';
    case 'laurel': return 'Laurel';
    case 'datestrip': return 'Date strip';
    default: return 'Component';
  }
}

const base = (x: number, y: number): Pick<SlideElement, 'id' | 'x' | 'y' | 'rotation' | 'scale'> => ({ id: uid(), x, y, rotation: 0, scale: 1 });

export function newShape(x = 195, y = 400): SlideElement {
  return { ...base(x, y), kind: 'shape', w: 200, h: 120, bg: '#1C1C1E', radius: 22 };
}
export function newHeatmap(x = 195, y = 480): SlideElement {
  return { ...base(x, y), kind: 'heatmap', w: 300, cols: 12, rows: 7, fill: 0.5, cell: '#1C1C1E', bg: '#D8D5CE' };
}
export function newIconEl(x = 195, y = 400, icon = 'check'): SlideElement {
  return { ...base(x, y), kind: 'icon', w: 40, h: 40, icon, color: '#111111' };
}
export function newStarsEl(x = 195, y = 400): SlideElement {
  return { ...base(x, y), kind: 'stars', cols: 5, size: 16, color: '#111111' };
}
export function newLaurelEl(x = 195, y = 400): SlideElement {
  return { ...base(x, y), kind: 'laurel', size: 56, color: '#111111', cardValue: '+38,420', cardCaption: 'Hábitos cumpridos' };
}
export function newDateStrip(x = 195, y = 280): SlideElement {
  return { ...base(x, y), kind: 'datestrip', w: 320, days: 'Q,S,S,D,S,T', dates: '28,29,30,31,1,2', activeIndex: 5 };
}
export function newStreakWidget(x = 195, y = 460): SlideElement {
  return { ...base(x, y), kind: 'card', w: 300, h: 150, bg: '#1C1C1E', radius: 24, cardTitle: 'Sequência atual', cardValue: '9d', cardCaption: '✓ Cumprido hoje', accent: '#FFFFFF', fontSize: 48 };
}
export function newStatCard(x = 130, y = 600): SlideElement {
  return { ...base(x, y), kind: 'card', w: 100, h: 80, bg: '#FFFFFF', radius: 16, cardTitle: 'Esta semana', cardValue: '7/7', fontSize: 26, color: '#111111' };
}
export function newNotification(x = 195, y = 360): SlideElement {
  return { ...base(x, y), kind: 'card', w: 320, h: 96, bg: '#FFFFFF', radius: 20, cardTitle: 'Norte · agora', cardValue: 'Hora de meditar 🧘', cardCaption: 'Mantenha sua sequência de 9 dias', fontSize: 20, color: '#111111' };
}
