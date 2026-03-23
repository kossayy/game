/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          blue: '#00f0ff',
          purple: '#bf00ff',
          pink: '#ff00aa',
          green: '#00ff88',
          yellow: '#ffee00',
        },
        dark: {
          900: '#050508',
          800: '#0a0a12',
          700: '#0f0f1a',
          600: '#161625',
          500: '#1e1e35',
        }
      },
      fontFamily: {
        display: ['Orbitron', 'monospace'],
        body: ['Rajdhani', 'sans-serif'],
        mono: ['Share Tech Mono', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 4s linear infinite',
        'flicker': 'flicker 3s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 95%, 100%': { opacity: '1' },
          '96%, 98%': { opacity: '0.3' },
          '97%, 99%': { opacity: '0.8' },
        }
      },
      boxShadow: {
        'neon-blue': '0 0 20px #00f0ff, 0 0 40px #00f0ff40',
        'neon-purple': '0 0 20px #bf00ff, 0 0 40px #bf00ff40',
        'neon-pink': '0 0 20px #ff00aa, 0 0 40px #ff00aa40',
        'neon-green': '0 0 20px #00ff88, 0 0 40px #00ff8840',
      }
    },
  },
  plugins: [],
}
