import type { Config } from 'tailwindcss'

const ink = '#263d4b'

// Colours replace Tailwind's palette so only design-system tokens are available.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      canvas: '#ffffff',
      'canvas-soft': '#faf8f5',
      surface: '#ffffff',
      'surface-raised': '#faf8f5',
      paper: ink,
      muted: '#56636c',
      peach: '#efcfc5',
      'peach-deep': '#fae7df',
      blue: '#49b6e5',
      green: '#54c98a',
      yellow: '#f3b544',
      ice: '#d8eef8',
      cream: '#fff8df',
      rust: '#694538',
      'line-soft': '#d8dfe2',
      focus: '#d9ffbe',
      glass: 'rgba(255, 255, 255, .96)',
    },
    extend: {
      fontFamily: {
        body: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Delius Swash Caps"', 'cursive'],
      },
      fontSize: {
        hero: 'clamp(48px, 6.2vw, 74px)',
        'hero-mobile': 'clamp(42px, 12.5vw, 49px)',
        section: '32px',
        'section-mobile': '27px',
        'card-title': '21px',
        body: '16px',
        small: '13px',
        eyebrow: '11px',
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '20px',
        xl: '25px',
        dialog: '30px',
        pill: '999px',
      },
      boxShadow: {
        sm: `2px 2px 0 ${ink}`,
        md: `3px 4px 0 ${ink}`,
        lg: `5px 6px 0 ${ink}`,
        soft: '0 9px 24px rgba(15, 23, 42, .18)',
      },
      maxWidth: {
        shell: '1120px',
      },
    },
  },
  plugins: [],
} satisfies Config
