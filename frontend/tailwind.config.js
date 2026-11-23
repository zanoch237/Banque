// Configuration Tailwind CSS
/** @type {import('tailwindcss').Config} */
export default {
  // Chemins des fichiers à analyser pour purger les classes inutilisées
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Extension de la palette de couleurs avec les couleurs de la charte
      colors: {
        primaire: {
          DEFAULT: '#2563EB', // blue-600
          clair: '#3B82F6',   // blue-500
          fonce: '#1D4ED8',   // blue-700
        },
        secondaire: {
          DEFAULT: '#6366F1', // indigo-500
        },
      },
      // Polices supplémentaires si nécessaire
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
