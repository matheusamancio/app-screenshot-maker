import {
  Sora,
  DM_Sans,
  Bricolage_Grotesque,
  Plus_Jakarta_Sans,
  Nunito,
  Lato,
  Poppins,
  Montserrat,
  Archivo,
  Inter_Tight,
  JetBrains_Mono,
} from 'next/font/google';

// Norte design system fonts
export const archivo = Archivo({ subsets: ['latin'], variable: '--font-archivo', display: 'swap', weight: ['500', '600', '700', '800'] });
export const interTight = Inter_Tight({ subsets: ['latin'], variable: '--font-inter-tight', display: 'swap', weight: ['400', '500', '600'] });
export const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', display: 'swap', weight: ['400', '500', '600'] });

// Other available fonts
export const sora = Sora({ subsets: ['latin'], variable: '--font-sora', display: 'swap', weight: ['300', '400', '500', '600', '700', '800'] });
export const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap', weight: ['400', '500', '600', '700'] });
export const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage', display: 'swap', weight: ['400', '500', '600', '700', '800'] });
export const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap', weight: ['400', '500', '600', '700', '800'] });
export const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito', display: 'swap', weight: ['400', '500', '600', '700', '800'] });
export const lato = Lato({ subsets: ['latin'], variable: '--font-lato', display: 'swap', weight: ['400', '700'] });
export const poppins = Poppins({ subsets: ['latin'], variable: '--font-poppins', display: 'swap', weight: ['400', '500', '600', '700', '800'] });
export const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', display: 'swap', weight: ['400', '500', '600', '700', '800'] });

interface FontOption {
  id: string;
  label: string;
  family: string;
  group?: 'Norte' | 'Display' | 'Body' | 'Mono';
  badge?: string;
}

export const FONT_OPTIONS: FontOption[] = [
  // Norte design system
  { id: 'Archivo', label: 'Archivo', family: 'var(--font-archivo), sans-serif', group: 'Norte', badge: 'Display' },
  { id: 'Inter Tight', label: 'Inter Tight', family: 'var(--font-inter-tight), sans-serif', group: 'Norte', badge: 'Body' },
  { id: 'JetBrains Mono', label: 'JetBrains Mono', family: 'var(--font-jetbrains-mono), monospace', group: 'Norte', badge: 'Mono' },
  // Other display
  { id: 'Sora', label: 'Sora', family: 'var(--font-sora), sans-serif', group: 'Display' },
  { id: 'Bricolage Grotesque', label: 'Bricolage Grotesque', family: 'var(--font-bricolage), sans-serif', group: 'Display' },
  { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', family: 'var(--font-jakarta), sans-serif', group: 'Display' },
  { id: 'Poppins', label: 'Poppins', family: 'var(--font-poppins), sans-serif', group: 'Display' },
  { id: 'Montserrat', label: 'Montserrat', family: 'var(--font-montserrat), sans-serif', group: 'Display' },
  // Body
  { id: 'DM Sans', label: 'DM Sans', family: 'var(--font-dm-sans), sans-serif', group: 'Body' },
  { id: 'Nunito', label: 'Nunito', family: 'var(--font-nunito), sans-serif', group: 'Body' },
  { id: 'Lato', label: 'Lato', family: 'var(--font-lato), sans-serif', group: 'Body' },
];

/**
 * Glyph-coverage fallbacks for non-Latin scripts (Japanese, Korean, Traditional
 * Chinese, Arabic). Inserted before the generic family so CJK/Arabic text renders
 * with a real font on the canvas AND in html2canvas exports, while Latin text
 * still uses the chosen display font.
 */
const SCRIPT_FALLBACKS = "'Noto Sans JP', 'Noto Sans KR', 'Noto Sans TC', 'Noto Sans Arabic'";

function withScriptFallbacks(family: string): string {
  if (family.includes('Noto Sans')) return family;
  return family
    .replace(/,\s*sans-serif\s*$/, `, ${SCRIPT_FALLBACKS}, sans-serif`)
    .replace(/,\s*monospace\s*$/, `, ${SCRIPT_FALLBACKS}, monospace`);
}

export function fontFamilyFor(id: string): string {
  const found = FONT_OPTIONS.find((f) => f.id === id);
  return withScriptFallbacks(found?.family || 'var(--font-inter-tight), sans-serif');
}

export const FONT_CSS_VARIABLES = [
  archivo.variable,
  interTight.variable,
  jetbrainsMono.variable,
  sora.variable,
  dmSans.variable,
  bricolage.variable,
  jakarta.variable,
  nunito.variable,
  lato.variable,
  poppins.variable,
  montserrat.variable,
].join(' ');
