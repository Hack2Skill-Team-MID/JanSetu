'use client';

import { useEffect } from 'react';
import { useThemeStore, THEMES } from '../../store/theme-store';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeId = useThemeStore((s) => s.themeId);

  useEffect(() => {
    const palette = THEMES.find((t) => t.id === themeId) || THEMES[0];
    const html = document.documentElement;

    // Inject all CSS variables for this palette
    Object.entries(palette.vars).forEach(([key, value]) => {
      html.style.setProperty(key, value);
    });

    // Toggle dark/light class — drives Tailwind dark: variants
    if (palette.isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    // data-theme drives our CSS selector overrides in globals.css
    html.setAttribute('data-theme', themeId);
  }, [themeId]);

  // On first mount, apply the default forest theme immediately
  // so there's no flash even if localStorage is empty
  useEffect(() => {
    const html = document.documentElement;
    if (!html.getAttribute('data-theme')) {
      const defaultPalette = THEMES[0]; // forest
      Object.entries(defaultPalette.vars).forEach(([k, v]) => html.style.setProperty(k, v));
      html.classList.add('dark');
      html.setAttribute('data-theme', 'forest');
    }
  }, []);

  return <>{children}</>;
}
