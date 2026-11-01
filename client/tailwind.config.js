/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['Fraunces', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'DM Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'bg-base': 'var(--bg-base)',
        'bg-soft': 'var(--bg-soft)',
        'surface-glass': 'var(--surface-glass)',
        'surface-glass-strong': 'var(--surface-glass-strong)',
        'border-glass': 'var(--border-glass)',
        'border-glass-subtle': 'var(--border-glass-subtle)',
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          soft: 'var(--primary-soft)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          soft: 'var(--accent-soft)',
        },
        gold: {
          DEFAULT: 'var(--gold)',
          soft: 'var(--gold-soft)',
        },
        'text-main': 'var(--text-main)',
        'text-muted': 'var(--text-muted)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
      },
      boxShadow: {
        warm: 'var(--shadow-warm)',
        glass: 'var(--shadow-glass)',
        'glass-hover': '0 16px 36px rgba(95, 80, 55, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
      },
      animation: {
        'organic-drift-1': 'organic1 32s ease-in-out infinite alternate',
        'organic-drift-2': 'organic2 26s ease-in-out infinite alternate',
        'organic-drift-3': 'organic3 38s ease-in-out infinite alternate',
      },
      keyframes: {
        organic1: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(45px, -35px) scale(1.06)' },
          '100%': { transform: 'translate(-30px, 30px) scale(0.96)' },
        },
        organic2: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(-50px, 40px) scale(1.08)' },
          '100%': { transform: 'translate(25px, -25px) scale(0.94)' },
        },
        organic3: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(35px, 45px) scale(1.04)' },
          '100%': { transform: 'translate(-40px, -20px) scale(0.98)' },
        },
      },
    },
  },
  plugins: [],
};
