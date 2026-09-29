import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

// Aparte de vite.config.ts porque vitest trae su propia copia de los tipos de
// vite y `test` no se reconoce dentro de `defineConfig` de vite.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
    },
  }),
);
