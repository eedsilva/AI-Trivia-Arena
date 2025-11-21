import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: '#0e0a1f',
        accent: '#7c3aed',
        accent2: '#a855f7',
        card: '#18102f',
        border: '#2a2045'
      },
      boxShadow: {
        glow: '0 0 30px rgba(124, 58, 237, 0.35)'
      }
    }
  },
  plugins: []
};

export default config;
