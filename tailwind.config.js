/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'matrix-green': '#00FF41',
        'matrix-dark-green': '#00CC33',
        'matrix-dim-green': '#009900',
        'warning-orange': '#FF6B35',
        'neutral-black': '#0D0D0D',
        'console-gray': '#1A1A1A',
        'console-dark': '#111111',
        'border-green': '#00AA33',
        'glow-green': '#00FF4144',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
        'code': ['Source Code Pro', 'monospace'],
      },
      animation: {
        'blink': 'blink 1s infinite',
        'pulse-glow': 'pulse-glow 2s infinite',
        'scan-line': 'scan-line 2s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { 
            textShadow: '0 0 5px #00FF41, 0 0 10px #00FF41',
          },
          '50%': { 
            textShadow: '0 0 10px #00FF41, 0 0 20px #00FF41, 0 0 30px #00FF41',
          },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
};