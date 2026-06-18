import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: "class",
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        display: ['var(--font-plus-jakarta-sans)'],
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        border: 'var(--border)',
        
        // Keep these if any components still use them explicitly
        homepage: {
          primary: '#1B4F72',
          background: '#FAFBFF',
        },
        pelapor: {
          primary: '#4A90B8',
          background: '#F0F7FC',
        },
        konsultan: {
          primary: '#5B8A6F',
          background: '#F4F9F6',
        },
        admin: {
          primary: '#2C3E6B',
          background: '#F5F6FA',
        },
        operator: {
          primary: '#7B5EA7',
          background: '#F8F5FC',
        },
        satgas: {
          primary: '#1A5276',
          background: '#EBF5FB',
        },
      },
    },
  },
  plugins: [],
};
export default config;
