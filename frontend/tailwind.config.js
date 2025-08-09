/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // F1 Brand Colors
        f1: {
          red: '#E10600',
          'red-dark': '#C7050A',
          black: '#15151E',
          'gray-dark': '#38383F',
          'gray-light': '#A1A1AA',
          white: '#FFFFFF',
        },
        // Team Colors
        teams: {
          'red-bull': '#1E41FF',
          'red-bull-secondary': '#FF8000',
          mercedes: '#00D2BE',
          'mercedes-secondary': '#000000',
          ferrari: '#DC143C',
          'ferrari-secondary': '#FFFF00',
          mclaren: '#FF8700',
          'mclaren-secondary': '#000000',
          alpine: '#0090FF',
          'alpine-secondary': '#FF007F',
          'aston-martin': '#006F62',
          'aston-martin-secondary': '#BDFF00',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        f1: ['Formula1', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'f1-track': "url('/images/f1-track-pattern.svg')",
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      aspectRatio: {
        'driver-card': '3/4',
        'car': '16/9',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
