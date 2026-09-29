/** @type {import('tailwindcss').Config} */
// Ooru Digital tokens (light theme, verbatim from the Ooru design system)
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#fcfcfa',
        sand: '#eeece3',
        card: '#ffffff',
        navy: '#0a3970',
        cyan: '#2ed9e8',
        ink: {
          DEFAULT: '#0a3970',
          muted: '#4f4f4f',
          'on-strong': '#fcfcfa',
          'muted-on-strong': '#c3d3e6',
        },
        line: {
          DEFAULT: '#c6c4be',
          strong: '#8b877b',
        },
        azure: {
          DEFAULT: '#1a92c1',
          ink: '#157398',
        },
        pass: '#0f6b5a',
        warn: '#8a5a00',
        fail: '#b3261e',
      },
      fontFamily: {
        sans: ['"Clash Grotesk"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['"Fragment Mono"', 'ui-monospace', '"SF Mono"', 'Menlo', 'monospace'],
      },
      fontSize: {
        'display-56': ['56px', { lineHeight: '56px', letterSpacing: '-1.68px', fontWeight: '500' }],
        'display-40': ['40px', { lineHeight: '40px', letterSpacing: '-1.2px', fontWeight: '500' }],
        'display-32': ['32px', { lineHeight: '38.4px', letterSpacing: '-0.64px', fontWeight: '500' }],
        'display-28': ['28px', { lineHeight: '25.2px', letterSpacing: '-0.56px', fontWeight: '500' }],
        'stat-32': ['32px', { lineHeight: '38.4px', letterSpacing: '-2.56px', fontWeight: '500' }],
        'lead-20': ['20px', { lineHeight: '28px', fontWeight: '500' }],
        'lead-18': ['18px', { lineHeight: '25.2px', fontWeight: '500' }],
        body: ['16px', { lineHeight: '22.4px' }],
        label: ['16px', { lineHeight: '19.2px', fontWeight: '500' }],
        small: ['14px', { lineHeight: '16.8px' }],
        caption: ['12px', { lineHeight: '14.4px' }],
      },
      borderRadius: {
        sm: '9px',
        lg: '16px',
        pill: '100px',
      },
      boxShadow: {
        card: '0 0.722625px 0.722625px -1.25px rgba(0,0,0,0.18), 0 2.74624px 2.74624px -2.5px rgba(0,0,0,0.16), 0 12px 12px -3.75px rgba(0,0,0,0.06)',
        raised: '0 0.602187px 0.602187px -1.25px rgba(0,0,0,0.26), 0 2.28853px 2.28853px -2.5px rgba(0,0,0,0.23), 0 10px 10px -3.75px rgba(0,0,0,0.09)',
      },
      spacing: {
        14: '56px',
        24: '96px',
      },
      keyframes: {
        indeterminate: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(250%)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(220%)' },
        },
      },
      animation: {
        indeterminate: 'indeterminate 1.6s ease-in-out infinite',
        shimmer: 'shimmer 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
