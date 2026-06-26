/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bayern: {
          red: '#DC052D',
          'red-dark': '#A0021F',
          'red-light': '#FF1744',
          blue: '#0066B2',
          'blue-dark': '#004A80',
          gold: '#F5A623',
          dark: '#0A0A0F',
          'dark-2': '#12121A',
          'dark-3': '#1A1A28',
          'dark-4': '#252538',
          surface: '#1E1E2E',
          border: '#2A2A3E',
          'text-primary': '#FFFFFF',
          'text-secondary': '#9CA3AF',
          'text-muted': '#6B7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #0A0A0F 0%, #12121A 50%, #1A0A10 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(220,5,45,0.1) 0%, rgba(0,102,178,0.05) 100%)',
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(220,5,45,0.3)',
        'glow-blue': '0 0 20px rgba(0,102,178,0.3)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-red': 'pulseRed 2s infinite',
        'count-up': 'countUp 1s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseRed: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      }
    },
  },
  plugins: [],
}
