import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './components/**/*.{ts,tsx}',
    './contexts/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './services/**/*.{ts,tsx}',
    './utils/**/*.{ts,tsx}',
    './constants.tsx',
    './types.ts',
    './src/**/*.{ts,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Space Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: [
          'Inter',
          'ui-sans-serif',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        nothing: {
          red: '#dc2626',
          'red-hover': '#b91c1c',
          ink: {
            DEFAULT: '#0a0a0a',
            soft: '#171717',
          },
          paper: {
            DEFAULT: '#fafafa',
            soft: '#f5f5f5',
          },
        },
      },
      borderRadius: {
        // Softer, rounder OS chrome. `window` is the canonical window/panel radius.
        window: '18px',
        panel: '16px',
        control: '10px',
      },
      boxShadow: {
        // Calmer, softer elevation scale — low opacity, wide blur, minimal spread.
        soft: '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px -4px rgba(0,0,0,0.08)',
        panel: '0 2px 8px -4px rgba(0,0,0,0.08), 0 12px 32px -12px rgba(0,0,0,0.16)',
        window: '0 4px 12px -6px rgba(0,0,0,0.12), 0 24px 56px -20px rgba(0,0,0,0.28)',
        dock: '0 2px 8px -4px rgba(0,0,0,0.10), 0 16px 40px -16px rgba(0,0,0,0.22)',
      },
      transitionTimingFunction: {
        'nothing-out': 'cubic-bezier(.2,.8,.2,1)',
        'nothing-in': 'cubic-bezier(.4,0,.6,1)',
        'nothing-spring': 'cubic-bezier(.34,1.56,.64,1)',
      },
      transitionDuration: {
        fast: '120ms',
        base: '200ms',
        slow: '320ms',
      },
      zIndex: {
        desktop: '0',
        window: '100',
        'window-active': '200',
        dock: '300',
        'menu-bar': '400',
        dropdown: '500',
        modal: '600',
        'snap-preview': '650',
        'context-menu': '700',
        spotlight: '800',
        notification: '900',
        'drag-ghost': '1000',
      },
    },
  },
  plugins: [],
};

export default config;
