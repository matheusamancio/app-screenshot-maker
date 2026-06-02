import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,js,jsx,mdx}',
    './components/**/*.{ts,tsx,js,jsx,mdx}',
    './lib/**/*.{ts,tsx}',
    './store/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        base: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        overlay: 'var(--bg-overlay)',
        muted: 'var(--bg-muted)',

        'border-default': 'var(--border-default)',
        'border-strong': 'var(--border-strong)',
        'border-focus': 'var(--border-focus)',

        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        disabled: 'var(--text-disabled)',
        inverse: 'var(--text-inverse)',
        'text-accent': 'var(--text-accent)',

        'norte-primary': 'var(--norte-primary)',
        'norte-primary-hover': 'var(--norte-primary-hover)',
        'norte-primary-light': 'var(--norte-primary-light)',
        'norte-secondary': 'var(--norte-secondary)',
        'norte-secondary-light': 'var(--norte-secondary-light)',

        success: 'var(--success)',
        'success-light': 'var(--success-light)',
        warning: 'var(--warning)',
        error: 'var(--error)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        canvas: 'var(--shadow-canvas)',
      },
      fontFamily: {
        display: ['var(--font-sora)', 'sans-serif'],
        body: ['var(--font-dm-sans)', 'sans-serif'],
        sora: ['var(--font-sora)', 'sans-serif'],
        dmsans: ['var(--font-dm-sans)', 'sans-serif'],
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
export default config;
