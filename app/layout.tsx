import type { Metadata } from 'next';
import './globals.css';
import {
  archivo,
  interTight,
  jetbrainsMono,
  sora,
  dmSans,
  bricolage,
  jakarta,
  nunito,
  lato,
  poppins,
  montserrat,
} from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'ScreenForge — App Store & Play Store Screenshot Generator',
  description: 'Compose professional App Store and Google Play marketing screenshots in minutes.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const fontVars = [
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

  return (
    <html lang="en" className={fontVars}>
      <body className="bg-base text-primary">{children}</body>
    </html>
  );
}
