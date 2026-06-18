/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          950: '#05060a'
        }
      },
      boxShadow: {
        glow: '0 0 22px rgba(124, 58, 237, 0.35)'
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-10px,0)' }
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        pulseSoft: {
          '0%,100%': { opacity: '0.7' },
          '50%': { opacity: '1' }
        },
        popIn: {
          '0%': { transform: 'translate3d(0,10px,0) scale(0.98)', opacity: 0 },
          '100%': { transform: 'translate3d(0,0,0) scale(1)', opacity: 1 }
        },
        gridReveal: {
          '0%': { transform: 'translate3d(0,8px,0)', opacity: 0 },
          '100%': { transform: 'translate3d(0,0,0)', opacity: 1 }
        }
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        shimmer: 'shimmer 1.35s ease-in-out infinite',
        pulseSoft: 'pulseSoft 2.2s ease-in-out infinite',
        popIn: 'popIn 220ms ease-out forwards',
        gridReveal: 'gridReveal 360ms ease-out forwards'
      }
    }
  },
  plugins: []
};
