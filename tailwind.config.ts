import type { Config } from "tailwindcss";

export default {
  darkMode: false, // não precisamos mais de alternância por classe
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
        xl2: "1.25rem",
      },
      colors: {
        // Paleta fixa Dark (alto contraste)
        background: '#0B1120',     // fundo da app
        foreground: '#F8FAFC',     // texto principal
        muted: '#94A3B8',          // texto secundário
        
        sidebar: {
          bg: '#0F172A',
          text: '#CBD5E1',
          hover: '#1E293B',
          active: '#334155',
          border: '#1E293B',
        },
        
        card: {
          bg: '#1E293B',
          text: '#F8FAFC',
          border: '#334155',
        },
        
        primary: '#60A5FA',
        success: '#4ADE80',
        warning: '#FBBF24',
        danger: '#F87171',
        
        // Cores adicionais para compatibilidade
        border: '#334155',
        input: '#0F172A',
        ring: '#60A5FA',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 10px 30px rgba(0,0,0,0.35)',
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
