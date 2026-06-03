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

/** White rounded tile with an emoji inside and a black check badge in the
 *  top-right corner — the Norte "habit completed" sticker. */
export function newHabitTile(x = 195, y = 300, emoji = '🏋️'): SlideElement {
  return {
    id: uid(),
    kind: 'emoji',
    x,
    y,
    rotation: 0,
    scale: 1,
    emoji,
    tile: true,
    check: true,
    size: 76,
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
    case 'barchart': return 'Bar chart';
    case 'linechart': return 'Line chart';
    case 'streak': return 'Streak card';
    case 'button': return 'Button';
    case 'blur': return 'Blur panel';
    case 'phone': return 'iPhone';
    case 'habitrow': return 'Habit row';
    case 'notification': return 'Notification';
    case 'widget': return 'Widget';
    default: return 'Component';
  }
}

const base = (x: number, y: number): Pick<SlideElement, 'id' | 'x' | 'y' | 'rotation' | 'scale'> => ({ id: uid(), x, y, rotation: 0, scale: 1 });

export function newShape(x = 195, y = 400): SlideElement {
  return { ...base(x, y), kind: 'shape', shapeType: 'rect', w: 200, h: 120, bg: '#1C1C1E', radius: 22, opacity: 1 };
}
export type ShapeStyle = 'square' | 'rounded' | 'circle' | 'pill' | 'triangle' | 'diamond' | 'hexagon' | 'star' | 'line';
/** Create a shape of a given visual style (square, circle, triangle, …). */
export function newShapeKind(style: ShapeStyle, x = 195, y = 400): SlideElement {
  const b = { ...base(x, y), kind: 'shape' as const, bg: '#1C1C1E', opacity: 1 };
  switch (style) {
    case 'square': return { ...b, shapeType: 'rect', w: 120, h: 120, radius: 6 };
    case 'rounded': return { ...b, shapeType: 'rect', w: 150, h: 104, radius: 26 };
    case 'circle': return { ...b, shapeType: 'circle', w: 120, h: 120, radius: 0 };
    case 'pill': return { ...b, shapeType: 'pill', w: 168, h: 64, radius: 0 };
    case 'triangle': return { ...b, shapeType: 'triangle', w: 124, h: 112, radius: 6 };
    case 'diamond': return { ...b, shapeType: 'diamond', w: 120, h: 120, radius: 6 };
    case 'hexagon': return { ...b, shapeType: 'hexagon', w: 124, h: 112, radius: 6 };
    case 'star': return { ...b, shapeType: 'star', w: 124, h: 120, radius: 4 };
    case 'line': return { ...b, shapeType: 'line', w: 180, h: 0, radius: 5 };
  }
}
export function newHeatmap(x = 195, y = 480): SlideElement {
  return { ...base(x, y), kind: 'heatmap', w: 300, cols: 12, rows: 7, fill: 0.5, cell: '#1C1C1E', bg: '#D8D5CE' };
}
/** Full framed habit-grid card: header (emoji + label + %), grid, footer + "today" cell. */
export function newHeatmapCard(x = 195, y = 480): SlideElement {
  return {
    ...base(x, y), kind: 'heatmap', framed: true, w: 320, h: 300,
    cols: 10, rows: 7, fill: 0.5, cell: '#1A1A1A', bg: '#D8D5CE', radius: 24,
    color: '#F4F2ED',
    cardTitle: '🏋️ exercitar 20min', cardValue: '54',
    cardCaption: 'Cada quadrado = um dia · escuro = cumprido',
  };
}
export function newIconEl(x = 195, y = 400, icon = 'check'): SlideElement {
  return { ...base(x, y), kind: 'icon', w: 40, h: 40, icon, color: '#111111' };
}
/** Norte app icon: dark rounded square with the white mountain mark.
 *  Pass check=true for the orange "completed" badge variant. */
export function newNorteLogo(x = 195, y = 360, check = false): SlideElement {
  return { ...base(x, y), kind: 'icon', icon: 'mountain', tile: true, size: 88, radius: 22, bg: '#1A1A1A', color: '#F4F2ED', check, accent: '#E8923C' };
}
/** Black circular badge with a white padlock (privacy / locked). */
export function newLockBadge(x = 195, y = 320): SlideElement {
  return { ...base(x, y), kind: 'icon', icon: 'lock', tile: true, size: 60, radius: 30, bg: '#1A1A1A', color: '#FFFFFF', check: false };
}
/** Rounded pill button with editable label (double-click to edit). */
export function newButton(x = 195, y = 560): SlideElement {
  return { ...base(x, y), kind: 'button', text: 'Get Norte — Free', showArrow: true, bg: '#1A1A1A', color: '#F4F2ED', fontSize: 17, radius: 28, h: 56 };
}
/** Frosted blur panel — place it over the device to obscure the content behind. */
export function newBlurPanel(x = 195, y = 420): SlideElement {
  return { ...base(x, y), kind: 'blur', w: 220, h: 300, radius: 20, blur: 7 };
}
/** iPhone device frame — dark→grey gradient screen with a dynamic-island pill. */
export function newPhone(x = 195, y = 430): SlideElement {
  return { ...base(x, y), kind: 'phone', phoneStyle: 'gradient', w: 232, h: 480, radius: 46, bg: '#000000', bg2: '#A6A6A6', island: true };
}
/** Realistic empty iPhone — titanium bezel, light screen, dynamic island + status bar.
 *  Drop one and place your components on top of it. */
