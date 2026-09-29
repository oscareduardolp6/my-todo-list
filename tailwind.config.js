/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Todos los colores salen de variables CSS (src/index.css) para que el
      // tema oscuro/claro y el color de acento sean configurables en runtime.
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        border: 'var(--border)',
        fg: 'var(--text)',
        muted: 'var(--muted)',
        faint: 'var(--faint)',
        accent: 'var(--accent)',
        'accent-fg': 'var(--accent-fg)',
        danger: 'var(--danger)',
        warn: 'var(--warn)',
        success: 'var(--success)',
        p1: 'var(--p1)',
        p2: 'var(--p2)',
        p3: 'var(--p3)',
        p4: 'var(--p4)',
      },
    },
  },
  plugins: [],
};
