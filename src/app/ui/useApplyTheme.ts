import { useEffect } from 'react';
import { accentColor } from '../../features/settings/domain/settings';
import type { Settings } from '../../features/settings/domain/settings';

const THEME_CACHE_KEY = 'todo.theme';

const resolveTheme = (theme: Settings['theme']): 'dark' | 'light' =>
  theme === 'system' ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : theme;

/** Aplica tema y acento al documento. El tema se cachea en localStorage para que
 *  `index.html` lo pinte antes de que cargue React (sin destello). */
export function useApplyTheme(settings: Settings): void {
  useEffect(() => {
    const apply = () => {
      const theme = resolveTheme(settings.theme);
      const root = document.documentElement;
      root.setAttribute('data-theme', theme);
      root.style.setProperty('--accent', accentColor(settings.accent));
      const bg = getComputedStyle(root).getPropertyValue('--bg').trim();
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg);
    };
    apply();
    try {
      localStorage.setItem(THEME_CACHE_KEY, settings.theme);
    } catch {
      // Sin localStorage (modo privado): solo se pierde el anti-destello.
    }
    if (settings.theme !== 'system') return undefined;
    const media = window.matchMedia('(prefers-color-scheme: light)');
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [settings.theme, settings.accent]);
}