export function newPhoneFrame(x = 195, y = 430): SlideElement {
  return {
    ...base(x, y), kind: 'phone', phoneStyle: 'frame', w: 240, h: 500, radius: 48,
    bg: '#2B2B2D', bg2: '#EFEDE8', island: true, text: '9:41', cardTitle: 'NORTE',
  };
}
/** Habit row card — check toggle + emoji + name + streak line + mini history heatmap. */
export function newHabitRow(x = 195, y = 300, emoji = '🏋️', name = 'exercitar 20min'): SlideElement {
  return {
    ...base(x, y), kind: 'habitrow', w: 356, h: 88, radius: 20,
    bg: '#F4F2ED', color: '#1A1A1A', cell: '#1A1A1A',
    emoji, text: name, cardCaption: '7D · 54%', check: true,
    cols: 8, rows: 6, fill: 0.45,
  };
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
/** Two-stat streak card: current streak + record, divider, "Cumprido hoje" footer. */
export function newStreakCard(x = 195, y = 460): SlideElement {
  return {
    ...base(x, y), kind: 'streak', w: 320, h: 200, radius: 28, bg: '#1A1A1A',
    cardTitle: 'Sequência atual', cardValue: '15',
    cardTitle2: 'Recorde', cardValue2: '24',
    cardCaption: 'Cumprido hoje', unit: 'd', showFire: true, accent: '#E8923C',
  };
}
export function newStatCard(x = 130, y = 600): SlideElement {
  return { ...base(x, y), kind: 'card', w: 100, h: 80, bg: '#FFFFFF', radius: 16, cardTitle: 'Esta semana', cardValue: '7/7', fontSize: 26, color: '#111111' };
}
/** iOS-style notification banner — app name + time, bold title, body. All editable. */
export function newNotification(x = 195, y = 200): SlideElement {
  return {
    ...base(x, y), kind: 'notification', w: 320, radius: 20, bg: '#FBFAF8', color: '#1A1A1A',
    cardTitle: 'NORTE', cardValue: 'agora', text: 'Hora de meditar 🧘', cardCaption: 'Mantenha sua sequência de 9 dias.',
  };
}
/** Today list widget (dark) — header + up to ~3 habit rows. */
export function newTodayWidget(x = 195, y = 360): SlideElement {
  return {
    ...base(x, y), kind: 'widget', variant: 'today', w: 300, radius: 18, bg: '#1A1A1A', color: '#F4F2ED', accent: '#E8923C',
    cardTitle: 'NORTE · HOJE', cardValue: '2 / 3 FEITOS',
    items: [
      { emoji: '🏋️', name: 'exercitar 20min', meta: '7d', done: true },
      { emoji: '📚', name: 'Leitura', meta: '3d', done: true },
      { emoji: '💧', name: 'Água', meta: '1d', done: false },
    ],
  };
}
/** "Cumprido hoje" square widget (dark) — title + check + count. */
export function newDoneWidget(x = 130, y = 560): SlideElement {
  return {
    ...base(x, y), kind: 'widget', variant: 'done', w: 150, h: 150, radius: 20, bg: '#1A1A1A', color: '#F4F2ED', accent: '#E8923C',
    cardTitle: 'NORTE', cardValue: '🔥 3d', text: 'Leitura', cardCaption: 'CUMPRIDO HOJE', cardValue2: '2/30', check: true,
  };
}
/** "Este mês" square widget (dark) — title + percent + mini heatmap. */
export function newMonthWidget(x = 280, y = 560): SlideElement {
  return {
    ...base(x, y), kind: 'widget', variant: 'month', w: 150, h: 150, radius: 20, bg: '#1A1A1A', color: '#F4F2ED', accent: '#E8923C',
    cardTitle: 'NORTE', cardValue: '🔥 7d', text: 'exercitar', cardCaption: 'ESTE MÊS · 54%',
    cols: 7, rows: 5, fill: 0.5, cell: '#F4F2ED',
  };
}
/** Month-by-month bar chart with a two-segment toggle pill on top. */
export function newBarChart(x = 195, y = 460): SlideElement {
  return {
    ...base(x, y), kind: 'barchart', w: 300, h: 340, radius: 22,
    bg: '#F4F2ED', cell: '#C9C5BD', accent: '#1A1A1A',
    toggleLeft: 'Dia da semana', toggleRight: 'Mês a mês',
    days: 'FEV,MAR,ABR,MAI,JUN', dates: '33,35,36,52,88', activeIndex: 4,
  };
}
/** Cumulative line chart with filled areas + habit toggle pills. */
export function newLineChart(x = 195, y = 470): SlideElement {
  return {
    ...base(x, y), kind: 'linechart', w: 340, h: 320, radius: 22,
    bg: '#FFFFFF',
    days: 'Fev,Mar,Abr,Mai,Jun',
    yTicks: '0,23,45', yMax: 50,
    cardCaption: 'Mais íngreme = mais consistente',
    series: [
      { label: 'exercitar 20min', color: '#6F7D5E', values: [0, 6, 16, 31, 45] },
      { label: 'Leitura', color: '#7C6FD6', values: [null, 0, 6, 15, 23] },
      { label: 'Vitamina D', color: '#C4AE7A', values: [null, null, 4, 12, 20] },
    ],
  };
}
