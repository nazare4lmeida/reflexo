/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
colors: {
  reflexo: {
    brown: '#1E2A3B',      // texto principal / elementos fortes (light mode)
    rose: '#3B82F6',       // azul royal - cor de destaque (botões, links, ícones)
    beigeRose: '#93C5FD',  // azul claro - hover, bordas, detalhes secundários
    beigeLight: '#F1F5F9', // fundo claro (light mode)
    gray: '#94A3B8',       // cinza-azulado - textos secundários/bordas
    dark: '#0F172A',       // fundo principal do dark mode
  },
},
      fontFamily: {
        sans: ['"Quicksand"', '"Segoe UI"', 'sans-serif'],
        handwritten: ['"Caveat"', '"Comic Sans MS"', 'cursive'],
      },
      boxShadow: {
        soft: '0 4px 20px rgba(94, 75, 69, 0.08)',
        softer: '0 2px 10px rgba(94, 75, 69, 0.06)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
